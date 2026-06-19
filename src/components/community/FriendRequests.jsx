import { useState, useEffect, useCallback } from 'react'
import { Avatar } from './ui.jsx'
import {
  listFriendRequests, listFriends, respondFriendRequest, cancelFriendRequest, removeFriend,
  getMyFriendCode, addFriendByCode, isFriendCodeMissing, FRIEND_REQUESTS_CHANGED,
} from '../../lib/community.js'

// Tell the header bell + the chip badge to re-count after any change here.
const announceChange = () => window.dispatchEvent(new Event(FRIEND_REQUESTS_CHANGED))

// Pretty-print an 8-char code as "ABCD-EFGH" (input still accepts any spacing).
const pretty = (c) => (c && c.length === 8 ? `${c.slice(0, 4)}-${c.slice(4)}` : c || '')

// ─── Incoming / outgoing requests + current friends ───────────────────────
export default function FriendRequests({ myId, onOpenProfile }) {
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)

  // Friend codes (hidden gracefully if friend_codes.sql hasn't been run).
  const [myCode, setMyCode] = useState('')
  const [codesOn, setCodesOn] = useState(true)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: reqs }, { data: fr }, { data: code, error: codeErr }] = await Promise.all([
      listFriendRequests(myId), listFriends(myId), getMyFriendCode(),
    ])
    setIncoming(reqs?.incoming || [])
    setOutgoing(reqs?.outgoing || [])
    setFriends(fr || [])
    if (isFriendCodeMissing(codeErr)) setCodesOn(false)
    else if (code) setMyCode(code)
    setLoading(false)
  }, [myId])

  useEffect(() => { load() }, [load])

  async function respond(id, accept) { await respondFriendRequest(id, accept); announceChange(); load() }
  async function cancel(id) { await cancelFriendRequest(id); announceChange(); load() }
  async function unfriend(id) { await removeFriend(id); announceChange(); load() }

  function copyCode() {
    if (!myCode) return
    navigator.clipboard?.writeText(pretty(myCode)).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }

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
      {/* ── Friend codes: add anyone without needing their username ── */}
      {codesOn && (
        <section className="card-bone p-4 sm:p-5">
          <span className="editorial-label text-clay">Friend code</span>
          <p className="text-sm text-ink-soft mt-1 leading-snug">
            Share your code, or enter a friend’s — no username needed.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div>
              <span className="block editorial-label text-ink-softer mb-1">Yours</span>
              <button onClick={copyCode} title="Copy your code"
                className="font-mono text-xl sm:text-2xl tracking-[0.18em] text-ink bg-cream border border-ink/15 px-3 py-1.5 hover:border-ink/40 transition-colors">
                {pretty(myCode) || '········'}
              </button>
            </div>
            <button onClick={copyCode} className="btn-ghost text-sm self-end mb-1">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-ink/10">
            <span className="block editorial-label text-ink-softer mb-1.5">Add by code</span>
            <AddByCode onAdded={() => { announceChange(); load() }} onOpenProfile={onOpenProfile} myCode={myCode} />
          </div>
        </section>
      )}

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
        {friends.length === 0 ? <Empty>No friends yet — share your friend code above, or find people from Search.</Empty> : (
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

// Enter a friend's code → sends them a request (or befriends instantly if they
// already asked you). Shows a clear success/error line either way.
function AddByCode({ onAdded, onOpenProfile, myCode }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)   // { ok, text, username? }

  const norm = (s) => s.toUpperCase().replace(/[^A-Z0-9]/g, '')

  async function submit(e) {
    e.preventDefault()
    const clean = norm(code)
    if (clean.length < 4) { setMsg({ ok: false, text: 'Enter a full friend code.' }); return }
    if (myCode && clean === myCode) { setMsg({ ok: false, text: 'That’s your own code.' }); return }
    setBusy(true); setMsg(null)
    const { data, error } = await addFriendByCode(clean)
    setBusy(false)
    if (error) { setMsg({ ok: false, text: error.message || 'Could not add that code.' }); return }
    const who = data.profile?.display_name || (data.profile?.username ? `@${data.profile.username}` : 'them')
    setMsg({
      ok: true,
      username: data.profile?.username,
      text: data.status === 'friends' ? `You’re now friends with ${who}.` : `Friend request sent to ${who}.`,
    })
    setCode('')
    onAdded()
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-start gap-2">
      <input
        value={code}
        onChange={(e) => { setCode(e.target.value); setMsg(null) }}
        placeholder="e.g. ABCD-EFGH"
        maxLength={9}
        autoCapitalize="characters" autoCorrect="off" spellCheck={false}
        className="input-line font-mono tracking-[0.12em] uppercase flex-1 min-w-[10rem]"
        aria-label="Friend code"
      />
      <button type="submit" disabled={busy} className="btn-clay disabled:opacity-50">
        {busy ? 'Adding…' : 'Add'}
      </button>
      {msg && (
        <p className={`w-full text-sm mt-1 ${msg.ok ? 'text-sage-dark' : 'text-clay'}`}>
          {msg.text}
          {msg.ok && msg.username && (
            <button type="button" onClick={() => onOpenProfile(msg.username)} className="underline underline-offset-2 ml-1 hover:text-ink">View profile</button>
          )}
        </p>
      )}
    </form>
  )
}
