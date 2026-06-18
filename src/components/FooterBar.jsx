/* The shared "bottom line" present on every page: the About link. (Night mode
   lives in the header now, where it's always reachable.) */
export default function FooterBar({ onNavigate }) {
  return (
    <button
      onClick={() => onNavigate('about')}
      className="editorial-label text-ink-soft hover:text-ink transition-colors"
    >
      About
    </button>
  )
}
