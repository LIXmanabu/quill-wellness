import { createContext, useContext, useState } from 'react'
import * as localAuth from '../lib/localAuth'

// ─── Dev mode ────────────────────────────────────────────────────────
// VITE_DEV_MODE=true → bypass auth entirely and always show the
// onboarding quiz on every load (original prototype behaviour).
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Restore the remembered local session on first render (production only).
  // Local storage is synchronous, so there is no loading state to wait on.
  const [user] = useState(() => (DEV_MODE ? null : localAuth.getSession()))
  const [currentUser, setCurrentUser] = useState(user)

  async function signUp(email, password, name) {
    const res = await localAuth.signUp(email, password, name)
    if (res.user) setCurrentUser(res.user)
    return { data: res.user ?? null, error: res.error ?? null }
  }

  async function signIn(email, password) {
    const res = await localAuth.signIn(email, password)
    if (res.user) setCurrentUser(res.user)
    return { data: res.user ?? null, error: res.error ?? null }
  }

  function signOut() {
    localAuth.signOut()
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user: currentUser, loading: false, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
