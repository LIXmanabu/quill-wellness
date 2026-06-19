import { useState, useEffect } from 'react'
import BadgeLegend from './community/BadgeLegend.jsx'

/* The shared "bottom line" present on every page: the About link and a Badges
   link that opens the community medal legend in a modal (so it's reachable from
   anywhere, not just the Community tab). Night mode lives in the header. */
export default function FooterBar({ onNavigate }) {
  const [showBadges, setShowBadges] = useState(false)
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onNavigate('about')}
        className="editorial-label text-ink-soft hover:text-ink transition-colors"
      >
        About
      </button>
      <span className="w-px h-4 bg-ink/15" aria-hidden="true" />
      <button
        onClick={() => setShowBadges(true)}
        className="editorial-label text-ink-soft hover:text-ink transition-colors"
      >
        Badges
      </button>
      {showBadges && <BadgeModal onClose={() => setShowBadges(false)} />}
    </div>
  )
}

function BadgeModal({ onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-cream-dark/95 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto panel-scroll bg-cream-light border border-ink/15 p-6 sm:p-8 animate-pop-in shadow-soft-lg">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center border border-ink/20 hover:border-ink hover:bg-ink hover:text-cream transition-all display-italic text-lg z-10"
        >
          ✕
        </button>
        <p className="editorial-label text-clay">Quill Community</p>
        <h2 className="font-display text-3xl sm:text-4xl text-ink leading-tight mt-1 mb-5">Badges</h2>
        <BadgeLegend />
      </div>
    </div>
  )
}
