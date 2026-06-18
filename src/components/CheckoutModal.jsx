import { useState, useEffect } from 'react'
import { usePro } from '../context/ProContext.jsx'
import Celebration from './Celebration.jsx'

const planData = {
  pro: {
    label: 'Pro',
    sub: 'Everything in Free, plus the depth.',
    price: 5,
    period: 'month',
    color: '#1A1410',
    bullets: [
      'Unlimited favorites + collections',
      'All 60 wellness tips',
      'Ingredient & science deep-dives',
      'Seven-day meal templates',
      'Per-answer routine in My Quill',
    ],
  },
  max: {
    label: 'Max',
    sub: 'Six working tools. Real data, real cycle tracking, real audio.',
    price: 13,
    crossedPrice: 20,
    period: 'month',
    color: '#9B4423',
    bullets: [
      'Everything in Pro',
      'Sleep schedule analyzer',
      'Cycle tracking, 4-phase calendar',
      'Wearable sync (Apple · Oura · Whoop · Garmin)',
      'Audio library, 6 sounds + breathwork timer',
      'Habit streak tracker, 14-day grid',
      'Family seats, 4 members',
      'Rainbow Max theme + early access',
    ],
  },
}

export default function CheckoutModal({ plan, onClose }) {
  const { setTier } = usePro()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const p = planData[plan]

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && !submitting) onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, submitting])

  if (!p) return null

  // No card is collected during the beta — testers unlock with their code, and
  // billing isn't live yet. This just flips the tier locally after a short beat.
  function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setTimeout(() => {
      setTier(plan)
      setDone(true)
      // Celebration component handles its own onDone → close
    }, 1100)
  }

  return (
    <>
    {done && <Celebration tier={plan} onDone={onClose} />}
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />

      <div className="relative w-full max-w-md sm:max-w-3xl bg-cream-light shadow-soft-lg border border-ink/15 animate-fade-up grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] max-h-[92vh] overflow-y-auto panel-scroll">
        {/* LEFT, plan summary */}
        <aside className="bg-bone p-6 sm:p-8 border-b sm:border-b-0 sm:border-r border-ink/10 relative">
          <button
            onClick={onClose}
            disabled={submitting}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-ink/20 hover:border-ink hover:bg-ink hover:text-cream transition-all display-italic disabled:opacity-30"
            aria-label="Close"
          >
            ✕
          </button>
          <span className="editorial-label">Subscribe to</span>
          <h2 className="font-display text-5xl text-ink mt-1 leading-none">
            Quill <span className="display-italic text-clay">{p.label}</span>
          </h2>
          <p className="text-sm text-ink-soft mt-2 leading-relaxed">{p.sub}</p>

          <div className="mt-6 pt-6 border-t border-ink/15">
            <div className="flex items-baseline gap-2">
              {p.crossedPrice && (
                <span className="num-display text-2xl text-ink-softer line-through">${p.crossedPrice}</span>
              )}
              <span className="font-display text-6xl text-ink leading-none">${p.price}</span>
              <span className="text-sm text-ink-soft">/{p.period}</span>
            </div>
            {p.crossedPrice && (
              <p className="editorial-label text-clay mt-2">Launch offer · save ${p.crossedPrice - p.price}/mo</p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-ink/15">
            <span className="editorial-label">What's included</span>
            <ul className="mt-3 space-y-2">
              {p.bullets.map((b) => (
                <li key={b} className="flex items-baseline gap-3 text-sm text-ink-soft leading-snug">
                  <span style={{ color: p.color }} className="display-italic">✦</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[10px] text-ink-softer mt-6 leading-relaxed italic">
            Free beta, no payment is taken and no card details are ever requested or collected.
          </p>
        </aside>

        {/* RIGHT, payment form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col">
          {done ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <span className="num-display text-7xl text-clay animate-pop-in">✓</span>
              <p className="font-display text-3xl text-ink mt-4">You're in.</p>
              <p className="display-italic text-sm text-ink-soft mt-2">
                Welcome to Quill {p.label}. Enjoy the practice.
              </p>
            </div>
          ) : (
            <>
              <span className="editorial-label">Free beta</span>
              <h3 className="font-display text-3xl text-ink mt-1 leading-tight">
                No card needed
              </h3>

              <div className="mt-6 flex-1 space-y-4">
                <p className="text-sm text-ink-soft leading-relaxed">
                  Billing isn’t live yet, so there’s nothing to pay and no card to enter.
                  During the beta you can unlock <span className="font-semibold text-ink">Quill {p.label}</span> for
                  free to explore everything it includes.
                </p>
                <div className="bg-bone border border-ink/10 px-4 py-3">
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Got a tester code? You can also unlock free access from the
                    <span className="font-semibold text-ink"> Have a tester code?</span> box next to the Free plan.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 btn-ink w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                data-cursor-label="unlock"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="num-display animate-pulse">●</span> Unlocking…
                  </span>
                ) : (
                  <>Unlock {p.label} for the beta <span className="display-italic">→</span></>
                )}
              </button>

              <p className="text-[10px] text-ink-softer text-center mt-3 leading-relaxed">
                No charge, no card stored. Real billing arrives after the beta.
              </p>
            </>
          )}
        </form>

      </div>
    </div>
    </>
  )
}
