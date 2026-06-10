-- ════════════════════════════════════════════════════════════════════════
--  Quill — Community patch: publish media immediately (remove review gate)
--
--  Run this ONCE in the Supabase SQL Editor (same place as community.sql).
--  Safe to re-run.
--
--  What it changes:
--   • Removes the rule that sent photo/video posts from accounts younger than
--     7 days to "pending_review". After this, posts with media publish straight
--     to the public feed.
--   • Everything else still protects the community: text moderation still
--     blocks/holds bad text, and a post is still auto-hidden once 3 different
--     people report it.
--
--  ⚠️ Trade-off: photos/videos are no longer screened before they go public.
--     If you later want pre-publish review back, re-run section 3(b) of
--     community.sql (the community_media_guard trigger).
-- ════════════════════════════════════════════════════════════════════════

drop trigger if exists community_media_guard_t on public.community_posts;
drop function if exists public.community_media_guard();
