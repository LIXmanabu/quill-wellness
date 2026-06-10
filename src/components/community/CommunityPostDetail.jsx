import { useState } from 'react'
import { Avatar, CategoryBadge, VisibilityIcon, StatusPill, timeAgo } from './ui.jsx'
import CommentsSection from './CommentsSection.jsx'

// ─── Full post / routine view ─────────────────────────────────────────────
export default function CommunityPostDetail({
  post, liked, saved, isOwner,
  myId, authorMeta, canModerate, onCommentCountChange,
  onBack, onLike, onSave, onReport, onDelete, onOpenAuthor,
}) {
  const [active, setActive] = useState(0)
  const media = post.media || []
  const current = media[active]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <button onClick={onBack} className="btn-ghost mb-5">
        <span className="display-italic text-base">←</span> Back to community
      </button>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <CategoryBadge category={post.category} />
        <VisibilityIcon visibility={post.visibility} showLabel />
        <StatusPill status={post.status} />
      </div>

      <h1 className="font-display text-[clamp(1.9rem,6vw,3rem)] text-ink leading-[0.98] tracking-tight">
        {post.title}
      </h1>

      {/* Creator */}
      <button onClick={onOpenAuthor} className="flex items-center gap-3 mt-5 group">
        <Avatar url={post.author.avatarUrl} name={post.author.displayName || post.author.username} size={42} />
        <span className="text-left">
          <span className="block font-medium text-ink group-hover:text-clay transition-colors">
            {post.author.displayName || post.author.username || 'Someone'}
          </span>
          <span className="block text-xs text-ink-softer">
            {post.author.username ? `@${post.author.username} · ` : ''}{timeAgo(post.createdAt)}
          </span>
        </span>
      </button>

      {/* Media gallery */}
      {media.length > 0 && (
        <div className="mt-6">
          <div className="bg-ink/5 overflow-hidden rounded-sm">
            {current.type === 'video' ? (
              <video src={current.url} controls playsInline className="w-full max-h-[70vh] object-contain bg-black" />
            ) : (
              <img src={current.url} alt="" className="w-full max-h-[70vh] object-contain" />
            )}
          </div>
          {media.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {media.map((m, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`w-16 h-16 shrink-0 overflow-hidden rounded-sm border-2 ${i === active ? 'border-clay' : 'border-transparent opacity-70'}`}>
                  {m.type === 'video'
                    ? <span className="w-full h-full bg-ink/10 flex items-center justify-center text-ink-soft text-xs">▶</span>
                    : <img src={m.url} alt="" className="w-full h-full object-cover" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {post.description && (
        <p className="text-lg text-ink-soft leading-relaxed mt-6 whitespace-pre-wrap">{post.description}</p>
      )}

      {/* Steps */}
      {post.steps.length > 0 && (
        <section className="mt-9">
          <span className="editorial-label">The routine</span>
          <ol className="mt-4 space-y-px bg-ink/10">
            {post.steps.map((s, i) => {
              const text = typeof s === 'string' ? s : s?.text || ''
              return (
                <li key={i} className="bg-cream-light p-4 sm:p-5 flex items-start gap-4">
                  <span className="num-display text-clay text-lg leading-none w-7 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-ink leading-relaxed">{text}</p>
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {/* Products */}
      {post.products.length > 0 && (
        <section className="mt-9">
          <span className="editorial-label">Products &amp; tools</span>
          <ul className="mt-4 flex flex-wrap gap-2">
            {post.products.map((p, i) => {
              const name = typeof p === 'string' ? p : p?.name || ''
              return <li key={i} className="chip chip-cream">{name}</li>
            })}
          </ul>
        </section>
      )}

      {/* Actions */}
      <div className="mt-10 pt-6 border-t border-ink/15 flex items-center gap-3 flex-wrap">
        <button onClick={onLike} aria-pressed={liked}
          className={`inline-flex items-center gap-2 px-4 py-2.5 border transition-colors ${liked ? 'bg-clay text-cream border-clay' : 'border-ink/20 text-ink hover:border-ink'}`}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5"><path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20Z" /></svg>
          {post.likesCount > 0 ? post.likesCount : ''} Like
        </button>
        <button onClick={onSave} aria-pressed={saved}
          className={`inline-flex items-center gap-2 px-4 py-2.5 border transition-colors ${saved ? 'bg-ink text-cream border-ink' : 'border-ink/20 text-ink hover:border-ink'}`}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5"><path d="M6 4h12v16l-6-4-6 4z" /></svg>
          {saved ? 'Saved' : 'Save'}
        </button>
        <button type="button"
          onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-ink/20 text-ink hover:border-ink transition-colors">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5h14v11H9l-4 3z" /></svg>
          {post.commentsCount > 0 ? `${post.commentsCount} ` : ''}{post.commentsCount === 1 ? 'Comment' : 'Comments'}
        </button>
        <div className="ml-auto flex items-center gap-3">
          {isOwner ? (
            <button onClick={onDelete} className="btn-ghost text-ink-soft hover:text-clay">Delete</button>
          ) : (
            <button onClick={onReport} className="btn-ghost text-ink-soft hover:text-clay">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 21V4h11l-1.5 3.5L15 11H4" /><path d="M4 4v17" /></svg>
              Report
            </button>
          )}
        </div>
      </div>

      <CommentsSection
        postId={post.id} myId={myId} authorMeta={authorMeta}
        canModerate={canModerate || isOwner} count={post.commentsCount || 0}
        onCountChange={onCommentCountChange} />
    </div>
  )
}
