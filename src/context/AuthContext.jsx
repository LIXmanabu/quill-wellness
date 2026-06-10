import { createContext, useContext, useEffect, useState } from 'react'
import * as localAuth from '../lib/localAuth'
import { supabase, SUPABASE_ENABLED } from '../lib/supabase'

// ─── Dev mode ────────────────────────────────────────────────────────
// VITE_DEV_MODE=true → bypass auth entirely and always show the
// onboarding quiz on every load (original prototype behaviour).
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'

const AuthContext = createContext(null)

// Shape the rest of the app expects everywhere: { id, name, email }.
function mapUser(u) {
  if (!u) return null
  return { id: u.id, email: u.email, name: u.user_metadata?.name || '' }
}

// Where confirmation / reset / magic-link emails should send people back to.
// Uses the current app URL (works for localhost AND the live sub-path) — just
// make sure this exact URL is in Supabase → Authentication → URL Configuration.
const appUrl = () =>
  (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '/')

// ── Real accounts: Supabase Auth (server-side, works across devices) ──
function SupabaseAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // True after the user clicks a "reset password" email link, so the app can
  // prompt them to choose a new password.
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(mapUser(data.session?.user))
      setLoading(false)
    })
    // Stay in sync across tabs, token refreshes, and sign in/out.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      setUser(mapUser(session?.user))
      setLoading(false)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  async function signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email: (email || '').trim(),
      password,
      options: { data: { name: (name || '').trim() }, emailRedirectTo: appUrl() },
    })
    // When "Confirm email" is ON, sign-up returns a user but NO session — the
    // person must click the email link first. The UI uses this to say so.
    const needsConfirmation = !error && !!data?.user && !data?.session
    return { data: mapUser(data?.user), error, needsConfirmation }
  }

  // Email a password-reset link. The link returns to the app and fires the
  // PASSWORD_RECOVERY event handled above.
  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail((email || '').trim(), { redirectTo: appUrl() })
    return { error }
  }

  // Set a new password (used during recovery, while temporarily signed in).
  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) setRecovery(false)
    return { error }
  }

  function clearRecovery() { setRecovery(false) }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: (email || '').trim(),
      password,
    })
    return { data: mapUser(data?.user), error }
  }

  // Passwordless "magic link": emails a one-click sign-in link. No password
  // needed. If the email has no account yet, one is created automatically.
  async function signInWithMagicLink(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email: (email || '').trim(),
      options: { emailRedirectTo: appUrl() },
    })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, loading, recovery, signUp, signIn, signInWithMagicLink, signOut,
      resetPassword, updatePassword, clearRecovery,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Local-only accounts: localStorage on this device (fallback) ───────
function LocalAuthProvider({ children }) {
  // Local storage is synchronous, so there is no loading state to wait on.
  const [user, setUser] = useState(() => (DEV_MODE ? null : localAuth.getSession()))

  async function signUp(email, password, name) {
    const res = await localAuth.signUp(email, password, name)
    if (res.user) setUser(res.user)
    return { data: res.user ?? null, error: res.error ?? null, needsConfirmation: false }
  }

  // Local-only mode has no email server, so password reset isn't possible here.
  async function resetPassword() {
    return { error: { message: 'Password reset needs the database connected. (Local accounts can’t email you.)' } }
  }
  async function updatePassword() {
    return { error: { message: 'Not available in local-only mode.' } }
  }
  function clearRecovery() {}

  async function signIn(email, password) {
    const res = await localAuth.signIn(email, password)
    if (res.user) setUser(res.user)
    return { data: res.user ?? null, error: res.error ?? null }
  }

  // Magic links need a server to send email, which local-only mode has not.
  // Return a clear message so the UI can fall back to email + password.
  async function signInWithMagicLink() {
    return { error: { message: 'Email sign-in links need the database connected. Use email + password here.' } }
  }

  function signOut() {
    localAuth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, loading: false, recovery: false, signUp, signIn, signInWithMagicLink, signOut,
      resetPassword, updatePassword, clearRecovery,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Pick the backend once at load: real database when keys are set (and not
// in dev mode), otherwise local-only. The live site keeps working with the
// local fallback until the Supabase keys are added.
const Provider = SUPABASE_ENABLED && !DEV_MODE ? SupabaseAuthProvider : LocalAuthProvider

export function AuthProvider({ children }) {
  return <Provider>{children}</Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
