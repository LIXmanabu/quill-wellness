import { timeAgo } from './ui.jsx'

// ─── A single Q&A question row (Reddit-style) ─────────────────────────────
// An upvote rail on the left (upvote = post like), the question + a snippet,
// and the answer count. Tapping the body opens the thread; tapping the author
// opens their profile.
export default function QuestionCard({ post, liked, myId, onOpen, onUpvote, onOpenAuthor }) {
  const answers = post.commentsCount || 0
  return (
    <article className="card-paper card-paper-hover p-4 sm:p-5 flex gap-3 sm:gap-4">
      {/* Upvote rail */}
      <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
        <button
          type="button"
          onClick={() => myId && onUpvote()}
          disabled={!myId}
          aria-pressed={liked}
          aria-label={liked ? 'Remove upvote' : 'Upvote'}
          title={myId ? (liked ? 'Remove upvote' : 'Upvote') : 'Sign in to upvote'}
          className={`transition-colors ${liked ? 'text-clay' : 'text-ink-softer hover:text-clay'} ${!myId ? 'cursor-default' : ''}`}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M12 4l8 9h-5v7H9v-7H4l8-9z" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="num-display text-sm text-ink leading-none">{post.likesCount || 0}</span>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
        <h3 className="font-display text-lg sm:text-xl text-ink leading-snug">{post.title}</h3>
        {post.description && (
          <p className="text-sm text-ink-soft mt-1 leading-snug line-clamp-2">{post.description}</p>
        )}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2.5 text-xs text-ink-softer">
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M21 11.5a8.4 8.4 0 0 1-11.9 7.6L3 21l1.9-6.1A8.4 8.4 0 1 1 21 11.5z" strokeLinejoin="round" />
            </svg>
            {answers} {answers === 1 ? 'answer' : 'answers'}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (post.author?.username) onOpenAuthor?.() }}
            className="hover:text-ink truncate max-w-[12rem]"
          >
            {post.author?.displayName || (post.author?.username ? '@' + post.author.username : 'Someone')}
          </button>
          <span>· {timeAgo(post.createdAt)}</span>
        </div>
      </div>
    </article>
  )
}
