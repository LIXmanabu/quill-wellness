import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { CATEGORIES } from '../data/communityCategories.js'
import Reveal from '../components/interactive/Reveal.jsx'
import CommunityPostCard from '../components/community/CommunityPostCard.jsx'
import CommunityFeaturedPost from '../components/community/CommunityFeaturedPost.jsx'
import CommunityPostDetail from '../components/community/CommunityPostDetail.jsx'
import CreateCommunityPostForm from '../components/community/CreateCommunityPostForm.jsx'
import AskQuestionForm from '../components/community/AskQuestionForm.jsx'
import QuestionCard from '../components/community/QuestionCard.jsx'
import BadgeLegend from '../components/community/BadgeLegend.jsx'
import UserSearch from '../components/community/UserSearch.jsx'
import UserProfile from '../components/community/UserProfile.jsx'
import FriendRequests from '../components/community/FriendRequests.jsx'
import AdminModerationQueue from '../components/community/AdminModerationQueue.jsx'
import ReportContentModal from '../components/community/ReportContentModal.jsx'
import MilestoneToast from '../components/community/MilestoneToast.jsx'
import { Avatar } from '../components/community/ui.jsx'
import {
  COMMUNITY_ENABLED, isBackendMissing, listFeed, getPost, createPost, deletePost,
  getMyInteractions, toggleLike, toggleSave, getUserPosts,
  getMyProfile, isUsernameAvailable, updateMyProfile, checkIsAdmin,
  reportPost, reportUser, qaForumReady,
  takeCommunityView, COMMUNITY_VIEW_EVENT,
} from '../lib/community.js'
import useFriendRequestCount from '../hooks/useFriendRequestCount.js'
import { detectLikeMilestones } from '../lib/communityMilestones.js'
import { takeCommunityDraft } from '../lib/plans.js'

const FEED_TABS = [
  { key: 'foryou',  label: 'For You',  needsAuth: false },
  { key: 'friends', label: 'Friends',  needsAuth: true  },
  { key: 'mine',    label: 'My Posts', needsAuth: true  },
  { key: 'saved',   label: 'Saved',    needsAuth: true  },
]

export default function Community() {
  const { user } = useAuth()
  const myId = user?.id || null

  // ── Routing within the tab ──
  const [view, setView] = useState('feed')       // feed | detail | create | search | friends | profile | admin
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedUsername, setSelectedUsername] = useState(null)
  const [detailFrom, setDetailFrom] = useState('feed') // where "Back" returns from a post

  const [report, setReport] = useState(null)     // { kind, label, submit }
  const [draft, setDraft] = useState(null)        // prefilled post draft (e.g. shared plan)
  const [milestone, setMilestone] = useState(null) // celebratory like-milestone toast

  // ── My community identity ──
  const [myProfile, setMyProfile] = useState(undefined) // undefined=loading, null=none
  const [isAdmin, setIsAdmin] = useState(false)
  const [myPostCount, setMyPostCount] = useState(null)  // null=unknown, drives the first-post nudge
  const pendingRequests = useFriendRequestCount() // incoming friend requests, for the bell + chip badges

  // ── Feed state ──
  const [tab, setTab] = useState('foryou')
  const [mode, setMode] = useState('routines')   // 'routines' | 'qa' (the Q&A forum)
  const [qaReady, setQaReady] = useState(true)    // false → run supabase/qa_forum.sql
  const [category, setCategory] = useState(null)
  const [sortByLikes, setSortByLikes] = useState(false)  // false = For-You/recent order, true = Most loved
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState([])
  const [interactions, setInteractions] = useState({ liked: new Set(), saved: new Set() })
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [backendReady, setBackendReady] = useState(true)
  const searchTimer = useRef(null)
  const [searchInput, setSearchInput] = useState('')

  // A plan shared from "My Quill" arrives as a stashed draft → open the create
  // form pre-filled. Runs once on mount.
  useEffect(() => {
    if (!COMMUNITY_ENABLED) return
    const d = takeCommunityDraft()
    if (d) { setDraft(d); setView('create') }
  }, [])

  // Deep-link from the header bell / account button (or elsewhere) into a
  // sub-view. The stash covers the case where Community was just lazy-loaded by
  // the click; the live event covers the case where Community is already on
  // screen. 'myprofile' is special — it opens your own profile once it's known.
  const [wantSelf, setWantSelf] = useState(false)
  useEffect(() => {
    const apply = (v) => {
      if (v === 'myprofile') { setWantSelf(true); return }
      setView(v); window.scrollTo(0, 0)
    }
    const initial = takeCommunityView()
    if (initial) apply(initial)
    function onView(e) { if (e.detail) apply(e.detail) }
    window.addEventListener(COMMUNITY_VIEW_EVENT, onView)
    return () => window.removeEventListener(COMMUNITY_VIEW_EVENT, onView)
  }, [])

  // Resolve "open my profile" once my profile (and its username) has loaded.
  useEffect(() => {
    if (!wantSelf || myProfile === undefined) return
    if (myProfile?.username) openProfile(myProfile.username)
    else setView('friends')   // no username yet → the setup flow lives here
    setWantSelf(false)
  }, [wantSelf, myProfile])

  // Load my community profile + admin flag once signed in.
  useEffect(() => {
    if (!COMMUNITY_ENABLED || !myId) { setMyProfile(null); setIsAdmin(false); return }
    let active = true
    getMyProfile(myId).then(({ data }) => { if (active) setMyProfile(data || null) })
    checkIsAdmin().then((v) => { if (active) setIsAdmin(v) })
    return () => { active = false }
  }, [myId])

  // On entering Community, check whether any of my routines crossed a like
  // milestone since last visit → celebrate the biggest one. (First visit just
  // records a baseline, so we don't fire for likes earned before this existed.)
  useEffect(() => {
    if (!COMMUNITY_ENABLED || !myId) return
    let active = true
    getUserPosts(myId).then(({ data }) => {
      if (!active || !data) return
      setMyPostCount(data.length)
      const fresh = detectLikeMilestones(myId, data)
      if (fresh.length) setMilestone(fresh[fresh.length - 1]) // biggest milestone
    })
    return () => { active = false }
  }, [myId])

  // Debounce the search box into the feed query.
  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(searchTimer.current)
  }, [searchInput])

  const loadFeed = useCallback(async () => {
    if (!COMMUNITY_ENABLED) { setLoadingFeed(false); return }
    setLoadingFeed(true)
    const kind = mode === 'qa' ? 'question' : 'routine'
    const { data, error } = await listFeed({ tab, category, search, userId: myId, sortByLikes, kind })
    setBackendReady(!isBackendMissing(error))
    const list = data || []
    setPosts(list)
    if (myId && list.length) {
      const { data: inter } = await getMyInteractions(myId, list.map((p) => p.id))
      if (inter) setInteractions(inter)
    }
    setLoadingFeed(false)
  }, [tab, category, search, myId, sortByLikes, mode])

  useEffect(() => { if (view === 'feed') loadFeed() }, [view, loadFeed])

  // Is the Q&A column present? (hides the forum until supabase/qa_forum.sql runs)
  useEffect(() => { qaForumReady().then(setQaReady) }, [])

  // ── Account age estimate for the trust check (DB is authoritative) ──
  const accountAgeDays = myProfile?.created_at
    ? Math.floor((Date.now() - new Date(myProfile.created_at).getTime()) / 86400000)
    : 0
  const authorMeta = {
    username: myProfile?.username || '',
    displayName: myProfile?.display_name || user?.name || '',
    avatarUrl: myProfile?.avatar_url || '',
    accountAgeDays,
  }

  // ── Interactions (optimistic) ──
  async function handleLike(post) {
    if (!myId) return // guests can't like — gentle no-op (the guest banner explains why)
    const on = !interactions.liked.has(post.id)
    setInteractions((s) => { const liked = new Set(s.liked); on ? liked.add(post.id) : liked.delete(post.id); return { ...s, liked } })
    setPosts((ps) => ps.map((p) => p.id === post.id ? { ...p, likesCount: p.likesCount + (on ? 1 : -1) } : p))
    if (selectedPost?.id === post.id) setSelectedPost((p) => ({ ...p, likesCount: p.likesCount + (on ? 1 : -1) }))
    await toggleLike(myId, post.id, on)
  }
  async function handleSave(post) {
    if (!myId) return
    const on = !interactions.saved.has(post.id)
    setInteractions((s) => { const saved = new Set(s.saved); on ? saved.add(post.id) : saved.delete(post.id); return { ...s, saved } })
    setPosts((ps) => ps.map((p) => p.id === post.id ? { ...p, savesCount: p.savesCount + (on ? 1 : -1) } : p))
    if (selectedPost?.id === post.id) setSelectedPost((p) => ({ ...p, savesCount: p.savesCount + (on ? 1 : -1) }))
    await toggleSave(myId, post.id, on)
  }

  // Keep the post's comment count in sync (detail + feed card) as the open
  // thread changes. CommentsSection owns the writes; this just mirrors the total.
  function handleCommentCount(postId, next) {
    setPosts((ps) => ps.map((p) => p.id === postId ? { ...p, commentsCount: next } : p))
    setSelectedPost((p) => p && p.id === postId ? { ...p, commentsCount: next } : p)
  }

  function openPost(post) {
    setDetailFrom(view === 'profile' ? 'profile' : view === 'admin' ? 'admin' : 'feed')
    setSelectedPost(post); setView('detail'); window.scrollTo(0, 0)
  }
  async function openPostById(id) { const { data } = await getPost(id); if (data) openPost(data) }
  function openProfile(username) { setSelectedUsername(username); setView('profile'); window.scrollTo(0, 0) }

  async function handleCreate(payload) {
    const res = await createPost(myId, authorMeta, payload)
    if (!res.blocked && !res.error) {
      setTab('mine'); setView('feed'); window.scrollTo(0, 0)
    }
    return res
  }
  async function handleDelete(post) {
    if (!confirm('Delete this post? This can’t be undone.')) return
    await deletePost(post.id)
    setView('feed'); loadFeed()
  }

  function openReportPost(post) {
    setReport({
      kind: 'post', label: post.title,
      submit: ({ reason, details }) => reportPost(myId, post, reason, details),
    })
  }
  function openReportUser(profile) {
    setReport({
      kind: 'profile', label: profile.display_name || `@${profile.username}`,
      submit: ({ reason, details }) => reportUser(myId, profile.id, reason, details),
    })
  }

  // ─────────────────────────────────────────────────────────────────────
  // Gates: backend off, or signed-in-but-no-username
  // ─────────────────────────────────────────────────────────────────────
  if (!COMMUNITY_ENABLED) return <ConnectGate />

  // A signed-in user without a username must set one before posting/friending.
  // Every account gets an auto-created profile row at signup, so "no row" never
  // happens — the real signal is an empty username. (myProfile === undefined
  // means still loading; don't prompt yet.)
  const needsSetup = myId && myProfile !== undefined && !myProfile?.username
  if (needsSetup && (view === 'create' || view === 'friends')) {
    return <ProfileSetup myId={myId} seedName={user?.name} onDone={(p) => { setMyProfile(p); setView(view) }} onBack={() => setView('feed')} />
  }

  // ── Sub-views ──
  if (view === 'detail' && selectedPost) {
    return (
      <>
        <CommunityPostDetail
          post={selectedPost}
          liked={interactions.liked.has(selectedPost.id)} saved={interactions.saved.has(selectedPost.id)}
          isOwner={selectedPost.userId === myId}
          myId={myId} authorMeta={authorMeta} canModerate={isAdmin}
          onCommentCountChange={(next) => handleCommentCount(selectedPost.id, next)}
          onBack={() => setView(detailFrom)}
          onLike={() => handleLike(selectedPost)} onSave={() => handleSave(selectedPost)}
          onReport={() => myId ? openReportPost(selectedPost) : null}
          onDelete={() => handleDelete(selectedPost)}
          onOpenAuthor={() => selectedPost.author.username && openProfile(selectedPost.author.username)}
        />
        {report && <ReportContentModal target={report} onClose={() => setReport(null)} onSubmit={report.submit} />}
      </>
    )
  }
  if (view === 'create') {
    if (mode === 'qa') {
      return <AskQuestionForm onCreate={handleCreate} onBack={() => setView('feed')} />
    }
    return <CreateCommunityPostForm userId={myId}
      initial={draft} onBack={() => { setDraft(null); setView('feed') }} onCreate={handleCreate} />
  }
  if (view === 'profile' && selectedUsername) {
    return (
      <>
        <UserProfile username={selectedUsername} myId={myId}
          onBack={() => setView('feed')} onOpenPost={openPost} onReportUser={openReportUser} />
        {report && <ReportContentModal target={report} onClose={() => setReport(null)} onSubmit={report.submit} />}
      </>
    )
  }
  if (view === 'admin') {
    return <div>
      <SubHeader title="Moderation" onBack={() => setView('feed')} />
      <AdminModerationQueue onOpenPost={openPostById} />
    </div>
  }

  // The default For-You view (no filter) gets the editorial treatment: a pulse
  // strip + a featured lead, with the grid starting from the second post. Other
  // tabs and any filtered view stay a clean chronological grid.
  const isDefaultForYou = tab === 'foryou' && !category && !search.trim()
  const showFeatured = isDefaultForYou && !loadingFeed && posts.length > 0
  const featured = showFeatured ? posts[0] : null
  const feedPosts = showFeatured ? posts.slice(1) : posts

  // ── Main feed shell (also hosts search + friends in panels) ──
  return (
    <div className="bg-cream min-h-[60vh]">
      {/* Header */}
      <section className="bg-cream-light border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="editorial-label text-clay">Quill Community</p>
              <h1 className="font-display text-[clamp(2.2rem,8vw,3.6rem)] text-ink leading-[0.95] tracking-tight mt-2">
                {mode === 'qa'
                  ? <>Ask &amp; <span className="display-italic text-clay">answer.</span></>
                  : <>Routines, <span className="display-italic text-clay">shared.</span></>}
              </h1>
              <p className="text-ink-soft mt-3 max-w-lg leading-relaxed">
                {mode === 'qa'
                  ? 'Ask the community anything about skincare, wellness, movement or diet — and upvote the answers that help.'
                  : 'Real skincare, beauty, movement and wellness plans from people like you. Save what works, share your own.'}
              </p>
            </div>
            <button onClick={() => myId ? setView('create') : null} disabled={!myId}
              className="btn-clay shrink-0 hidden sm:inline-flex disabled:opacity-50" data-cursor-label="share">
              <span className="display-italic text-base">＋</span> {mode === 'qa' ? 'Ask a question' : 'Share routine'}
            </button>
          </div>

          {/* Routines / Q&A switch + friend-request bell */}
          <div className="flex items-center gap-3 mt-5">
            {qaReady && (
              <div className="inline-flex border border-ink/15 bg-cream p-0.5">
                {[['routines', 'Routines'], ['qa', 'Q&A']].map(([m, label]) => (
                  <button key={m} onClick={() => { setMode(m); setTab('foryou'); setCategory(null); setView('feed') }}
                    className={`px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.1em] transition-colors ${
                      mode === m ? 'bg-ink text-cream' : 'text-ink-soft hover:text-ink'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
            {myId && (
              <button onClick={() => { setView('friends'); window.scrollTo(0, 0) }}
                aria-label={pendingRequests > 0 ? `Friend requests — ${pendingRequests} new` : 'Friend requests'}
                title={pendingRequests > 0 ? `${pendingRequests} new friend ${pendingRequests === 1 ? 'request' : 'requests'}` : 'Friend requests'}
                className="relative flex items-center justify-center w-9 h-9 border border-ink/15 bg-cream text-ink-soft hover:text-ink hover:border-ink/40 transition-colors">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M18 8a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.3 20a2 2 0 0 0 3.4 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {pendingRequests > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] num-display bg-clay text-cream rounded-full animate-pop-in">
                    {pendingRequests > 9 ? '9+' : pendingRequests}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* People tools */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <button onClick={() => setView('search')} className="chip chip-cream hover:border-ink/40 transition-colors">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" strokeLinecap="round" /></svg>
              Find people
            </button>
            {myId && myProfile?.username && (
              <button onClick={() => openProfile(myProfile.username)} className="chip chip-cream hover:border-ink/40 transition-colors">
                My profile
              </button>
            )}
            {myId && (
              <button onClick={() => setView('friends')} className="chip chip-cream hover:border-ink/40 transition-colors inline-flex items-center gap-1.5">
                Friends &amp; requests
                {pendingRequests > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] num-display bg-clay text-cream rounded-full">
                    {pendingRequests > 9 ? '9+' : pendingRequests}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setView('badges')} className="chip chip-cream hover:border-ink/40 transition-colors">
              <span aria-hidden="true">✦</span> Badges
            </button>
            {isAdmin && (
              <button onClick={() => setView('admin')} className="chip card-clay hover:opacity-80 transition-opacity">
                Moderation queue
              </button>
            )}
          </div>

          {/* Nudge signed-in users to claim a username, so they're findable. */}
          {myId && myProfile !== undefined && !myProfile?.username && (
            <div className="mt-5 bg-cream border border-clay/30 p-4 flex flex-wrap items-center gap-3">
              <p className="text-sm text-ink flex-1 min-w-[14rem] leading-snug">
                <span className="font-semibold">Pick a username</span> so people can find and friend you — and so your shared routines show your name.
              </p>
              <button onClick={() => setView('friends')} className="btn-clay shrink-0">Set username →</button>
            </div>
          )}
        </div>
      </section>

      {/* Search + filters */}
      <div className="sticky top-14 md:top-28 z-30 bg-cream/95 backdrop-blur-sm border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
          <label className="relative block">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-softer">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" strokeLinecap="round" /></svg>
            </span>
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder={mode === 'qa' ? 'Search questions…' : 'Search routines…'} className="input-line pl-11 py-2" />
          </label>

          {/* Sub-tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {FEED_TABS.map((t) => {
              const disabled = t.needsAuth && !myId
              return (
                <button key={t.key} onClick={() => !disabled && setTab(t.key)} disabled={disabled}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    tab === t.key ? 'border-clay text-ink' : 'border-transparent text-ink-soft hover:text-ink'
                  } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title={disabled ? 'Sign in to use this' : undefined}>
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* Category chips (routines only) + sort */}
          <div className="flex items-center gap-2">
            {mode === 'qa' ? (
              <div className="flex-1" />
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
                <button onClick={() => setCategory(null)}
                  className={`chip whitespace-nowrap ${!category ? 'chip-ink' : 'chip-cream hover:border-ink/40'}`}>All</button>
                {CATEGORIES.map((c) => (
                  <button key={c.value} onClick={() => setCategory(category === c.value ? null : c.value)}
                    className={`chip whitespace-nowrap transition-colors ${category === c.value ? 'chip-ink' : 'chip-cream hover:border-ink/40'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setSortByLikes((v) => !v)} aria-pressed={sortByLikes}
              title={sortByLikes ? 'Showing top first' : 'Sort by top'}
              className={`chip whitespace-nowrap shrink-0 flex items-center gap-1 transition-colors ${sortByLikes ? 'card-clay' : 'chip-cream hover:border-ink/40'}`}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill={sortByLikes ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />
              </svg>
              {mode === 'qa' ? 'Top' : 'Most loved'}
            </button>
          </div>
        </div>
      </div>

      {/* Body: search / friends panels, or the feed */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!backendReady && (
          <div className="card-gold p-5 sm:p-6 mb-6">
            <p className="font-display text-xl text-ink leading-snug">One setup step to go live</p>
            <p className="text-sm text-ink-soft mt-2 leading-relaxed">
              The community database tables haven’t been created yet, so posting, friends, and saved
              routines are switched off. Run <code className="font-mono text-[0.85em] bg-ink/5 px-1 py-0.5 rounded">supabase/community.sql</code> once in your
              Supabase dashboard (SQL Editor → paste → Run — about 2 minutes), then refresh this page.
              Full steps are in <code className="font-mono text-[0.85em] bg-ink/5 px-1 py-0.5 rounded">supabase/COMMUNITY_SETUP.md</code>.
            </p>
          </div>
        )}
        {!myId && backendReady && (
          <div className="card-bone p-5 mb-6">
            <p className="text-sm text-ink-soft leading-relaxed">
              You’re browsing as a guest. <span className="text-ink font-medium">Sign in</span> to share routines,
              add friends, and save posts.
            </p>
          </div>
        )}
        {view === 'search' ? (
          <Panel title="Find people" onBack={() => setView('feed')}>
            <UserSearch myId={myId} onOpenProfile={openProfile} />
          </Panel>
        ) : view === 'friends' ? (
          <Panel title="Friends" onBack={() => setView('feed')}>
            <FriendRequests myId={myId} onOpenProfile={openProfile} />
          </Panel>
        ) : view === 'badges' ? (
          <Panel title="Community badges" onBack={() => setView('feed')}>
            <BadgeLegend />
          </Panel>
        ) : mode === 'qa' ? (
          /* ── Q&A forum feed ── */
          <div className="space-y-3">
            {loadingFeed ? (
              <p className="text-ink-softer text-sm py-8 text-center">Loading questions…</p>
            ) : posts.length === 0 ? (
              <div className="card-bone p-8 text-center">
                <p className="font-display text-2xl text-ink">No questions yet.</p>
                <p className="text-ink-soft mt-2">{myId ? 'Be the first to ask the community something.' : 'Sign in to ask the first question.'}</p>
                {myId && <button onClick={() => setView('create')} className="btn-clay mt-5">Ask a question</button>}
              </div>
            ) : (
              posts.map((p) => (
                <QuestionCard key={p.id} post={p} myId={myId}
                  liked={interactions.liked.has(p.id)}
                  onOpen={() => openPost(p)}
                  onUpvote={() => handleLike(p)}
                  onOpenAuthor={() => p.author.username && openProfile(p.author.username)} />
              ))
            )}
          </div>
        ) : (
          <>
            {tab === 'mine' && !loadingFeed && posts.length > 0 && (
              <MyPostsDashboard posts={posts} onOpen={openPost} />
            )}
            {isDefaultForYou && !loadingFeed && posts.length > 0 && (
              <CommunityPulse posts={posts} myId={myId} myPostCount={myPostCount}
                onShare={() => myId && setView('create')} />
            )}
            {featured && (
              <CommunityFeaturedPost post={featured}
                liked={interactions.liked.has(featured.id)} saved={interactions.saved.has(featured.id)}
                onOpen={() => openPost(featured)} onLike={() => handleLike(featured)} onSave={() => handleSave(featured)} />
            )}
            {(!showFeatured || feedPosts.length > 0) && (
              <Feed
                posts={feedPosts} loading={loadingFeed} interactions={interactions} myId={myId} tab={tab}
                onOpen={openPost} onLike={handleLike} onSave={handleSave}
                onReport={(p) => myId && openReportPost(p)}
                onOpenAuthor={(p) => p.author.username && openProfile(p.author.username)}
                onShare={() => myId && setView('create')}
              />
            )}
          </>
        )}
      </div>

      {/* Mobile floating "share" button */}
      {myId && view === 'feed' && (
        <button onClick={() => setView('create')} aria-label="Share a routine"
          className="sm:hidden fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-40 w-14 h-14 rounded-full bg-clay text-cream shadow-soft-lg flex items-center justify-center text-2xl">
          ＋
        </button>
      )}

      {report && <ReportContentModal target={report} onClose={() => setReport(null)} onSubmit={report.submit} />}
      {milestone && (
        <MilestoneToast milestone={milestone}
          onOpen={(m) => { setMilestone(null); openPostById(m.postId) }}
          onClose={() => setMilestone(null)} />
      )}
    </div>
  )
}

// ─── My Posts dashboard ──────────────────────────────────────────────────
// A private at-a-glance of the love your shared routines have earned.
function MyPostsDashboard({ posts, onOpen }) {
  const totalLikes = posts.reduce((s, p) => s + (p.likesCount || 0), 0)
  const totalSaves = posts.reduce((s, p) => s + (p.savesCount || 0), 0)
  const topPost = posts.reduce((best, p) => ((p.likesCount || 0) > (best?.likesCount || 0) ? p : best), null)

  const Heart = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-clay self-center" aria-hidden="true">
      <path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />
    </svg>
  )
  const Stat = ({ n, label, icon }) => (
    <span className="flex items-baseline gap-1.5">
      {icon}
      <span className="num-display text-3xl text-ink leading-none">{n}</span>
      <span className="text-xs text-ink-softer uppercase tracking-[0.12em]">{label}</span>
    </span>
  )

  return (
    <div className="card-bone p-5 sm:p-6 mb-6">
      <p className="editorial-label text-clay">Your routines, loved by the community</p>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-3">
        <Stat n={totalLikes} label={totalLikes === 1 ? 'like earned' : 'likes earned'} icon={<Heart />} />
        <Stat n={totalSaves} label="saved" />
        <Stat n={posts.length} label={posts.length === 1 ? 'routine' : 'routines'} />
      </div>
      {topPost && topPost.likesCount > 0 && (
        <button onClick={() => onOpen(topPost)}
          className="mt-4 pt-4 border-t border-ink/10 w-full text-left flex items-center gap-2 group">
          <span className="editorial-label text-ink-softer shrink-0">Most-loved</span>
          <span className="font-display text-base text-ink truncate group-hover:text-clay transition-colors">{topPost.title}</span>
          <span className="ml-auto shrink-0 inline-flex items-center gap-1 text-clay text-sm">
            <Heart /><span className="num-display">{topPost.likesCount}</span>
          </span>
        </button>
      )}
    </div>
  )
}

// ─── Community pulse ─────────────────────────────────────────────────────
// A slim strip that makes the feed feel alive (recent faces + fresh count) and
// keeps "share yours" in front of people. Doubles as social proof. Everything
// is derived from the already-loaded feed, so it costs no extra query.
function CommunityPulse({ posts, myId, myPostCount, onShare }) {
  const weekAgo = Date.now() - 7 * 86400000
  const newThisWeek = posts.filter((p) => new Date(p.createdAt).getTime() >= weekAgo).length

  // Up to 5 distinct recent faces.
  const seen = new Set()
  const faces = []
  for (const p of posts) {
    const key = p.author.username || p.userId
    if (key && !seen.has(key)) { seen.add(key); faces.push(p.author) }
    if (faces.length >= 5) break
  }
  const isNewPoster = myId && myPostCount === 0

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-7 pb-6 border-b border-ink/10">
      {faces.length > 0 && (
        <div className="flex -space-x-2.5">
          {faces.map((a, i) => (
            <span key={i} className="ring-2 ring-cream rounded-full inline-flex">
              <Avatar url={a.avatarUrl} name={a.displayName || a.username} size={32} />
            </span>
          ))}
        </div>
      )}
      <p className="text-sm text-ink-soft leading-snug">
        {newThisWeek > 0 ? (
          <><span className="num-display text-ink">{newThisWeek}</span> new {newThisWeek === 1 ? 'routine' : 'routines'} this week</>
        ) : 'Fresh routines from the community'}
      </p>
      {myId && (
        <button onClick={onShare} className="ml-auto btn-clay text-sm py-1.5 px-4">
          {isNewPoster ? 'Share your first routine' : 'Share a routine'} <span className="display-italic">→</span>
        </button>
      )}
    </div>
  )
}

// An editorial invitation seeded into the feed grid so the urge to contribute
// meets people while they're already browsing (not just at the top).
function ShareTile({ onShare }) {
  return (
    <button onClick={onShare} data-cursor-label="share"
      className="card-clay card-paper-hover aspect-[4/5] flex flex-col items-center justify-center text-center p-5 group">
      <span className="editorial-num text-5xl text-clay/50">✶</span>
      <span className="font-display text-xl text-ink leading-snug mt-2">Your routine could be here</span>
      <span className="editorial-label text-clay mt-3 group-hover:opacity-70 transition-opacity">Share yours →</span>
    </button>
  )
}

// ─── Feed grid ─────────────────────────────────────────────────────────────
function Feed({ posts, loading, interactions, myId, tab, onOpen, onLike, onSave, onReport, onOpenAuthor, onShare }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card-paper overflow-hidden">
            <div className="aspect-[4/5] bg-ink/5 animate-pulse-soft" />
            <div className="p-3.5 space-y-2"><div className="h-4 bg-ink/5 rounded" /><div className="h-3 bg-ink/5 rounded w-2/3" /></div>
          </div>
        ))}
      </div>
    )
  }
  if (posts.length === 0) {
    const msg = {
      foryou: { t: 'No routines yet.', s: 'Be the first to share one with the community.' },
      friends: { t: 'No posts from friends yet.', s: 'Add friends to see the routines they share with friends.' },
      mine: { t: 'You haven’t shared anything yet.', s: 'Your routines and plans will appear here.' },
      saved: { t: 'Nothing saved yet.', s: 'Tap the bookmark on any routine to keep it here.' },
    }[tab] || { t: 'Nothing here.', s: '' }
    return (
      <div className="card-bone p-10 sm:p-16 text-center">
        <span className="editorial-num text-6xl text-clay/30">❀</span>
        <p className="font-display text-2xl sm:text-3xl text-ink mt-3">{msg.t}</p>
        <p className="text-ink-soft mt-2 max-w-sm mx-auto leading-relaxed">{msg.s}</p>
        {myId && (tab === 'mine' || tab === 'foryou') && (
          <button onClick={onShare} className="btn-clay mt-6">Share a routine <span className="display-italic">→</span></button>
        )}
      </div>
    )
  }
  const cards = posts.map((p, i) => (
    <Reveal key={p.id} delay={Math.min(i, 6) * 40}>
      <CommunityPostCard post={p}
        liked={interactions.liked.has(p.id)} saved={interactions.saved.has(p.id)}
        onOpen={() => onOpen(p)} onLike={() => onLike(p)} onSave={() => onSave(p)}
        onReport={() => onReport(p)} onOpenAuthor={() => onOpenAuthor(p)} />
    </Reveal>
  ))
  // Seed one share invitation mid-grid for signed-in browsers on the main feed.
  if (myId && tab === 'foryou' && cards.length >= 3) {
    cards.splice(3, 0, <ShareTile key="share-tile" onShare={onShare} />)
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards}
    </div>
  )
}

// ─── A back-able panel inside the feed shell ────────────────────────────────
function Panel({ title, onBack, children }) {
  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="btn-ghost mb-5"><span className="display-italic text-base">←</span> Back to feed</button>
      <h2 className="font-display text-3xl text-ink leading-tight mb-5">{title}</h2>
      {children}
    </div>
  )
}
function SubHeader({ title, onBack }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <button onClick={onBack} className="btn-ghost"><span className="display-italic text-base">←</span> Back to community</button>
    </div>
  )
}

// ─── Gate: backend not connected ────────────────────────────────────────────
function ConnectGate() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <span className="editorial-num text-6xl text-clay/30">❀</span>
      <h1 className="font-display text-3xl sm:text-4xl text-ink mt-3 leading-tight">Community is almost here</h1>
      <p className="text-ink-soft mt-3 leading-relaxed">
        The community lives in the cloud so you can share with friends across devices. It turns on
        automatically once the app is connected to its database. For now, everything else in Quill
        works offline on your device.
      </p>
    </div>
  )
}

// ─── First-run: choose a community username ─────────────────────────────────
function ProfileSetup({ myId, seedName, onDone, onBack }) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState(seedName || '')
  const [bio, setBio] = useState('')
  const [status, setStatus] = useState('idle')  // idle | checking | taken | ok
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const timer = useRef(null)

  function onUser(v) {
    const clean = v.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
    setUsername(clean)
    setStatus('idle')
    clearTimeout(timer.current)
    if (clean.length < 3) return
    setStatus('checking')
    timer.current = setTimeout(async () => {
      const { data } = await isUsernameAvailable(clean, myId)
      setStatus(data ? 'ok' : 'taken')
    }, 350)
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    if (username.length < 3) { setError('Username must be at least 3 characters.'); return }
    if (status === 'taken') { setError('That username is taken.'); return }
    setSaving(true)
    const { error: e2 } = await updateMyProfile(myId, { username, displayName: displayName || username, bio })
    setSaving(false)
    if (e2) { setError(e2.message?.includes('duplicate') ? 'That username is taken.' : (e2.message || 'Could not save.')); return }
    onDone({ id: myId, username, display_name: displayName || username, bio, avatar_url: '', created_at: new Date().toISOString() })
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <button onClick={onBack} className="btn-ghost mb-6"><span className="display-italic text-base">←</span> Back</button>
      <p className="editorial-label text-clay">One quick step</p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mt-2">Set up your community profile</h1>
      <p className="text-ink-soft mt-3 leading-relaxed">Pick a public username so friends can find you. You can change your display name and bio anytime.</p>

      <form onSubmit={save} className="mt-7 space-y-5">
        <div>
          <span className="editorial-label block mb-2">Username</span>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-softer">@</span>
            <input value={username} onChange={(e) => onUser(e.target.value)} placeholder="yourname" className="input-line pl-8" />
          </div>
          <p className="text-xs mt-1.5 h-4">
            {status === 'checking' && <span className="text-ink-softer">Checking…</span>}
            {status === 'ok' && <span className="text-sage-dark">✓ Available</span>}
            {status === 'taken' && <span className="text-clay">Already taken</span>}
          </p>
        </div>
        <div>
          <span className="editorial-label block mb-2">Display name</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} placeholder="How your name appears" className="input-line" />
        </div>
        <div>
          <span className="editorial-label block mb-2">Bio (optional)</span>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} maxLength={160} placeholder="A line about you" className="input-line resize-none" />
        </div>
        {error && <p className="text-sm text-clay">{error}</p>}
        <button type="submit" disabled={saving || status === 'taken'} className="btn-clay w-full justify-center disabled:opacity-50">
          {saving ? 'Saving…' : 'Continue'} <span className="display-italic">→</span>
        </button>
      </form>
    </div>
  )
}
