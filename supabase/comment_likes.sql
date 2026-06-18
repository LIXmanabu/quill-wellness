-- ════════════════════════════════════════════════════════════════════════
--  Quill — Community patch: likes on comments
--
--  Run this ONCE in the Supabase SQL Editor, AFTER community.sql and
--  community_comments.sql. Safe to re-run (every statement is idempotent).
--
--  What it adds:
--   • a `likes_count` column on post_comments (kept current by a trigger)
--   • a `comment_likes` table with Row-Level Security that mirrors post_likes:
--       – you may add/remove only your OWN like (one per comment), and
--       – you may read only your own like rows (counts come from likes_count)
--  Nobody can like as someone else, and the count can't be tampered with from
--  the browser — it's maintained server-side by the trigger.
-- ════════════════════════════════════════════════════════════════════════

-- 1.  Denormalised like count on the comment
alter table public.post_comments
  add column if not exists likes_count int default 0;

-- 2.  Likes table (one row per (user, comment))
create table if not exists public.comment_likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  comment_id uuid not null references public.post_comments (id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, comment_id)
);
alter table public.comment_likes enable row level security;

create index if not exists comment_likes_comment_idx
  on public.comment_likes (comment_id);

-- You manage only your own comment likes.
drop policy if exists "manage own comment likes" on public.comment_likes;
create policy "manage own comment likes" on public.comment_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3.  Keep likes_count current
create or replace function public.bump_comment_likes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.post_comments set likes_count = likes_count + 1 where id = new.comment_id;
  elsif tg_op = 'DELETE' then
    update public.post_comments set likes_count = greatest(0, likes_count - 1) where id = old.comment_id;
  end if;
  return null;
end;
$$;
drop trigger if exists bump_comment_likes_t on public.comment_likes;
create trigger bump_comment_likes_t after insert or delete on public.comment_likes
  for each row execute function public.bump_comment_likes();

-- ════════════════════════════════════════════════════════════════════════
--  Done. Refresh the app — you can now like comments in the Q&A threads.
-- ════════════════════════════════════════════════════════════════════════
