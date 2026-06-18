import { useState, useEffect } from 'react'

/*
  "Install Quill" affordance. The app is already an installable PWA (manifest +
  service worker), but browsers hide the native install option in a menu, and
  iOS Safari has no automatic prompt at all, so most people never discover it.
  This surfaces a quiet, dismissable prompt:
   - Chrome / Edge / Android: capture `beforeinstallprompt` and offer a one-tap
     "Install app" button that triggers the real browser install dialog.
   - iOS Safari: no such event exists, so show the manual Share → Add to Home
     Screen instructions instead.
  It hides when the app is already installed (running standalone) and remembers
  a dismissal so it never nags. Sits above the bottom tab bar like the other
  status toasts.
*/

const DISMISS_KEY = 'quill.install-dismissed'

// Already running as an installed app? Then there's nothing to offer.
function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true // iOS Safari
  )
}

function isIos() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS 13+ reports as a Mac; detect via touch support.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

// iOS only fires the install flow from Safari (not Chrome/Firefox on iOS, which
// can't add to the home screen), so only prompt where it actually works.
function isIosSafari() {
  if (!isIos()) return false
  const ua = navigator.userAgent
  return /safari/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua)
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
  })

  useEffect(() => {
    if (dismissed || isStandalone()) return

    // Chrome / Edge / Android: stash the event so we can trigger it on tap.
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    // Once installed, clear everything so we never show again.
    const onInstalled = () => {
      setDeferredPrompt(null)
      setShowIosHint(false)
      try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
    }
    window.addEventListener('appinstalled', onInstalled)

    // iOS Safari gets no event, so offer the manual instructions instead.
    if (isIosSafari()) setShowIosHint(true)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [dismissed])

  function dismiss() {
    setDeferredPrompt(null)
    setShowIosHint(false)
    setDismissed(true)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') {
      try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
    }
  }

  if (dismissed) return null
  if (!deferredPrompt && !showIosHint) return null

  return (
    <div
      className="fixed left-0 right-0 z-[70] flex justify-center px-3 pointer-events-none
                 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] lg:bottom-4"
      role="dialog"
      aria-label="Install Quill"
    >
      <div className="pointer-events-auto flex items-center gap-3 bg-ink text-cream px-4 py-3 shadow-soft-lg max-w-md w-full sm:w-auto">
        <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" className="w-8 h-8 rounded-md shrink-0" />
        {deferredPrompt ? (
          <>
            <span className="text-sm leading-snug">Install Quill as an app on your device.</span>
            <button
              onClick={install}
              className="ml-auto shrink-0 text-xs font-bold uppercase tracking-[0.15em] underline underline-offset-2 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold rounded px-1 min-h-[36px]"
            >
              Install
            </button>
          </>
        ) : (
          <span className="text-sm leading-snug">
            Install Quill: tap{' '}
            <span aria-label="the Share button" className="font-semibold">Share</span>
            {' '}then{' '}
            <span className="font-semibold">Add&nbsp;to&nbsp;Home&nbsp;Screen</span>.
          </span>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 text-cream/60 hover:text-cream focus-visible:ring-2 focus-visible:ring-gold rounded min-h-[36px] min-w-[36px] flex items-center justify-center text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}
