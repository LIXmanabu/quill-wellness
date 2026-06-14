-- ════════════════════════════════════════════════════════════════════════
--  Quill — Beta tester codes
-- ════════════════════════════════════════════════════════════════════════
--
--  WHAT THIS IS
--  A small table of invite codes that flag a visitor as a beta tester, plus
--  one secure function the app calls to check a code. The list of codes is
--  NEVER sent to the browser, so nobody can read your codes out of the site.
--
--  HOW TO INSTALL (one time)
--  1. Open your Supabase project → SQL Editor → New query.
--  2. Paste this whole file and click "Run". You should see "Success".
--
--  HOW TO MAKE A TESTER CODE (any time, no redeploy)
--  Supabase → Table Editor → "tester_codes" → "Insert row":
--    • code      the code/link word, e.g. sarah-2026  (keep it simple)
--    • label     a note for you, e.g. "Sarah from Insta"  (optional)
--    • active    leave ON. Flip OFF to instantly revoke.
--    • max_uses  leave blank for unlimited, or set e.g. 1 for single-use.
--    • expires_at leave blank for no expiry, or pick a date/time.
--  Then send the tester this link (swap in their code):
--    https://lixmanabu.github.io/quill-wellness/?tester=sarah-2026
--  They tap it and they're in. They can also type the code on the checkout
--  screen's hidden box. "uses" counts how many times each code was redeemed.
--
--  HOW TO REVOKE  Set that row's "active" to false (or delete the row).
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.tester_codes (
  code        text primary key,
  label       text,
  active      boolean     not null default true,
  uses        integer     not null default 0,
  max_uses    integer,                       -- null = unlimited
  expires_at  timestamptz,                   -- null = never expires
  created_at  timestamptz not null default now()
);

-- Lock the table down. RLS on + no policies + no table grants to the public
-- roles means the browser (anon/authenticated) can neither read nor write it.
-- Only the function below (which runs with the owner's rights) and the
-- Supabase dashboard (service role) can touch it.
alter table public.tester_codes enable row level security;
revoke all on public.tester_codes from anon, authenticated;

-- The only thing the app can do: ask "is this code good?" and, if so, count
-- the redemption. Returns true/false; never reveals any other code.
create or replace function public.redeem_tester_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.tester_codes%rowtype;
begin
  if p_code is null or btrim(p_code) = '' then
    return false;
  end if;

  select * into rec
    from public.tester_codes
   where lower(code) = lower(btrim(p_code))
   for update;

  if not found then return false; end if;
  if not rec.active then return false; end if;
  if rec.expires_at is not null and rec.expires_at < now() then return false; end if;
  if rec.max_uses   is not null and rec.uses >= rec.max_uses then return false; end if;

  update public.tester_codes
     set uses = uses + 1
   where code = rec.code;

  return true;
end;
$$;

-- Let the public app call only this one function.
revoke all on function public.redeem_tester_code(text) from public;
grant execute on function public.redeem_tester_code(text) to anon, authenticated;

-- Keep the original shared link working: seed the existing code.
insert into public.tester_codes (code, label)
values ('quill-beta', 'Original shared beta link')
on conflict (code) do nothing;
