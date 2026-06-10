import { supabase, SUPABASE_ENABLED } from './supabase'

// ─── Community media upload ───────────────────────────────────────────────
// Uploads to the public `community-media` Storage bucket (created by
// supabase/community.sql). Files go into a per-user folder so RLS can ensure
// people only write to their own space:  community-media/<uid>/<file>.

export const BUCKET = 'community-media'

export const MEDIA_LIMITS = {
  maxImages: 5,
  maxVideos: 1,
  imageBytes: 5 * 1024 * 1024,        // 5 MB
  videoBytes: 50 * 1024 * 1024,       // 50 MB
  imageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  videoTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
}

// Media is only offered when a real Supabase backend is connected. (When the
// bucket itself hasn't been created yet, uploads fail gracefully with a clear
// message — see uploadMediaFile.)
export const MEDIA_ENABLED = SUPABASE_ENABLED

export function fileKind(file) {
  if (MEDIA_LIMITS.imageTypes.includes(file.type)) return 'image'
  if (MEDIA_LIMITS.videoTypes.includes(file.type)) return 'video'
  return null
}

/**
 * Validate a chosen set of files against the per-post limits.
 * @returns {{ ok: boolean, error?: string }}
 */
export function validateSelection(existing, incoming) {
  const all = [...existing, ...incoming]
  const images = all.filter((f) => fileKind(f) === 'image')
  const videos = all.filter((f) => fileKind(f) === 'video')

  for (const f of incoming) {
    const kind = fileKind(f)
    if (!kind) return { ok: false, error: `“${f.name}” isn’t a supported image or video type.` }
    if (kind === 'image' && f.size > MEDIA_LIMITS.imageBytes)
      return { ok: false, error: `Images must be under 5 MB (“${f.name}” is too large).` }
    if (kind === 'video' && f.size > MEDIA_LIMITS.videoBytes)
      return { ok: false, error: `Videos must be under 50 MB (“${f.name}” is too large).` }
  }
  if (videos.length > MEDIA_LIMITS.maxVideos)
    return { ok: false, error: 'You can add at most 1 video per post.' }
  if (images.length > MEDIA_LIMITS.maxImages)
    return { ok: false, error: 'You can add at most 5 images per post.' }
  if (videos.length > 0 && images.length > 0)
    return { ok: false, error: 'A post can have either images or a video, not both.' }

  return { ok: true }
}

function extFor(file) {
  const fromName = file.name?.split('.').pop()?.toLowerCase()
  if (fromName && fromName.length <= 5) return fromName
  return file.type.split('/')[1] || 'bin'
}

/**
 * Upload a single file with progress.
 * @param {File} file
 * @param {string} userId
 * @param {(pct:number)=>void} onProgress  0..100
 * @returns {Promise<{ url:string, type:'image'|'video', path:string }>}
 */
export async function uploadMediaFile(file, userId, onProgress) {
  if (!MEDIA_ENABLED) throw new Error('Media upload needs the database connected.')
  const kind = fileKind(file)
  if (!kind) throw new Error('Unsupported file type.')

  const path = `${userId}/${crypto.randomUUID()}.${extFor(file)}`

  // supabase-js v2 doesn't surface upload progress, so for accurate progress we
  // upload via the Storage REST endpoint with XHR. Falls back to a simple
  // start/finish if anything is unavailable.
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const url = `${supabase.storageUrl || (import.meta.env.VITE_SUPABASE_URL + '/storage/v1')}/object/${BUCKET}/${path}`

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url, true)
      xhr.setRequestHeader('authorization', `Bearer ${token}`)
      xhr.setRequestHeader('x-upsert', 'false')
      xhr.setRequestHeader('content-type', file.type)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status}). Has the community-media bucket been created?`)))
      xhr.onerror = () => reject(new Error('Network error during upload.'))
      xhr.send(file)
    })
  } catch (err) {
    // Fallback path (no progress) using the SDK.
    onProgress?.(50)
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type, upsert: false,
    })
    if (error) throw new Error(error.message || 'Upload failed.')
  }

  onProgress?.(100)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, type: kind, path }
}

/** Best-effort cleanup if a post is abandoned or fails after upload. */
export async function deleteMediaPaths(paths = []) {
  if (!MEDIA_ENABLED || paths.length === 0) return
  try { await supabase.storage.from(BUCKET).remove(paths) } catch {}
}
