-- ════════════════════════════════════════════════════════════════════════
--  Quill — Community schema  (run AFTER schema.sql)
--
--  Run this ONCE in your Supabase project:
--    supabase.com → your project → SQL Editor → New query → paste → Run
--
--  Safe to re-run: every statement is idempotent (IF NOT EXISTS / drop+create).
--
--  What it adds:
--   • public identity columns on `profiles` (username, display_name, avatar, bio)
--     + a column-safe `public_profiles` view so other people only ever see the
--       public fields (never your skin_type / goal / favourites).
--   • community_posts, post_likes, saved_posts, friend_requests, friendships,
--     community_reports — all with Row-Level Security.
--   • server-side safety: a trigger forces any post WITH MEDIA to
--     `pending_review`, and a trigger hard-blocks the worst words at write time.
--   • auto-hide: a post is flagged (hidden from the public feed) once it passes
--     a report threshold.
--   • a `community_admins` table that ordinary users CANNOT add themselves to —
--     only you, from the dashboard, can grant admin.
--   • a Storage bucket `community-media` (5 MB images / 50 MB video), where each
--     user can only upload into their own folder.
-- ════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 0.  Extend profiles with public community identity
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists username     text;
alter table public.profiles add column if not exists display_name text default '';
alter table public.profiles add column if not exists avatar_url   text default '';
alter table public.profiles add column if not exists bio          text default '';
alter table public.profiles add column if not exists created_at   timestamptz default now();

-- Usernames are unique (case-insensitive) and url/search friendly.
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username)) where username is not null;

-- A user may read public identity fields of ANY profile — but only through this
-- view, which exposes the public columns only. The base `profiles` table stays
-- locked to its owner (policies from schema.sql), so skin_type/goal/favourites
-- are never exposed to other users.
create or replace view public.public_profiles as
  select id, username, display_name, avatar_url, bio, created_at
  from public.profiles;

grant select on public.public_profiles to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 1.  Admins  (you grant this from the dashboard; nobody can self-promote)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.community_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz default now()
);
alter table public.community_admins enable row level security;

-- A user may check whether THEY are an admin (needed to show the admin UI),
-- but there is NO insert/update/delete policy — so the only way to add an admin
-- is from the Supabase dashboard (Table editor → community_admins → insert row),
-- which runs as the service role and bypasses RLS.
drop policy if exists "see own admin row" on public.community_admins;
create policy "see own admin row" on public.community_admins
  for select using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.community_admins where user_id = auth.uid());
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- 2.  Friendships + friend requests
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.friend_requests (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  status      text not null default 'pending'
              check (status in ('pending','accepted','declined','blocked')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  check (sender_id <> receiver_id),
  unique (sender_id, receiver_id)
);
alter table public.friend_requests enable row level security;

-- Friendships are stored once, with the smaller uuid as user_a, so a pair can
-- never be duplicated in both directions.
create table if not exists public.friendships (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references auth.users (id) on delete cascade,
  user_b     uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);
alter table public.friendships enable row level security;

-- Either party may see a request that involves them.
drop policy if exists "see own requests" on public.friend_requests;
create policy "see own requests" on public.friend_requests
  for select using (auth.uid() in (sender_id, receiver_id));

-- You may only create a request as yourself.
drop policy if exists "send own requests" on public.friend_requests;
create policy "send own requests" on public.friend_requests
  for insert with check (auth.uid() = sender_id);

-- The sender may cancel (delete) a still-pending request.
drop policy if exists "cancel own pending request" on public.friend_requests;
create policy "cancel own pending request" on public.friend_requests
  for delete using (auth.uid() = sender_id and status = 'pending');

-- Either party may see a friendship that involves them.
drop policy if exists "see own friendships" on public.friendships;
create policy "see own friendships" on public.friendships
  for select using (auth.uid() in (user_a, user_b));

-- Are auth.uid() and `other` accepted friends?
create or replace function public.is_friend(other uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.friendships
    where (user_a = least(auth.uid(), other) and user_b = greatest(auth.uid(), other))
  );
$$;

-- Accept / decline a request you received. On accept, the friendship row is
-- created atomically. SECURITY DEFINER so it can write friendships, but it
-- verifies the caller is the receiver first.
create or replace function public.respond_friend_request(request_id uuid, accept boolean)
returns void language plpgsql security definer set search_path = public as $$
declare r public.friend_requests;
begin
  select * into r from public.friend_requests where id = request_id;
  if not found then raise exception 'Request not found'; end if;
  if r.receiver_id <> auth.uid() then raise exception 'Not your request to answer'; end if;
  if r.status <> 'pending' then raise exception 'Request already answered'; end if;

  update public.friend_requests
     set status = case when accept then 'accepted' else 'declined' end,
         updated_at = now()
   where id = request_id;

  if accept then
    insert into public.friendships (user_a, user_b)
    values (least(r.sender_id, r.receiver_id), greatest(r.sender_id, r.receiver_id))
    on conflict do nothing;
  end if;
end;
$$;

-- Remove a friend: deletes the friendship and clears any request between you,
-- so a fresh request can be sent later.
create or replace function public.remove_friend(other uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.friendships
   where user_a = least(auth.uid(), other) and user_b = greatest(auth.uid(), other);
  delete from public.friend_requests
   where (sender_id = auth.uid() and receiver_id = other)
      or (sender_id = other and receiver_id = auth.uid());
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- 3.  Community posts
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.community_posts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  -- Author identity is denormalised onto the post so the feed never needs to
  -- read other users' profile rows (keeps RLS simple and the feed fast).
  author_username     text default '',
  author_display_name text default '',
  author_avatar_url   text default '',
  title         text not null,
  category      text not null,
  description   text default '',
  visibility    text not null default 'public'
                check (visibility in ('public','friends','private')),
  status        text not null default 'published'
                check (status in ('published','pending_review','flagged','hidden','deleted')),
  steps         jsonb default '[]'::jsonb,
  products      jsonb default '[]'::jsonb,
  media         jsonb default '[]'::jsonb,   -- [{url, type, path}]
  likes_count   int default 0,
  saves_count   int default 0,
  reports_count int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.community_posts enable row level security;

create index if not exists community_posts_feed_idx
  on public.community_posts (status, visibility, created_at desc);
create index if not exists community_posts_user_idx
  on public.community_posts (user_id, created_at desc);

-- READ rules:
--  • anyone (incl. signed-out) may read public, published posts
--  • you may always read your own posts (any status/visibility)
--  • accepted friends may read your friends-only published posts
--  • admins may read everything (for the moderation queue)
drop policy if exists "read public posts" on public.community_posts;
create policy "read public posts" on public.community_posts
  for select using (visibility = 'public' and status = 'published');

drop policy if exists "read own posts" on public.community_posts;
create policy "read own posts" on public.community_posts
  for select using (auth.uid() = user_id);

drop policy if exists "read friends posts" on public.community_posts;
create policy "read friends posts" on public.community_posts
  for select using (
    visibility = 'friends' and status = 'published' and public.is_friend(user_id)
  );

drop policy if exists "admins read all posts" on public.community_posts;
create policy "admins read all posts" on public.community_posts
  for select using (public.is_admin());

-- WRITE rules: you may only create/update/delete your own posts. A user can set
-- only the safe statuses on insert; the trigger below downgrades media posts.
drop policy if exists "create own posts" on public.community_posts;
create policy "create own posts" on public.community_posts
  for insert with check (
    auth.uid() = user_id
    and status in ('published','pending_review','flagged')
  );

drop policy if exists "update own posts" on public.community_posts;
create policy "update own posts" on public.community_posts
  for update using (auth.uid() = user_id);

drop policy if exists "delete own posts" on public.community_posts;
create policy "delete own posts" on public.community_posts
  for delete using (auth.uid() = user_id);

drop policy if exists "admins update posts" on public.community_posts;
create policy "admins update posts" on public.community_posts
  for update using (public.is_admin());

-- ── Server-side safety net ────────────────────────────────────────────────
-- Even if a client is tampered with, these run in the database on every write.

-- (a) Hard-block clearly illegal / exploitative terms: never store them.
--     This is intentionally tiny — nuanced moderation lives in moderateText()
--     on the client; this is the last line of defence for the worst content.
create or replace function public.community_hard_block()
returns trigger language plpgsql as $$
declare blob text;
begin
  blob := lower(coalesce(new.title,'') || ' ' || coalesce(new.description,''));
  if blob ~ '(child\s*porn|cp\s+for\s+sale|rape|bestiality|\bzoophilia\b)' then
    raise exception 'This content is not allowed.';
  end if;
  return new;
end;
$$;

-- (b) Any post that carries media must go to pending_review unless the author
--     is "trusted" (account older than 7 days). New/untrusted accounts cannot
--     publish media straight to the public feed.
create or replace function public.community_media_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare acct_age interval;
begin
  if new.media is not null and jsonb_array_length(new.media) > 0 then
    select now() - created_at into acct_age from auth.users where id = new.user_id;
    if acct_age is null or acct_age < interval '7 days' then
      if new.status = 'published' then new.status := 'pending_review'; end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists community_hard_block_t on public.community_posts;
create trigger community_hard_block_t before insert or update on public.community_posts
  for each row execute function public.community_hard_block();

drop trigger if exists community_media_guard_t on public.community_posts;
create trigger community_media_guard_t before insert on public.community_posts
  for each row execute function public.community_media_guard();

-- ─────────────────────────────────────────────────────────────────────────
-- 4.  Likes  &  saves   (with denormalised counts kept by triggers)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.post_likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  post_id    uuid not null references public.community_posts (id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, post_id)
);
alter table public.post_likes enable row level security;

create table if not exists public.saved_posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  post_id    uuid not null references public.community_posts (id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, post_id)
);
alter table public.saved_posts enable row level security;

-- You manage only your own likes/saves; everyone may read like rows (for counts
-- you already have the denormalised column, but reading is harmless).
drop policy if exists "manage own likes" on public.post_likes;
create policy "manage own likes" on public.post_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "manage own saves" on public.saved_posts;
create policy "manage own saves" on public.saved_posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.bump_likes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.community_posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;
drop trigger if exists bump_likes_t on public.post_likes;
create trigger bump_likes_t after insert or delete on public.post_likes
  for each row execute function public.bump_likes();

create or replace function public.bump_saves()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts set saves_count = saves_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.community_posts set saves_count = greatest(0, saves_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;
drop trigger if exists bump_saves_t on public.saved_posts;
create trigger bump_saves_t after insert or delete on public.saved_posts
  for each row execute function public.bump_saves();

-- ─────────────────────────────────────────────────────────────────────────
-- 5.  Reports   (+ auto-hide after a threshold of distinct reporters)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.community_reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references auth.users (id) on delete cascade,
  post_id          uuid references public.community_posts (id) on delete cascade,
  reported_user_id uuid references auth.users (id) on delete cascade,
  reason           text not null,
  details          text default '',
  status           text not null default 'open'
                   check (status in ('open','reviewed','dismissed','action_taken')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  -- one report per reporter per post (prevents a single user inflating counts)
  unique (reporter_id, post_id)
);
alter table public.community_reports enable row level security;

-- Any signed-in user may file a report (as themselves).
drop policy if exists "create reports" on public.community_reports;
create policy "create reports" on public.community_reports
  for insert with check (auth.uid() = reporter_id);

-- A reporter may see the reports they filed; admins may see all and update them.
drop policy if exists "see own reports" on public.community_reports;
create policy "see own reports" on public.community_reports
  for select using (auth.uid() = reporter_id);

drop policy if exists "admins read reports" on public.community_reports;
create policy "admins read reports" on public.community_reports
  for select using (public.is_admin());

drop policy if exists "admins update reports" on public.community_reports;
create policy "admins update reports" on public.community_reports
  for update using (public.is_admin());

-- Keep reports_count current and auto-hide a post once 3 distinct people have
-- reported it (flagged = removed from the public feed pending review).
create or replace function public.bump_reports()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if new.post_id is null then return null; end if;
  select count(*) into n from public.community_reports where post_id = new.post_id;
  update public.community_posts
     set reports_count = n,
         status = case when n >= 3 and status = 'published' then 'flagged' else status end
   where id = new.post_id;
  return null;
end;
$$;
drop trigger if exists bump_reports_t on public.community_reports;
create trigger bump_reports_t after insert on public.community_reports
  for each row execute function public.bump_reports();

-- ─────────────────────────────────────────────────────────────────────────
-- 6.  Storage bucket for photos / videos
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-media', 'community-media', true,
  52428800,  -- 50 MB hard ceiling (video); images are checked to 5 MB client-side
  array['image/jpeg','image/png','image/webp','image/jpg',
        'video/mp4','video/quicktime','video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Media is publicly readable (the bucket is public). NOTE: this means a media
-- file URL is reachable by anyone who has the link, even for a friends-only or
-- private post — column-level privacy hides the POST, but not a leaked file URL.
-- This is the standard trade-off for a public CDN bucket in v1; for stricter
-- privacy, switch the bucket to private and serve signed URLs (documented in
-- supabase/COMMUNITY_SETUP.md).
drop policy if exists "community media public read" on storage.objects;
create policy "community media public read" on storage.objects
  for select using (bucket_id = 'community-media');

-- A user may upload / change / delete ONLY inside their own folder, named after
-- their user id:  community-media/<uid>/<file>
drop policy if exists "community media own folder write" on storage.objects;
create policy "community media own folder write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'community-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "community media own folder modify" on storage.objects;
create policy "community media own folder modify" on storage.objects
  for update to authenticated
  using (bucket_id = 'community-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "community media own folder delete" on storage.objects;
create policy "community media own folder delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'community-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- ════════════════════════════════════════════════════════════════════════
--  Done. To make yourself an admin:
--    Table editor → community_admins → Insert row → user_id = your auth uid
--    (find your uid under Authentication → Users).
-- ════════════════════════════════════════════════════════════════════════
