import { useState, useEffect, useRef } from 'react'
import { Avatar, timeAgo } from './ui.jsx'
import { listComments, addComment, deleteComment, isBackendMissing, getMyCommentLikes, toggleCommentLike } from '../../lib/community.js'

// ─── Conversation under a routine ─────────────────────────────────────────
// Threaded notes on a post. Signed-in users can add one; the author and admins
// can remove any; everyone else just reads. Degrades quietly when the comments
// table hasn't been created yet (community_comments.sql not run).
export default function CommentsSection({
  postId, myId, authorMeta, canModerate = false, count = 0, onCountChange,
}) {
  const [comments, setComments] = useState([])
  const [likedIds, setLikedIds] = useState(new Set())   // comment ids I've liked
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(true)   // false → comments table not set up yet
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const taRef = useRef(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    listComments(postId).then(({ data, error }) => {
      if (!active) return
      if (isBackendMissing(error)) { setReady(false); setLoading(false); return }
      const list = data || []
      setComments(list)
      setLoading(false)
      if (myId && list.length) {
        getMyCommentLikes(myId, list.map((c) => c.id)).then(({ data: liked }) => {
          if (active && liked) setLikedIds(liked)
        })
      }
    })
    return () => { active = false }
  }, [postId, myId])

  // Like / unlike a comment, optimistically (count comes back from the trigger
  // on the next load; we adjust locally for instant feedback).
  async function toggleLike(comment) {
    if (!myId) return
    const wasLiked = likedIds.has(comment.id)
    const delta = wasLiked ? -1 : 1
    setLikedIds((s) => { const n = new Set(s); wasLiked ? n.delete(comment.id) : n.add(comment.id); return n })
    setComments((cs) => cs.map((c) => c.id === comment.id ? { ...c, likesCount: Math.max(0, (c.likesCount || 0) + delta) } : c))
    const { error } = await toggleCommentLike(myId, comment.id, !wasLiked)
    if (error) {   // revert on failure (e.g. likes table not set up yet)
      setLikedIds((s) => { const n = new Set(s); wasLiked ? n.add(comment.id) : n.delete(comment.id); return n })
      setComments((cs) => cs.map((c) => c.id === comment.id ? { ...c, likesCount: Math.max(0, (c.likesCount || 0) - delta) } : c))
    }
  }

  function grow(el) {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  async function submit(e) {
    e?.preventDefault()
    setError('')
    const text = body.trim()
    if (!text || sending) return
    setSending(true)
    const res = await addComment(myId, authorMeta, postId, text)
    setSending(false)
    if (res.blocked) { setError(res.reason); return }
    if (res.error) { setError('Couldn’t post that. Try again.'); return }
    setComments((c) => [...c, res.data])
    setBody('')
    if (taRef.current) taRef.current.style.height = 'auto'
    onCountChange?.(count + 1)
  }

  async function remove(comment) {
    const prev = comments
    setComments((c) => c.filter((x) => x.id !== comment.id))
    onCountChange?.(Math.max(0, count - 1))
    const { error } = await deleteComment(comment.id)
    if (error) { setComments(prev); onCountChange?.(count) }  // restore on failure
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  return (
    <section id="comments" className="mt-10 pt-8 border-t border-ink/15 scroll-mt-24">
      <div className="flex items-baseline gap-2">
        <span className="editorial-label">Conversation</span>
        {count > 0 && <span className="num-display text-ink-softer text-sm">{count}</span>}
      </div>

      {!ready ? (
        <p className="text-sm text-ink-softer mt-4 leading-relaxed">
          Comments are warming up, check back soon.
        </p>
      ) : (
        <>
          {/* Composer (signed-in) or a gentle nudge (guest) */}
          {myId ? (
            <form onSubmit={submit} className="flex items-start gap-3 mt-5">
              <Avatar url={authorMeta?.avatarUrl} name={authorMeta?.displayName || authorMeta?.username} size={36} />
              <div className="flex-1 min-w-0">
                <textarea
                  ref={taRef} value={body} rows={1}
                  onChange={(e) => { setBody(e.target.value); grow(e.target) }}
                  onKeyDown={onKeyDown}
                  placeholder="Add a kind word or a question…"
                  className="input-line resize-none py-2 w-full" maxLength={800} />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-clay h-4">{error}</span>
                  <button type="submit" disabled={!body.trim() || sending}
                    className="btn-clay text-sm py-1.5 px-4 disabled:opacity-40">
                    {sending ? 'Posting…' : 'Post'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="card-bone p-4 mt-5">
              <p className="text-sm text-ink-soft leading-relaxed">
                <span className="text-ink font-medium">Sign in</span> to join the conversation.
              </p>
            </div>
          )}

          {/* Thread */}
          <div className="mt-7 space-y-6">
            {loading ? (
              <p className="text-sm text-ink-softer">Loading…</p>
            ) : comments.length === 0 ? (
              <p className="text-ink-soft leading-relaxed">
                No notes yet. Be the first to say something kind.
              </p>
            ) : (
              comments.map((c) => {
                const mine = c.userId === myId
                return (
                  <div key={c.id} className="flex items-start gap-3 group">
                    <Avatar url={c.author.avatarUrl} name={c.author.displayName || c.author.username} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-ink text-sm truncate">
                          {c.author.displayName || c.author.username || 'Someone'}
                        </span>
                        <span className="text-[11px] text-ink-softer shrink-0">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-ink-soft leading-relaxed mt-0.5 whitespace-pre-wrap break-words">{c.body}</p>
                      {/* Like a comment */}
                      <div className="mt-1.5">
                        <button
                          type="button"
                          onClick={() => toggleLike(c)}
                          disabled={!myId}
                          aria-pressed={likedIds.has(c.id)}
                          aria-label={likedIds.has(c.id) ? 'Unlike comment' : 'Like comment'}
                          title={myId ? (likedIds.has(c.id) ? 'Unlike' : 'Like') : 'Sign in to like'}
                          className={`inline-flex items-center gap-1 text-xs transition-colors ${
                            likedIds.has(c.id) ? 'text-clay' : 'text-ink-softer hover:text-clay'
                          } ${!myId ? 'cursor-default' : ''}`}
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill={likedIds.has(c.id) ? 'currentColor' : 'none'}
                            stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                            <path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />
                          </svg>
                          {(c.likesCount || 0) > 0 && <span className="num-display">{c.likesCount}</span>}
                          {(c.likesCount || 0) === 0 && <span>Like</span>}
                        </button>
                      </div>
                    </div>
                    {(mine || canModerate) && (
                      <button onClick={() => remove(c)} aria-label="Delete comment"
                        className="shrink-0 text-ink-softer hover:text-clay transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 p-1">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                          <path d="M5 7h14M10 7V5h4v2M8 7l1 12h6l1-12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </section>
  )
}
