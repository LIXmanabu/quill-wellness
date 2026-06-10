import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register the offline app-shell service worker.
// Only in production builds, in dev it would cache Vite's HMR assets and
// fight hot reload. (Run `npm run build && npm run preview` to test installs.)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // BASE_URL keeps the SW path correct whether hosted at / or /<repo>/.
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then((reg) => {
      // Force a version check on every load (and when the tab regains focus),
      // so a normal refresh always picks up the newest deploy. The new worker
      // skip-waits + claims, and the controllerchange handler below reloads
      // once into the fresh version. No manual "Update" tap needed.
      reg.update()
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update()
      })

      // When a new SW finishes installing while an old one controls the page,
      // tell the app so it can offer a one-tap reload (see ConnectionStatus).
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing
        if (!sw) return
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            window.dispatchEvent(new CustomEvent('quill:sw-update', { detail: reg }))
          }
        })
      })
    }).catch((err) => {
      console.warn('Service worker registration failed:', err)
    })

    // Reload once the new SW takes control (after the user taps "Update").
    let reloaded = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return
      reloaded = true
      window.location.reload()
    })
  })
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // A service worker installed by a PROD build viewed earlier on this same
  // origin (e.g. `npm run preview` on localhost) will keep serving its cached,
  // stale app shell on top of the dev server, making new pages/tabs look
  // missing. In dev, evict any such worker + its caches, then reload once.
  navigator.serviceWorker.getRegistrations().then((regs) => {
    if (!regs.length) return
    Promise.all(regs.map((r) => r.unregister()))
      .then(() => ('caches' in window
        ? caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        : null))
      .then(() => window.location.reload())
  })
}
