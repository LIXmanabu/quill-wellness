// ─── Like-milestone tracking (local, no backend) ──────────────────────────
// Celebrates when one of YOUR routines crosses a like milestone. We remember
// the highest milestone already celebrated per post (in localStorage, keyed by
// user) so each one fires exactly once — even across reloads — and never
// re-fires when you sign in on the same device.

export const LIKE_MILESTONES = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]

const KEY = 'quill.community.likeMilestones'

// Highest milestone a like-count has reached (0 if none yet).
function highestReached(likes) {
  let m = 0
  for (const v of LIKE_MILESTONES) if (likes >= v) m = v
  return m
}

function loadStore() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
function saveStore(store) {
  try { localStorage.setItem(KEY, JSON.stringify(store)) } catch { /* storage off — skip */ }
}

/**
 * detectLikeMilestones — given the signed-in user's own posts, return the
 * milestones newly crossed since last check, and persist the new baseline.
 *
 * The very first run for a user only records a baseline (no toasts), so we
 * don't fire a burst for likes earned before this feature existed.
 *
 * @returns {Array<{ postId, title, milestone }>} newly reached, biggest last
 */
export function detectLikeMilestones(userId, posts) {
  if (!userId || !Array.isArray(posts)) return []
  const store = loadStore()
  const prev = store[userId]            // map postId -> highest celebrated, or undefined on first run
  const firstRun = prev === undefined
  const baseline = prev || {}
  const next = {}
  const fresh = []

  for (const p of posts) {
    const reached = highestReached(p.likesCount || 0)
    next[p.id] = reached
    if (!firstRun && reached > (baseline[p.id] || 0)) {
      fresh.push({ postId: p.id, title: p.title, milestone: reached })
    }
  }

  store[userId] = next
  saveStore(store)
  return fresh.sort((a, b) => a.milestone - b.milestone)
}
