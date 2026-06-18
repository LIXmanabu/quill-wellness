-- ════════════════════════════════════════════════════════════════════════
--  Quill — Beta master switch
--
--  Run this ONCE in the Supabase SQL Editor. Safe to re-run.
--
--  WHAT THIS IS
--  A one-row config flag the app reads on load: `beta_active`. While it's TRUE,
--  tester mode works normally. Flip it to FALSE at launch and the app instantly
--  stops treating ANYONE as a tester — including people who already redeemed a
--  code on their device — and hides all tester UI (the Beta badge, the feedback
--  button, the "Have a tester code?" box). No redeploy needed.
--
--  Anyone can READ this flag (it's just a feature switch); only YOU, from the
--  Supabase dashboard, can change it.
--
--  HOW TO END THE BETA (at launch)
--  Option A — Table Editor → "app_config" → the beta_active row → set value OFF.
--  Option B — run:  update public.app_config set value = false where key = 'beta_active';
--  To turn the beta back on, set it true again.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.app_config (
  key        text primary key,
  value      boolean     not null default true,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

-- Everyone may read feature flags…
drop policy if exists "read app config" on public.app_config;
create policy "read app config" on public.app_config
  for select using (true);
grant select on public.app_config to anon, authenticated;

-- …but nobody can write from the browser. With RLS on and NO insert/update/
-- delete policies, only the dashboard (service role) can change a flag.
revoke insert, update, delete on public.app_config from anon, authenticated;

-- Seed the beta flag, ON for the test period.
insert into public.app_config (key, value)
values ('beta_active', true)
on conflict (key) do nothing;
