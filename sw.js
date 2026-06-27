/*
  Quill — minimal offline app shell.
  Strategy:
   - Navigations: network-first, fall back to cached shell when offline so the
     app always opens (it stores its data in localStorage, so it works offline).
   - Static assets (scripts, styles, images, fonts): stale-while-revalidate.
  Bump CACHE_VERSION to invalidate old caches on deploy.
*/
// Relative paths resolve against the SW's own location, so the shell works
// whether the app is hosted at / or at /<repo>/ (GitHub Pages sub-path).
const CACHE_VERSION = 'quill-v3'
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png']

self.addEventListener('install', (event) => {
  // Activate a new version immediately instead of waiting for a manual "Update"
  // tap, so deploys reach everyone on their next visit (paired with
  // clients.claim in activate + the controllerchange reload in main.jsx).
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL))
  )
})

// The page asks the waiting worker to activate immediately (user tapped "Update").
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // Only handle same-origin; let the network handle fonts/Unsplash/Supabase directly.
  if (url.origin !== self.location.origin) return

  // App navigations → network-first with cached-shell fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_VERSION).then((c) => c.put('./', copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('./')))
    )
    return
  }

  // Static assets → stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone()
            caches.open(CACHE_VERSION).then((c) => c.put(request, copy)).catch(() => {})
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
