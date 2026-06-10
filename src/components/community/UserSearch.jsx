import { useState, useEffect, useRef } from 'react'
import { Avatar } from './ui.jsx'
import { searchUsers } from '../../lib/community.js'

// ─── Find people by username / display name ───────────────────────────────
export default function UserSearch({ myId, onOpenProfile }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    clearTimeout(timer.current)
    if (query.trim().length < 2) { setResults([]); return }
    setLoading(true); setTouched(true)
    timer.current = setTimeout(async () => {
      const { data } = await searchUsers(query, myId)
      setResults(data || [])
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer.current)
  }, [query, myId])

  return (
    <div>
      <label className="relative block">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-softer">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" strokeLinecap="round" /></svg>
        </span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus
          placeholder="Search by name or @username…"
          className="input-line pl-11" />
      </label>

      <div className="mt-4 space-y-px bg-ink/10">
        {loading && <div className="bg-cream-light p-4 text-sm text-ink-soft">Searching…</div>}
        {!loading && touched && results.length === 0 && query.trim().length >= 2 && (
          <div className="bg-cream-light p-6 text-center">
            <p className="text-ink-soft text-sm">No one found for “{query.trim()}”.</p>
          </div>
        )}
        {results.map((u) => (
          <button key={u.id} onClick={() => onOpenProfile(u.username)}
            className="w-full bg-cream-light p-4 flex items-center gap-3 text-left hover:bg-bone transition-colors">
            <Avatar url={u.avatar_url} name={u.display_name || u.username} size={42} />
            <span className="min-w-0">
              <span className="block font-medium text-ink truncate">{u.display_name || u.username}</span>
              <span className="block text-xs text-ink-softer truncate">@{u.username}{u.bio ? ` · ${u.bio}` : ''}</span>
            </span>
            <span className="ml-auto text-ink-softer display-italic">→</span>
          </button>
        ))}
      </div>

      {!touched && (
        <p className="text-sm text-ink-soft mt-6 leading-relaxed">
          Search for friends by their username or display name, then open their profile to send a friend request.
        </p>
      )}
    </div>
  )
}
