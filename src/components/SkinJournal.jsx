import { useState, useEffect, useRef, useMemo } from 'react'
import Reveal from './interactive/Reveal.jsx'
import SpotlightCard from './interactive/SpotlightCard.jsx'
import ConfirmButton from './ConfirmButton.jsx'

/**
 * Skin Journal, a private, on-device skin log. Take a photo (or upload),
 * tag what you notice on each face zone, add a sleep rating + notes, save.
 * Over time you see your own patterns, not a comparison to anyone else.
 *
 * Storage: localStorage. Photos are scaled to 240×240 JPEG q=0.55 (≈30 KB
 * each) before saving, so 12 entries fit comfortably under the 5 MB quota.
 * Nothing is ever uploaded.
 */

const STORAGE_KEY = 'quill.skin.journal'
const MAX_ENTRIES = 12
const THUMB_SIZE = 240

const conditions = [
  { id: 'smooth',    label: 'Smooth',    color: '#5A6B5D', desc: 'Clear, even, comfortable' },
  { id: 'dry',       label: 'Dry',       color: '#C8654A', desc: 'Tight, flaky, parched' },
  { id: 'oily',      label: 'Oily',      color: '#D4A744', desc: 'Shiny, slick to touch' },
  { id: 'red',       label: 'Red',       color: '#9B4423', desc: 'Inflamed, flushed, visible vessels' },
  { id: 'breakout',  label: 'Breakout',  color: '#6B2D1A', desc: 'Spots, congestion, blackheads' },
  { id: 'sensitive', label: 'Sensitive', color: '#E8B4B8', desc: 'Stinging, reactive, tight' },
]

const zones = [
  { id: 'forehead',  label: 'Forehead',   x: 50, y: 22 },
  { id: 'leftEye',   label: 'L eye area', x: 32, y: 40 },
  { id: 'rightEye',  label: 'R eye area', x: 68, y: 40 },
  { id: 'nose',      label: 'Nose',       x: 50, y: 50 },
  { id: 'leftCheek', label: 'L cheek',    x: 30, y: 58 },
  { id: 'rightCheek',label: 'R cheek',    x: 70, y: 58 },
  { id: 'chin',      label: 'Chin / jaw', x: 50, y: 76 },
]

function dayLabel(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function daysAgo(iso) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return '1 day ago'
  return `${d} days ago`
}

// Take a File or HTMLImageElement, produce a square thumbnail data URL
async function fileToThumb(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = THUMB_SIZE
        canvas.height = THUMB_SIZE
        const ctx = canvas.getContext('2d')
        // Cover-fit crop to square
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, THUMB_SIZE, THUMB_SIZE)
        resolve(canvas.toDataURL('image/jpeg', 0.55))
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function SkinJournal() {
  const [store, setStore] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return { entries: [] }
  })
  const [thumb, setThumb] = useState(null)
  const [tags, setTags] = useState({}) // { zoneId: [conditionId, ...] }
  const [activeZone, setActiveZone] = useState(null)
  const [sleep, setSleep] = useState(7)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)) } catch (err) {
      console.warn('Skin journal storage full', err)
    }
  }, [store])

  async function handleFile(file) {
    if (!file) return
    setBusy(true)
    try {
      const dataUrl = await fileToThumb(file)
      setThumb(dataUrl)
    } catch {
      alert('Could not read that photo. Try another.')
    } finally {
      setBusy(false)
    }
  }

  function toggleTag(zone, cond) {
    setTags((t) => {
      const list = new Set(t[zone] || [])
      if (list.has(cond)) list.delete(cond)
      else list.add(cond)
      return { ...t, [zone]: Array.from(list) }
    })
  }

  function reset() {
    setThumb(null); setTags({}); setActiveZone(null); setSleep(7); setNotes('')
    if (fileRef.current) fileRef.current.value = ''
  }

  function save() {
    const hasAnyTag = Object.values(tags).some((arr) => arr && arr.length > 0)
    if (!hasAnyTag && !notes.trim() && !thumb) {
      alert('Add a photo, tag a zone, or write a note before saving.')
      return
    }
    const entry = {
      id: `e-${Date.now()}`,
      date: new Date().toISOString(),
      thumb,
      tags: { ...tags },
      sleep: Number(sleep),
      notes: notes.trim().slice(0, 240),
    }
    setStore((s) => ({ entries: [entry, ...s.entries].slice(0, MAX_ENTRIES) }))
    reset()
  }

  function remove(id) {
    setStore((s) => ({ entries: s.entries.filter((e) => e.id !== id) }))
  }

  function clearAll() {
    setStore({ entries: [] })
  }

  // Insights from the last 30 days
  const insights = useMemo(() => {
    const cutoff = Date.now() - 30 * 86400000
    const recent = store.entries.filter((e) => new Date(e.date).getTime() >= cutoff)
    if (recent.length === 0) return null

    const condCount = {}
    const zoneCount = {}
    let sleepTotal = 0
    for (const e of recent) {
      sleepTotal += e.sleep || 0
      for (const [zone, list] of Object.entries(e.tags || {})) {
        for (const c of list) {
          condCount[c] = (condCount[c] || 0) + 1
          zoneCount[zone] = (zoneCount[zone] || 0) + 1
        }
      }
    }
    const topCond = Object.entries(condCount).sort((a, b) => b[1] - a[1])[0]
    const topZone = Object.entries(zoneCount).sort((a, b) => b[1] - a[1])[0]
    const avgSleep = recent.length ? Math.round((sleepTotal / recent.length) * 10) / 10 : null

    return {
      entries: recent.length,
      topCondition: topCond ? { id: topCond[0], count: topCond[1] } : null,
      topZone: topZone ? { id: topZone[0], count: topZone[1] } : null,
      avgSleep,
    }
  }, [store.entries])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="skin-journal">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15 flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="editorial-label">Skin journal</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              Your skin, <span className="display-italic text-clay">your own data.</span>
            </h2>
            <p className="text-sm text-ink-soft mt-3 max-w-xl">
              Take a photo, tap the zones, log what you notice. Quill remembers, so over weeks you see how <em>your</em> skin actually changes. No comparisons, no scoring, no sharing. Everything stays on this device.
            </p>
          </div>
          {store.entries.length > 0 && (
            <ConfirmButton onConfirm={clearAll} question={`Delete all ${store.entries.length} entries?`} confirm="Delete all" className="text-xs text-ink-soft hover:text-clay transition-colors display-italic">
              clear all data
            </ConfirmButton>
          )}
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT, capture + face map */}
        <Reveal className="lg:col-span-7">
          <div className="border border-ink/15 bg-cream-light p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-6">
              {/* Photo column */}
              <div>
                <div className="aspect-square bg-bone border border-ink/15 relative overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt="Your skin today" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <span className="num-display text-5xl text-ink-softer">◐</span>
                      <p className="text-xs text-ink-soft mt-2 leading-snug">Add a photo<br/>(optional)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="hidden"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={busy}
                    className="flex-1 px-3 py-2 text-xs font-medium border border-ink/20 hover:border-ink hover:bg-bone transition-all disabled:opacity-50"
                  >
                    {busy ? 'Reading…' : thumb ? 'Replace photo' : 'Add photo'}
                  </button>
                  {thumb && (
                    <button
                      onClick={() => setThumb(null)}
                      className="px-3 py-2 text-xs text-ink-soft hover:text-clay transition-colors display-italic"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-ink-softer mt-2 italic leading-relaxed">
                  Stays on this device. Scaled to {THUMB_SIZE}×{THUMB_SIZE} before save.
                </p>
              </div>

              {/* Face map column */}
              <div>
                <span className="editorial-label block mb-2">Tap a zone to tag</span>
                <div className="relative aspect-[3/4] bg-bone border border-ink/15">
                  {/* Face silhouette */}
                  <svg viewBox="0 0 100 130" className="absolute inset-0 w-full h-full" aria-hidden="true">
                    <ellipse cx="50" cy="55" rx="32" ry="44" fill="none" stroke="#1A1410" strokeWidth="0.5" strokeOpacity="0.3" />
                    <path d="M 30 38 q 4 -4 8 0" fill="none" stroke="#1A1410" strokeWidth="0.4" strokeOpacity="0.25" />
                    <path d="M 62 38 q 4 -4 8 0" fill="none" stroke="#1A1410" strokeWidth="0.4" strokeOpacity="0.25" />
                    <path d="M 48 48 q 2 6 0 10 q -2 2 4 2" fill="none" stroke="#1A1410" strokeWidth="0.4" strokeOpacity="0.25" />
                    <path d="M 42 72 q 8 4 16 0" fill="none" stroke="#1A1410" strokeWidth="0.4" strokeOpacity="0.25" />
                  </svg>
                  {/* Zone dots */}
                  {zones.map((z) => {
                    const taggedHere = (tags[z.id] || []).length
                    const active = activeZone === z.id
                    return (
                      <button
                        key={z.id}
                        onClick={() => setActiveZone(active ? null : z.id)}
                        style={{ left: `${z.x}%`, top: `${z.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                          active
                            ? 'bg-ink text-cream border-ink scale-110'
                            : taggedHere > 0
                              ? 'bg-clay text-cream border-clay'
                              : 'bg-cream border-ink/40 text-ink-softer hover:border-ink'
                        }`}
                        title={z.label}
                      >
                        {taggedHere > 0 ? taggedHere : ''}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
                  {zones.map((z) => (
                    <button
                      key={z.id}
                      onClick={() => setActiveZone(z.id)}
                      className={`px-2 py-0.5 border ${activeZone === z.id ? 'bg-ink text-cream border-ink' : 'border-ink/15 text-ink-soft hover:border-ink'}`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Condition tagger for active zone */}
            {activeZone && (
              <div className="mt-6 pt-5 border-t border-ink/10">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="editorial-label">
                    Tag conditions on <span className="text-clay">{zones.find((z) => z.id === activeZone).label}</span>
                  </span>
                  <button onClick={() => setActiveZone(null)} className="text-xs text-ink-soft hover:text-clay display-italic">done</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {conditions.map((c) => {
                    const on = (tags[activeZone] || []).includes(c.id)
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleTag(activeZone, c.id)}
                        className={`text-left p-3 border transition-all ${on ? 'border-ink' : 'border-ink/15 hover:border-ink/40'}`}
                        style={on ? { background: c.color + '22', borderColor: c.color } : {}}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c.color }} />
                          <span className="font-medium text-sm">{c.label}</span>
                          {on && <span className="ml-auto text-clay display-italic">✓</span>}
                        </div>
                        <p className="text-[10px] text-ink-softer mt-1 leading-snug">{c.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Sleep + notes + save */}
            <div className="mt-6 pt-5 border-t border-ink/10 space-y-4">
              <div>
                <span className="editorial-label block mb-1.5">Last night's sleep · {sleep}/10</span>
                <input
                  type="range" min="1" max="10" step="1"
                  value={sleep}
                  onChange={(e) => setSleep(Number(e.target.value))}
                  className="w-full accent-ink"
                />
              </div>
              <div>
                <span className="editorial-label block mb-1.5">Notes <span className="text-ink-softer normal-case">(optional)</span></span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 240))}
                  rows={2}
                  placeholder="What changed today? Any new product, food, stress?"
                  className="w-full bg-cream border border-ink/20 px-3 py-2 text-sm focus:outline-none focus:border-ink"
                />
                <p className="text-[10px] text-ink-softer mt-1 text-right">{notes.length}/240</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={save} className="btn-ink flex-1 justify-center" data-cursor-label="save entry">
                  Save entry <span className="display-italic">→</span>
                </button>
                <button onClick={reset} className="text-xs text-ink-soft hover:text-clay display-italic">
                  reset
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* RIGHT, insights + history */}
        <div className="lg:col-span-5 space-y-6">
          {/* Insights */}
          {insights && (
            <Reveal>
              <SpotlightCard className="bg-ink text-cream p-6 sm:p-7 relative overflow-hidden rainbow-frame">
                <span className="editorial-label text-gold">Last 30 days · {insights.entries} {insights.entries === 1 ? 'entry' : 'entries'}</span>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {insights.topCondition && (
                    <div>
                      <p className="text-[10px] text-cream/60 uppercase tracking-[0.15em]">Most tagged</p>
                      <p className="font-display text-xl mt-1">{conditions.find((c) => c.id === insights.topCondition.id)?.label}</p>
                      <p className="text-[10px] text-cream/60 mt-0.5">{insights.topCondition.count} times</p>
                    </div>
                  )}
                  {insights.topZone && (
                    <div>
                      <p className="text-[10px] text-cream/60 uppercase tracking-[0.15em]">Most-affected zone</p>
                      <p className="font-display text-xl mt-1">{zones.find((z) => z.id === insights.topZone.id)?.label}</p>
                      <p className="text-[10px] text-cream/60 mt-0.5">{insights.topZone.count} tags</p>
                    </div>
                  )}
                  {insights.avgSleep != null && (
                    <div>
                      <p className="text-[10px] text-cream/60 uppercase tracking-[0.15em]">Avg sleep</p>
                      <p className="num-display text-2xl mt-1 text-gold">{insights.avgSleep}/10</p>
                    </div>
                  )}
                </div>
                <p className="display-italic text-sm text-cream/80 mt-5 leading-relaxed">
                  Patterns mean more than single readings. Keep going, the more days you log, the clearer your skin's story gets.
                </p>
              </SpotlightCard>
            </Reveal>
          )}

          {/* Timeline */}
          <Reveal>
            <div className="border border-ink/15 bg-cream-light">
              <div className="px-5 py-4 border-b border-ink/10">
                <span className="editorial-label">Timeline</span>
                <p className="font-display text-xl text-ink mt-0.5">
                  {store.entries.length} of {MAX_ENTRIES} saved
                </p>
              </div>
              {store.entries.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="font-display text-2xl text-ink-softer italic">No entries yet.</p>
                  <p className="text-xs text-ink-soft mt-2">Save your first one to start the trail.</p>
                </div>
              ) : (
                <div className="divide-y divide-ink/10 max-h-[480px] overflow-y-auto panel-scroll">
                  {store.entries.map((e) => {
                    const allTags = Object.entries(e.tags || {}).flatMap(([zone, list]) =>
                      list.map((c) => ({ zone, cond: c }))
                    )
                    return (
                      <div key={e.id} className="p-4 flex gap-4 group">
                        <div className="w-16 h-16 flex-shrink-0 bg-bone border border-ink/10 overflow-hidden">
                          {e.thumb ? (
                            <img src={e.thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-ink-softer text-2xl num-display">◐</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="font-medium text-sm text-ink">{dayLabel(e.date)}</p>
                            <p className="text-[10px] text-ink-softer">{daysAgo(e.date)} · sleep {e.sleep}/10</p>
                          </div>
                          {allTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {allTags.slice(0, 6).map((t, i) => {
                                const c = conditions.find((x) => x.id === t.cond)
                                return (
                                  <span key={i} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 border" style={{ borderColor: c?.color, color: c?.color }}>
                                    {c?.label}
                                  </span>
                                )
                              })}
                              {allTags.length > 6 && <span className="text-[10px] text-ink-softer">+{allTags.length - 6}</span>}
                            </div>
                          )}
                          {e.notes && (
                            <p className="text-xs text-ink-soft italic mt-1.5 leading-snug line-clamp-2">"{e.notes}"</p>
                          )}
                        </div>
                        <ConfirmButton
                          onConfirm={() => remove(e.id)}
                          question="Delete?"
                          confirm="Delete"
                          aria-label="Delete entry"
                          className="opacity-0 group-hover:opacity-100 text-xs text-ink-softer hover:text-clay transition-all display-italic self-start"
                          armedClassName="self-start"
                        >
                          ✕
                        </ConfirmButton>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Reveal>

          <p className="text-[10px] text-ink-softer italic leading-relaxed">
            This is a personal mirror, not a diagnosis. Persistent changes or anything painful → see a dermatologist.
          </p>
        </div>
      </div>
    </section>
  )
}
