// ─── Local-only accounts ──────────────────────────────────────────────
// Everything here lives in THIS browser's localStorage. There is no
// server, no network request, and no data ever leaves the device.
// Clearing browser data permanently erases all accounts.
//
// Passwords are hashed with SHA-256 + a per-account random salt so the
// raw password is never stored, even though it never leaves the device.

const ACCOUNTS_KEY = 'quill.accounts'   // array of account records
const SESSION_KEY  = 'quill.session'    // id of the signed-in account

function loadAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || []
  } catch { return [] }
}

function saveAccounts(accounts) {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)) } catch {}
}

function toHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function randomSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)))
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(salt + password)
  const buf  = await crypto.subtle.digest('SHA-256', data)
  return toHex(new Uint8Array(buf))
}

// Strip the secret fields, never expose the hash/salt to the app
function publicUser(acc) {
  return { id: acc.id, name: acc.name, email: acc.email }
}

// ── Sign up ───────────────────────────────────────────────────────────
export async function signUp(email, password, name) {
  email = (email || '').trim().toLowerCase()
  if (!email || !password) return { error: { message: 'Email and password are required.' } }
  if (password.length < 8)  return { error: { message: 'Password must be at least 8 characters.' } }

  const accounts = loadAccounts()
  if (accounts.some((a) => a.email === email)) {
    return { error: { message: 'An account with this email already exists on this device.' } }
  }

  const salt = randomSalt()
  const acc = {
    id:           crypto.randomUUID(),
    name:         (name || '').trim(),
    email,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt:    Date.now(),
  }
  accounts.push(acc)
  saveAccounts(accounts)
  try { localStorage.setItem(SESSION_KEY, acc.id) } catch {}
  return { user: publicUser(acc) }
}

// ── Sign in ───────────────────────────────────────────────────────────
export async function signIn(email, password) {
  email = (email || '').trim().toLowerCase()
  const acc = loadAccounts().find((a) => a.email === email)
  if (!acc) return { error: { message: 'No account found with this email on this device.' } }

  const hash = await hashPassword(password, acc.salt)
  if (hash !== acc.passwordHash) return { error: { message: 'Incorrect password.' } }

  try { localStorage.setItem(SESSION_KEY, acc.id) } catch {}
  return { user: publicUser(acc) }
}

// ── Sign out ──────────────────────────────────────────────────────────
export function signOut() {
  try { localStorage.removeItem(SESSION_KEY) } catch {}
}

// ── Restore the remembered session ────────────────────────────────────
export function getSession() {
  try {
    const id = localStorage.getItem(SESSION_KEY)
    if (!id) return null
    const acc = loadAccounts().find((a) => a.id === id)
    return acc ? publicUser(acc) : null
  } catch { return null }
}
