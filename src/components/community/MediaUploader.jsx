import { useState, useRef } from 'react'
import { MEDIA_ENABLED, MEDIA_LIMITS, fileKind, uploadMediaFile } from '../../lib/communityMedia.js'

// ─── Reusable photo/video uploader ────────────────────────────────────────
// Uploads each file as soon as it's chosen (so we always hold real URLs) and
// reports the current media list up via `onChange`. Used by both the Community
// post form and the personal-plan editor.
//
// value:    [{ url, type:'image'|'video', path }]
// onChange: (nextArray) => void
// The PARENT owns cleanup: on cancel it deletes the paths added this session;
// on save it deletes any pre-existing paths the user removed.
export default function MediaUploader({ userId, value = [], onChange, disabled = false }) {
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState([])   // [{ id, pct, kind }]
  const fileRef = useRef(null)

  if (!MEDIA_ENABLED || !userId) {
    return (
      <div className="card-bone p-4 text-sm text-ink-soft leading-relaxed">
        {userId
          ? 'Photo & video upload turns on once the community database is connected.'
          : 'Sign in to add photos and videos.'}
      </div>
    )
  }

  const images = value.filter((m) => m.type === 'image').length + uploading.filter((u) => u.kind === 'image').length
  const videos = value.filter((m) => m.type === 'video').length + uploading.filter((u) => u.kind === 'video').length
  const atLimit = videos >= MEDIA_LIMITS.maxVideos || images >= MEDIA_LIMITS.maxImages

  function validate(incoming) {
    let ni = 0, nv = 0
    for (const f of incoming) {
      const k = fileKind(f)
      if (!k) return `“${f.name}” isn’t a supported image or video type.`
      if (k === 'image' && f.size > MEDIA_LIMITS.imageBytes) return `Images must be under 5 MB (“${f.name}”).`
      if (k === 'video' && f.size > MEDIA_LIMITS.videoBytes) return `Videos must be under 50 MB (“${f.name}”).`
      k === 'image' ? ni++ : nv++
    }
    if (videos + nv > MEDIA_LIMITS.maxVideos) return 'You can add at most 1 video.'
    if (images + ni > MEDIA_LIMITS.maxImages) return 'You can add at most 5 images.'
    if (videos + nv > 0 && images + ni > 0) return 'Use either images or a video, not both.'
    return null
  }

  async function onPick(e) {
    setError('')
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    const v = validate(files)
    if (v) { setError(v); return }

    // Upload sequentially, accumulating into `current` so multiple files all stick.
    let current = value
    for (const f of files) {
      const id = crypto.randomUUID()
      const kind = fileKind(f)
      setUploading((u) => [...u, { id, pct: 0, kind }])
      try {
        const m = await uploadMediaFile(f, userId, (pct) =>
          setUploading((u) => u.map((x) => (x.id === id ? { ...x, pct } : x))))
        current = [...current, m]
        onChange(current)
      } catch (err) {
        setError(err.message || 'Upload failed.')
      } finally {
        setUploading((u) => u.filter((x) => x.id !== id))
      }
    }
  }

  function remove(i) { onChange(value.filter((_, idx) => idx !== i)) }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((m, i) => (
          <div key={m.path || i} className="relative w-20 h-20 rounded-sm overflow-hidden border border-ink/15 bg-ink/5">
            {m.type === 'video'
              ? <video src={m.url} className="w-full h-full object-cover" muted />
              : <img src={m.url} alt="" className="w-full h-full object-cover" />}
            {m.type === 'video' && (
              <span className="absolute inset-0 flex items-center justify-center text-cream text-lg drop-shadow">▶</span>
            )}
            <button type="button" onClick={() => remove(i)} aria-label="Remove"
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink/70 text-cream text-xs flex items-center justify-center">✕</button>
          </div>
        ))}

        {uploading.map((u) => (
          <div key={u.id} className="w-20 h-20 rounded-sm border border-ink/15 bg-bone flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] text-ink-soft">{u.pct}%</span>
            <span className="block w-12 h-1 bg-ink/10 rounded-full overflow-hidden">
              <span className="block h-full bg-clay transition-all" style={{ width: `${u.pct}%` }} />
            </span>
          </div>
        ))}

        {!atLimit && !disabled && (
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-sm border border-dashed border-ink/30 text-ink-soft hover:border-ink hover:text-ink transition-colors flex flex-col items-center justify-center gap-1">
            <span className="text-xl leading-none">+</span>
            <span className="text-[10px]">Add</span>
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" multiple
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
        onChange={onPick} className="hidden" />

      <p className="text-[11px] text-ink-softer mt-2">
        Up to {MEDIA_LIMITS.maxImages} images (5 MB each) or 1 video (50 MB). JPG, PNG, WebP, MP4, MOV, WebM.
      </p>
      {error && <p className="text-xs text-clay mt-1">{error}</p>}
    </div>
  )
}

// Helper for parents: which of `paths` are NOT in `keep` (for cleanup).
export function pathsToCleanup(allMedia, keepMedia) {
  const keep = new Set((keepMedia || []).map((m) => m.path))
  return (allMedia || []).map((m) => m.path).filter((p) => p && !keep.has(p))
}
