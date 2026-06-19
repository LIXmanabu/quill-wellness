import {
  requestCommunityView, COMMUNITY_VIEW_EVENT,
} from '../lib/community.js'
import useFriendRequestCount from '../hooks/useFriendRequestCount.js'

// ─── Header notification bell ─────────────────────────────────────────────
// Always-visible (every page, every screen size) indicator for incoming friend
// requests. Shows a clay badge with the count and deep-links into Community →
// Friends & requests. The count + its refresh logic live in
// useFriendRequestCount, which returns 0 for guests / local-only mode (so the
// bell renders nothing for them).
export default function NotificationBell({ onNavigate, className = '' }) {
  const count = useFriendRequestCount()

  function open() {
    requestCommunityView('friends')          // covers Community lazy-loading
    onNavigate('community')
    window.dispatchEvent(new CustomEvent(COMMUNITY_VIEW_EVENT, { detail: 'friends' }))
  }

  const label = count > 0
    ? `Friend requests — ${count} new`
    : 'Friend requests'

  return (
    <button
      onClick={open}
      aria-label={label}
      title={label}
      className={`relative flex items-center justify-center min-h-[44px] min-w-[44px] text-ink-soft hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-clay rounded ${className}`}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M18 8a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.3 20a2 2 0 0 0 3.4 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {count > 0 && (
        <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] num-display bg-clay text-cream rounded-full animate-pop-in">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
