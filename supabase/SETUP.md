# Quill accounts database — setup guide

Your app is already coded for real accounts. These steps **turn it on**. ~10 minutes, free.

## What you'll get
- People create accounts (email + password) **and** can sign in with a one-click
  email link (no password needed).
- Accounts live in one central database you can see.
- People stay signed in across visits, and across devices.
- Passwords are encrypted by Supabase — nobody, including you, can read them
  (this is correct and legally required). Forgotten passwords are handled by
  email reset links, not by looking them up.

## Step 1 — Create the database (only you can do this)
1. Go to **supabase.com** → **Start your project** → sign in.
2. **New project**. Name `quill`, set a database password (save it), region
   **EU (Frankfurt)**, Free plan. Wait ~2 min.

## Step 2 — Create the table
1. In your project: **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` (in this folder), copy ALL of it, paste, **Run**.
   You should see "Success". This makes the `profiles` table, locks it so each
   user only sees their own data, and auto-creates a profile row on signup.

## Step 3 — Turn on email sign-in links
1. **Authentication** → **Providers** → **Email**: make sure it's enabled.
   "Confirm email" can stay on. (The magic-link option uses this.)
2. **Authentication** → **URL Configuration**: add your live site URL
   (e.g. your GitHub Pages address) to **Site URL** and **Redirect URLs**,
   and also `http://localhost:5174` for local testing.

## Step 4 — Connect the keys (you can paste these to me)
1. **Settings** → **API**. Copy the **Project URL** and the **anon public** key.
2. Put them in **both** env files:
   - `.env.local`   (local dev) — also set `VITE_DEV_MODE=false`
   - `.env.production` (live site)
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
   The anon key is safe to commit — it's public by design. Security comes from
   the Row-Level Security rules in `schema.sql`, not from hiding this key.

## Step 5 — Test
- Local: `npm run dev`, open the site, create an account. Then check
  **Authentication → Users** in Supabase — your new account appears.
- Rebuild/redeploy for the live site (`npm run build`).

## Where you see the accounts
**supabase.com → your project → Authentication → Users.** Live list of every
account: email, name, signup date, last sign-in. This is your admin view.
