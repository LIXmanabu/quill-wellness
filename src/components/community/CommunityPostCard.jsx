import { Avatar, CategoryBadge, VisibilityIcon, StatusPill, timeAgo, firstMedia } from './ui.jsx'

// ─── A single feed card (Pinterest/IG-flavoured, Quill editorial styling) ──
export default function CommunityPostCard({ post, liked, saved, onOpen, onLike, onSave, onReport, onOpenAuthor }) {
  const media = firstMedia(post.media)

  return (
    <article className="card-paper card-paper-hover overflow-hidden flex flex-col group">
      {/* Media preview (or a soft typographic placeholder when text-only) */}
      <button onClick={onOpen} className="block text-left relative" aria-label={`Open ${post.title}`}>
        {media ? (
          media.type === 'video' ? (
            <div className="relative aspect-[4/5] bg-ink/5 overflow-hidden">
              <video src={media.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-11 h-11 rounded-full bg-cream/85 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-ink ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                </span>
              </span>
            </div>
          ) : (
            <div className="aspect-[4/5] bg-ink/5 overflow-hidden">
              <img src={media.url} alt="" loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            </div>
          )
        ) : (
          <div className="aspect-[4/5] card-bone flex flex-col items-center justify-center p-6 text-center">
            <span className="editorial-num text-5xl text-clay/40">❝</span>
            <p className="font-display text-xl text-ink leading-snug mt-2 line-clamp-4">{post.title}</p>
          </div>
        )}
        <span className="absolute top-2.5 left-2.5"><CategoryBadge category={post.category} /></span>
        {post.media.length > 1 && (
          <span className="absolute top-2.5 right-2.5 chip bg-ink/70 text-cream border-transparent text-[10px] py-0.5">
            1/{post.media.length}
          </span>
        )}
      </button>

      <div className="p-3.5 flex flex-col gap-2.5 flex-1">
        <button onClick={onOpen} className="text-left">
          {media && <h3 className="font-display text-lg text-ink leading-snug line-clamp-2">{post.title}</h3>}
          {post.description && (
            <p className="text-sm text-ink-soft leading-relaxed line-clamp-2 mt-1">{post.description}</p>
          )}
        </button>

        <div className="flex items-center gap-2 mt-auto pt-1">
          <button onClick={onOpenAuthor} className="flex items-center gap-2 min-w-0 group/author">
            <Avatar url={post.author.avatarUrl} name={post.author.displayName || post.author.username} size={26} />
            <span className="min-w-0">
              <span className="block text-xs font-medium text-ink truncate group-hover/author:text-clay transition-colors">
                {post.author.displayName || post.author.username || 'Someone'}
              </span>
              <span className="block text-[10px] text-ink-softer">{timeAgo(post.createdAt)}</span>
            </span>
          </button>
          <span className="ml-auto flex items-center gap-1.5">
            <VisibilityIcon visibility={post.visibility} />
            <StatusPill status={post.status} />
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 -mb-1 -mx-1">
          <ActionBtn active={liked} onClick={onLike} label="Like" count={post.likesCount}
            d={<path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />} />
          <ActionBtn active={saved} onClick={onSave} label="Save" count={post.savesCount}
            d={<path d="M6 4h12v16l-6-4-6 4z" />} />
          <button onClick={onOpen} aria-label="Comments" data-cursor-label="comment"
            className="min-h-[40px] px-2 flex items-center gap-1.5 rounded text-ink-soft hover:text-ink transition-colors">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 5h14v11H9l-4 3z" />
            </svg>
            {post.commentsCount > 0 && <span className="text-xs num-display">{post.commentsCount}</span>}
          </button>
          <button onClick={onReport} aria-label="Report" data-cursor-label="report"
            className="ml-auto min-h-[40px] min-w-[40px] flex items-center justify-center text-ink-softer hover:text-clay transition-colors rounded">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 21V4h11l-1.5 3.5L15 11H4" /><path d="M4 4v17" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}

function ActionBtn({ active, onClick, label, count, d }) {
  return (
    <button onClick={onClick} aria-pressed={active} aria-label={label} data-cursor-label={label.toLowerCase()}
      className={`min-h-[40px] px-2 flex items-center gap-1.5 rounded transition-colors ${
        active ? 'text-clay' : 'text-ink-soft hover:text-ink'
      }`}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill={active ? 'currentColor' : 'none'} stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
      {count > 0 && <span className="text-xs num-display">{count}</span>}
    </button>
  )
}
