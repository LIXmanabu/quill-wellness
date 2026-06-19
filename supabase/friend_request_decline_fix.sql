-- ════════════════════════════════════════════════════════════════════════
--  Quill — Community patch: declining a friend request no longer blocks re-asking
--
--  Run this ONCE in the Supabase SQL Editor (same place as community.sql).
--  Safe to re-run.
--
--  The bug it fixes:
--   • friend_requests has unique(sender_id, receiver_id). The old
--     respond_friend_request() left a row behind (status 'declined' or
--     'accepted'). A 'declined' row then PERMANENTLY blocked the sender from
--     ever asking that person again — the unique constraint rejected the new
--     request, and the sender couldn't delete the stale row either (the delete
--     policy only allows status = 'pending').
--
--  The fix:
--   • respond_friend_request() now DELETES the request once it's answered.
--     On accept, the friendships row is the source of truth; on decline, no
--     trace is left, so the pair is free to send a fresh request later.
--   • A one-time cleanup removes any rows already stuck in a non-pending state,
--     freeing previously-blocked pairs. This is safe: nothing in the app reads
--     non-pending request rows (friendships hold accepted relationships;
--     listing/counting only ever filters status = 'pending').
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.respond_friend_request(request_id uuid, accept boolean)
returns void language plpgsql security definer set search_path = public as $$
declare r public.friend_requests;
begin
  select * into r from public.friend_requests where id = request_id;
  if not found then raise exception 'Request not found'; end if;
  if r.receiver_id <> auth.uid() then raise exception 'Not your request to answer'; end if;
  if r.status <> 'pending' then raise exception 'Request already answered'; end if;

  if accept then
    insert into public.friendships (user_a, user_b)
    values (least(r.sender_id, r.receiver_id), greatest(r.sender_id, r.receiver_id))
    on conflict do nothing;
  end if;

  -- Remove the request once answered (see header for why deleting matters).
  delete from public.friend_requests where id = request_id;
end;
$$;

-- One-time cleanup: free any pair already blocked by a leftover non-pending row.
delete from public.friend_requests where status <> 'pending';
