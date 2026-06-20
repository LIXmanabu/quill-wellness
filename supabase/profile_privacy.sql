-- ════════════════════════════════════════════════════════════════════════
--  Quill — Community patch: real profile privacy controls
--
--  Run this ONCE in the Supabase SQL Editor (after community.sql + badge_override.sql).
--  Safe to re-run (idempotent).
--
--  What it adds to profiles (all default to today's open behaviour, so nothing
--  changes until a member tightens their own settings):
--    • profile_visibility  'public' | 'friends' | 'private'
--    • show_badges         show your medals on your public profile
--    • show_saved          (reserved) show your saved routines publicly
--    • allow_requests      accept incoming friend requests
--    • allow_comments      let others comment on your routines
--
--  Enforcement (server-side, can't be bypassed from the client):
--    • allow_requests → a trigger blocks friend_requests aimed at someone who
--      turned them off.
--    • allow_comments → a trigger blocks comments on a routine whose owner
--      turned them off (the owner can always comment on their own).
--    • profile_visibility → get_visible_profile() returns a profile only to
--      people allowed to see it (public = everyone, friends = accepted friends
--      + self, private = self only).
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. Columns ──────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists profile_visibility text    not null default 'public';
alter table public.profiles add column if not exists show_badges        boolean not null default true;
alter table public.profiles add column if not exists show_saved         boolean not null default true;
alter table public.profiles add column if not exists allow_requests     boolean not null default true;
alter table public.profiles add column if not exists allow_comments     boolean not null default true;

do $$ begin
  alter table public.profiles
    add constraint profiles_visibility_chk check (profile_visibility in ('public','friends','private'));
exception when duplicate_object then null; end $$;

-- ── 2. Re-expose the public view with the viewer-relevant prefs ──────────────
-- (keeps badge_override from badge_override.sql). The base profiles table stays
-- owner-locked; only these columns are ever public.
create or replace view public.public_profiles as
  select id, username, display_name, avatar_url, bio, created_at, badge_override,
         profile_visibility, show_badges, allow_requests
  from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- ── 3. Enforce allow_requests ───────────────────────────────────────────────
create or replace function public.guard_allow_requests()
returns trigger language plpgsql security definer set search_path = public as $$
declare allowed boolean;
begin
  select allow_requests into allowed from public.profiles where id = new.receiver_id;
  if allowed is false then
    raise exception 'This member is not accepting friend requests';
  end if;
  return new;
end; $$;

drop trigger if exists guard_allow_requests_t on public.friend_requests;
create trigger guard_allow_requests_t before insert on public.friend_requests
  for each row execute function public.guard_allow_requests();

-- ── 4. Enforce allow_comments ───────────────────────────────────────────────
create or replace function public.guard_allow_comments()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner uuid; allowed boolean;
begin
  select user_id into owner from public.community_posts where id = new.post_id;
  if owner is null then return new; end if;
  if owner = new.user_id then return new; end if;          -- owner can always reply
  select allow_comments into allowed from public.profiles where id = owner;
  if allowed is false then
    raise exception 'Comments are turned off for this routine';
  end if;
  return new;
end; $$;

drop trigger if exists guard_allow_comments_t on public.post_comments;
create trigger guard_allow_comments_t before insert on public.post_comments
  for each row execute function public.guard_allow_comments();

-- ── 5. Visibility-aware profile fetch ───────────────────────────────────────
-- Returns 0 or 1 rows. The client calls this instead of reading public_profiles
-- directly, so a private/friends-only profile simply isn't returned to people
-- who aren't allowed to see it.
create or replace function public.get_visible_profile(uname text)
returns setof public.public_profiles
language sql stable security definer set search_path = public as $$
  select p.*
  from public.public_profiles p
  join public.profiles pr on pr.id = p.id
  where lower(p.username) = lower(trim(uname))
    and (
      pr.profile_visibility = 'public'
      or pr.id = auth.uid()
      or (pr.profile_visibility = 'friends' and public.is_friend(pr.id))
    );
$$;
grant execute on function public.get_visible_profile(text) to anon, authenticated;
