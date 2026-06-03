// ─── Login attempt guard ──────────────────────────────────────────────
// Slows down password guessing in the browser: after a few wrong tries it
// locks the sign-in form for a cooldown that grows the more it's abused.
//
// This is a SECOND layer of defence and good UX — it is intentionally not
// the main protection, because anyone could bypass the browser and call the
// API directly. The real brute-force limit is Supabase's server-side rate
// limiting (configured in the Supabase dashboard). Use both together.

const KEY = 'quill.loginGuard'
const MAX_BEFORE_LOCK = 5                       // free tries before the first lock
const LADDER = [30, 60, 120, 300, 900, 3600]    // cooldown seconds, escalating

function loadAll() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}
function saveAll(map) {
  try { localStorage.setItem(KEY, JSON.stringify(map)) } catch {}
}
function keyFor(email) {
  return (email || '').trim().toLowerCase()
}

// Current lock state for an email, without changing anything.
export function checkLock(email) {
  const e = keyFor(email)
  const entry = loadAll()[e]
  const now = Date.now()
  if (entry?.lockUntil && now < entry.lockUntil) {
    return { locked: true, secondsLeft: Math.ceil((entry.lockUntil - now) / 1000) }
  }
  const fails = entry?.fails || 0
  return { locked: false, secondsLeft: 0, attemptsLeft: Math.max(0, MAX_BEFORE_LOCK - fails) }
}

// Record a failed attempt and return the resulting lock state.
export function recordFailure(email) {
  const e = keyFor(email)
  const map = loadAll()
  const entry = map[e] || { fails: 0, lockUntil: 0 }
  entry.fails += 1
  if (entry.fails >= MAX_BEFORE_LOCK) {
    const idx = Math.min(entry.fails - MAX_BEFORE_LOCK, LADDER.length - 1)
    entry.lockUntil = Date.now() + LADDER[idx] * 1000
  }
  map[e] = entry
  saveAll(map)
  if (entry.lockUntil > Date.now()) {
    return { locked: true, secondsLeft: Math.ceil((entry.lockUntil - Date.now()) / 1000) }
  }
  return { locked: false, secondsLeft: 0, attemptsLeft: Math.max(0, MAX_BEFORE_LOCK - entry.fails) }
}

// Clear the record after a successful sign-in.
export function recordSuccess(email) {
  const e = keyFor(email)
  const map = loadAll()
  if (map[e]) { delete map[e]; saveAll(map) }
}

// "1m 05s" / "45s" for friendly countdown messages.
export function formatWait(seconds) {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${String(s).padStart(2, '0')}s`
  }
  return `${seconds}s`
}
