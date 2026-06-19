import { useState, useEffect } from 'react'
import {
  LIKE_BADGES, MAX_BADGE_LIKES, effectiveLikes,
  previewAllBadges, setPreviewAllBadges, BADGE_PREVIEW_EVENT,
} from '../../lib/badges.js'

// ─── Badge case ───────────────────────────────────────────────────────────
// All five like-medals shown together: earned ones in full colour, the rest
// dimmed with their threshold. On your own profile you get a toggle to show
// every medal:
//   • admins → a PUBLIC toggle that writes a badge override (everyone sees it),
//   • everyone else → a local preview (only you see it, on this device).
export default function BadgeCase({ totalLikes = 0, isSelf = false, isAdmin = false, override = 0, onSetOverride }) {
  const [preview, setPreview] = useState(previewAllBadges())
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const sync = () => setPreview(previewAllBadges())
    window.addEventListener(BADGE_PREVIEW_EVENT, sync)
    return () => window.removeEventListener(BADGE_PREVIEW_EVENT, sync)
  }, [])

  const publicOn = (override || 0) >= MAX_BADGE_LIKES
  const shown = effectiveLikes(totalLikes, { isSelf, override })
  const earnedCount = LIKE_BADGES.filter((b) => shown >= b.min).length

  async function toggleLocal() {
    const next = !preview
    setPreview(next)
    setPreviewAllBadges(next)
  }
  async function togglePublic() {
    if (!onSetOverride) return
    setBusy(true)
    await onSetOverride(publicOn ? null : MAX_BADGE_LIKES)
    setBusy(false)
  }

  const on = isAdmin ? publicOn : preview

  return (
    <div className="card-bone p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <span className="editorial-label text-clay">Badge case</span>
          <p className="text-sm text-ink-soft mt-0.5">
            {earnedCount} of {LIKE_BADGES.length} medals
            {isSelf && on ? (isAdmin ? ' (shown to everyone)' : ' (preview)') : ' earned'}
          </p>
        </div>
        {isSelf && (
          <button
            onClick={isAdmin ? togglePublic : toggleLocal}
            disabled={busy}
            role="switch"
            aria-checked={on}
            className={`shrink-0 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] px-3 py-2 border transition-colors disabled:opacity-50 ${
              on ? 'bg-ink text-cream border-ink' : 'border-ink/20 text-ink-soft hover:border-ink/40'
            }`}
            title={isAdmin ? 'Show every medal on your profile to everyone' : 'Preview every medal (only you see this)'}
          >
            <span className={`inline-block w-2 h-2 rounded-full ${on ? 'bg-cream' : 'bg-ink/30'}`} />
            {busy ? 'Saving…' : on ? 'Showing all' : 'Show all badges'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {LIKE_BADGES.map((b) => {
          const earned = shown >= b.min
          return (
            <div key={b.key} className="flex flex-col items-center text-center gap-1.5">
              <img
                src={`${import.meta.env.BASE_URL}badges/${b.img}`}
                alt={`${b.label} badge`}
                className={`h-12 sm:h-16 w-auto rounded-md transition-all ${
                  earned ? 'shadow-soft' : 'grayscale opacity-35'
                }`}
                loading="lazy"
              />
              <span
                className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] leading-tight ${earned ? '' : 'text-ink-softer'}`}
                style={earned ? { color: b.accent } : undefined}
              >
                {b.label}
              </span>
              <span className="text-[9px] num-display text-ink-softer leading-none">
                {b.min >= 1000 ? `${b.min / 1000}k` : b.min}
              </span>
            </div>
          )
        })}
      </div>

      {isSelf && on && (
        <p className="text-[11px] text-ink-softer mt-3 leading-snug">
          {isAdmin
            ? 'All medals are showing on your profile to everyone. Turn off to go back to the medals your routines have earned.'
            : 'Preview is on — only you see all medals here. Others see the ones your routines have truly earned.'}
        </p>
      )}
    </div>
  )
}
