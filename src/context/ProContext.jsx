import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase, SUPABASE_ENABLED } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'

const TESTER_STORAGE_KEY = 'quill.tester'
const BETA_STORAGE_KEY = 'quill.betaActive'
const TIERS = ['free', 'pro', 'max']

// ── Developer / "god mode" ────────────────────────────────────────────────
// Dev access is no longer a typed code (that old code shipped inside the
// public JavaScript for anyone to find). It's now granted automatically to
// admin accounts, and the decision is made by the SERVER: a locked `admins`
// table + the is_admin() function (see supabase/admins.sql). Add your own
// user ID there and signing in unlocks the tier switcher — with nothing
// secret left in the browser bundle.

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
// FALLBACK_TESTER_CODES are always-on built-in codes: they work in local dev
// (no Supabase keys) and during the window before the SQL is run on the live
// project. 'quill-beta' is kept so older invite links never break; 'testerbeta'
// is the simple shareable code. (Custom codes you create in the dashboard work
// through the secure RPC, regardless of these.)
export const FALLBACK_TESTER_CODES = ['quill-beta', 'testerbeta']
export const FALLBACK_TESTER_CODE = FALLBACK_TESTER_CODES[0]

// Validate a tester code. Resolves true when the code is good. Uses the secure
// Supabase function when available, falling back to the built-in codes so the
// invite flow never hard-breaks if the backend is offline or not yet migrated.
export async function validateTesterCode(code) {
  const entered = (code || '').trim()
  if (!entered) return false
  if (SUPABASE_ENABLED) {
    try {
      const { data, error } = await supabase.rpc('redeem_tester_code', { p_code: entered })
      if (!error && data === true) return true   // good code in the dashboard table
    } catch { /* network/RPC failure → fall through to local check */ }
  }
  return FALLBACK_TESTER_CODES.includes(entered.toLowerCase())
}

// Where tester notes ("request a change") and any "contact us" links deliver.
// This is the Quill project inbox, so beta feedback lands separately from your
// personal mail. (Account emails — password reset, sign-in links — are sent by
// Supabase, not from here; that "from" address is set in the Supabase dashboard.)
export const FEEDBACK_EMAIL = 'Quill-app@protonmail.com'

const ProContext = createContext({
  tier: 'free',
  isPro: false,
  isMax: false,
  devUnlocked: false,
  isTester: false,
  betaActive: true,
  setTier: () => {},
  togglePro: () => {},
  setDevUnlocked: () => {},
  setTester: () => {},
})

export function ProProvider({ children }) {
  const { user } = useAuth()

  // Tier is intentionally NOT persisted across reloads. Every page load
  // starts at Free, users have to "upgrade" through the checkout flow
  // again, which is the desired behaviour for this prototype.
  const [tier, setTierState] = useState('free')

  // Dev-mode unlock is NOT stored in the browser and can't be typed in: it is
  // granted only when the signed-in account is an admin, which the server
  // confirms via is_admin() (supabase/admins.sql). Signing out turns it off.
  const [devUnlocked, setDevUnlockedState] = useState(false)

  // Ask the server whether the current account is an admin whenever the
  // signed-in user changes. Anyone who isn't signed in, or isn't in the
  // locked `admins` table, simply gets false.
  useEffect(() => {
    let cancelled = false
    if (!user || !SUPABASE_ENABLED) { setDevUnlockedState(false); return }
    supabase
      .rpc('is_admin')
      .then(({ data, error }) => {
        if (!cancelled) setDevUnlockedState(!error && data === true)
      })
      .catch(() => { if (!cancelled) setDevUnlockedState(false) })
    return () => { cancelled = true }
  }, [user?.id])

  // Tester flag is persisted: once someone arrives via the tester link
  // (or types the code), they stay a tester on this device until they leave.
  const [isTester, setTesterState] = useState(() => {
    try { return localStorage.getItem(TESTER_STORAGE_KEY) === 'true' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem(TESTER_STORAGE_KEY, String(isTester)) } catch {}
  }, [isTester])

  // ── Beta master switch (remote) ──────────────────────────────────────────
  // A single flag in Supabase (app_config.beta_active — see supabase/beta_switch.sql).
  // While true, tester mode works normally. Flip it to false at launch and the
  // app stops treating ANYONE as a tester — even people who already redeemed a
  // code — and hides all tester UI, with no redeploy. Cached locally so a
  // returning visitor doesn't flicker. Defaults ON if the table isn't set up.
  const [betaActive, setBetaActive] = useState(() => {
    try { return localStorage.getItem(BETA_STORAGE_KEY) !== 'false' } catch { return true }
  })

  useEffect(() => {
    if (!SUPABASE_ENABLED) return
    let cancelled = false
    supabase.from('app_config').select('value').eq('key', 'beta_active').maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error) return   // table missing → keep default (beta on)
        const active = data ? data.value !== false : true
        setBetaActive(active)
        try { localStorage.setItem(BETA_STORAGE_KEY, String(active)) } catch {}
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

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
    // Beta over → nobody is a tester any more, regardless of their saved flag.
    isTester: isTester && betaActive,
    betaActive,
    setTier,
    togglePro,
    setDevUnlocked,
    setTester,
  }), [tier, devUnlocked, isTester, betaActive])

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
