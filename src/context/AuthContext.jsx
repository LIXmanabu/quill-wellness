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

// ── Real accounts: Supabase Auth (server-side, works across devices) ──
function SupabaseAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(mapUser(data.session?.user))
      setLoading(false)
    })
    // Stay in sync across tabs, token refreshes, and sign in/out.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user))
      setLoading(false)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  async function signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email: (email || '').trim(),
      password,
      options: { data: { name: (name || '').trim() } },
    })
    return { data: mapUser(data?.user), error }
  }

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
      options: { emailRedirectTo: window.location.origin },
    })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithMagicLink, signOut }}>
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
    return { data: res.user ?? null, error: res.error ?? null }
  }

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
    <AuthContext.Provider value={{ user, loading: false, signUp, signIn, signInWithMagicLink, signOut }}>
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
