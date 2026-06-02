-- ─────────────────────────────────────────────────────────────────────────
-- Quill — Supabase database setup
-- Run this once in: supabase.com → your project → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Profiles table — one row per user, mirrors the UserContext state
create table if not exists public.profiles (
  id                   uuid        references auth.users on delete cascade primary key,
  name                 text        default '',
  skin_type            text        default '',
  goal                 text        default '',
  time_per_day         text        default '',
  favorites            jsonb       default '[]'::jsonb,
  dismissed_onboarding boolean     default false,
  tier                 text        default 'free',   -- 'free' | 'pro' | 'max'
  updated_at           timestamptz default now()
);

-- 2. Row-level security — users can only see and edit their own row
alter table public.profiles enable row level security;

create policy "select own profile" on public.profiles
  for select using ( auth.uid() = id );

create policy "insert own profile" on public.profiles
  for insert with check ( auth.uid() = id );

create policy "update own profile" on public.profiles
  for update using ( auth.uid() = id );

-- 3. Auto-create a blank profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$;

-- Drop if exists so re-running this script is safe
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
