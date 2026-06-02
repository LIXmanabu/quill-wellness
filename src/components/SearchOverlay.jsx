import { useState, useEffect, useRef, useMemo } from 'react'
import { dailyTips } from '../data/dailyTips.js'

/*
  Full-screen search — the app's jump-to-anything affordance.
  Indexes every destination (with synonyms) plus the 60 daily tips, so content
  that lives under "More" (Skin, Diet, Wellness…) is discoverable by typing.
  Keyboard: ↑/↓ to move, Enter to open, Esc to close. Touch: tap a result.
*/

// Every destination with plain-language description + search synonyms.
const SECTIONS = [
  { key: 'today',    label: 'Today',        desc: 'Your one gentle thing for today',        kw: 'daily routine plan now do' },
  { key: 'body',     label: 'Body Atlas',   desc: 'Tap any area to explore care',            kw: 'anatomy map atlas pain ache region' },
  { key: 'sport',    label: 'Movement',     desc: 'Beginner-safe exercise & stretching',     kw: 'exercise workout fitness sport stretch strength yoga walk' },
  { key: 'skincare', label: 'Skin ritual',  desc: 'Simple routines for every skin type',     kw: 'skin skincare spf acne dry oily routine cleanse moisturize' },
  { key: 'wellness', label: 'Wellness',     desc: 'Sleep, stress, mood & breathing',         kw: 'sleep stress mood mindfulness breathing calm anxiety rest' },
  { key: 'diet',     label: 'Nourishment',  desc: 'Food, macros & meal templates',           kw: 'diet food nutrition meal macros eating recipe protein' },
  { key: 'tips',     label: 'Daily tips',   desc: '60 evidence-informed wellness tips',       kw: 'tips advice library ideas' },
  { key: 'myquill',  label: 'Your Quill',   desc: 'Saved favourites & your routine',          kw: 'favorites favourites saved profile me mine bookmarks' },
  { key: 'pro',      label: 'Pro & Max',    desc: 'Unlock all tools',                          kw: 'upgrade premium max subscription plan price' },
  { key: 'about',    label: 'About Quill',  desc: 'Our approach & privacy',                    kw: 'about info privacy data contact' },
  { key: 'home',     label: 'Home',         desc: 'The cover of this issue',                  kw: 'start cover front' },
]

const norm = (s) => s.toLowerCase()

export default function SearchOverlay({ onClose, onNavigate }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const results = useMemo(() => {
    const term = norm(q.trim())
    if (!term) {
      // Empty query → show all destinations as a browse hub.
      return SECTIONS.map((s) => ({ type: 'section', ...s }))
    }
    const terms = term.split(/\s+/)
    const match = (hay) => terms.every((t) => norm(hay).includes(t))

    const sections = SECTIONS
      .filter((s) => match(`${s.label} ${s.desc} ${s.kw}`))
      .map((s) => ({ type: 'section', ...s }))

    const tips = dailyTips
      .filter((t) => match(`${t.title} ${t.body} ${t.category}`))
      .slice(0, 8)
      .map((t) => ({ type: 'tip', key: `tip-${t.id}`, label: t.title, desc: t.body, category: t.category, icon: t.icon }))

    return [...sections, ...tips]
  }, [q])

  // Keep active index in range when results change.
  useEffect(() => { setActive(0) }, [q])

  function choose(item) {
    if (!item) return
    onNavigate(item.type === 'tip' ? 'tips' : item.key)
    onClose()
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); choose(results[active]) }
  }

  // Scroll the active row into view.
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-cream animate-fade-in pt-[env(safe-area-inset-top)]"
      role="dialog"
      aria-modal="true"
      aria-label="Search Quill"
      onKeyDown={onKeyDown}
    >
      {/* Search field */}
      <div className="border-b border-ink/12">
        <div className="max-w-2xl mx-auto w-full px-4 flex items-center gap-3 h-16">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"
               className="text-ink-soft shrink-0" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sections and tips…"
            aria-label="Search query"
            aria-controls="search-results"
            className="flex-1 bg-transparent text-lg font-display text-ink placeholder:text-ink-softer focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-soft hover:text-ink focus-visible:ring-2 focus-visible:ring-clay rounded"
          >
            <span className="text-sm font-medium uppercase tracking-[0.15em]">Esc</span>
          </button>
        </div>
      </div>

      {/* Results */}
      <div ref={listRef} id="search-results" className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <div className="max-w-2xl mx-auto w-full px-4 py-3">
          {q.trim() === '' && (
            <p className="editorial-label text-ink-softer px-1 py-2">Browse everything</p>
          )}
          {results.length === 0 && (
            <p className="text-ink-soft px-1 py-8 text-center">
              No matches for "<span className="text-ink">{q}</span>". Try "sleep", "skin", or "protein".
            </p>
          )}
          <ul role="listbox" aria-label="Results">
            {results.map((r, i) => (
              <li key={r.key} role="option" aria-selected={i === active} data-idx={i}>
                <button
                  onClick={() => choose(r)}
                  onMouseEnter={() => setActive(i)}
                  className={`w-full text-left flex items-baseline gap-3 px-3 min-h-[56px] py-2 border-b border-ink/5 transition-colors rounded-sm ${
                    i === active ? 'bg-bone' : 'active:bg-bone/60'
                  }`}
                >
                  <span className="text-base w-6 shrink-0" aria-hidden="true">
                    {r.type === 'tip' ? r.icon : <span className="num-display text-[11px] text-clay">{String(i + 1).padStart(2, '0')}</span>}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-lg text-ink">{r.label}</span>
                      <span className="editorial-label text-ink-softer">{r.type === 'tip' ? r.category : 'Section'}</span>
                    </span>
                    <span className="block text-sm text-ink-soft leading-snug line-clamp-2">{r.desc}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
