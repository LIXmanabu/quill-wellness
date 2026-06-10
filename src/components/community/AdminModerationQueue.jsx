import { useState, useEffect, useCallback } from 'react'
import { CategoryBadge, StatusPill, VisibilityIcon, timeAgo } from './ui.jsx'
import {
  adminListPosts, adminSetStatus, adminListReports, adminResolveReport,
} from '../../lib/community.js'

// ─── Admin / moderation queue ─────────────────────────────────────────────
const TABS = [
  { key: 'pending_review', label: 'Pending' },
  { key: 'flagged',        label: 'Flagged' },
  { key: 'reports',        label: 'Reports' },
  { key: 'hidden',         label: 'Hidden' },
]

export default function AdminModerationQueue({ onOpenPost }) {
  const [tab, setTab] = useState('pending_review')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    if (tab === 'reports') {
      const { data } = await adminListReports('open')
      setItems(data || [])
    } else {
      const { data } = await adminListPosts(tab)
      setItems(data || [])
    }
    setLoading(false)
  }, [tab])

  useEffect(() => { load() }, [load])

  async function setStatus(id, status) { await adminSetStatus(id, status); load() }
  async function resolve(id, status, postId, postStatus) {
    if (postId && postStatus) await adminSetStatus(postId, postStatus)
    await adminResolveReport(id, status); load()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <p className="editorial-label text-clay">Moderation</p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mt-1">Review queue</h1>

      <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`chip whitespace-nowrap transition-colors ${tab === t.key ? 'chip-ink' : 'chip-cream hover:border-ink/40'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? <p className="text-ink-soft">Loading…</p>
          : items.length === 0 ? (
            <div className="card-bone p-8 text-center">
              <p className="font-display text-xl text-ink">Nothing here.</p>
              <p className="text-ink-soft text-sm mt-1">This queue is clear.</p>
            </div>
          ) : tab === 'reports' ? (
            <ul className="space-y-3">
              {items.map((r) => (
                <li key={r.id} className="card-paper p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="chip card-clay text-[10px] py-0.5">{r.reason}</p>
                      {r.details && <p className="text-sm text-ink-soft mt-2">{r.details}</p>}
                      {r.post && (
                        <p className="text-sm text-ink mt-2">
                          On post: <button onClick={() => onOpenPost(r.postId)} className="link-underline font-medium">{r.post.title}</button>
                          {' '}<StatusPill status={r.post.status} />
                        </p>
                      )}
                      <p className="editorial-label text-ink-softer mt-2">{timeAgo(r.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-ink/10">
                    {r.postId && <button onClick={() => resolve(r.id, 'action_taken', r.postId, 'hidden')} className="btn-clay !px-3 !py-2 text-xs">Hide post</button>}
                    {r.postId && <button onClick={() => resolve(r.id, 'action_taken', r.postId, 'deleted')} className="btn-ghost text-xs text-ink-soft hover:text-clay">Delete post</button>}
                    <button onClick={() => resolve(r.id, 'dismissed')} className="btn-ghost text-xs text-ink-soft hover:text-clay ml-auto">Dismiss report</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-3">
              {items.map((p) => (
                <li key={p.id} className="card-paper p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CategoryBadge category={p.category} />
                    <VisibilityIcon visibility={p.visibility} showLabel />
                    <StatusPill status={p.status} />
                    {p.reportsCount > 0 && <span className="chip card-clay text-[10px] py-0.5">{p.reportsCount} reports</span>}
                  </div>
                  <button onClick={() => onOpenPost(p.id)} className="block text-left mt-2">
                    <h3 className="font-display text-xl text-ink leading-snug link-underline inline">{p.title}</h3>
                  </button>
                  {p.description && <p className="text-sm text-ink-soft mt-1 line-clamp-2">{p.description}</p>}
                  <p className="editorial-label text-ink-softer mt-2">@{p.author.username || '—'} · {timeAgo(p.createdAt)} · {p.media.length} media</p>
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-ink/10">
                    {(p.status === 'pending_review' || p.status === 'flagged' || p.status === 'hidden') &&
                      <button onClick={() => setStatus(p.id, 'published')} className="btn-clay !px-3 !py-2 text-xs">Approve / publish</button>}
                    {p.status !== 'hidden' && <button onClick={() => setStatus(p.id, 'hidden')} className="btn-ghost text-xs text-ink-soft hover:text-clay">Hide</button>}
                    <button onClick={() => setStatus(p.id, 'deleted')} className="btn-ghost text-xs text-ink-soft hover:text-clay ml-auto">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  )
}
