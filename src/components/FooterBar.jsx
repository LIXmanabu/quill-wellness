import ThemeToggle from './ThemeToggle.jsx'
import { useTheme } from '../context/ThemeContext'

/* The shared "bottom line" present on every page: an About link and the
   night-mode toggle. Keeping these here lets the top navbar stay uncluttered
   while making both reliably reachable at the foot of any page. */
export default function FooterBar({ onNavigate }) {
  const { theme } = useTheme()
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onNavigate('about')}
        className="editorial-label text-ink-soft hover:text-ink transition-colors"
      >
        About
      </button>
      <span className="w-px h-4 bg-ink/15" aria-hidden="true" />
      <span className="inline-flex items-center gap-2 editorial-label text-ink-soft">
        <ThemeToggle />
        {theme === 'dark' ? 'Day mode' : 'Night mode'}
      </span>
    </div>
  )
}
