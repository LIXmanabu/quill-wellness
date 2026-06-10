-- ════════════════════════════════════════════════════════════════════════
--  Quill — Community patch: comments on routines
--
--  Run this ONCE in the Supabase SQL Editor (same place as community.sql),
--  AFTER community.sql. Safe to re-run (every statement is idempotent).
--
--  What it adds:
--   • a `comments_count` column on community_posts (kept current by a trigger)
--   • a `post_comments` table with Row-Level Security:
--       – you can read comments on any post YOU are allowed to see (the policy
--         reuses community_posts' own RLS, so post privacy is inherited for free)
--       – you may write comments only as yourself, only on posts you can see
--       – you may delete your own comment; the post's author and admins may
--         delete any comment on/under their post (light moderation)
--   • a tiny hard-block guard on comment text (last line of defence; nuanced
--     moderation still lives in moderateText() on the client)
-- ════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 1.  Denormalised comment count on the post
-- ─────────────────────────────────────────────────────────────────────────
alter table public.community_posts
  add column if not exists comments_count int default 0;

-- ─────────────────────────────────────────────────────────────────────────
-- 2.  Comments table
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.post_comments (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.community_posts (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  -- Author identity is denormalised onto the comment (same as posts) so the
  -- thread never needs to read other users' profile rows.
  author_username     text default '',
  author_display_name text default '',
  author_avatar_url   text default '',
  body          text not null,
  status        text not null default 'visible'
                check (status in ('visible','hidden')),
  created_at    timestamptz default now()
);
alter table public.post_comments enable row level security;

create index if not exists post_comments_thread_idx
  on public.post_comments (post_id, created_at);

-- ── READ ────────────────────────────────────────────────────────────────
-- A comment is readable when the viewer is allowed to read its parent post.
-- The EXISTS subquery against community_posts is itself subject to that
-- table's RLS, so post visibility (public / own / friends / admin) is
-- inherited automatically. Hidden comments stay visible to their author,
-- the post owner, and admins.
drop policy if exists "read comments on visible posts" on public.post_comments;
create policy "read comments on visible posts" on public.post_comments
  for select using (
    exists (select 1 from public.community_posts p where p.id = post_id)
    and (
      status = 'visible'
      or auth.uid() = user_id
      or public.is_admin()
      or exists (select 1 from public.community_posts p
                 where p.id = post_id and p.user_id = auth.uid())
    )
  );

-- ── WRITE ───────────────────────────────────────────────────────────────
-- You may comment only as yourself, and only on a post you can see (the
-- EXISTS inherits community_posts' read RLS).
drop policy if exists "create own comments" on public.post_comments;
create policy "create own comments" on public.post_comments
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.community_posts p where p.id = post_id)
  );

-- Delete: your own comment, OR you're an admin, OR you own the post the
-- comment sits on (so authors can moderate their own threads).
drop policy if exists "delete own or moderate comments" on public.post_comments;
create policy "delete own or moderate comments" on public.post_comments
  for delete using (
    auth.uid() = user_id
    or public.is_admin()
    or exists (select 1 from public.community_posts p
               where p.id = post_id and p.user_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────────────────
-- 3.  Keep comments_count current
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.bump_comments()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.community_posts set comments_count = greatest(0, comments_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;
drop trigger if exists bump_comments_t on public.post_comments;
create trigger bump_comments_t after insert or delete on public.post_comments
  for each row execute function public.bump_comments();

-- ─────────────────────────────────────────────────────────────────────────
-- 4.  Server-side hard-block on comment text (last line of defence)
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.comment_hard_block()
returns trigger language plpgsql as $$
begin
  if lower(coalesce(new.body,'')) ~ '(child\s*porn|cp\s+for\s+sale|rape|bestiality|\bzoophilia\b)' then
    raise exception 'This content is not allowed.';
  end if;
  return new;
end;
$$;
drop trigger if exists comment_hard_block_t on public.post_comments;
create trigger comment_hard_block_t before insert or update on public.post_comments
  for each row execute function public.comment_hard_block();

-- ════════════════════════════════════════════════════════════════════════
--  Done. Refresh the app — comments now appear under each routine.
-- ════════════════════════════════════════════════════════════════════════
