import { useState, useEffect } from 'react'

/*
  Two quiet, app-appropriate signals:
   - Offline banner: reassures the user their data is safe (it's local-only).
   - Update toast: when the service worker has a new version waiting, offer a
     one-tap reload instead of silently serving a stale build.
  Both sit above the bottom tab bar and respect the safe-area inset.
*/
export default function ConnectionStatus() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine)
  const [waitingReg, setWaitingReg] = useState(null)

  useEffect(() => {
    const goOnline = () => setOffline(false)
    const goOffline = () => setOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    // A new service worker is installed and waiting (see main.jsx).
    const onUpdate = (e) => setWaitingReg(e.detail || true)
    window.addEventListener('quill:sw-update', onUpdate)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('quill:sw-update', onUpdate)
    }
  }, [])

  function applyUpdate() {
    const reg = waitingReg && waitingReg.waiting
    if (reg) reg.postMessage({ type: 'SKIP_WAITING' }) // main.jsx reloads on controllerchange
    else window.location.reload()
  }

  if (!offline && !waitingReg) return null

  return (
    <div
      className="fixed left-0 right-0 z-[70] flex flex-col items-center gap-2 px-3 pointer-events-none
                 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] lg:bottom-4"
      role="status"
      aria-live="polite"
    >
      {waitingReg && (
        <div className="pointer-events-auto flex items-center gap-3 bg-ink text-cream px-4 py-2.5 shadow-soft-lg max-w-md w-full sm:w-auto">
          <span className="text-sm">A new version of Quill is ready.</span>
          <button
            onClick={applyUpdate}
            className="ml-auto text-xs font-bold uppercase tracking-[0.15em] underline underline-offset-2 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold rounded px-1 min-h-[36px]"
          >
            Update
          </button>
        </div>
      )}
      {offline && (
        <div className="pointer-events-auto flex items-center gap-2 bg-clay text-cream px-4 py-2 shadow-soft text-xs sm:text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-cream/80" aria-hidden="true" />
          You're offline. Quill still works, your data is saved on this device.
        </div>
      )}
    </div>
  )
}
