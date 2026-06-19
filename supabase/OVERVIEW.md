# Quill — backend overview & launch runbook

A one-page record of everything that powers the app's backend, the order to
install it, and the switches you control. For first-time account/database setup,
see `SETUP.md`; this file is the full picture once you're past that.

> **This file contains no secrets.** It only points at where to do things in your
> own Supabase dashboard. The only key shipped in the app is the *public* anon
> key; all real protection comes from Row-Level Security — the database itself
> decides who can read/write what. Reading this file gives nobody the ability to
> change anything.
>
> **Who can change things:** only **your GitHub login** (code + deploy) and **your
> Supabase login** (database + the switches below). Visitors holding the public
> key cannot modify protected data — RLS blocks it.

---

## Migrations — run once each, in this order

**Supabase → SQL Editor**, paste each file's contents, **Run**. All are idempotent
(safe to re-run). Each later one builds on the earlier ones, so order matters.

| # | File | What it turns on |
|---|------|------------------|
| 1 | `schema.sql` | `profiles` table + per-user RLS; auto-creates a profile on signup |
| 2 | `community.sql` | Community core: posts, likes, saves, public-profiles view, friends, reports |
| 3 | `community_comments.sql` | Comments on routines (`post_comments` + `comments_count`) |
| 4 | `comment_likes.sql` | Liking individual comments (`comment_likes` + `likes_count`) |
| 5 | `admins.sql` | Developer/admin mode (`admins` list + `is_admin()`) |
| 6 | `tester_codes.sql` | Beta tester codes (`tester_codes` + `redeem_tester_code()`) |
| 7 | `beta_switch.sql` | The beta master switch (`app_config.beta_active`) |
| 8 | `qa_forum.sql` | Q&A forum (`kind` column on posts; questions reuse posts/comments/likes) |

If you ever see `relation "public.post_comments" does not exist`, run #3 before #4.

**Current status:** all of the above are installed and verified live.

---

## Make yourself an admin

After `admins.sql` is installed and you've signed in once:

```sql
insert into public.admins (user_id, note)
select id, 'Felix'
from auth.users
where lower(email) = lower('felix_s3006@icloud.com')   -- your login email
on conflict (user_id) do nothing;
```

Refresh while signed in → the dev tier-switcher appears (only for you). Delete
your row to revoke.

---

## Tester codes

- Built-in codes that always work: **`quill-beta`** and **`testerBeta`**.
- Custom, trackable codes: **Table Editor → `tester_codes` → Insert row**
  (`code`, optional `label`, `active`, optional `max_uses`, optional `expires_at`).
  Share `https://lixmanabu.github.io/quill-wellness/?tester=<code>` or have testers
  type it in **My Quill → Beta access**.
- Revoke a single code: set its `active` to `false` (or delete the row).

Being a tester only shows the beta badge + feedback button — it does **not** unlock
any paid features.

---

## End the beta at launch (one toggle)

Turns tester mode off for **everyone** — including people who already redeemed a
code — with no redeploy:

```sql
update public.app_config set value = false where key = 'beta_active';
```

Set it back to `true` to reopen the beta. (Table Editor → `app_config` → toggling
the `beta_active` row works too.)

---

## Auth URL configuration

In **Supabase → Authentication → URL Configuration**, keep these current so
confirmation / reset / sign-in-link emails return to the app:

- **Site URL:** `https://lixmanabu.github.io/quill-wellness/`
- **Redirect URLs:** `https://lixmanabu.github.io/quill-wellness/**`
  (+ `http://localhost:5173/**` and `http://localhost:5174/**` for local testing)

Moving to a custom domain later → update these to the new domain.

---

## Deploying the app

The live site serves from the **`gh-pages`** branch, not `main`. To publish:

```sh
npm run deploy   # builds and pushes to gh-pages
```

Pushing to `main` backs up the source but does **not** update the live site —
only `npm run deploy` does.
