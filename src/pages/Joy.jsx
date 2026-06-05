import { useState, useEffect, useMemo } from 'react'
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
  const [justSaved, setJustSaved] = useState(false)

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
        </div>
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
            <p className="text-sm text-ink-soft mt-2">Even something tiny. Especially something tiny.</p>

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
    </div>
  )
}
