import { badgeForLikes, nextBadge } from '../../lib/badges.js'

/* A member's earned like-medal. Renders nothing until the first tier (10
   likes). With `showProgress`, adds a quiet "N to <next tier>" nudge below. */
export default function LikeBadge({ totalLikes, showProgress = false, size = 'md' }) {
  const badge = badgeForLikes(totalLikes)
  if (!badge) return null
  const next = showProgress ? nextBadge(totalLikes) : null
  const big = size === 'lg'

  return (
    <span className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 border bg-cream-light ${big ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'}`}
        style={{ borderColor: badge.accent, color: badge.accent }}
        title={`${badge.label} member · ${(totalLikes || 0).toLocaleString('en-GB')} likes earned`}
      >
        <span aria-hidden="true" className={big ? 'text-base' : 'text-sm'}>{badge.icon}</span>
        <span className="font-bold uppercase tracking-[0.14em]">{badge.label}</span>
      </span>
      {next && (
        <span className="text-[10px] text-ink-softer uppercase tracking-[0.12em]">
          {next.remaining.toLocaleString('en-GB')} to {next.label}
        </span>
      )}
    </span>
  )
}
