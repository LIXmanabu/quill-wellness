# Community — setup (one-time)

The Community tab is built and live in the app, but it needs its database tables
and a storage bucket created before it does anything. Everything is in one SQL
file. This takes about 2 minutes.

## 1. Run the SQL

1. Go to **supabase.com → your Quill project → SQL Editor → New query**.
2. Open `supabase/community.sql` from this repo, copy the whole thing, paste it
   into the editor, and click **Run**.
   - It's safe to re-run (every statement is idempotent).
   - It assumes `schema.sql` (the `profiles` table) was already run — it has been.

That single file creates:

- new public columns on `profiles` (`username`, `display_name`, `avatar_url`, `bio`)
  plus a **`public_profiles` view** so other people only ever see those public
  fields — never your `skin_type`, `goal`, or `favorites`.
- the tables: `community_posts`, `post_likes`, `saved_posts`, `friend_requests`,
  `friendships`, `community_reports`, `community_admins`.
- Row-Level Security on all of them (the security rules — see below).
- a public **`community-media`** Storage bucket for photos/videos.

### Comments (one extra file)

To turn on **comments under each routine**, run `supabase/community_comments.sql`
the same way (SQL Editor → paste → Run, also safe to re-run). It adds a
`post_comments` table plus a `comments_count` column, with Row-Level Security
that reuses post visibility — you can only read or write comments on posts you're
allowed to see. Until you run it, the rest of Community works normally and the
comment box shows a quiet "comments are warming up" note instead of an error.

## 2. Make yourself an admin (optional, for the moderation queue)

1. **Authentication → Users** — copy your account's **UID**.
2. **Table editor → `community_admins` → Insert row** — paste your UID into
   `user_id`, save.

Now the **Moderation queue** button appears for you in the Community tab. Nobody
can make themselves an admin from the app — the `community_admins` table has no
insert policy, so the only way in is from this dashboard (which runs as the
service role).

## What's enforced where

**Security (Row-Level Security, in the database — can't be bypassed by the app):**

- Anyone (even signed-out) can read **public + published** posts.
- You can always read **your own** posts (any status).
- You can read a friend's **friends-only** posts only if you're accepted friends.
- Admins can read everything (for moderation).
- You can only create/edit/delete **your own** posts.
- Reports can be filed by any signed-in user; only admins can read/resolve them.
- Storage: anyone can *read* media; you can only *upload* into your own folder
  (`community-media/<your-uid>/…`).

**Moderation (no paid AI — version 1):**

- `moderateText()` (`src/lib/moderation.js`) runs a keyword/heuristic filter.
  Clearly inappropriate text is **blocked** (never saved); suspicious text is
  sent to **`pending_review`**. The database also has a tiny hard-block trigger
  as a last line of defence.
- Posts **with media** from accounts **younger than 7 days** are forced to
  `pending_review` before they're public (enforced by a DB trigger, so it can't
  be skipped by tampering with the app).
- A post is auto-**flagged** (hidden from the public feed) once **3 different
  people** report it.
- `moderateMedia()` is a stub you can later point at a real image/video
  moderation API without touching any other code.

## Media privacy — the one limitation to know

The `community-media` bucket is **public** (a normal CDN bucket). That means a
media *file URL*, if someone has the exact link, is reachable even for a
friends-only or private post. The **post** itself is still hidden by the rules
above — only the raw file link isn't access-controlled.

This is the standard, simple trade-off for v1. If you later want strict media
privacy, switch the bucket to **private** in the dashboard and change
`getPublicUrl` in `src/lib/communityMedia.js` to `createSignedUrl`. Left as a
public bucket for now because it's far simpler and most shared routines are
public anyway.

## Turning it off / rolling back

Drop the tables in reverse order (or just `drop table … cascade` the community
tables) and delete the `community-media` bucket. The rest of Quill is untouched.
