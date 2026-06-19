// ─── Community like-badges (medals) ───────────────────────────────────────
// Recognition for the total likes a member has earned on their shared
// routines. Five tiers, awarded automatically — purely derived from the
// like count, so there's nothing to store: pass a total in, get the badge out.
// Each tier has its own illustrated medal in public/badges/.

export const LIKE_BADGES = [
  { key: 'bloom',     min: 10,     label: 'Bloom',      img: 'badge-10.png',     accent: '#c98aa6' },
  { key: 'glow',      min: 100,    label: 'Glow',       img: 'badge-100.png',    accent: '#caa14a' },
  { key: 'spotlight', min: 1000,   label: 'Spotlight',  img: 'badge-1000.png',   accent: '#9b6bd6' },
  { key: 'icon',      min: 10000,  label: 'Icon',       img: 'badge-10000.png',  accent: '#b06bc0' },
  { key: 'ultra',     min: 100000, label: 'Ultra Rare', img: 'badge-100000.png', accent: '#8a5cc7' },
]

// The highest badge a like-total has earned, or null if under the first tier.
export function badgeForLikes(total) {
  let earned = null
  for (const b of LIKE_BADGES) if ((total || 0) >= b.min) earned = b
  return earned
}

// The next badge still to reach (with how many likes remain), or null once the
// top tier is earned. Handy for a little "230 to Spotlight" progress nudge.
export function nextBadge(total) {
  const t = total || 0
  const next = LIKE_BADGES.find((b) => t < b.min)
  return next ? { ...next, remaining: next.min - t } : null
}
