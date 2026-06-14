import { useState, useRef, useEffect } from 'react'
import { usePro, FEEDBACK_EMAIL } from '../context/ProContext.jsx'

/* ─────────────────────────────────────────────────────────────────────────
   TesterBadge — only ever rendered for people in the beta (isTester).
   A small, unobtrusive "Beta" pill in the bottom-left. Tapping it opens a
   little card with a one-tap "Send feedback" button (opens their mail app,
   pre-addressed to FEEDBACK_EMAIL) and a way to leave the beta. Sits above
   the phone tab bar and the safe-area inset; on desktop it drops to bottom-6.
   ──────────────────────────────────────────────────────────────────────── */
export default function TesterBadge() {
  const { isTester, setTester } = usePro()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Match the rest of the app's overlays: while open, tapping outside the
  // card (the touch tap-away phones expect) or pressing Escape closes it.
  // Scoped to the mobile layout only — a phone or a narrow window, i.e. below
  // the lg breakpoint where the bottom tab bar replaces the desktop top nav.
  // Checked at event time so it stays correct if the window is resized.
  useEffect(() => {
    if (!open) return
    const isMobileLayout = () => window.matchMedia('(max-width: 1023px)').matches
    function onPointer(e) {
      if (isMobileLayout() && ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (isMobileLayout() && e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!isTester) return null

  const subject = encodeURIComponent('Quill beta feedback')
  const body = encodeURIComponent(
    'What I liked:\n\n\nWhat felt confusing or broken:\n\n\nWhat I wish it did:\n\n\n' +
    '— sent from the Quill beta'
  )
  const mailto = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`

  return (
    <div ref={ref} className="fixed left-4 z-[55] bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] lg:bottom-6">
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-60 bg-cream-light border-2 border-ink shadow-soft-lg p-4 animate-fade-up">
          <p className="editorial-label text-clay">You're testing Quill</p>
          <p className="text-sm text-ink-soft leading-snug mt-1">
            Thanks for trying the beta. Tell us what worked and what didn't, it shapes what comes next.
          </p>
          <a
            href={mailto}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-ink text-cream text-sm font-medium hover:bg-clay transition-colors"
          >
            Send feedback →
          </a>
          <button
            type="button"
            onClick={() => { setTester(false); setOpen(false) }}
            className="mt-2 w-full text-center text-xs text-ink-softer hover:text-clay display-italic"
          >
            Leave the beta
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Beta tester menu"
        className="flex items-center gap-1.5 px-3 py-2 bg-sage text-cream text-xs font-bold uppercase tracking-[0.16em] shadow-soft-lg border-2 border-sage hover:bg-ink hover:border-ink transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cream/90" aria-hidden="true" />
        Beta
      </button>
    </div>
  )
}
