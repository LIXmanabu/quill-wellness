import { LIKE_BADGES } from '../../lib/badges.js'

// ─── Badge legend ─────────────────────────────────────────────────────────
// Shows all five like-medals and what each is worth. Earned automatically from
// the likes your shared routines collect — nothing to claim.
export default function BadgeLegend({ totalLikes = null }) {
  return (
    <div className="max-w-2xl">
      <p className="text-ink-soft leading-relaxed mb-6">
        Every like your shared routines earn moves you up. Medals are awarded automatically —
        here's what's ahead.
      </p>
      <div className="space-y-3">
        {LIKE_BADGES.map((b) => {
          const earned = totalLikes != null && totalLikes >= b.min
          return (
            <div key={b.key}
              className={`flex items-center gap-4 card-paper p-3 sm:p-4 ${earned ? 'ring-1 ring-clay/40' : ''}`}>
              <img
                src={`${import.meta.env.BASE_URL}badges/${b.img}`}
                alt={`${b.label} badge`}
                className="h-16 w-auto rounded-md shadow-soft shrink-0"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold uppercase tracking-[0.14em] text-sm" style={{ color: b.accent }}>
                  {b.label}
                </p>
                <p className="num-display text-2xl text-ink leading-none mt-0.5">
                  {b.min.toLocaleString('en-GB')}<span className="text-sm text-ink-softer font-sans"> likes</span>
                </p>
              </div>
              {earned && <span className="chip chip-ink shrink-0">✓ Earned</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
