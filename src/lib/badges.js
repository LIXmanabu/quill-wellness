// ─── Community like-badges (medals) ───────────────────────────────────────
// Recognition for the total likes a member has earned on their shared
// routines. Four tiers, awarded automatically — purely derived from the
// like count, so there's nothing to store: pass a total in, get the badge out.

export const LIKE_BADGES = [
  { key: 'bronze',  min: 10,    label: 'Bronze',  icon: '🥉', accent: '#a9743b' },
  { key: 'silver',  min: 100,   label: 'Silver',  icon: '🥈', accent: '#8a8f98' },
  { key: 'gold',    min: 1000,  label: 'Gold',    icon: '🥇', accent: '#c9a227' },
  { key: 'diamond', min: 10000, label: 'Diamond', icon: '💎', accent: '#4aa3c7' },
]

const fmt = (n) => (n || 0).toLocaleString('en-GB')

// The highest badge a like-total has earned, or null if under the first tier.
export function badgeForLikes(total) {
  let earned = null
  for (const b of LIKE_BADGES) if ((total || 0) >= b.min) earned = b
  return earned
}

// The next badge still to reach (with how many likes remain), or null once the
// top tier is earned. Handy for a little "230 to Gold" progress nudge.
export function nextBadge(total) {
  const t = total || 0
  const next = LIKE_BADGES.find((b) => t < b.min)
  return next ? { ...next, remaining: next.min - t } : null
}
