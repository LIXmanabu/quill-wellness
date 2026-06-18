import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useAuth, DEV_MODE } from './AuthContext'
import { supabase, SUPABASE_ENABLED } from '../lib/supabase'

const defaultProfile = {
  name: '',
  skinType: '',
  goal: '',
  timePerDay: '',
  concerns: [],
  favorites: [],
  dismissedOnboarding: false,
}

// Trim a saved name and strip any trailing commas/spaces. Greetings render the
// name inside their own punctuation (e.g. "Hello, {name}," or "Good morning,
// {name}"), so a nickname accidentally saved as "Lix," would otherwise show a
// stray double comma. Normalising here keeps every greeting clean.
export function cleanName(name) {
  return (name || '').trim().replace(/[\s,]+$/, '')
}

// Concerns aren't a DB column, so for signed-in users they're mirrored to
// localStorage (per account) instead. Guests already persist the whole
// profile locally, so they're covered automatically.
function loadConcerns(id) {
  try { return JSON.parse(localStorage.getItem(`quill.concerns.${id}`)) || [] } catch { return [] }
}
function saveConcerns(id, concerns) {
  try { localStorage.setItem(`quill.concerns.${id}`, JSON.stringify(concerns || [])) } catch {}
}

const UserContext = createContext({
  profile: defaultProfile,
  updateProfile: () => {},
  toggleFavorite: () => {},
  isFavorite: () => false,
  completeOnboarding: () => {},
  resetProfile: () => {},
})

// Shared mutators so both backends expose the identical API to the app.
function useProfileActions(setProfile) {
  const updateProfile = useCallback((patch) => {
    const clean = 'name' in patch ? { ...patch, name: cleanName(patch.name) } : patch
    setProfile((p) => ({ ...p, ...clean }))
  }, [setProfile])

  const toggleFavorite = useCallback((id) => {
    setProfile((p) => {
      const has = p.favorites.includes(id)
      return {
        ...p,
        favorites: has ? p.favorites.filter((f) => f !== id) : [...p.favorites, id],
      }
    })
  }, [setProfile])

  const completeOnboarding = useCallback((data) => {
    const clean = 'name' in data ? { ...data, name: cleanName(data.name) } : data
    setProfile((p) => ({ ...p, ...clean, dismissedOnboarding: true }))
  }, [setProfile])

  const resetProfile = useCallback(() => setProfile(defaultProfile), [setProfile])

  return { updateProfile, toggleFavorite, completeOnboarding, resetProfile }
}

// ── Map between the app's camelCase profile and the DB's snake_case row ──
function rowToProfile(r, seedName = '') {
  return {
    name: cleanName(r.name ?? seedName ?? ''),
    skinType: r.skin_type ?? '',
    goal: r.goal ?? '',
    timePerDay: r.time_per_day ?? '',
    concerns: [],   // not a DB column; merged from localStorage in the loader
    favorites: Array.isArray(r.favorites) ? r.favorites : [],
    dismissedOnboarding: Boolean(r.dismissed_onboarding),
  }
}
function profileToRow(p) {
  return {
    name: p.name,
    skin_type: p.skinType,
    goal: p.goal,
    time_per_day: p.timePerDay,
    favorites: p.favorites,
    dismissed_onboarding: p.dismissedOnboarding,
    updated_at: new Date().toISOString(),
  }
}

// ── Real profiles: stored in Supabase (one row per user, RLS-protected) ──
function SupabaseUserProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(defaultProfile)
  // Becomes true only after this user's row has loaded, so the debounced
  // save never overwrites the DB with the default before the real load.
  const loadedRef = useRef(false)

  useEffect(() => {
    loadedRef.current = false
    if (!user?.id) {
      // Guest: keep answers in localStorage so they survive reloads, then if
      // they sign up the account starts from their guest answers (migration
      // happens via the save effect once a user.id appears with an empty row).
      setProfile(loadProfile('quill.user.guest'))
      loadedRef.current = true
      return
    }
    let active = true
    supabase
      .from('profiles')
      .select('name, skin_type, goal, time_per_day, favorites, dismissed_onboarding')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        const row = data ? rowToProfile(data, user.name) : null
        // If the account has no answers yet but this device has guest answers,
        // carry them over so signing up doesn't wipe a just-completed quiz.
        const guest = loadProfile('quill.user.guest')
        const guestHasAnswers = guest.goal || guest.skinType || guest.timePerDay
        const stored = loadConcerns(user.id)
        if ((!row || (!row.goal && !row.skinType && !row.timePerDay)) && guestHasAnswers) {
          setProfile({ ...guest, name: cleanName(user.name || guest.name || ''), concerns: stored.length ? stored : (guest.concerns || []) })
        } else {
          setProfile({ ...(row || { ...defaultProfile, name: cleanName(user.name || '') }), concerns: stored })
        }
        loadedRef.current = true
      })
    return () => { active = false }
  }, [user?.id, user?.name])

  // Persist profile changes: signed-in → Supabase (debounced); guest → device.
  useEffect(() => {
    if (!loadedRef.current) return
    if (!user?.id) {
      try { localStorage.setItem('quill.user.guest', JSON.stringify(profile)) } catch {}
      return
    }
    saveConcerns(user.id, profile.concerns)   // mirror concerns locally (no DB column)
    const t = setTimeout(() => {
      supabase
        .from('profiles')
        .update(profileToRow(profile))
        .eq('id', user.id)
        .then(() => {}, () => {})
    }, 500)
    return () => clearTimeout(t)
  }, [profile, user?.id])

  const isFavorite = useCallback((id) => profile.favorites.includes(id), [profile.favorites])
  const actions = useProfileActions(setProfile)

  return (
    <UserContext.Provider value={{ profile, isFavorite, ...actions }}>
      {children}
    </UserContext.Provider>
  )
}

// ── Local profiles: localStorage on this device (fallback) ───────────────
function storageKey(user) {
  if (DEV_MODE)  return 'quill.user'
  if (user?.id)  return `quill.user.${user.id}`
  return 'quill.user.guest'
}
function loadProfile(key, seedName = '') {
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...defaultProfile, ...parsed, name: cleanName(parsed.name ?? seedName) }
    }
  } catch {}
  return { ...defaultProfile, name: cleanName(seedName) }
}

function LocalUserProvider({ children }) {
  const { user } = useAuth()

  // keyRef tracks which storage slot the current `profile` belongs to, so
  // the save effect never clobbers one account's data with another's.
  const keyRef = useRef(storageKey(user))
  const [profile, setProfile] = useState(() => loadProfile(keyRef.current, user?.name))

  useEffect(() => {
    const key = storageKey(user)
    if (key === keyRef.current) return
    keyRef.current = key
    setProfile(loadProfile(key, user?.name))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  useEffect(() => {
    try { localStorage.setItem(keyRef.current, JSON.stringify(profile)) } catch {}
  }, [profile])

  const isFavorite = useCallback((id) => profile.favorites.includes(id), [profile.favorites])
  const actions = useProfileActions(setProfile)

  return (
    <UserContext.Provider value={{ profile, isFavorite, ...actions }}>
      {children}
    </UserContext.Provider>
  )
}

const Provider = SUPABASE_ENABLED && !DEV_MODE ? SupabaseUserProvider : LocalUserProvider

export function UserProvider({ children }) {
  return <Provider>{children}</Provider>
}

export function useUser() {
  return useContext(UserContext)
}
