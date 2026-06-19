-- ════════════════════════════════════════════════════════════════════════
--  Quill — Community patch: public badge override (admin-set)
--
--  Run this ONCE in the Supabase SQL Editor (after community.sql). Safe to re-run.
--
--  What it adds:
--   • profiles.badge_override — an optional like-total "floor". When set, the
--     person's badge display behaves as if they'd earned at least that many
--     likes, so the medals show as earned to EVERYONE (not just on your device).
--   • It's surfaced through public_profiles so other viewers can read it.
--   • A guard trigger means only admins (or the dashboard/service role) can set
--     it — regular users can't fake their own medals.
--
--  To light up ALL medals on an account, set the floor to the top tier (100000).
--  The last statement below does that for one account by email — edit the email,
--  or set it to NULL to clear.
-- ════════════════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists badge_override integer;

-- Re-expose the public identity view WITH the override (new column added at end).
create or replace view public.public_profiles as
  select id, username, display_name, avatar_url, bio, created_at, badge_override
  from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- Only admins may change badge_override. auth.uid() is NULL for the service role
-- (dashboard SQL editor), so that path is allowed too; ordinary signed-in users
-- (uid set, not admin) are blocked. Other profile edits are unaffected.
create or replace function public.guard_badge_override()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.badge_override is distinct from old.badge_override
     and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins can change badge_override';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_badge_override_t on public.profiles;
create trigger guard_badge_override_t before update on public.profiles
  for each row execute function public.guard_badge_override();

-- ── Turn ON all medals for one account (edit the email; NULL clears it) ──
update public.profiles set badge_override = 100000
 where id = (select id from auth.users where email = 'felix_s3006@icloud.com');
