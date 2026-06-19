-- ════════════════════════════════════════════════════════════════════════
--  Quill — Community patch: Q&A forum
--
--  Run ONCE in the Supabase SQL Editor, after community.sql. Idempotent.
--
--  The Q&A forum reuses the community_posts engine: a question is just a post
--  with kind = 'question'. Upvotes are post likes, answers are comments, and
--  answer-upvotes are comment likes — so all the existing Row-Level Security
--  applies automatically. This patch only adds the column that tells the two
--  apart, plus an index for the Q&A feed.
-- ════════════════════════════════════════════════════════════════════════

alter table public.community_posts
  add column if not exists kind text not null default 'routine';

-- Keep values sane (routine | question), added safely if not already present.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'community_posts_kind_check'
  ) then
    alter table public.community_posts
      add constraint community_posts_kind_check check (kind in ('routine','question'));
  end if;
end $$;

create index if not exists community_posts_kind_idx
  on public.community_posts (kind, status, visibility, created_at desc);

-- ════════════════════════════════════════════════════════════════════════
--  Done. Refresh the app — the Q&A tab appears in Community.
-- ════════════════════════════════════════════════════════════════════════
