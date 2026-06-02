import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useAuth, DEV_MODE } from './AuthContext'

const defaultProfile = {
  name: '',
  skinType: '',
  goal: '',
  timePerDay: '',
  favorites: [],
  dismissedOnboarding: false,
}

const UserContext = createContext({
  profile: defaultProfile,
  updateProfile: () => {},
  toggleFavorite: () => {},
  isFavorite: () => false,
  completeOnboarding: () => {},
  resetProfile: () => {},
})

// Each account gets its own storage slot so two people on the same device
// never see each other's data. Dev mode + guests share simpler keys.
function storageKey(user) {
  if (DEV_MODE)  return 'quill.user'
  if (user?.id)  return `quill.user.${user.id}`
  return 'quill.user.guest'
}

function loadProfile(key, seedName = '') {
  try {
    const saved = localStorage.getItem(key)
    if (saved) return { ...defaultProfile, ...JSON.parse(saved) }
  } catch {}
  return { ...defaultProfile, name: seedName }
}

export function UserProvider({ children }) {
  const { user } = useAuth()

  // keyRef tracks which storage slot the current `profile` belongs to.
  // The save effect writes to keyRef — never to a freshly-changed user key
  // before that account's profile has actually loaded — which prevents one
  // account's data from clobbering another's on login/logout.
  const keyRef = useRef(storageKey(user))
  const [profile, setProfile] = useState(() => loadProfile(keyRef.current, user?.name))

  // When the active account changes, swap in that account's stored profile.
  useEffect(() => {
    const key = storageKey(user)
    if (key === keyRef.current) return
    keyRef.current = key
    setProfile(loadProfile(key, user?.name))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Persist every profile change to the slot it belongs to.
  useEffect(() => {
    try { localStorage.setItem(keyRef.current, JSON.stringify(profile)) } catch {}
  }, [profile])

  const updateProfile = useCallback((patch) => {
    setProfile((p) => ({ ...p, ...patch }))
  }, [])

  const toggleFavorite = useCallback((id) => {
    setProfile((p) => {
      const has = p.favorites.includes(id)
      return {
        ...p,
        favorites: has ? p.favorites.filter((f) => f !== id) : [...p.favorites, id],
      }
    })
  }, [])

  const isFavorite = useCallback((id) => profile.favorites.includes(id), [profile.favorites])

  const completeOnboarding = useCallback((data) => {
    setProfile((p) => ({ ...p, ...data, dismissedOnboarding: true }))
  }, [])

  const resetProfile = useCallback(() => setProfile(defaultProfile), [])

  return (
    <UserContext.Provider
      value={{ profile, updateProfile, toggleFavorite, isFavorite, completeOnboarding, resetProfile }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
