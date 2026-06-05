import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { flushSync } from 'react-dom'
import Navbar from './components/Navbar.jsx'
import BottomTabBar from './components/BottomTabBar.jsx'
import SearchOverlay from './components/SearchOverlay.jsx'
import ConnectionStatus from './components/ConnectionStatus.jsx'
import OnboardingQuiz from './components/OnboardingQuiz.jsx'
import AuthModal from './components/AuthModal.jsx'
import CustomCursor from './components/interactive/CustomCursor.jsx'
import NoiseOverlay from './components/interactive/NoiseOverlay.jsx'
import Home from './pages/Home.jsx'
import { ProProvider } from './context/ProContext.jsx'
import { UserProvider, useUser } from './context/UserContext.jsx'
import { AuthProvider, useAuth, DEV_MODE } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { usePro } from './context/ProContext.jsx'

// Code-split: each route ships as its own chunk, loaded on demand.
// Home stays eagerly imported so first paint is instant.
const Today = lazy(() => import('./pages/Today.jsx'))
const Sport = lazy(() => import('./pages/Sport.jsx'))
const Body = lazy(() => import('./pages/Body.jsx'))
const SkinCare = lazy(() => import('./pages/SkinCare.jsx'))
const Wellness = lazy(() => import('./pages/Wellness.jsx'))
const Diet = lazy(() => import('./pages/Diet.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const MyQuill = lazy(() => import('./pages/MyQuill.jsx'))
const Pro = lazy(() => import('./pages/Pro.jsx'))
const TipLibrary = lazy(() => import('./pages/TipLibrary.jsx'))
const Joy = lazy(() => import('./pages/Joy.jsx'))

const PAGE_LABELS = {
  today: 'Today',
  sport: 'Movement',
  body: 'Body Atlas',
  skincare: 'Skin ritual',
  wellness: 'Wellness',
  diet: 'Nourishment',
  tips: 'Daily tips',
  about: 'About Quill',
  myquill: 'Your Quill',
  pro: 'Pro edition',
  home: 'Home',
}

function PageLoader({ page }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="num-display text-5xl text-clay animate-pulse-soft">◐</p>
        <p className="editorial-label text-ink-soft mt-3">{PAGE_LABELS[page] || 'Opening'}</p>
      </div>
    </div>
  )
}

function AppShell() {
  // Launch on Today: the product's job is "find one thing to do today".
  // (Change 'today' → 'home' here to land on the magazine cover instead.)
  const [activePage, setActivePage] = useState('today')
  const [showSearch,     setShowSearch]     = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAuth,       setShowAuth]       = useState(false)
  // Guest is session-only (not remembered across reloads), so the sign-up
  // screen reappears on each fresh load until the visitor makes a real account.
  const [guestMode,      setGuestMode]      = useState(false)
  const { profile, updateProfile } = useUser()
  const { tier, isMax, setTier } = usePro()
  const { user, loading: authLoading } = useAuth()

  // However onboarding is dismissed (skip, ✕, escape, or completion),
  // remember it so logged-in users aren't asked again every visit.
  function closeOnboarding() {
    setShowOnboarding(false)
    if (!profile.dismissedOnboarding) updateProfile({ dismissedOnboarding: true })
  }

  useEffect(() => {
    if (DEV_MODE) {
      // ── Developer mode: always show onboarding on every load ──
      const t = setTimeout(() => setShowOnboarding(true), 600)
      return () => clearTimeout(t)
    }

    if (authLoading) return

    if (!user && !guestMode) {
      // Not logged in and not a guest → show auth modal
      setShowAuth(true)
    } else {
      // Logged in or guest → close auth. Native apps never re-ask identity on
      // every launch, so onboarding is gated to first run only: show it just
      // when the user hasn't been onboarded and hasn't told us their name.
      setShowAuth(false)
      if (!profile.dismissedOnboarding && !profile.name) setShowOnboarding(true)
    }
  }, [user, authLoading, guestMode])

  function handleContinueAsGuest() {
    setGuestMode(true)   // session-only; the sign-up screen returns next load
    setShowAuth(false)
    // Show the onboarding (name) screen for guests too
    setShowOnboarding(true)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [activePage])

  // Apply a page change with a view transition, without touching history.
  // Guard against overlapping transitions (which throw "Transition was aborted")
  // and swallow the benign abort rejection when the overlay unmounts mid-flight.
  const vtActive = useRef(false)
  const applyPage = useCallback((key) => {
    if (!document.startViewTransition || vtActive.current) { setActivePage(key); return }
    vtActive.current = true
    const t = document.startViewTransition(() => { flushSync(() => setActivePage(key)) })
    const done = () => { vtActive.current = false }
    t.finished.then(done, done)
  }, [])

  // Public navigate: changes the page AND pushes a history entry, so the
  // device/edge back button steps back through pages instead of leaving the app.
  const activePageRef = useRef(activePage)
  const showSearchRef = useRef(showSearch)
  useEffect(() => { activePageRef.current = activePage }, [activePage])
  useEffect(() => { showSearchRef.current = showSearch }, [showSearch])

  const handleNavigate = useCallback((key) => {
    const wasSearch = showSearchRef.current
    if (key === activePageRef.current && !wasSearch) return
    if (wasSearch) setShowSearch(false)
    const changing = key !== activePageRef.current
    if (changing) applyPage(key)
    // Privacy-friendly analytics: log each section as a pageview (this is a
    // single-page app, so the URL doesn't change on tab switches). No-ops
    // until the Umami snippet in index.html loads.
    if (changing && window.umami?.track) {
      window.umami.track((props) => ({ ...props, url: '/' + key, title: 'Quill · ' + key }))
    }
    // If search is open, its history entry is on top, consume it by replacing,
    // so a later Back doesn't re-open search. Otherwise push a normal page entry.
    if (wasSearch && window.history.state?.quillOverlay === 'search') {
      window.history.replaceState({ quillPage: key }, '')
    } else if (changing) {
      window.history.pushState({ quillPage: key }, '')
    }
  }, [applyPage])

  const openSearch = useCallback(() => {
    if (showSearchRef.current) return
    setShowSearch(true)
    // Push an overlay entry so system back closes search first.
    window.history.pushState({ quillPage: activePageRef.current, quillOverlay: 'search' }, '')
  }, [])

  const closeSearch = useCallback(() => {
    if (!showSearchRef.current) return
    if (window.history.state?.quillOverlay === 'search') window.history.back()
    else setShowSearch(false)
  }, [])

  // Seed the first history entry, then mirror back/forward into UI state.
  useEffect(() => {
    window.history.replaceState({ quillPage: activePageRef.current }, '')
    function onPop(e) {
      const st = e.state || {}
      const wantSearch = st.quillOverlay === 'search'
      setShowSearch(wantSearch)
      if (st.quillPage && st.quillPage !== activePageRef.current) applyPage(st.quillPage)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [applyPage])

  const pageMap = {
    home: <Home onNavigate={handleNavigate} />,
    today: <Today onNavigate={handleNavigate} />,
    sport: <Sport onNavigate={handleNavigate} />,
    body: <Body onNavigate={handleNavigate} />,
    skincare: <SkinCare onNavigate={handleNavigate} />,
    wellness: <Wellness onNavigate={handleNavigate} />,
    diet: <Diet onNavigate={handleNavigate} />,
    about: <About />,
    myquill: <MyQuill onNavigate={handleNavigate} />,
    pro: <Pro onNavigate={handleNavigate} />,
    tips: <TipLibrary onNavigate={handleNavigate} />,
    joy: <Joy onNavigate={handleNavigate} />,
  }

  return (
    <div className={`min-h-screen font-sans bg-cream text-ink ${isMax ? 'max-mode' : ''}`}>
      {isMax && (
        <>
          <div className="max-rainbow-bar max-rainbow-bar--top" aria-hidden="true" />
          <div className="max-rainbow-bar max-rainbow-bar--bottom" aria-hidden="true" />
        </>
      )}
      <NoiseOverlay />
      <CustomCursor />
      <ConnectionStatus />
      <Navbar activePage={activePage} onNavigate={handleNavigate} onOpenSearch={openSearch} />
      <main className="pt-16 md:pt-28 relative pb-[calc(env(safe-area-inset-bottom)+5.5rem)] lg:pb-0">
        <div key={activePage} className="animate-page-in">
          <Suspense fallback={<PageLoader page={activePage} />}>
            {pageMap[activePage] ?? <Home onNavigate={handleNavigate} />}
          </Suspense>
        </div>
      </main>

      {/* Footer, local-only data notice (Home has its own colophon footer) */}
      {activePage !== 'home' && (
        <footer className="border-t border-ink/10 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="editorial-label text-ink-soft">Quill · Vol. 01</span>
            <p className="text-xs text-ink-soft leading-relaxed max-w-xl sm:text-right">
              Your account and progress are stored only in this browser, on your device. Quill
              doesn't send, collect, or share any of your data. Clearing your browser will erase it.
            </p>
          </div>
        </footer>
      )}

      {/* App-style bottom navigation (phones/tablets); desktop keeps the top nav */}
      <BottomTabBar activePage={activePage} onNavigate={handleNavigate} onOpenSearch={openSearch} />

      {showSearch     && <SearchOverlay onClose={closeSearch} onNavigate={handleNavigate} />}
      {showAuth       && <AuthModal onGuest={handleContinueAsGuest} />}
      {showOnboarding && <OnboardingQuiz onClose={closeOnboarding} />}

      {/* Always-visible "exit upgraded tier" button, bottom-right, every page. */}
      {tier !== 'free' && (
        <button
          onClick={() => setTier('free')}
          className={`fixed right-4 z-[55] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] shadow-soft-lg transition-all border-2 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] lg:bottom-6 ${
            isMax
              ? 'bg-cream text-ink border-gold hover:bg-gold hover:text-ink'
              : 'bg-ink text-cream border-ink hover:bg-clay hover:border-clay'
          }`}
          aria-label="Switch back to Free mode"
          data-cursor-label="back to free"
        >
          <span className="display-italic text-base mr-1">←</span> Back to Free
        </button>
      )}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProProvider>
          <UserProvider>
            <AppShell />
          </UserProvider>
        </ProProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
