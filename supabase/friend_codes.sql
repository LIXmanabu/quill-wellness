-- ════════════════════════════════════════════════════════════════════════
--  Quill — Community patch: friendship codes
--
--  Run this ONCE in the Supabase SQL Editor (after community.sql). Safe to re-run.
--
--  What it adds:
--   • Every profile gets a short, shareable FRIEND CODE (e.g. "ABCD-7K3P").
--     You share your code; a friend types it in to add you — no username needed.
--   • Codes are NOT in the public_profiles view, so they can't be scraped or
--     enumerated; they're only resolvable through add_friend_by_code() below.
--
--  Three SECURITY DEFINER functions:
--   • my_friend_code()        → returns my code, generating it on first use.
--   • add_friend_by_code(code)→ resolves the code's owner and sends them a friend
--                               request (or, if they'd already requested me,
--                               accepts instantly). Reuses the normal request flow.
--   • (helper) gen_friend_code() → a unique code from an unambiguous alphabet.
-- ════════════════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists friend_code text;

create unique index if not exists profiles_friend_code_idx
  on public.profiles (friend_code) where friend_code is not null;

-- Unambiguous alphabet: no 0/O/1/I/L to avoid "is that a one or an L" confusion.
create or replace function public.gen_friend_code()
returns text language plpgsql as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
  i int;
begin
  loop
    code := '';
    for i in 1..8 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.profiles where friend_code = code);
  end loop;
  return code;
end;
$$;

-- My own code (owner-only), created lazily the first time it's needed.
create or replace function public.my_friend_code()
returns text language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select friend_code into c from public.profiles where id = auth.uid();
  if c is null then
    c := public.gen_friend_code();
    update public.profiles set friend_code = c where id = auth.uid();
  end if;
  return c;
end;
$$;

-- Add someone by their code. Normalises input (case-insensitive, ignores spaces
-- and dashes), then sends a friend request as the caller — or, if that person
-- already has a pending request out to me, accepts it so we become friends
-- immediately. Returns { status, user_id } so the UI can confirm who/what.
create or replace function public.add_friend_by_code(code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  target uuid;
  norm   text := upper(regexp_replace(coalesce(code, ''), '[^A-Za-z0-9]', '', 'g'));
  rev    public.friend_requests;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if norm = '' then raise exception 'Enter a friend code'; end if;

  select id into target from public.profiles where friend_code = norm;
  if target is null then raise exception 'No one uses that code'; end if;
  if target = auth.uid() then raise exception 'That is your own code'; end if;

  -- Already friends? Nothing to do.
  if exists (
    select 1 from public.friendships
    where user_a = least(auth.uid(), target) and user_b = greatest(auth.uid(), target)
  ) then
    return jsonb_build_object('status', 'friends', 'user_id', target);
  end if;

  -- They already asked me → accept instantly (mutual intent).
  select * into rev from public.friend_requests
   where sender_id = target and receiver_id = auth.uid() and status = 'pending';
  if found then
    insert into public.friendships (user_a, user_b)
      values (least(target, auth.uid()), greatest(target, auth.uid())) on conflict do nothing;
    delete from public.friend_requests where id = rev.id;
    return jsonb_build_object('status', 'friends', 'user_id', target);
  end if;

  -- Otherwise create (or keep) my outgoing request.
  insert into public.friend_requests (sender_id, receiver_id)
    values (auth.uid(), target)
    on conflict (sender_id, receiver_id) do nothing;
  return jsonb_build_object('status', 'requested', 'user_id', target);
end;
$$;

grant execute on function public.my_friend_code()        to authenticated;
grant execute on function public.add_friend_by_code(text) to authenticated;
