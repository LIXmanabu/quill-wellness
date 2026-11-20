import { badgeForLikes, nextBadge } from '../../lib/badges.js'

/* A member's earned like-medal — an illustrated badge (public/badges/) that
   levels up with total likes: Bloom 10 · Glow 100 · Spotlight 1k · Icon 10k ·
   Ultra Rare 100k. Renders nothing until the first tier. With `showProgress`,
   adds a quiet "N to <next tier>" nudge. */
export default function LikeBadge({ totalLikes, showProgress = false, size = 'md' }) {
  const badge = badgeForLikes(totalLikes)
  if (!badge) return null
  const next = showProgress ? nextBadge(totalLikes) : null
  const imgH = size === 'lg' ? 'h-16' : 'h-11'

  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src={`${import.meta.env.BASE_URL}badges/${badge.img}`}
        alt={`${badge.label} badge`}
        className={`${imgH} w-auto rounded-md shadow-soft shrink-0`}
        loading="lazy"
      />
      <span className="flex flex-col leading-tight">
        <span className="font-bold text-xs" style={{ color: badge.accent }}>
          {badge.label}
        </span>
        <span className="text-xs text-ink-softer">
          {(totalLikes || 0).toLocaleString('en-GB')} likes earned
        </span>
        {next && (
          <span className="text-xs text-ink-softer/80">
            {next.remaining.toLocaleString('en-GB')} to {next.label}
          </span>
        )}
      </span>
    </span>
  )
}
