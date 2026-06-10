import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const brandColors = ['#C8654A', '#D4A744', '#5A6B5D', '#6BAEEF', '#C9B3E8', '#E8B4B8', '#9B4423', '#3D4A40']

// ─── "Your routine just hit N likes!" celebratory toast ───────────────────
// Fires a quick confetti burst on mount, then auto-dismisses. Tapping it opens
// the routine. `milestone` carries { title, milestone, postId }.
export default function MilestoneToast({ milestone, onOpen, onClose }) {
  useEffect(() => {
    confetti({
      particleCount: 90,
      spread: 70,
      startVelocity: 38,
      origin: { y: 0.3 },
      colors: brandColors,
      scalar: 1.05,
    })
    const t = setTimeout(() => onClose?.(), 6500)
    return () => clearTimeout(t)
  }, [milestone, onClose])

  return (
    <div className="fixed inset-x-0 top-0 z-[120] flex justify-center px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pointer-events-none">
      <div className="animate-fade-up pointer-events-auto card-gold shadow-soft-lg max-w-md w-full p-4 flex items-center gap-3">
        <span className="text-2xl shrink-0" aria-hidden="true">🎉</span>
        <button onClick={() => onOpen?.(milestone)} className="min-w-0 flex-1 text-left">
          <p className="font-display text-lg text-ink leading-snug">
            Your routine just passed <span className="text-clay">{milestone.milestone} likes!</span>
          </p>
          <p className="text-sm text-ink-soft truncate mt-0.5">“{milestone.title}” — tap to see it</p>
        </button>
        <button onClick={onClose} aria-label="Dismiss"
          className="shrink-0 w-8 h-8 flex items-center justify-center text-ink-softer hover:text-ink rounded-full">✕</button>
      </div>
    </div>
  )
}
