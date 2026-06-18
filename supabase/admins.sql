-- ════════════════════════════════════════════════════════════════════════
--  Quill — Admin (developer) accounts
-- ════════════════════════════════════════════════════════════════════════
--
--  WHAT THIS IS
--  A small, locked table of user IDs that get developer / "god mode" in the
--  app (the tier switcher). It replaces the old typed dev code, which shipped
--  inside the public JavaScript where anyone could read it. The list of admins
--  is NEVER sent to the browser; the app can only ask "am I an admin?" about
--  the currently signed-in account, and the server answers yes/no.
--
--  WHY A SEPARATE TABLE (not a column on profiles)
--  Users are allowed to UPDATE their own profiles row, so an is_admin column
--  there could be flipped on by the user themselves. This table has RLS on
--  and NO policies, so the browser can neither read nor write it — only the
--  Supabase dashboard (service role) and the function below can touch it.
--
--  HOW TO INSTALL (one time)
--  1. Open your Supabase project → SQL Editor → New query.
--  2. Paste this whole file and click "Run". You should see "Success".
--
--  HOW TO MAKE YOURSELF ADMIN
--  1. Sign in once in the app so your account exists.
--  2. Supabase → Authentication → Users → click your row → copy the UID.
--  3. Supabase → Table Editor → "admins" → Insert row → user_id = <your UID>,
--     note = "Felix".  (Or run the insert at the bottom with your UID.)
--  Refresh the app while signed in — the dev tier switcher appears.
--
--  HOW TO REVOKE  Delete your row from "admins".
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.admins (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  note       text,
  created_at timestamptz not null default now()
);

-- Lock the table down completely. RLS on + no policies + no grants means the
-- browser (anon/authenticated) can neither read the list nor add themselves.
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- The only thing the app can do: ask "is the signed-in user an admin?".
-- security definer → runs with the owner's rights so it can read the locked
-- table, but it only ever checks the caller's own auth.uid(); it never reveals
-- who else is an admin.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── Make yourself admin ───────────────────────────────────────────────────
-- Paste your UID (Authentication → Users) and uncomment:
-- insert into public.admins (user_id, note)
-- values ('00000000-0000-0000-0000-000000000000', 'Felix')
-- on conflict (user_id) do nothing;
