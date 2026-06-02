import { useState } from 'react'
import { useUser } from '../context/UserContext.jsx'
import { usePro } from '../context/ProContext.jsx'

const FREE_LIMIT = 3

export default function FavoriteButton({ id, label, size = 'md', onUpsell }) {
  const { isFavorite, toggleFavorite, profile } = useUser()
  const { isPro } = usePro()
  const [showHint, setShowHint] = useState(false)
  const fav = isFavorite(id)

  const reachedLimit = !isPro && !fav && profile.favorites.length >= FREE_LIMIT

  function handle(e) {
    e.stopPropagation()
    e.preventDefault()
    if (reachedLimit) {
      setShowHint(true)
      onUpsell?.()
      setTimeout(() => setShowHint(false), 2400)
      return
    }
    toggleFavorite(id)
  }

  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-base' : 'w-10 h-10 text-lg'

  return (
    <div className="relative inline-flex">
      <button
        onClick={handle}
        aria-label={fav ? `Remove ${label || 'item'} from favorites` : `Save ${label || 'item'}`}
        aria-pressed={fav}
        className={`${sizeClasses} flex items-center justify-center transition-all duration-200 border ${
          fav
            ? 'bg-ink text-cream border-ink'
            : reachedLimit
              ? 'bg-cream-light text-ink-softer border-ink/15 hover:border-gold-dark hover:text-gold-dark'
              : 'bg-cream-light text-ink-softer border-ink/15 hover:border-ink hover:text-ink hover:bg-bone'
        }`}
      >
        <span className={fav ? 'animate-pop-in display-italic' : 'display-italic'}>
          {fav ? '♥' : '♡'}
        </span>
      </button>

      {showHint && (
        <div className="absolute top-full right-0 mt-2 z-20 w-56 p-3 bg-cream-light border border-ink shadow-soft-lg animate-pop-in">
          <p className="editorial-label text-clay mb-1">Free · {FREE_LIMIT} max</p>
          <p className="text-xs text-ink-soft leading-snug">
            Upgrade to Pro for unlimited saved tips, routines, and plans.
          </p>
        </div>
      )}
    </div>
  )
}
