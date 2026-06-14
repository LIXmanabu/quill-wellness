import { createContext, useContext, useEffect, useState, useMemo } from 'react'

const DEV_STORAGE_KEY = 'quill.devUnlocked'
const TESTER_STORAGE_KEY = 'quill.tester'
const TIERS = ['free', 'pro', 'max']

// ── Private developer code (you) ──────────────────────────────────────────
// Unlocks the tier switcher / "god mode". Keep this to yourself.
export const DEV_CODE = 'I know Felix'

// ── Shared tester code (the people you invite) ────────────────────────────
// One code for everyone in the beta. The easiest way to onboard a tester is
// to send them this link (no typing needed):
//   https://lixmanabu.github.io/quill-wellness/?tester=quill-beta
// Anyone who opens that link is silently flagged as a tester so you can tell
// them apart from random traffic in Umami. They can also type the code into
// the hidden box on the checkout screen. Testers use the app exactly like a
// normal user — this does NOT unlock the developer tier switcher.
export const TESTER_CODE = 'quill-beta'

// Where the "Send feedback" button delivers. Swap this to your Quill business
// email once it's set up (e.g. hello@quill...). Until then it goes to you.
export const FEEDBACK_EMAIL = 'felix_s3006@icloud.com'

const ProContext = createContext({
  tier: 'free',
  isPro: false,
  isMax: false,
  devUnlocked: false,
  isTester: false,
  setTier: () => {},
  togglePro: () => {},
  setDevUnlocked: () => {},
  setTester: () => {},
})

export function ProProvider({ children }) {
  // Tier is intentionally NOT persisted across reloads. Every page load
  // starts at Free, users have to "upgrade" through the checkout flow
  // again, which is the desired behaviour for this prototype.
  const [tier, setTierState] = useState('free')

  // Dev-mode unlock IS persisted, once you've entered the code, you
  // stay unlocked until you explicitly lock again.
  const [devUnlocked, setDevUnlockedState] = useState(() => {
    try { return localStorage.getItem(DEV_STORAGE_KEY) === 'true' } catch { return false }
  })

  // Tester flag is persisted too: once someone arrives via the tester link
  // (or types the code), they stay a tester on this device until they leave.
  const [isTester, setTesterState] = useState(() => {
    try { return localStorage.getItem(TESTER_STORAGE_KEY) === 'true' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem(DEV_STORAGE_KEY, String(devUnlocked)) } catch {}
  }, [devUnlocked])

  useEffect(() => {
    try { localStorage.setItem(TESTER_STORAGE_KEY, String(isTester)) } catch {}
  }, [isTester])

  // ── Auto-join the beta from the invite link ──────────────────────────────
  // If the page is opened with ?tester=<code>, flag this visitor as a tester,
  // tell Umami (so their whole session is segmented), then strip the param so
  // a refresh stays clean and the code isn't left dangling in the address bar.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('tester')
      if (code && code.trim().toLowerCase() === TESTER_CODE.toLowerCase()) {
        setTesterState(true)
        markTesterInAnalytics()
        params.delete('tester')
        const qs = params.toString()
        const clean = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash
        window.history.replaceState(window.history.state, '', clean)
      }
    } catch {}
  }, [])

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

  function setTester(v) {
    const on = !!v
    setTesterState(on)
    if (on) markTesterInAnalytics()
  }

  const value = useMemo(() => ({
    tier,
    isPro: tier === 'pro' || tier === 'max',
    isMax: tier === 'max',
    devUnlocked,
    isTester,
    setTier,
    togglePro,
    setDevUnlocked,
    setTester,
  }), [tier, devUnlocked, isTester])

  return (
    <ProContext.Provider value={value}>
      {children}
    </ProContext.Provider>
  )
}

// Tag the Umami session so tester traffic is filterable in the dashboard.
// Both calls no-op safely until the Umami snippet has loaded.
function markTesterInAnalytics() {
  try {
    window.umami?.identify?.({ tester: true })
    window.umami?.track?.('tester-joined')
  } catch {}
}

export function usePro() {
  return useContext(ProContext)
}
