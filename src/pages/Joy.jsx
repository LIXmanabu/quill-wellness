import { useState, useEffect, useMemo } from 'react'
import confetti from 'canvas-confetti'
import { useAuth } from '../context/AuthContext.jsx'
import Reveal from '../components/interactive/Reveal.jsx'
import SpotlightCard from '../components/interactive/SpotlightCard.jsx'
import SplitText from '../components/interactive/SplitText.jsx'

// ─── Joy ──────────────────────────────────────────────────────────────
// A gentle place to save small good moments, then have them resurface
// weeks or months later as a quiet pick-me-up. Stored locally on the
// device (per account), so it works offline and stays private.

const PROMPTS = [
  'a message from someone you love',
  'sunlight through the window',
  'a really good coffee',
  "a stranger's small kindness",
  'a song that lifted you',
  'something that made you laugh',
  'a neighbour who helped out',
  'a slow, quiet morning',
]

// Rotating capture nudges (one per day) so the prompt stays fresh.
const NUDGES = [
  'What went a little right today?',
  'Who made your day a bit better?',
  'What are you grateful for right now?',
  'What tiny thing are you looking forward to?',
  'What did your body do for you today?',
  'What made you laugh recently?',
  'What felt calm today, even for a moment?',
]

// Warm, non-preachy quotes (no hustle, no toxic positivity). One per day.
const QUOTES = [
  { t: 'You do not have to be good. You only have to let the soft animal of your body love what it loves.', a: 'Mary Oliver' },
  { t: 'Almost everything will work again if you unplug it for a few minutes, including you.', a: 'Anne Lamott' },
  { t: 'There is a crack in everything. That’s how the light gets in.', a: 'Leonard Cohen' },
  { t: 'Joy is not made to be a crumb.', a: 'Mary Oliver' },
  { t: 'Start where you are. Use what you have. Do what you can.', a: 'Arthur Ashe' },
  { t: 'Even the darkest night will end and the sun will rise.', a: 'Victor Hugo' },
  { t: 'Gratitude turns what we have into enough.', a: '' },
  { t: 'Be gentle with yourself. You are doing the best you can.', a: '' },
  { t: 'You are not behind. There is no schedule.', a: '' },
  { t: 'Feelings are visitors. Let them come and go.', a: '' },
  { t: 'What you water grows. Water the good.', a: '' },
  { t: 'Little by little, one travels far.', a: '' },
  { t: 'Rest is not a reward for finishing. It is part of the work.', a: '' },
  { t: 'You have survived 100% of your hardest days.', a: '' },
  { t: 'Hope is a discipline.', a: 'Mariame Kaba' },
  { t: 'Be the reason someone smiles today, even if that someone is you.', a: '' },
  { t: 'It is okay to be both a masterpiece and a work in progress.', a: '' },
  { t: 'Wherever you are, be all there.', a: 'Jim Elliot' },
  { t: 'Small steps still move you forward.', a: '' },
  { t: 'Take the day one small joy at a time.', a: '' },
  { t: 'Comparison is the thief of joy.', a: 'Theodore Roosevelt' },
  { t: 'You don’t have to do it all today.', a: '' },
  { t: 'Breathe. You’re exactly where you need to be.', a: '' },
  { t: 'The most wasted of days is one without laughter.', a: 'e. e. cummings' },
  { t: 'Tend to the small things. They are not small.', a: '' },
  { t: 'Some days the bravest thing is to be kind to yourself.', a: '' },
  { t: 'Nothing is permanent, not even the hard parts.', a: '' },
  { t: 'A little progress each day adds up to big change.', a: '' },
]

// Gentle, validating lines for the "I need a lift" moment. Not dismissive,
// not toxic-positive, just kind.
const KIND_LINES = [
  'This is a hard moment, not a hard life.',
  'You’ve made it through every day so far. That’s not nothing.',
  'Be as kind to yourself as you’d be to a good friend.',
  'Feelings pass. You don’t have to fix anything right now.',
  'You’re allowed to rest. You’re allowed to start small.',
  'Even now, something small is still good.',
  'Breathe in for four, out for six. Just once, with me.',
  'You don’t have to carry all of it today.',
]

const todayIndex = Math.floor(Date.now() / 86400000)
function pick(arr) { return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null }
function dayBucket(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}
function celebrate() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    confetti({
      particleCount: 45, spread: 55, startVelocity: 32, scalar: 0.9,
      origin: { y: 0.7 }, disableForReducedMotion: true,
      colors: ['#C8654A', '#D4A744', '#5A6B5D', '#E8B4B8', '#9B4423'],
    })
  } catch {}
}

function storageKey(user) {
  return user?.id ? `quill.joy.${user.id}` : 'quill.joy.guest'
}
function loadJoys(key) {
  try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] }
}
function saveJoys(key, items) {
  try { localStorage.setItem(key, JSON.stringify(items)) } catch {}
}
function daysSince(ts) {
  return Math.floor((Date.now() - ts) / 86400000)
}
function whenLabel(ts) {
  const d = daysSince(ts)
  if (d <= 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 7) return `${d} days ago`
  if (d < 31) return `${Math.max(1, Math.round(d / 7))} ${Math.round(d / 7) === 1 ? 'week' : 'weeks'} ago`
  if (d < 365) return `${Math.max(1, Math.round(d / 30))} ${Math.round(d / 30) === 1 ? 'month' : 'months'} ago`
  return `${Math.round(d / 365)} ${Math.round(d / 365) === 1 ? 'year' : 'years'} ago`
}
function fullDate(ts) {
  return new Date(ts).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Joy() {
  const { user } = useAuth()
  const key = storageKey(user)
  const [items, setItems] = useState(() => loadJoys(key))
  const [text, setText] = useState('')
  const [memoryIdx, setMemoryIdx] = useState(0)
  const [quoteIdx, setQuoteIdx] = useState(todayIndex)
  const [justSaved, setJustSaved] = useState(false)
  const [lift, setLift] = useState(null)   // null = closed; {kind, quote, joy} when open
  const quote = QUOTES[Math.abs(quoteIdx) % QUOTES.length]
  const nudge = NUDGES[todayIndex % NUDGES.length]

  function openLift() {
    setLift({ kind: pick(KIND_LINES), quote: pick(QUOTES), joy: pick(items) })
  }
  function nextLift() {
    setLift({ kind: pick(KIND_LINES), quote: pick(QUOTES), joy: items.length ? pick(items) : null })
  }
  // Escape closes the lift overlay.
  useEffect(() => {
    if (!lift) return
    const onKey = (e) => { if (e.key === 'Escape') setLift(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lift])

  // Switch the store when the signed-in account changes.
  useEffect(() => { setItems(loadJoys(storageKey(user))); setMemoryIdx(0) }, [user?.id])
  // Persist every change.
  useEffect(() => { saveJoys(key, items); /* eslint-disable-next-line */ }, [items])

  function addJoy(e) {
    e?.preventDefault()
    const t = text.trim()
    if (!t) return
    setItems((prev) => [{ id: crypto.randomUUID(), text: t, createdAt: Date.now() }, ...prev])
    setText('')
    celebrate()
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2600)
  }
  function removeJoy(id) { setItems((prev) => prev.filter((i) => i.id !== id)) }

  // A memory to resurface: prefer ones from a while ago (>= 10 days),
  // otherwise any from before today. This is the "it found its way back" moment.
  const memories = useMemo(() => {
    const past = items.filter((i) => daysSince(i.createdAt) >= 1)
    const older = past.filter((i) => daysSince(i.createdAt) >= 10)
    return older.length ? older : past
  }, [items])
  const memory = memories.length ? memories[memoryIdx % memories.length] : null

  // Gentle, shame-free streak: consecutive days (ending today or yesterday)
  // with at least one moment. Never scolds a gap; just quietly encourages.
  const streak = useMemo(() => {
    const days = new Set(items.map((i) => dayBucket(i.createdAt)))
    const d = new Date()
    if (!days.has(dayBucket(d.getTime()))) d.setDate(d.getDate() - 1)
    let s = 0
    while (days.has(dayBucket(d.getTime()))) { s++; d.setDate(d.getDate() - 1) }
    return s
  }, [items])

  return (
    <div className="bg-cream">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-cream-light">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(110% 80% at 85% -10%, rgba(232,180,184,0.16), transparent 58%)' }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12 sm:pb-16">
          <p className="editorial-label text-clay">A jar of good days</p>
          <h1 className="font-display text-[clamp(2.6rem,9vw,4.5rem)] text-ink leading-[0.92] tracking-tight mt-3">
            <SplitText byChar stagger={26}>Collect the</SplitText>{' '}
            <span className="display-italic text-clay"><SplitText byChar stagger={26} startDelay={350}>small joys.</SplitText></span>
          </h1>
          <p className="text-lg text-ink-soft leading-relaxed mt-6 max-w-xl">
            Save the little things that made today lighter. Weeks or months from now,
            Quill will quietly bring one back to you, on a day you might need it.
          </p>
          {items.length > 0 && (
            <p className="editorial-label text-ink-softer mt-6">
              {items.length} small {items.length === 1 ? 'joy' : 'joys'} kept
              {streak >= 2 ? ` · ${streak} days noticing the good` : ''}
            </p>
          )}
          <button onClick={openLift} className="btn-clay mt-7">
            <span className="display-italic">✦</span> I need a lift
          </button>
        </div>
      </section>

      {/* ── A thought for today ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <Reveal>
          <SpotlightCard className="card-paper relative overflow-hidden p-8 sm:p-12 text-center">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(80% 80% at 50% 0%, rgba(90,107,93,0.10), transparent 60%)' }} />
            <div className="relative">
              <p className="editorial-label text-clay">A thought for today</p>
              <p className="font-display text-2xl sm:text-4xl text-ink leading-snug mt-4 max-w-3xl mx-auto text-balance">
                “{quote.t}”
              </p>
              {quote.a && <p className="display-italic text-ink-soft text-lg mt-4">{quote.a}</p>}
              <button
                onClick={() => setQuoteIdx((i) => i + 1)}
                className="mt-7 inline-flex items-center gap-2 text-xs font-medium text-clay hover:text-clay-dark transition-colors link-underline"
              >
                Another <span className="display-italic">→</span>
              </button>
            </div>
          </SpotlightCard>
        </Reveal>
      </section>

      {/* ── Resurfaced memory ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Reveal>
          <span className="editorial-label">Found its way back</span>
        </Reveal>
        <Reveal delay={120} className="mt-4">
          {memory ? (
            <SpotlightCard className="card-paper card-paper-hover relative overflow-hidden p-8 sm:p-12">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(80% 70% at 100% 0%, rgba(212,167,68,0.12), transparent 55%)' }} />
              <div className="relative">
                <p className="editorial-label text-clay">{whenLabel(memory.createdAt)} · {fullDate(memory.createdAt)}</p>
                <p className="font-display text-3xl sm:text-5xl text-ink leading-tight mt-3 max-w-3xl">
                  “{memory.text}”
                </p>
                <p className="display-italic text-ink-soft text-lg sm:text-xl mt-5">This made you happy. It still counts.</p>
                {memories.length > 1 && (
                  <button
                    onClick={() => setMemoryIdx((i) => i + 1)}
                    className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-clay hover:text-clay-dark transition-colors link-underline"
                  >
                    Show me another <span className="display-italic">→</span>
                  </button>
                )}
              </div>
            </SpotlightCard>
          ) : (
            <div className="card-paper p-8 sm:p-12">
              <p className="font-display text-2xl sm:text-3xl text-ink leading-snug max-w-2xl">
                Your first good moment is waiting.
              </p>
              <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">
                Save one below. In a little while it will find its way back to you here, a small surprise from your past self.
              </p>
            </div>
          )}
        </Reveal>
      </section>

      {/* ── Capture ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <Reveal>
          <SpotlightCard className="card-paper p-8 sm:p-12">
            <h2 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
              What made you <span className="display-italic text-clay">smile</span> today?
            </h2>
            <p className="text-sm text-ink-soft mt-2">{nudge} Even something tiny counts.</p>

            <form onSubmit={addJoy} className="mt-6">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="e.g. my neighbour took the bins out for me"
                className="w-full border border-ink/20 bg-cream px-4 py-3 text-base font-sans text-ink placeholder:text-ink-softer outline-none focus:border-ink transition-colors resize-none"
              />
              {/* inspiration chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setText(p)}
                    className="chip chip-cream text-[11px] hover:border-ink/40 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-4">
                <button type="submit" disabled={!text.trim()}
                  className="btn-ink disabled:opacity-40 disabled:cursor-not-allowed">
                  Keep this moment <span className="display-italic">→</span>
                </button>
                {justSaved && <span className="text-sm text-sage-dark display-italic animate-fade-in">Saved. See you again, later.</span>}
              </div>
            </form>
          </SpotlightCard>
        </Reveal>
      </section>

      {/* ── Collection ── */}
      {items.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-end justify-between gap-4 mb-6 pb-3 border-b border-ink/15">
            <span className="editorial-label">Your collection</span>
            <span className="text-[10px] num-display text-ink-softer uppercase tracking-[0.2em]">
              {items.length} {items.length === 1 ? 'moment' : 'moments'}
            </span>
          </div>
          <ul className="space-y-px bg-ink/10">
            {items.map((it) => (
              <li key={it.id} className="group bg-cream-light p-5 sm:p-6 flex items-start gap-4">
                <span className="editorial-num text-2xl text-clay/70 leading-none flex-shrink-0 mt-0.5">✿</span>
                <div className="min-w-0 flex-1">
                  <p className="text-ink leading-relaxed break-words">{it.text}</p>
                  <p className="editorial-label text-ink-softer mt-1">{whenLabel(it.createdAt)}</p>
                </div>
                <button
                  onClick={() => removeJoy(it.id)}
                  aria-label="Remove this moment"
                  className="flex-shrink-0 text-ink-softer hover:text-clay transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Gentle note ── */}
      <section className="border-t border-ink/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-sm text-ink-soft leading-relaxed max-w-2xl">
            <span className="font-semibold text-ink">Some days are heavy, and that's allowed.</span>{' '}
            This isn't about forcing a smile, just noticing the small good when it's there. If things
            feel really dark, please reach out to someone you trust or a professional. You deserve real care.
          </p>
          <p className="text-[10px] num-display text-ink-softer uppercase tracking-[0.2em] mt-4">
            Saved privately on this device · nothing is shared
          </p>
        </div>
      </section>

      {/* ── "I need a lift" overlay ── */}
      {lift && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cream/95 backdrop-blur-md animate-fade-in"
          role="dialog" aria-modal="true" aria-label="A moment for you"
          onClick={(e) => { if (e.target === e.currentTarget) setLift(null) }}
        >
          <div className="w-full max-w-lg bg-cream-light border border-ink/15 p-8 sm:p-10 text-center relative overflow-hidden">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(90% 80% at 50% 0%, rgba(232,180,184,0.18), transparent 60%)' }} />
            <div className="relative">
              <p className="editorial-label text-clay">A moment for you</p>
              <p className="font-display text-3xl sm:text-4xl text-ink leading-tight mt-4 text-balance">
                {lift.kind}
              </p>

              {lift.joy && (
                <div className="mt-7 pt-6 border-t border-ink/10">
                  <p className="editorial-label text-ink-softer">Something you loved · {whenLabel(lift.joy.createdAt)}</p>
                  <p className="display-italic text-xl sm:text-2xl text-ink mt-2 leading-snug">“{lift.joy.text}”</p>
                </div>
              )}

              <div className="mt-7">
                <p className="text-ink-soft leading-relaxed">“{lift.quote.t}”</p>
                {lift.quote.a && <p className="display-italic text-ink-softer text-sm mt-2">{lift.quote.a}</p>}
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                <button onClick={nextLift} className="btn-cream">Another</button>
                <button onClick={() => setLift(null)} className="btn-ink">I’m okay for now</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
