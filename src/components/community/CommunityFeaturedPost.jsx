import { Avatar, CategoryBadge, timeAgo, firstMedia } from './ui.jsx'

// ─── The lead routine ─────────────────────────────────────────────────────
// A wide, editorial feature for the top-ranked For-You post. It deliberately
// breaks the uniform 4-up grid so the feed reads like a spread, not a table.
export default function CommunityFeaturedPost({ post, liked, saved, onOpen, onLike, onSave }) {
  const media = firstMedia(post.media)

  return (
    <article className="card-paper overflow-hidden group mb-8">
      <div className="grid md:grid-cols-5">
        {/* Visual side (3/5 on desktop) */}
        <button onClick={onOpen} aria-label={`Open ${post.title}`}
          className="md:col-span-3 block text-left relative">
          {media ? (
            media.type === 'video' ? (
              <div className="relative aspect-[16/10] bg-ink/5 overflow-hidden">
                <video src={media.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full bg-cream/85 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className="text-ink ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </span>
              </div>
            ) : (
              <div className="aspect-[16/10] bg-ink/5 overflow-hidden">
                <img src={media.url} alt="" loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
              </div>
            )
          ) : (
            <div className="aspect-[16/10] card-bone flex flex-col items-center justify-center p-8 text-center">
              <span className="editorial-num text-7xl text-clay/30">❝</span>
              <p className="font-display text-2xl sm:text-3xl text-ink leading-snug mt-3 max-w-md line-clamp-4">{post.title}</p>
            </div>
          )}
          <span className="absolute top-3 left-3"><CategoryBadge category={post.category} /></span>
        </button>

        {/* Editorial side (2/5) */}
        <div className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-center">
          <span className="editorial-label text-clay">Featured this week</span>

          <button onClick={onOpen} className="text-left mt-2">
            <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.4rem)] text-ink leading-[1.02] tracking-tight group-hover:text-clay transition-colors">
              {post.title}
            </h2>
          </button>

          {post.description && (
            <p className="text-ink-soft leading-relaxed mt-3 line-clamp-3">{post.description}</p>
          )}

          <button onClick={onOpen} className="flex items-center gap-2.5 mt-5 group/author w-fit">
            <Avatar url={post.author.avatarUrl} name={post.author.displayName || post.author.username} size={34} />
            <span className="text-left">
              <span className="block text-sm font-medium text-ink group-hover/author:text-clay transition-colors">
                {post.author.displayName || post.author.username || 'Someone'}
              </span>
              <span className="block text-[11px] text-ink-softer">{timeAgo(post.createdAt)}</span>
            </span>
          </button>

          {/* Stats */}
          <div className="flex items-center gap-1 mt-6 -mx-2">
            <Stat active={liked} onClick={onLike} label="Like" count={post.likesCount}
              d={<path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />} />
            <Stat active={saved} onClick={onSave} label="Save" count={post.savesCount}
              d={<path d="M6 4h12v16l-6-4-6 4z" />} />
            <Stat onClick={onOpen} label="Comments" count={post.commentsCount} fillNever
              d={<path d="M5 5h14v11H9l-4 3z" />} />
          </div>
        </div>
      </div>
    </article>
  )
}

function Stat({ active, onClick, label, count, d, fillNever }) {
  return (
    <button onClick={onClick} aria-pressed={fillNever ? undefined : active} aria-label={label}
      data-cursor-label={label.toLowerCase()}
      className={`min-h-[40px] px-2 flex items-center gap-1.5 rounded transition-colors ${
        active ? 'text-clay' : 'text-ink-soft hover:text-ink'
      }`}>
      <svg viewBox="0 0 24 24" width="19" height="19" fill={active && !fillNever ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
      {count > 0 && <span className="text-sm num-display">{count}</span>}
    </button>
  )
}
