-- ════════════════════════════════════════════════════════════════════════
--  Quill — database schema
--  Run this ONCE in your Supabase project:
--    supabase.com → your project → SQL Editor → New query → paste → Run
--
--  What it does:
--   1. Creates a `profiles` table (one row per user) for the onboarding/quiz
--      data the app stores. Accounts + emails + passwords themselves live in
--      Supabase's built-in `auth.users` table — Supabase manages those for you
--      and hashes every password automatically (you never see plaintext).
--   2. Turns on Row-Level Security so each signed-in user can read/write ONLY
--      their own profile row — never anyone else's.
--   3. Adds a trigger that automatically creates an empty profile row the
--      moment someone signs up, so their quiz answers have a place to save.
-- ════════════════════════════════════════════════════════════════════════

-- 1. The per-user profile table ------------------------------------------
create table if not exists public.profiles (
  id                   uuid        primary key references auth.users (id) on delete cascade,
  name                 text        default '',
  skin_type            text        default '',
  goal                 text        default '',
  time_per_day         text        default '',
  favorites            jsonb       default '[]'::jsonb,
  dismissed_onboarding boolean     default false,
  updated_at           timestamptz default now()
);

-- 2. Row-Level Security: lock every row to its owner ---------------------
alter table public.profiles enable row level security;

-- A user may read their own row.
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- A user may update their own row.
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- A user may insert their own row (covers the rare case the trigger missed).
drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 3. Auto-create a profile row on signup ---------------------------------
-- The app saves profiles with UPDATE, so a row must already exist. This
-- trigger creates one (seeded with the name from signup) for every new user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
