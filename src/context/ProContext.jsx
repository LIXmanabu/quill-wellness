import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase, SUPABASE_ENABLED } from '../lib/supabase.js'

const DEV_STORAGE_KEY = 'quill.devUnlocked'
const TESTER_STORAGE_KEY = 'quill.tester'
const TIERS = ['free', 'pro', 'max']

// ── Private developer code (you) ──────────────────────────────────────────
// Unlocks the tier switcher / "god mode". Keep this to yourself.
export const DEV_CODE = 'I know Felix'

// ── Tester codes ──────────────────────────────────────────────────────────
// Codes now live in Supabase (table `tester_codes`, see supabase/tester_codes.sql)
// so you can create, revoke, expire, and track them from the dashboard with no
// redeploy. The app validates a code through the `redeem_tester_code` function,
// which never exposes the list of codes to the browser. The easiest way to
// onboard a tester is to send them an invite link (no typing needed):
//   https://lixmanabu.github.io/quill-wellness/?tester=<their-code>
// Opening it flags them as a tester (segmented in Umami). They can also type
// the code into the hidden box on the checkout screen. Testers use the app
// like a normal user; this does NOT unlock the developer tier switcher.
//
// FALLBACK_TESTER_CODE keeps things working in local dev (no Supabase keys)
// and during the brief window before the SQL is run on the live project.
export const FALLBACK_TESTER_CODE = 'quill-beta'

// Validate a tester code. Resolves true when the code is good. Uses the secure
// Supabase function when available, falling back to the built-in code so the
// invite flow never hard-breaks if the backend is offline or not yet migrated.
export async function validateTesterCode(code) {
  const entered = (code || '').trim()
  if (!entered) return false
  if (SUPABASE_ENABLED) {
    try {
      const { data, error } = await supabase.rpc('redeem_tester_code', { p_code: entered })
      if (!error) return data === true
    } catch { /* network/RPC failure → fall through to local check */ }
  }
  return entered.toLowerCase() === FALLBACK_TESTER_CODE.toLowerCase()
}

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
  // If the page is opened with ?tester=<code>, validate it (against Supabase
  // when available), flag this visitor as a tester, tell Umami so their whole
  // session is segmented, then strip the param so a refresh stays clean and
  // the code isn't left dangling in the address bar.
  useEffect(() => {
    let cancelled = false
    let code = null
    try { code = new URLSearchParams(window.location.search).get('tester') } catch {}
    if (!code) return
    validateTesterCode(code).then((ok) => {
      if (cancelled || !ok) return
      setTesterState(true)
      markTesterInAnalytics()
      try {
        const params = new URLSearchParams(window.location.search)
        params.delete('tester')
        const qs = params.toString()
        const clean = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash
        window.history.replaceState(window.history.state, '', clean)
      } catch {}
    })
    return () => { cancelled = true }
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
