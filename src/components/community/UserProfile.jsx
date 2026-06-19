import { useState, useEffect, useCallback } from 'react'
import { Avatar } from './ui.jsx'
import LikeBadge from './LikeBadge.jsx'
import BadgeCase from './BadgeCase.jsx'
import { effectiveLikes, badgeForLikes } from '../../lib/badges.js'
import CommunityPostCard from './CommunityPostCard.jsx'
import {
  getProfileByUsername, getUserPosts, getFriendStatus,
  sendFriendRequest, removeFriend, getMyInteractions, setBadgeOverride,
} from '../../lib/community.js'

// ─── A user's public profile + their visible posts ───────────────────────
export default function UserProfile({ username, myId, isAdmin = false, onBack, onOpenPost, onReportUser }) {
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('none')   // none | outgoing | incoming | friends | self
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [interactions, setInteractions] = useState({ liked: new Set(), saved: new Set() })

  const load = useCallback(async () => {
    setLoading(true)
    const { data: prof } = await getProfileByUsername(username)
    if (!prof) { setProfile(null); setLoading(false); return }
    setProfile(prof)
    const self = prof.id === myId
    const [{ data: ps }, st] = await Promise.all([
      getUserPosts(prof.id),
      self ? Promise.resolve({ data: 'self' }) : getFriendStatus(prof.id, myId),
    ])
    setPosts(ps || [])
    setStatus(self ? 'self' : st.data)
    if (myId && ps?.length) {
      const { data: inter } = await getMyInteractions(myId, ps.map((p) => p.id))
      if (inter) setInteractions(inter)
    }
    setLoading(false)
  }, [username, myId])

  useEffect(() => { load() }, [load])

  async function onAddFriend() {
    setBusy(true)
    const { error } = await sendFriendRequest(myId, profile.id)
    // Only show "Request sent" if it actually was. On failure (e.g. a stale
    // declined request blocks a duplicate), re-read the true status instead of
    // falsely claiming success.
    if (error) {
      const st = await getFriendStatus(profile.id, myId)
      setStatus(st.data)
    } else {
      setStatus('outgoing')
    }
    setBusy(false)
  }
  async function onRemoveFriend() {
    setBusy(true)
    await removeFriend(profile.id)
    setStatus('none'); setBusy(false)
  }

  // Admin-only: flip this account's public badge floor, then reload to reflect it.
  async function handleSetOverride(floor) {
    await setBadgeOverride(profile.id, floor)
    await load()
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-ink-soft">Loading profile…</div>
  if (!profile) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="font-display text-2xl text-ink">Profile not found.</p>
      <button onClick={onBack} className="btn-ghost mt-4">← Back</button>
    </div>
  )

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null

  // Public trust signal: how much the community has loved this person's routines.
  const totalLikes = posts.reduce((s, p) => s + (p.likesCount || 0), 0)
  const totalSaves = posts.reduce((s, p) => s + (p.savesCount || 0), 0)
  const topPost = posts.reduce((best, p) => ((p.likesCount || 0) > (best?.likesCount || 0) ? p : best), null)

  // Badge display: fold in any admin-set public override (seen by everyone) and,
  // on your own profile, your local preview.
  const isSelf = status === 'self'
  const override = profile.badge_override || 0
  const effLikes = effectiveLikes(totalLikes, { isSelf, override })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <button onClick={onBack} className="btn-ghost mb-6"><span className="display-italic text-base">←</span> Back</button>

      <header className="flex items-start gap-5">
        <Avatar url={profile.avatar_url} name={profile.display_name || profile.username} size={84} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">{profile.display_name || profile.username}</h1>
          <p className="text-ink-softer text-sm">@{profile.username}</p>
          {profile.bio && <p className="text-ink-soft mt-2 leading-relaxed max-w-xl">{profile.bio}</p>}
          {memberSince && <p className="editorial-label text-ink-softer mt-3">Member since {memberSince}</p>}
        </div>
      </header>

      {/* Your badge case — the full medal collection (own profile only, always
          shown so you can see your badges even before your first post). */}
      {isSelf && (
        <div className="mt-6">
          <BadgeCase totalLikes={totalLikes} isSelf isAdmin={isAdmin} override={override} onSetOverride={handleSetOverride} />
        </div>
      )}

      {/* Another person's earned medal — shown even before their first post (e.g.
          when an admin override has lit up their badges). */}
      {!isSelf && posts.length === 0 && badgeForLikes(effLikes) && (
        <div className="mt-6">
          <LikeBadge totalLikes={effLikes} size="lg" />
        </div>
      )}

      {/* Likes earned — public trust signal */}
      {posts.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <Stat n={totalLikes} label={totalLikes === 1 ? 'like earned' : 'likes earned'} heart />
            <Stat n={totalSaves} label="saved" />
            <Stat n={posts.length} label={posts.length === 1 ? 'routine' : 'routines'} />
            {/* Earned like-medal (🥉10 · 🥈100 · 🥇1,000 · 💎10,000) */}
            <LikeBadge totalLikes={effLikes} showProgress={isSelf} size="lg" />
          </div>
          {topPost && topPost.likesCount > 0 && (
            <button onClick={() => onOpenPost(topPost)}
              className="card-bone hover:border-ink/30 border border-transparent transition-colors mt-4 p-3.5 flex items-center gap-3 w-full text-left group">
              <span className="editorial-num text-2xl text-clay/40 shrink-0">❀</span>
              <span className="min-w-0 flex-1">
                <span className="editorial-label text-clay block">Most-loved routine</span>
                <span className="block font-display text-lg text-ink leading-snug truncate group-hover:text-clay transition-colors">{topPost.title}</span>
              </span>
              <span className="shrink-0 inline-flex items-center gap-1 text-clay text-sm">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20Z" /></svg>
                <span className="num-display">{topPost.likesCount}</span>
              </span>
            </button>
          )}
        </div>
      )}

      {/* Friend actions */}
      {status !== 'self' && (
        <div className="mt-6 flex items-center gap-3 flex-wrap">
          {status === 'none' && <button onClick={onAddFriend} disabled={busy} className="btn-clay disabled:opacity-50">+ Add friend</button>}
          {status === 'outgoing' && <span className="chip chip-cream">Request sent</span>}
          {status === 'incoming' && <span className="chip card-gold">Wants to be your friend — see Requests</span>}
          {status === 'friends' && (
            <>
              <span className="chip chip-ink">✓ Friends</span>
              <button onClick={onRemoveFriend} disabled={busy} className="btn-ghost text-ink-soft hover:text-clay">Remove</button>
            </>
          )}
          <button onClick={() => onReportUser(profile)} className="btn-ghost text-ink-softer hover:text-clay ml-auto">Report</button>
        </div>
      )}

      {/* Posts */}
      <div className="mt-9 pt-6 border-t border-ink/15">
        <span className="editorial-label">{status === 'self' ? 'Your posts' : 'Shared routines'}</span>
        {posts.length === 0 ? (
          <p className="text-ink-soft mt-4">Nothing shared publicly yet.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
            {posts.map((p) => (
              <CommunityPostCard key={p.id} post={p}
                liked={interactions.liked.has(p.id)} saved={interactions.saved.has(p.id)}
                onOpen={() => onOpenPost(p)} onOpenAuthor={() => {}}
                onLike={() => {}} onSave={() => {}} onReport={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// A single headline number ("128 · likes earned") for the profile trust strip.
function Stat({ n, label, heart = false }) {
  return (
    <span className="flex items-baseline gap-1.5">
      {heart && (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-clay self-center" aria-hidden="true">
          <path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />
        </svg>
      )}
      <span className="num-display text-2xl text-ink leading-none">{n}</span>
      <span className="text-xs text-ink-softer uppercase tracking-[0.12em]">{label}</span>
    </span>
  )
}
