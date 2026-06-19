import { useState, useEffect, useCallback } from 'react'
import { useAuth, DEV_MODE } from '../context/AuthContext.jsx'
import { SUPABASE_ENABLED } from '../lib/supabase'
import { countIncomingRequests, FRIEND_REQUESTS_CHANGED } from '../lib/community.js'

// ─────────────────────────────────────────────────────────────────────────
//  Pending incoming friend-request count, for nav badges + the header bell.
//  One small head-only query, refreshed on a slow poll, on window focus, and
//  instantly whenever a request is answered anywhere in the app (the
//  FRIEND_REQUESTS_CHANGED event). Returns 0 for guests / local-only mode.
// ─────────────────────────────────────────────────────────────────────────
export default function useFriendRequestCount() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)
  const enabled = SUPABASE_ENABLED && !DEV_MODE && !!user?.id

  const refresh = useCallback(async () => {
    if (!user?.id) { setCount(0); return }
    const { data } = await countIncomingRequests(user.id)
    setCount(data || 0)
  }, [user?.id])

  useEffect(() => {
    if (!enabled) { setCount(0); return }
    refresh()
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    window.addEventListener(FRIEND_REQUESTS_CHANGED, refresh)
    const poll = setInterval(refresh, 60000)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener(FRIEND_REQUESTS_CHANGED, refresh)
      clearInterval(poll)
    }
  }, [enabled, refresh])

  return enabled ? count : 0
}
