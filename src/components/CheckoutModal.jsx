import { useState, useEffect } from 'react'
import { usePro, DEV_CODE } from '../context/ProContext.jsx'
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
      'Cycle tracking — 4-phase calendar',
      'Wearable sync (Apple · Oura · Whoop · Garmin)',
      'Audio library — 6 sounds + breathwork timer',
      'Habit streak tracker — 14-day grid',
      'Family seats — 4 members',
      'Rainbow Max theme + early access',
    ],
  },
}

function formatCard(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExp(v) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}
function formatCvc(v) {
  return v.replace(/\D/g, '').slice(0, 4)
}

export default function CheckoutModal({ plan, onClose }) {
  const { setTier, devUnlocked, setDevUnlocked } = usePro()
  const [email, setEmail] = useState('')
  const [card, setCard] = useState('')
  const [exp, setExp] = useState('')
  const [cvc, setCvc] = useState('')
  const [country, setCountry] = useState('United Kingdom')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  // Dev-mode unlock UI state
  const [codeOpen, setCodeOpen] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [codeUnlocked, setCodeUnlocked] = useState(false)

  function tryCode(e) {
    e.preventDefault()
    if (codeInput.trim().toLowerCase() === DEV_CODE.toLowerCase()) {
      setDevUnlocked(true)
      setCodeUnlocked(true)
      setCodeError(false)
      setCodeInput('')
      setTimeout(() => setCodeOpen(false), 1400)
    } else {
      setCodeError(true)
      setTimeout(() => setCodeError(false), 600)
    }
  }

  const p = planData[plan]

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && !submitting) onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, submitting])

  if (!p) return null

  const valid = email.includes('@') && card.replace(/\s/g, '').length >= 15 && exp.length >= 5 && cvc.length >= 3

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid || submitting) return
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
        {/* LEFT — plan summary */}
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
            Prototype mockup — no payment is taken, no card details are sent anywhere. Card stays in your browser.
          </p>
        </aside>

        {/* RIGHT — payment form */}
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
              <span className="editorial-label">Step 02 · Payment</span>
              <h3 className="font-display text-3xl text-ink mt-1 leading-tight">
                Your details
              </h3>

              <div className="mt-6 space-y-4">
                <Field label="Email">
                  <input
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                  />
                </Field>
                <Field label="Card number">
                  <div className="relative">
                    <input
                      required
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242"
                      value={card}
                      onChange={(e) => setCard(formatCard(e.target.value))}
                      disabled={submitting}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-widest text-ink-softer">VISA</span>
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry">
                    <input
                      required
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      value={exp}
                      onChange={(e) => setExp(formatExp(e.target.value))}
                      disabled={submitting}
                    />
                  </Field>
                  <Field label="CVC">
                    <input
                      required
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(formatCvc(e.target.value))}
                      disabled={submitting}
                    />
                  </Field>
                </div>
                <Field label="Country">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={submitting}
                  >
                    {['United Kingdom', 'United States', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Australia', 'Canada', 'Other'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <button
                type="submit"
                disabled={!valid || submitting}
                className="mt-6 btn-ink w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                data-cursor-label="subscribe"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="num-display animate-pulse">●</span> Processing…
                  </span>
                ) : (
                  <>Subscribe — ${p.price}/{p.period} <span className="display-italic">→</span></>
                )}
              </button>

              <p className="text-[10px] text-ink-softer text-center mt-3 leading-relaxed">
                By subscribing you agree to Quill's terms. Cancel anytime from My Quill.
              </p>
            </>
          )}
        </form>

        {/* ─── Hidden dev-mode unlock ─────────────────────────────────
            A tiny dot in the bottom-right corner. Clicking it opens an
            inline code input. Typing the secret unlocks the dev tier
            switcher in the navbar. */}
        {!devUnlocked && !done && (
          <>
            {!codeOpen ? (
              <button
                type="button"
                onClick={() => setCodeOpen(true)}
                aria-label="Developer access"
                title=""
                className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-ink/15 hover:bg-clay transition-colors"
              />
            ) : (
              <form
                onSubmit={tryCode}
                className="absolute bottom-4 right-4 bg-cream-light border border-ink/20 shadow-soft-lg p-3 animate-fade-up flex items-center gap-2"
                style={{ zIndex: 50 }}
              >
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  autoFocus
                  placeholder="code"
                  className={`w-32 text-xs bg-cream border px-2 py-1 focus:outline-none transition-all ${
                    codeError ? 'border-clay animate-pop-in' : 'border-ink/20 focus:border-ink'
                  }`}
                />
                <button
                  type="submit"
                  className="text-xs px-2 py-1 bg-ink text-cream hover:bg-ink-light transition-colors"
                >
                  ↵
                </button>
                <button
                  type="button"
                  onClick={() => { setCodeOpen(false); setCodeInput(''); setCodeError(false) }}
                  className="text-xs text-ink-softer hover:text-clay display-italic"
                >
                  ✕
                </button>
              </form>
            )}
          </>
        )}
        {codeUnlocked && (
          <div className="absolute bottom-4 right-4 bg-sage text-cream px-3 py-2 text-xs font-medium animate-pop-in" style={{ zIndex: 50 }}>
            ✓ Dev mode unlocked
          </div>
        )}
      </div>
    </div>
    </>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="editorial-label block mb-1.5">{label}</span>
      <div className="checkout-field">
        {children}
      </div>
    </label>
  )
}
