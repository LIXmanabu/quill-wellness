import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { Avatar, VisibilityIcon, timeAgo } from '../community/ui.jsx'
import { badgeForLikes, nextBadge, LIKE_BADGES } from '../../lib/badges.js'
import {
  COMMUNITY_ENABLED, getMyProfile, listFeed, listFriends,
  checkIsAdmin, setBadgeOverride, updateMyProfile,
} from '../../lib/community.js'
import {
  GlowScoreCard, StatsGrid, PlanCard, SavedPlanCard,
  ActivityTimeline, BadgesSection, SettingsPanel, Empty,
} from './ProfileSections.jsx'
import {
  DEMO_PROFILE, DEMO_STATS, DEMO_GLOW, DEMO_PLANS, DEMO_SAVED, DEMO_ACTIVITY,
} from '../../data/profileDemo.js'

// Dispatch this to open the modal from anywhere (the header avatar does):
//   window.dispatchEvent(new Event(PROFILE_MODAL_EVENT))
export const PROFILE_MODAL_EVENT = 'quill:open-profile-modal'

const TABS = ['Overview', 'Plans', 'Saved', 'Activity', 'Badges', 'Settings']

// "Trending / New / Saved by many" tag derived from a real post's numbers.
function deriveStatus(p) {
  const fresh = p.createdAt && (Date.now() - new Date(p.createdAt).getTime()) < 14 * 864e5
  if ((p.savesCount || 0) >= 50) return 'Saved by many'
  if ((p.likesCount || 0) >= 100) return 'Trending'
  if (fresh) return 'New'
  return null
}

function deriveActivity(plans, totalLikes) {
  const acts = []
  const badge = badgeForLikes(totalLikes)
  if (badge) acts.push({ id: 'badge', kind: 'badge', text: `You earned the ${badge.label} badge`, at: '' })
  plans.slice(0, 5).forEach((p) => {
    if ((p.likesCount || 0) > 0)
      acts.push({ id: `l${p.id}`, kind: 'likes', text: `“${p.title}” has ${p.likesCount} like${p.likesCount === 1 ? '' : 's'}`, at: timeAgo(p.createdAt) })
    else
      acts.push({ id: `s${p.id}`, kind: 'trending', text: `You shared “${p.title}”`, at: timeAgo(p.createdAt) })
  })
  return acts
}

export default function ProfileOverviewModal() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('Overview')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const lastFocused = useRef(null)

  // Open on the global event (fired by the header avatar / account button).
  useEffect(() => {
    const onOpen = () => { lastFocused.current = document.activeElement; setTab('Overview'); setOpen(true) }
    window.addEventListener(PROFILE_MODAL_EVENT, onOpen)
    return () => window.removeEventListener(PROFILE_MODAL_EVENT, onOpen)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    if (lastFocused.current?.focus) lastFocused.current.focus()
  }, [])

  // Build the modal's data: real Supabase data when signed in, else demo.
  const buildDemo = useCallback(() => ({
    profile: DEMO_PROFILE,
    stats: DEMO_STATS,
    glow: DEMO_GLOW,
    plans: DEMO_PLANS,
    saved: DEMO_SAVED,
    activity: DEMO_ACTIVITY,
    totalLikes: DEMO_STATS.glow,
    isSelf: true, isAdmin: false, override: 0, isDemo: true,
  }), [])

  const loadReal = useCallback(async () => {
    const [{ data: prof }, mine, saved, friends, isAdmin] = await Promise.all([
      getMyProfile(user.id),
      listFeed({ tab: 'mine', userId: user.id }),
      listFeed({ tab: 'saved', userId: user.id }),
      listFriends(user.id),
      checkIsAdmin().catch(() => false),
    ])
    if (!prof?.username) return null   // no community profile yet → fall back to demo
    const plans = (mine.data || []).map((p) => ({ ...p, status: deriveStatus(p) }))
    const savedPlans = (saved.data || []).map((p) => ({
      id: p.id, title: p.title, category: p.category,
      author: p.author, savedAt: p.createdAt, description: p.description,
    }))
    const totalLikes = plans.reduce((s, p) => s + (p.likesCount || 0), 0)
    const totalSaves = plans.reduce((s, p) => s + (p.savesCount || 0), 0)
    const friendCount = (friends.data || []).length
    const next = nextBadge(totalLikes)
    const earnedBadges = LIKE_BADGES.filter((b) => totalLikes >= b.min).length
    return {
      profile: {
        displayName: prof.display_name || prof.username,
        username: prof.username,
        avatarUrl: prof.avatar_url || '',
        bio: prof.bio || '',
        visibility: 'public',
        memberSince: prof.created_at
          ? new Date(prof.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
          : null,
        tags: [],
        isDemo: false,
      },
      stats: {
        glow: totalLikes, likes: totalLikes, sharedPlans: plans.length,
        savedPlans: savedPlans.length, friends: friendCount, badges: earnedBadges,
      },
      glow: {
        score: totalLikes,
        toNext: next ? next.remaining : 0,
        nextLabel: next ? next.label : 'next milestone',
        helper: 'Glow grows when your plans inspire others.',
      },
      plans, saved: savedPlans, activity: deriveActivity(plans, totalLikes),
      totalLikes, totalSaves,
      isSelf: true, isAdmin, override: prof.badge_override || 0, isDemo: false,
    }
  }, [user])

  useEffect(() => {
    if (!open) return
    let alive = true
    setLoading(true)
    ;(async () => {
      let next = null
      if (user && COMMUNITY_ENABLED) {
        try { next = await loadReal() } catch { next = null }
      }
      if (alive) { setData(next || buildDemo()); setLoading(false) }
    })()
    return () => { alive = false }
  }, [open, user, loadReal, buildDemo])

  // Escape to close + body scroll lock + initial focus.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => closeRef.current?.focus(), 30)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      clearTimeout(t)
    }
  }, [open, close])

  async function handleSetOverride(floor) {
    if (data?.isDemo) return
    await setBadgeOverride(user.id, floor)
    const fresh = await loadReal()
    if (fresh) setData(fresh)
  }
  async function handleSaveProfile(patch) {
    if (data?.isDemo) return
    await updateMyProfile(user.id, patch)
    const fresh = await loadReal()
    if (fresh) setData(fresh)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <button
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        aria-label="Close profile"
        onClick={close}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className="relative w-full sm:max-w-5xl h-[92vh] sm:h-auto sm:max-h-[88vh] bg-cream sm:rounded-2xl rounded-t-3xl shadow-soft-lg overflow-hidden flex flex-col animate-sheet-up"
      >
        {/* ── Sticky header ── */}
        <div className="shrink-0 relative">
          <div className="h-20 sm:h-24 bg-gradient-to-br from-blush/40 via-clay/15 to-gold/20" aria-hidden="true" />
          <button
            ref={closeRef}
            onClick={close}
            aria-label="Close profile overview"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-cream/90 hover:bg-cream text-ink flex items-center justify-center shadow-soft focus-visible:ring-2 focus-visible:ring-clay"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>

          <div className="px-4 sm:px-6 -mt-9 sm:-mt-10 pb-3">
            <div className="flex items-end gap-3 sm:gap-4">
              <span className="rounded-full ring-4 ring-cream shrink-0">
                <Avatar url={data?.profile.avatarUrl} name={data?.profile.displayName} size={72} />
              </span>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 id="profile-modal-title" className="font-display text-2xl sm:text-3xl text-ink leading-none truncate">
                    {data?.profile.displayName || 'My Quill Profile'}
                  </h2>
                  {data?.profile.visibility && (
                    <span className="chip chip-cream text-[10px] py-0.5 inline-flex items-center gap-1">
                      <VisibilityIcon visibility={data.profile.visibility} showLabel />
                    </span>
                  )}
                </div>
                <p className="text-ink-softer text-sm">@{data?.profile.username}</p>
              </div>
              <button
                onClick={() => setTab('Settings')}
                className="btn-ghost text-xs shrink-0 hidden sm:inline-flex self-center"
              >
                Edit profile
              </button>
            </div>

            {data?.profile.bio && <p className="text-ink-soft text-sm mt-2.5 leading-relaxed max-w-2xl">{data.profile.bio}</p>}
            {data?.profile.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {data.profile.tags.map((t) => <span key={t} className="chip chip-cream text-[11px] py-0.5">{t}</span>)}
              </div>
            )}
          </div>

          {/* ── Tab bar ── */}
          <div className="border-t border-ink/10 px-2 sm:px-4 flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                aria-current={tab === t}
                className={`shrink-0 px-3 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  tab === t ? 'border-clay text-ink' : 'border-transparent text-ink-soft hover:text-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          {loading || !data
            ? <div className="py-16 text-center text-ink-soft">Loading your glow…</div>
            : <Sections tab={tab} data={data} setTab={setTab}
                email={user?.email} onSignOut={signOut}
                onSetOverride={handleSetOverride} onSaveProfile={handleSaveProfile} />}
        </div>
      </div>
    </div>
  )
}

function Sections({ tab, data, setTab, email, onSignOut, onSetOverride, onSaveProfile }) {
  const { profile, stats, glow, plans, saved, activity, totalLikes, isSelf, isAdmin, override, isDemo } = data

  if (tab === 'Overview') return (
    <div className="space-y-5">
      <GlowScoreCard {...glow} />
      <StatsGrid stats={stats} />
      <Section title="Badge collection" action={{ label: 'View all badges', onClick: () => setTab('Badges') }}>
        <BadgesPreview totalLikes={totalLikes} />
      </Section>
      <Section title="Recent shared plans" action={plans.length ? { label: 'See all', onClick: () => setTab('Plans') } : null}>
        {plans.length
          ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{plans.slice(0, 2).map((p) => <PlanCard key={p.id} plan={p} onOpen={() => {}} />)}</div>
          : <Empty>You haven’t shared a plan yet. Create your first Beauty Plan and let the community discover your glow.</Empty>}
      </Section>
      <Section title="Recent activity">
        <ActivityTimeline items={activity.slice(0, 4)} />
      </Section>
    </div>
  )

  if (tab === 'Plans') return (
    <Section title="Your shared plans">
      {plans.length
        ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{plans.map((p) => <PlanCard key={p.id} plan={p} onOpen={() => {}} />)}</div>
        : <Empty>You haven’t shared a plan yet. Create your first Beauty Plan and let the community discover your glow.</Empty>}
    </Section>
  )

  if (tab === 'Saved') return (
    <Section title="Saved plans">
      {saved.length
        ? <div className="space-y-2.5">{saved.map((p) => <SavedPlanCard key={p.id} plan={p} onOpen={() => {}} />)}</div>
        : <Empty>Saved plans will appear here when you bookmark routines from the community.</Empty>}
    </Section>
  )

  if (tab === 'Activity') return (
    <Section title="Your activity"><ActivityTimeline items={activity} /></Section>
  )

  if (tab === 'Badges') return (
    <BadgesSection totalLikes={totalLikes} isSelf={isSelf} isAdmin={isAdmin} override={override} onSetOverride={onSetOverride} />
  )

  if (tab === 'Settings') return (
    <SettingsPanel profile={profile} email={email} isDemo={isDemo} onSaveProfile={onSaveProfile} onLogout={onSignOut} />
  )

  return null
}

function Section({ title, action, children }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <span className="editorial-label text-clay">{title}</span>
        {action && <button onClick={action.onClick} className="btn-ghost text-xs">{action.label} →</button>}
      </div>
      {children}
    </section>
  )
}

function BadgesPreview({ totalLikes }) {
  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
      {LIKE_BADGES.map((b) => {
        const earned = (totalLikes || 0) >= b.min
        return (
          <div key={b.key} className="shrink-0 flex flex-col items-center gap-1 w-16 text-center">
            <img
              src={`${import.meta.env.BASE_URL}badges/${b.img}`}
              alt={`${b.label} badge`}
              className={`h-12 w-auto rounded-md ${earned ? 'shadow-soft' : 'grayscale opacity-35'}`}
              loading="lazy"
            />
            <span className={`text-[9px] font-bold uppercase tracking-[0.08em] leading-tight ${earned ? '' : 'text-ink-softer'}`}
              style={earned ? { color: b.accent } : undefined}>{b.label}</span>
          </div>
        )
      })}
    </div>
  )
}
