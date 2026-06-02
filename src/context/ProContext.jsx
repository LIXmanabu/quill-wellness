import { createContext, useContext, useEffect, useState, useMemo } from 'react'

const DEV_STORAGE_KEY = 'quill.devUnlocked'
const TIERS = ['free', 'pro', 'max']

export const DEV_CODE = 'I know Felix'

const ProContext = createContext({
  tier: 'free',
  isPro: false,
  isMax: false,
  devUnlocked: false,
  setTier: () => {},
  togglePro: () => {},
  setDevUnlocked: () => {},
})

export function ProProvider({ children }) {
  // Tier is intentionally NOT persisted across reloads. Every page load
  // starts at Free — users have to "upgrade" through the checkout flow
  // again, which is the desired behaviour for this prototype.
  const [tier, setTierState] = useState('free')

  // Dev-mode unlock IS persisted — once you've entered the code, you
  // stay unlocked until you explicitly lock again.
  const [devUnlocked, setDevUnlockedState] = useState(() => {
    try { return localStorage.getItem(DEV_STORAGE_KEY) === 'true' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem(DEV_STORAGE_KEY, String(devUnlocked)) } catch {}
  }, [devUnlocked])

  // One-time housekeeping: clear any tier value from previous builds
  // so localStorage isn't polluted with stale keys.
  useEffect(() => {
    try {
      localStorage.removeItem('quill.tier')
      localStorage.removeItem('quill.isPro')
      localStorage.removeItem('quill.tierResetV2')
      localStorage.removeItem('quill.tierResetV3')
    } catch {}
  }, [])

  function setTier(next) {
    if (TIERS.includes(next)) setTierState(next)
  }

  function togglePro() {
    setTierState((t) => (t === 'free' ? 'pro' : 'free'))
  }

  function setDevUnlocked(v) {
    setDevUnlockedState(!!v)
  }

  const value = useMemo(() => ({
    tier,
    isPro: tier === 'pro' || tier === 'max',
    isMax: tier === 'max',
    devUnlocked,
    setTier,
    togglePro,
    setDevUnlocked,
  }), [tier, devUnlocked])

  return (
    <ProContext.Provider value={value}>
      {children}
    </ProContext.Provider>
  )
}

export function usePro() {
  return useContext(ProContext)
}
