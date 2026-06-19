import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import ThemeToggle from './ThemeToggle.jsx'
import useFriendRequestCount from '../hooks/useFriendRequestCount.js'
import { usePro, FEEDBACK_EMAIL } from '../context/ProContext.jsx'
import { useUser } from '../context/UserContext.jsx'
import { useAuth, DEV_MODE } from '../context/AuthContext.jsx'

const tabs = [
  { key: 'home', label: 'Home' },
  { key: 'today', label: 'Today' },
  { key: 'body', label: 'Body' },
  { key: 'sport', label: 'Movement' },
  { key: 'skincare', label: 'Skin' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'community', label: 'Community' },
  { key: 'joy', label: 'Joy' },
  { key: 'diet', label: 'Diet' },
  { key: 'tips', label: 'Tips' },
  { key: 'myquill', label: 'My Quill' },
]

export default function Navbar({ activePage, onNavigate, onOpenSearch }) {
  const [scrolled, setScrolled] = useState(false)
  const [hoverKey, setHoverKey] = useState(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 })
  const { tier, isTester } = usePro()
  const tierLabel = tier === 'max' ? 'Max Edition' : tier === 'pro' ? 'Pro Edition' : 'Free Edition'
  // Tester feedback ("request a change"), surfaced right in the masthead strip.
  const feedbackHref = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('Quill — request a change')}&body=${encodeURIComponent('What I’d like changed:\n\n\nWhere I saw it (which screen):\n\n\nWhat I liked:\n\n\n— sent from the Quill beta')}`
  const { profile } = useUser()
  const favCount = profile.favorites.length
  const requestCount = useFriendRequestCount()
  const { user, signOut } = useAuth()

  const navRef = useRef(null)
  const tabRefs = useRef({})

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Position the sliding indicator under the hovered or active tab
  useLayoutEffect(() => {
    const target = hoverKey || activePage
    const el = tabRefs.current[target]
    const nav = navRef.current
    if (!el || !nav) {
      setIndicator((s) => ({ ...s, opacity: 0 }))
      return
    }
    const navRect = nav.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    setIndicator({
      left: elRect.left - navRect.left,
      width: elRect.width,
      opacity: 1,
    })
  }, [hoverKey, activePage])

  // Recompute on resize
  useEffect(() => {
    function onResize() {
      const target = hoverKey || activePage
      const el = tabRefs.current[target]
      const nav = navRef.current
      if (!el || !nav) return
      const navRect = nav.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      setIndicator({ left: elRect.left - navRect.left, width: elRect.width, opacity: 1 })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [hoverKey, activePage])

  function handleNav(key) {
    onNavigate(key)
  }

  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 bg-cream pt-[env(safe-area-inset-top)] ${scrolled ? 'border-b border-ink/15 shadow-soft' : 'border-b border-ink/10'}`}>
      {/* Editorial top strip */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="masthead">
          <span>Quill · Wellness Quarterly</span>
          <span>Issue 01 · {date}</span>
          {isTester ? (
            <a href={feedbackHref} className="text-clay hover:text-ink transition-colors" title="Send the team a note">
              ✎ Request a change
            </a>
          ) : (
            <span>{tierLabel}</span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16 gap-3">
          {/* Logo, Magazine masthead style */}
          <button
            onClick={() => handleNav('home')}
            className="group shrink-0"
            aria-label="Quill, go to home"
          >
            <img
              src={`${import.meta.env.BASE_URL}quill-logo.png`}
              alt="Quill"
              className="h-12 md:h-14 w-auto shrink-0 transition-transform group-hover:scale-[1.03]"
            />
          </button>

          {/* Desktop tabs with sliding indicator */}
          <nav
            ref={navRef}
            className="hidden lg:flex relative items-center gap-5 xl:gap-7 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onMouseLeave={() => setHoverKey(null)}
          >
            {/* Sliding active/hover indicator, a single bar tracking the focused tab */}
            <span
              className="absolute -bottom-1 h-px bg-ink pointer-events-none"
              style={{
                left: indicator.left,
                width: indicator.width,
                opacity: indicator.opacity,
                transition: 'left 0.5s cubic-bezier(0.22, 1, 0.36, 1), width 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
              }}
              aria-hidden="true"
            />
            {/* Soft moving background pill for hover */}
            <span
              className="absolute -inset-y-1.5 bg-bone pointer-events-none"
              style={{
                left: indicator.left - 10,
                width: indicator.width + 20,
                opacity: hoverKey && hoverKey !== activePage ? 0.6 : 0,
                transition: 'left 0.5s cubic-bezier(0.22, 1, 0.36, 1), width 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
                zIndex: -1,
              }}
              aria-hidden="true"
            />

            {tabs.map((tab, i) => {
              const isActive = activePage === tab.key
              return (
                <button
                  key={tab.key}
                  ref={(el) => (tabRefs.current[tab.key] = el)}
                  onClick={() => handleNav(tab.key)}
                  onMouseEnter={() => setHoverKey(tab.key)}
                  className={`relative text-sm tracking-wide font-medium transition-all duration-300 py-1 shrink-0 whitespace-nowrap ${
                    isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-[10px] num-display text-ink-softer">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={`inline-block transition-transform duration-500 ${isActive ? '-translate-y-px' : ''}`}>
                      {tab.label}
                    </span>
                    {tab.key === 'myquill' && favCount > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[9px] num-display bg-clay text-cream rounded-full animate-pop-in">
                        {favCount}
                      </span>
                    )}
                    {tab.key === 'community' && requestCount > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] num-display bg-clay text-cream rounded-full animate-pop-in">
                        {requestCount > 9 ? '9+' : requestCount}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}

          </nav>

          {/* Right side: search + account indicator (the dev tier switcher is a
              floating control now, so it never crowds or crops the nav) */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Search, available on every screen size */}
            <button
              onClick={onOpenSearch}
              aria-label="Search Quill"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] text-ink-soft hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-clay rounded"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Night-mode toggle, always visible here in the header */}
            <ThemeToggle className="min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-clay rounded" />

            {/* Show email initial + sign-out when logged in (production only) */}
            {!DEV_MODE && user && (
              <div className="hidden lg:flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-clay/20 flex items-center justify-center text-[11px] font-bold text-clay uppercase">
                  {user.email?.[0] ?? '?'}
                </span>
                <button
                  onClick={signOut}
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft hover:text-ink transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
