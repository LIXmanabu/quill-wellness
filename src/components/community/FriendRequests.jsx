import { useState, useEffect, useCallback } from 'react'
import { Avatar } from './ui.jsx'
import {
  listFriendRequests, listFriends, respondFriendRequest, cancelFriendRequest, removeFriend,
  FRIEND_REQUESTS_CHANGED,
} from '../../lib/community.js'

// Tell the header bell + the chip badge to re-count after any change here.
const announceChange = () => window.dispatchEvent(new Event(FRIEND_REQUESTS_CHANGED))

// ─── Incoming / outgoing requests + current friends ───────────────────────
export default function FriendRequests({ myId, onOpenProfile }) {
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: reqs }, { data: fr }] = await Promise.all([
      listFriendRequests(myId), listFriends(myId),
    ])
    setIncoming(reqs?.incoming || [])
    setOutgoing(reqs?.outgoing || [])
    setFriends(fr || [])
    setLoading(false)
  }, [myId])

  useEffect(() => { load() }, [load])

  async function respond(id, accept) { await respondFriendRequest(id, accept); announceChange(); load() }
  async function cancel(id) { await cancelFriendRequest(id); announceChange(); load() }
  async function unfriend(id) { await removeFriend(id); announceChange(); load() }

  if (loading) return <div className="py-12 text-center text-ink-soft">Loading…</div>

  const Row = ({ p, children }) => (
    <li className="bg-cream-light p-4 flex items-center gap-3">
      <button onClick={() => p.username && onOpenProfile(p.username)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
        <Avatar url={p.avatar_url} name={p.display_name || p.username} size={42} />
        <span className="min-w-0">
          <span className="block font-medium text-ink truncate">{p.display_name || p.username || 'Someone'}</span>
          {p.username && <span className="block text-xs text-ink-softer truncate">@{p.username}</span>}
        </span>
      </button>
      <span className="flex items-center gap-2 shrink-0">{children}</span>
    </li>
  )

  return (
    <div className="space-y-9">
      <Section title="Friend requests" count={incoming.length}>
        {incoming.length === 0 ? <Empty>No new requests.</Empty> : (
          <ul className="space-y-px bg-ink/10">
            {incoming.map((r) => (
              <Row key={r.id} p={r.profile}>
                <button onClick={() => respond(r.id, true)} className="btn-clay !px-3 !py-2 text-xs">Accept</button>
                <button onClick={() => respond(r.id, false)} className="btn-ghost text-ink-soft hover:text-clay text-xs">Decline</button>
              </Row>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Sent" count={outgoing.length}>
        {outgoing.length === 0 ? <Empty>You haven’t sent any requests.</Empty> : (
          <ul className="space-y-px bg-ink/10">
            {outgoing.map((r) => (
              <Row key={r.id} p={r.profile}>
                <span className="chip chip-cream text-xs">Pending</span>
                <button onClick={() => cancel(r.id)} className="btn-ghost text-ink-softer hover:text-clay text-xs">Cancel</button>
              </Row>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Friends" count={friends.length}>
        {friends.length === 0 ? <Empty>No friends yet — find people from Search.</Empty> : (
          <ul className="space-y-px bg-ink/10">
            {friends.map((p) => (
              <Row key={p.id} p={p}>
                <button onClick={() => unfriend(p.id)} className="btn-ghost text-ink-softer hover:text-clay text-xs">Remove</button>
              </Row>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}

function Section({ title, count, children }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-ink/15">
        <span className="editorial-label">{title}</span>
        <span className="text-[10px] num-display text-ink-softer">{count}</span>
      </div>
      {children}
    </section>
  )
}
function Empty({ children }) {
  return <p className="text-sm text-ink-soft py-2">{children}</p>
}
