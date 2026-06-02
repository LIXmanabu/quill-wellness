import { useState, useEffect, useMemo } from 'react'
import Reveal from './interactive/Reveal.jsx'
import TierBadge from './TierBadge.jsx'

const STORAGE_KEY = 'quill.habits'

const presetHabits = [
  { id: 'water', label: 'Glass of water before coffee' },
  { id: 'walk', label: '2-min walk after meals' },
  { id: 'spf', label: 'SPF every morning' },
  { id: 'protein', label: 'Protein at breakfast' },
  { id: 'breath', label: 'Box breathing × 4' },
  { id: 'sunlight', label: '10 min morning sunlight' },
  { id: 'stretch', label: '2 min stretching' },
  { id: 'screens-off', label: 'No screens in bed' },
  { id: 'gratitude', label: 'Three good things journal' },
]

function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getStreak(checks, todayKey) {
  // checks: { 'YYYY-MM-DD': true }
  let streak = 0
  const d = new Date(todayKey)
  while (true) {
    const k = dayKey(d)
    if (!checks[k]) break
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

function getLast14(checks, todayKey) {
  const days = []
  const today = new Date(todayKey)
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const k = dayKey(d)
    days.push({ key: k, done: !!checks[k] })
  }
  return days
}

export default function HabitStreaks() {
  const [store, setStore] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return { active: ['water', 'walk', 'spf'], checks: {} }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)) } catch {}
  }, [store])

  const today = dayKey()

  function toggleHabit(id) {
    setStore((prev) => ({
      ...prev,
      active: prev.active.includes(id)
        ? prev.active.filter((x) => x !== id)
        : [...prev.active, id],
    }))
  }

  function toggleCheck(id) {
    setStore((prev) => {
      const checks = { ...(prev.checks || {}) }
      checks[id] = checks[id] || {}
      checks[id] = { ...checks[id], [today]: !checks[id][today] }
      return { ...prev, checks }
    })
  }

  const activeHabits = useMemo(
    () => presetHabits.filter((h) => store.active.includes(h.id)),
    [store.active]
  )

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="habit-streaks">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15">
          <span className="editorial-label flex items-center gap-2">
            Daily habit streaks <TierBadge />
          </span>
          <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
            Small things, <span className="display-italic text-clay">stacked daily.</span>
          </h2>
          <p className="text-sm text-ink-soft mt-3 max-w-xl">
            Pick the habits that matter. Tap the dot for today's check-in. Watch the streak — and the 14-day pattern — build.
          </p>
        </div>
      </Reveal>

      {activeHabits.length === 0 ? (
        <Reveal>
          <div className="card-paper p-12 text-center">
            <p className="font-display text-2xl text-ink">No habits chosen yet</p>
            <p className="text-sm text-ink-soft mt-2">Pick from the list below to start tracking.</p>
          </div>
        </Reveal>
      ) : (
        <Reveal>
          <div className="space-y-px bg-ink/15 border border-ink/15 mb-6">
            {activeHabits.map((h) => {
              const checks = store.checks?.[h.id] || {}
              const streak = getStreak(checks, today)
              const last14 = getLast14(checks, today)
              const doneToday = !!checks[today]
              return (
                <div key={h.id} className="bg-cream-light p-5 flex items-center gap-5 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => toggleCheck(h.id)}
                    aria-pressed={doneToday}
                    aria-label={`Toggle ${h.label}`}
                    className={`w-12 h-12 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                      doneToday
                        ? 'bg-ink border-ink text-cream'
                        : 'border-ink/30 text-ink-softer hover:border-ink hover:text-ink'
                    }`}
                  >
                    <span className="display-italic text-xl">{doneToday ? '✓' : '○'}</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xl text-ink leading-tight">{h.label}</p>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="editorial-label">Streak</span>
                      <span className="num-display text-2xl text-clay leading-none">{streak}</span>
                      <span className="text-xs text-ink-soft">day{streak === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                  {/* 14-day grid */}
                  <div className="flex gap-1">
                    {last14.map((d) => (
                      <span
                        key={d.key}
                        title={d.key + (d.done ? ' ✓' : '')}
                        className="w-3 h-6"
                        style={{
                          background: d.done ? '#5A6B5D' : '#E8DFD0',
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => toggleHabit(h.id)}
                    className="text-[10px] text-ink-soft hover:text-clay transition-colors display-italic"
                    aria-label={`Remove ${h.label}`}
                  >
                    remove
                  </button>
                </div>
              )
            })}
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="border border-ink/15 bg-bone p-5">
          <span className="editorial-label">Add a habit</span>
          <div className="flex flex-wrap gap-2 mt-3">
            {presetHabits.filter((h) => !store.active.includes(h.id)).map((h) => (
              <button
                key={h.id}
                onClick={() => toggleHabit(h.id)}
                className="px-3 py-1.5 text-xs font-medium border border-ink/20 text-ink hover:border-ink hover:bg-cream-light transition-all"
              >
                + {h.label}
              </button>
            ))}
            {presetHabits.every((h) => store.active.includes(h.id)) && (
              <span className="text-xs text-ink-softer italic">All habits added.</span>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
