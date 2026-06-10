import { categoryLabel, categoryAccent } from '../../data/communityCategories.js'

// ─── Small shared atoms for the Community feature ─────────────────────────

export function Avatar({ url, name, size = 36 }) {
  const initial = (name || '?').trim()[0]?.toUpperCase() || '?'
  if (url) {
    return (
      <img src={url} alt="" width={size} height={size}
        className="rounded-full object-cover bg-bone shrink-0"
        style={{ width: size, height: size }} />
    )
  }
  return (
    <span
      className="rounded-full bg-clay/15 text-clay flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}

export function CategoryBadge({ category }) {
  const accent = categoryAccent(category)
  return (
    <span className={`chip card-${accent} text-[10px] uppercase tracking-[0.12em] font-semibold py-0.5`}>
      {categoryLabel(category)}
    </span>
  )
}

const VIS = {
  public:  { label: 'Public',  d: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></> },
  friends: { label: 'Friends', d: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" /><path d="M16 6.5a3 3 0 0 1 0 5M18 20c0-2.4-1-4-2.5-4.6" /></> },
  private: { label: 'Only me', d: <><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></> },
}

export function VisibilityIcon({ visibility, showLabel = false, className = '' }) {
  const v = VIS[visibility] || VIS.public
  return (
    <span className={`inline-flex items-center gap-1 text-ink-softer ${className}`} title={v.label}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {v.d}
      </svg>
      {showLabel && <span className="text-[10px] uppercase tracking-[0.14em] font-semibold">{v.label}</span>}
    </span>
  )
}

export function StatusPill({ status }) {
  const map = {
    pending_review: { t: 'In review', c: 'bg-gold/20 text-gold-dark' },
    flagged:        { t: 'Flagged',   c: 'bg-clay/20 text-clay-dark' },
    hidden:         { t: 'Hidden',    c: 'bg-ink/15 text-ink-soft' },
    deleted:        { t: 'Removed',   c: 'bg-ink/15 text-ink-soft' },
  }
  const s = map[status]
  if (!s) return null
  return <span className={`chip ${s.c} border-transparent text-[10px] py-0.5`}>{s.t}</span>
}

export function timeAgo(iso) {
  if (!iso) return ''
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 60) return 'just now'
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// First image/video from a post's media array, for card previews.
export function firstMedia(media) {
  return Array.isArray(media) && media.length ? media[0] : null
}
