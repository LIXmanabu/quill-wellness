import { useState, useEffect } from 'react'
import {
  LIKE_BADGES, effectiveLikes, previewAllBadges, setPreviewAllBadges, BADGE_PREVIEW_EVENT,
} from '../../lib/badges.js'

// ─── Badge case ───────────────────────────────────────────────────────────
// All five like-medals shown together as a collection: earned ones in full
// colour, not-yet-earned ones dimmed with their threshold. On your own profile
// a "Show all badges" toggle lets you preview the full set (your view only).
export default function BadgeCase({ totalLikes = 0, isSelf = false }) {
  const [preview, setPreview] = useState(previewAllBadges())

  // Stay in sync if the preference is flipped elsewhere.
  useEffect(() => {
    const sync = () => setPreview(previewAllBadges())
    window.addEventListener(BADGE_PREVIEW_EVENT, sync)
    return () => window.removeEventListener(BADGE_PREVIEW_EVENT, sync)
  }, [])

  const shown = effectiveLikes(totalLikes, isSelf)
  const earnedCount = LIKE_BADGES.filter((b) => shown >= b.min).length

  function toggle() {
    const next = !preview
    setPreview(next)            // optimistic
    setPreviewAllBadges(next)   // persists + notifies
  }

  return (
    <div className="card-bone p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <span className="editorial-label text-clay">Badge case</span>
          <p className="text-sm text-ink-soft mt-0.5">
            {earnedCount} of {LIKE_BADGES.length} medals{isSelf && preview ? ' (preview)' : ' earned'}
          </p>
        </div>
        {isSelf && (
          <button
            onClick={toggle}
            role="switch"
            aria-checked={preview}
            className={`shrink-0 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] px-3 py-2 border transition-colors ${
              preview ? 'bg-ink text-cream border-ink' : 'border-ink/20 text-ink-soft hover:border-ink/40'
            }`}
            title="Show every medal on your own profile (only you see this)"
          >
            <span className={`inline-block w-2 h-2 rounded-full ${preview ? 'bg-cream' : 'bg-ink/30'}`} />
            {preview ? 'Showing all' : 'Show all badges'}
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

      {isSelf && preview && (
        <p className="text-[11px] text-ink-softer mt-3 leading-snug">
          Preview is on — only you see all medals here. Others see the ones your routines have truly earned.
        </p>
      )}
    </div>
  )
}
