import { supabase, SUPABASE_ENABLED } from './supabase'
import { decidePostStatus, moderateText } from './moderation'

// ─── Community data access ────────────────────────────────────────────────
// Every function here talks to Supabase. The Community UI only runs these when
// SUPABASE_ENABLED is true; in local-only mode the tab shows a "connect to join"
// state instead, because a social feed needs a shared server.
//
// All access is additionally protected by Row-Level Security (supabase/
// community.sql) — these helpers are convenience wrappers, not the security
// boundary.

export const COMMUNITY_ENABLED = SUPABASE_ENABLED

// True when an error means the Community tables haven't been created yet (i.e.
// supabase/community.sql hasn't been run). Lets the UI show a clear "set up the
// database" message instead of a misleading empty feed.
export function isBackendMissing(error) {
  if (!error) return false
  return error.code === 'PGRST205' || /could not find the table|does not exist|schema cache/i.test(error.message || '')
}

function err(error) { return { data: null, error } }
function ok(data) { return { data, error: null } }

// ── Community profile (public identity) ───────────────────────────────────

/** My own profile row (full, owner-only columns included). */
export async function getMyProfile(userId) {
  if (!userId) return ok(null)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, created_at, badge_override')
    .eq('id', userId)
    .maybeSingle()
  return error ? err(error) : ok(data)
}

export async function isUsernameAvailable(username, myId) {
  const clean = (username || '').trim().toLowerCase()
  if (!clean) return ok(false)
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, username')
    .ilike('username', clean)
    .limit(1)
  if (error) return err(error)
  const taken = data?.some((r) => r.id !== myId && (r.username || '').toLowerCase() === clean)
  return ok(!taken)
}

/** Create/update my public community identity (writes the shared profiles row). */
export async function updateMyProfile(userId, patch) {
  const row = {}
  if (patch.username !== undefined) row.username = patch.username.trim()
  if (patch.displayName !== undefined) row.display_name = patch.displayName.trim()
  if (patch.bio !== undefined) row.bio = patch.bio.trim()
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl
  const { error } = await supabase.from('profiles').update(row).eq('id', userId)
  return error ? err(error) : ok(true)
}

/** Whether the signed-in user has admin rights (drives the admin UI). */
export async function checkIsAdmin() {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return false
  return Boolean(data)
}

// ── Row → app object mapping ──────────────────────────────────────────────
export function mapPost(r) {
  if (!r) return null
  return {
    id: r.id,
    userId: r.user_id,
    author: {
      username: r.author_username || '',
      displayName: r.author_display_name || '',
      avatarUrl: r.author_avatar_url || '',
    },
    title: r.title,
    category: r.category,
    description: r.description || '',
    visibility: r.visibility,
    status: r.status,
    steps: Array.isArray(r.steps) ? r.steps : [],
    products: Array.isArray(r.products) ? r.products : [],
    media: Array.isArray(r.media) ? r.media : [],
    likesCount: r.likes_count || 0,
    savesCount: r.saves_count || 0,
    commentsCount: r.comments_count || 0,
    reportsCount: r.reports_count || 0,
    kind: r.kind || 'routine',           // 'routine' | 'question' (Q&A forum)
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

const POST_COLS =
  'id, user_id, author_username, author_display_name, author_avatar_url, title, category, ' +
  'description, visibility, status, steps, products, media, likes_count, saves_count, ' +
  'reports_count, created_at, updated_at'

// `comments_count` only exists once supabase/community_comments.sql has been run.
// Selecting a column the DB doesn't have errors the WHOLE posts query, which
// would empty the feed. So we probe once and omit it until it exists (counts
// then read 0). This keeps the feed working whether or not that migration has
// been applied yet — same "degrade gracefully" rule as isBackendMissing().
let hasCommentsCol = true
let commentsColProbe = null
let hasKindCol = true            // `kind` exists once supabase/qa_forum.sql has run
let kindColProbe = null
function missingCommentsCol(error) {
  return !!error && (error.code === '42703' || /comments_count/i.test(error.message || ''))
}
function postCols() {
  let cols = POST_COLS
  if (hasCommentsCol) cols += ', comments_count'
  if (hasKindCol) cols += ', kind'
  return cols
}
async function ensureCommentsCol() {
  if (!commentsColProbe) {
    commentsColProbe = supabase
      .from('community_posts').select('comments_count').limit(1)
      .then(({ error }) => { if (missingCommentsCol(error)) hasCommentsCol = false })
      .catch(() => {})
  }
  return commentsColProbe
}
async function ensureKindCol() {
  if (!kindColProbe) {
    kindColProbe = supabase
      .from('community_posts').select('kind').limit(1)
      .then(({ error }) => { if (error && (error.code === '42703' || /\bkind\b/i.test(error.message || ''))) hasKindCol = false })
      .catch(() => {})
  }
  return kindColProbe
}
async function ensurePostCols() { await Promise.all([ensureCommentsCol(), ensureKindCol()]) }
// Whether the Q&A column is available (the UI hides the forum until it is).
export async function qaForumReady() { await ensureKindCol(); return hasKindCol }

// ── Feed ──────────────────────────────────────────────────────────────────
// tab: 'foryou' (public) | 'friends' | 'mine' | 'saved'
export async function listFeed({ tab = 'foryou', category = null, search = '', userId = null, sortByLikes = false, kind = 'routine' } = {}) {
  await ensurePostCols()
  // "Saved" needs the join from saved_posts → posts; handle separately.
  if (tab === 'saved') {
    if (!userId) return ok([])
    const { data, error } = await supabase
      .from('saved_posts')
      .select(`post:community_posts(${postCols()})`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) return err(error)
    let posts = (data || []).map((r) => mapPost(r.post)).filter(Boolean)
    posts = applyClientFilters(posts, { category, search, kind })
    if (sortByLikes) posts = byLikes(posts)
    return ok(posts)
  }

  let q = supabase.from('community_posts').select(postCols())
  // Routines vs Q&A questions live in one table; the feed shows one kind.
  if (hasKindCol && kind) q = q.eq('kind', kind)
  q = sortByLikes
    ? q.order('likes_count', { ascending: false }).order('created_at', { ascending: false })
    : q.order('created_at', { ascending: false })

  if (tab === 'mine') {
    if (!userId) return ok([])
    q = q.eq('user_id', userId).neq('status', 'deleted')
  } else if (tab === 'friends') {
    // RLS only returns friends-only posts the viewer is allowed to see; we just
    // ask for visibility='friends' published posts and let RLS filter them.
    q = q.eq('visibility', 'friends').eq('status', 'published')
  } else {
    // For You: public, published. (RLS would block anything else anyway.)
    q = q.eq('visibility', 'public').eq('status', 'published')
  }

  if (category) q = q.eq('category', category)
  if (search?.trim()) {
    const s = `%${search.trim()}%`
    q = q.or(`title.ilike.${s},description.ilike.${s}`)
  }

  const { data, error } = await q.limit(60)
  if (error) return err(error)
  let posts = (data || []).map(mapPost)
  // "For You" is ranked by interest, not just recency, so a great routine from
  // last week can still surface above an empty one posted minutes ago — unless
  // the viewer explicitly asked for the strict "Most loved" ordering. The other
  // tabs (friends/mine/saved) stay chronological.
  if (tab === 'foryou' && !sortByLikes) posts = rankForYou(posts)
  return ok(posts)
}

// Strict "Most loved" ordering: most-liked first, saves break ties.
function byLikes(posts) {
  return [...posts].sort((a, b) => (b.likesCount - a.likesCount) || (b.savesCount - a.savesCount))
}

// Blend community love with freshness (Hacker-News-style decay). Saves weigh
// more than likes because saving is a stronger signal of "I'll actually use
// this", and the +2 / gravity 1.2 keep brand-new posts from being buried.
function rankForYou(posts) {
  const now = Date.now()
  const score = (p) => {
    const engagement = (p.likesCount || 0) + (p.savesCount || 0) * 2
    const ageHours = Math.max(0, (now - new Date(p.createdAt).getTime()) / 3_600_000)
    return (engagement + 1) / Math.pow(ageHours + 2, 1.2)
  }
  return [...posts].sort((a, b) => score(b) - score(a))
}

function applyClientFilters(posts, { category, search, kind }) {
  let out = posts
  if (kind) out = out.filter((p) => (p.kind || 'routine') === kind)
  if (category) out = out.filter((p) => p.category === category)
  if (search?.trim()) {
    const s = search.trim().toLowerCase()
    out = out.filter((p) =>
      p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s))
  }
  return out
}

export async function getPost(id) {
  await ensurePostCols()
  const { data, error } = await supabase
    .from('community_posts').select(postCols()).eq('id', id).maybeSingle()
  return error ? err(error) : ok(mapPost(data))
}

// ── Create / update / delete ───────────────────────────────────────────────

/**
 * Create a post. Runs text + media moderation first; a blocked post is never
 * sent to the server. Returns { data, error, blocked, reason }.
 */
export async function createPost(userId, author, payload) {
  // Trusted = account older than 7 days (mirrors the DB media guard).
  const isTrusted = author?.accountAgeDays != null ? author.accountAgeDays >= 7 : false
  const verdict = await decidePostStatus(payload, { isTrusted })
  if (verdict.blocked) return { data: null, error: null, blocked: true, reason: verdict.reason }

  const row = {
    user_id: userId,
    author_username: author?.username || '',
    author_display_name: author?.displayName || '',
    author_avatar_url: author?.avatarUrl || '',
    title: payload.title.trim(),
    category: payload.category,
    description: (payload.description || '').trim(),
    visibility: payload.visibility || 'public',
    status: verdict.status,
    steps: payload.steps || [],
    products: payload.products || [],
    media: payload.media || [],
  }
  await ensurePostCols()
  // Q&A questions are the same table, flagged with kind (omit if the column
  // isn't there yet so older databases still accept routine posts).
  if (hasKindCol && payload.kind) row.kind = payload.kind
  const { data, error } = await supabase
    .from('community_posts').insert(row).select(postCols()).single()
  if (error) return { data: null, error, blocked: false, reason: '' }
  return { data: mapPost(data), error: null, blocked: false, reason: verdict.reason }
}

export async function deletePost(id) {
  // Soft delete: keep the row (for moderation history) but hide it everywhere.
  const { error } = await supabase
    .from('community_posts').update({ status: 'deleted', updated_at: new Date().toISOString() }).eq('id', id)
  return error ? err(error) : ok(true)
}

// ── Likes & saves ───────────────────────────────────────────────────────────
export async function getMyInteractions(userId, postIds) {
  if (!userId || postIds.length === 0) return ok({ liked: new Set(), saved: new Set() })
  const [{ data: likes }, { data: saves }] = await Promise.all([
    supabase.from('post_likes').select('post_id').eq('user_id', userId).in('post_id', postIds),
    supabase.from('saved_posts').select('post_id').eq('user_id', userId).in('post_id', postIds),
  ])
  return ok({
    liked: new Set((likes || []).map((r) => r.post_id)),
    saved: new Set((saves || []).map((r) => r.post_id)),
  })
}

export async function toggleLike(userId, postId, on) {
  if (on) {
    const { error } = await supabase.from('post_likes').insert({ user_id: userId, post_id: postId })
    return error ? err(error) : ok(true)
  }
  const { error } = await supabase.from('post_likes').delete().match({ user_id: userId, post_id: postId })
  return error ? err(error) : ok(true)
}

export async function toggleSave(userId, postId, on) {
  if (on) {
    const { error } = await supabase.from('saved_posts').insert({ user_id: userId, post_id: postId })
    return error ? err(error) : ok(true)
  }
  const { error } = await supabase.from('saved_posts').delete().match({ user_id: userId, post_id: postId })
  return error ? err(error) : ok(true)
}

// ── Comments ──────────────────────────────────────────────────────────────
// Threads under a routine. Like posts, the author's public identity is
// denormalised onto each row so a thread never reads other profile rows.
function mapComment(r) {
  if (!r) return null
  return {
    id: r.id,
    postId: r.post_id,
    userId: r.user_id,
    author: {
      username: r.author_username || '',
      displayName: r.author_display_name || '',
      avatarUrl: r.author_avatar_url || '',
    },
    body: r.body || '',
    likesCount: r.likes_count || 0,
    createdAt: r.created_at,
  }
}

const COMMENT_COLS =
  'id, post_id, user_id, author_username, author_display_name, author_avatar_url, body, created_at'

// `likes_count` on post_comments only exists once supabase/comment_likes.sql has
// run. Selecting a missing column errors the whole thread query, so we probe
// once and omit it until it's there (counts then read 0) — same graceful
// degradation as the comments-count column on posts.
let hasCommentLikesCol = true
let commentLikesColProbe = null
function commentCols() {
  return hasCommentLikesCol ? `${COMMENT_COLS}, likes_count` : COMMENT_COLS
}
async function ensureCommentLikesCol() {
  if (!commentLikesColProbe) {
    commentLikesColProbe = supabase
      .from('post_comments').select('likes_count').limit(1)
      .then(({ error }) => {
        if (error && (error.code === '42703' || /likes_count/i.test(error.message || ''))) hasCommentLikesCol = false
      })
      .catch(() => {})
  }
  return commentLikesColProbe
}

/** Comments on a post, oldest first (RLS hides those on posts you can't see). */
export async function listComments(postId) {
  await ensureCommentLikesCol()
  const { data, error } = await supabase
    .from('post_comments').select(commentCols())
    .eq('post_id', postId).order('created_at', { ascending: true }).limit(200)
  return error ? err(error) : ok((data || []).map(mapComment))
}

/** Which of these comments the signed-in user has liked (their own rows only). */
export async function getMyCommentLikes(userId, commentIds) {
  if (!userId || !commentIds || commentIds.length === 0) return ok(new Set())
  const { data, error } = await supabase
    .from('comment_likes').select('comment_id').eq('user_id', userId).in('comment_id', commentIds)
  if (error) return ok(new Set())   // table not set up yet → nothing liked
  return ok(new Set((data || []).map((r) => r.comment_id)))
}

/** Like / unlike a comment. The denormalised count is kept by a DB trigger. */
export async function toggleCommentLike(userId, commentId, on) {
  if (on) {
    const { error } = await supabase.from('comment_likes').insert({ user_id: userId, comment_id: commentId })
    return error ? err(error) : ok(true)
  }
  const { error } = await supabase.from('comment_likes').delete().match({ user_id: userId, comment_id: commentId })
  return error ? err(error) : ok(true)
}

/**
 * Add a comment. Runs the same keyword moderation as posts (clearly bad text is
 * refused, never sent to the server). Returns { data, error, blocked, reason }.
 */
export async function addComment(userId, author, postId, body) {
  const text = (body || '').trim()
  if (!text) return { data: null, error: null, blocked: true, reason: 'Write something first.' }
  // Reuse the post text filter: a comment is just a title-less body of text.
  const verdict = moderateText({ title: 'comment', description: text })
  if (verdict.verdict === 'block') return { data: null, error: null, blocked: true, reason: verdict.reason }

  const row = {
    post_id: postId,
    user_id: userId,
    author_username: author?.username || '',
    author_display_name: author?.displayName || '',
    author_avatar_url: author?.avatarUrl || '',
    body: text,
  }
  const { data, error } = await supabase
    .from('post_comments').insert(row).select(COMMENT_COLS).single()
  if (error) return { data: null, error, blocked: false, reason: '' }
  return { data: mapComment(data), error: null, blocked: false, reason: '' }
}

export async function deleteComment(id) {
  const { error } = await supabase.from('post_comments').delete().eq('id', id)
  return error ? err(error) : ok(true)
}

// ── User search & profiles ───────────────────────────────────────────────
export async function searchUsers(query, myId) {
  const s = (query || '').trim()
  if (s.length < 2) return ok([])
  const like = `%${s}%`
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, username, display_name, avatar_url, bio')
    .or(`username.ilike.${like},display_name.ilike.${like}`)
    .limit(25)
  if (error) return err(error)
  return ok((data || []).filter((u) => u.id !== myId && u.username))
}

export async function getProfileByUsername(username) {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, username, display_name, avatar_url, bio, created_at, badge_override')
    .ilike('username', (username || '').trim())
    .maybeSingle()
  return error ? err(error) : ok(data)
}

// Admin-only (enforced by the guard trigger in badge_override.sql): set or clear
// a public badge floor so an account's medals show as earned to everyone.
// `floor` is a like-total (e.g. 100000 lights up every medal) or null to clear.
export async function setBadgeOverride(userId, floor) {
  const { error } = await supabase
    .from('profiles').update({ badge_override: floor }).eq('id', userId)
  return error ? err(error) : ok(true)
}

/** Posts by a given user that the viewer is allowed to see (RLS enforced). */
export async function getUserPosts(targetUserId) {
  await ensureCommentsCol()
  const { data, error } = await supabase
    .from('community_posts').select(postCols())
    .eq('user_id', targetUserId).neq('status', 'deleted')
    .order('created_at', { ascending: false }).limit(60)
  return error ? err(error) : ok((data || []).map(mapPost))
}

// ── Friends ─────────────────────────────────────────────────────────────────
export async function getFriendStatus(otherId, myId) {
  if (!myId || !otherId) return ok('none')
  // Accepted friendship?
  const { data: f } = await supabase
    .from('friendships').select('id')
    .or(`and(user_a.eq.${myId},user_b.eq.${otherId}),and(user_a.eq.${otherId},user_b.eq.${myId})`)
    .limit(1)
  if (f && f.length) return ok('friends')
  // Pending request either direction?
  const { data: req } = await supabase
    .from('friend_requests').select('sender_id, receiver_id, status')
    .or(`and(sender_id.eq.${myId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${myId})`)
    .eq('status', 'pending').limit(1)
  if (req && req.length) {
    return ok(req[0].sender_id === myId ? 'outgoing' : 'incoming')
  }
  return ok('none')
}

export async function sendFriendRequest(senderId, receiverId) {
  const { error } = await supabase
    .from('friend_requests').insert({ sender_id: senderId, receiver_id: receiverId })
  return error ? err(error) : ok(true)
}

export async function respondFriendRequest(requestId, accept) {
  const { error } = await supabase.rpc('respond_friend_request', { request_id: requestId, accept })
  return error ? err(error) : ok(true)
}

export async function removeFriend(otherId) {
  const { error } = await supabase.rpc('remove_friend', { other: otherId })
  return error ? err(error) : ok(true)
}

export async function cancelFriendRequest(requestId) {
  const { error } = await supabase.from('friend_requests').delete().eq('id', requestId)
  return error ? err(error) : ok(true)
}

// Enrich a list of user ids with their public identity for request/friend lists.
async function profilesByIds(ids) {
  if (ids.length === 0) return {}
  const { data } = await supabase
    .from('public_profiles').select('id, username, display_name, avatar_url').in('id', ids)
  const map = {}
  for (const p of data || []) map[p.id] = p
  return map
}

export async function listFriendRequests(myId) {
  const { data, error } = await supabase
    .from('friend_requests').select('id, sender_id, receiver_id, status, created_at')
    .eq('status', 'pending')
    .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
    .order('created_at', { ascending: false })
  if (error) return err(error)
  const others = [...new Set((data || []).map((r) => r.sender_id === myId ? r.receiver_id : r.sender_id))]
  const profiles = await profilesByIds(others)
  const incoming = [], outgoing = []
  for (const r of data || []) {
    const isIncoming = r.receiver_id === myId
    const otherId = isIncoming ? r.sender_id : r.receiver_id
    const item = { id: r.id, createdAt: r.created_at, profile: profiles[otherId] || { id: otherId } }
    ;(isIncoming ? incoming : outgoing).push(item)
  }
  return ok({ incoming, outgoing })
}

export async function listFriends(myId) {
  const { data, error } = await supabase
    .from('friendships').select('user_a, user_b, created_at')
    .or(`user_a.eq.${myId},user_b.eq.${myId}`)
  if (error) return err(error)
  const others = (data || []).map((r) => (r.user_a === myId ? r.user_b : r.user_a))
  const profiles = await profilesByIds(others)
  return ok(others.map((id) => profiles[id] || { id }))
}

// ── Friend codes ─────────────────────────────────────────────────────────────
// A short, shareable handle so people can add each other without knowing a
// username. Backed by supabase/friend_codes.sql (codes never appear in the
// public_profiles view — they're resolved only by the RPC below).

const FRIEND_CODE_MISSING = /could not find the function|add_friend_by_code|my_friend_code/i

// True when friend_codes.sql hasn't been run yet, so the UI can hide the feature
// instead of showing an error.
export function isFriendCodeMissing(error) {
  return !!error && FRIEND_CODE_MISSING.test(error.message || '')
}

/** My own friend code (created on first use). */
export async function getMyFriendCode() {
  const { data, error } = await supabase.rpc('my_friend_code')
  return error ? err(error) : ok(data)
}

/** Add a friend by their code → { status: 'friends' | 'requested', user_id }. */
export async function addFriendByCode(code) {
  const { data, error } = await supabase.rpc('add_friend_by_code', { code })
  if (error) return err(error)
  // Enrich with the other person's public identity for a friendly confirmation.
  let profile = null
  if (data?.user_id) {
    const { data: p } = await supabase
      .from('public_profiles').select('id, username, display_name, avatar_url').eq('id', data.user_id).maybeSingle()
    profile = p || null
  }
  return ok({ status: data?.status, profile })
}

// Lightweight count of pending requests *waiting on me* — drives the header
// notification bell. Head-only count, so it's cheap to poll.
export async function countIncomingRequests(myId) {
  if (!myId) return ok(0)
  const { count, error } = await supabase
    .from('friend_requests')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', myId).eq('status', 'pending')
  return error ? err(error) : ok(count || 0)
}

// ── Cross-component deep-link into a Community sub-view ───────────────────────
// The header bell lives outside the Community page, so it can't call setView
// directly. It stashes the target view here (read on Community mount, covering
// the lazy-load case) AND fires the event below (caught when Community is
// already mounted). Mirrors the takeCommunityDraft() pattern in plans.js.
let pendingCommunityView = null
export function requestCommunityView(view) { pendingCommunityView = view }
export function takeCommunityView() { const v = pendingCommunityView; pendingCommunityView = null; return v }

// Event names other parts of the app listen for / emit.
export const COMMUNITY_VIEW_EVENT = 'quill:community-view'        // detail: view name
export const FRIEND_REQUESTS_CHANGED = 'quill:friend-requests-changed'

// ── Reports ───────────────────────────────────────────────────────────────
export async function reportPost(reporterId, post, reason, details) {
  const { error } = await supabase.from('community_reports').insert({
    reporter_id: reporterId,
    post_id: post.id,
    reported_user_id: post.userId,
    reason,
    details: details || '',
  })
  return error ? err(error) : ok(true)
}

export async function reportUser(reporterId, targetUserId, reason, details) {
  const { error } = await supabase.from('community_reports').insert({
    reporter_id: reporterId,
    reported_user_id: targetUserId,
    reason,
    details: details || '',
  })
  return error ? err(error) : ok(true)
}

// ── Admin / moderation queue ────────────────────────────────────────────────
export async function adminListPosts(filter = 'pending_review') {
  // filter: 'pending_review' | 'flagged' | 'hidden'
  await ensureCommentsCol()
  const { data, error } = await supabase
    .from('community_posts').select(postCols())
    .eq('status', filter).order('created_at', { ascending: false }).limit(80)
  return error ? err(error) : ok((data || []).map(mapPost))
}

export async function adminSetStatus(postId, status) {
  const { error } = await supabase
    .from('community_posts').update({ status, updated_at: new Date().toISOString() }).eq('id', postId)
  return error ? err(error) : ok(true)
}

export async function adminListReports(status = 'open') {
  const { data, error } = await supabase
    .from('community_reports')
    .select('id, reporter_id, post_id, reported_user_id, reason, details, status, created_at')
    .eq('status', status).order('created_at', { ascending: false }).limit(80)
  if (error) return err(error)
  // Attach a light post summary where the report targets a post.
  const postIds = [...new Set((data || []).map((r) => r.post_id).filter(Boolean))]
  let postMap = {}
  if (postIds.length) {
    const { data: posts } = await supabase
      .from('community_posts').select('id, title, status, author_username').in('id', postIds)
    for (const p of posts || []) postMap[p.id] = p
  }
  return ok((data || []).map((r) => ({
    id: r.id, reason: r.reason, details: r.details, status: r.status, createdAt: r.created_at,
    postId: r.post_id, reportedUserId: r.reported_user_id, post: postMap[r.post_id] || null,
  })))
}

export async function adminResolveReport(reportId, status) {
  // status: 'reviewed' | 'dismissed' | 'action_taken'
  const { error } = await supabase
    .from('community_reports').update({ status, updated_at: new Date().toISOString() }).eq('id', reportId)
  return error ? err(error) : ok(true)
}
