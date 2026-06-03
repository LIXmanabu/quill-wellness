import { flushSync } from 'react-dom'
import { useTheme } from '../context/ThemeContext'

// A compact sun/moon toggle. Switching themes plays a circular-reveal
// animation: the new theme sweeps out from the button as an expanding circle
// (via the View Transitions API). Falls back to an instant switch where that
// API is unavailable or the user prefers reduced motion.
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  function handleClick(e) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce) {
      toggleTheme()
      return
    }

    // Reveal origin = the click point, or the button centre for keyboard use.
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX || rect.left + rect.width / 2
    const y = e.clientY || rect.top + rect.height / 2
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const root = document.documentElement
    root.classList.add('theme-vt')   // scopes the CSS that cancels the page-nav fade
    const transition = document.startViewTransition(() => {
      flushSync(() => toggleTheme())  // apply the new theme before the snapshot
    })
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
    transition.finished.finally(() => root.classList.remove('theme-vt'))
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      data-cursor-label={dark ? 'light' : 'dark'}
      className={`inline-flex items-center justify-center text-ink-soft hover:text-ink transition-colors ${className}`}
    >
      {dark ? (
        // Sun
        <svg key="sun" className="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
      ) : (
        // Moon
        <svg key="moon" className="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}
