import { useState, useEffect, useMemo, useRef } from 'react'
import { foods, categoryStyles, goalTargets, suggestNext, slotLabel, currentMealSlot } from '../data/foodDatabase.js'
import Reveal from './interactive/Reveal.jsx'
import SpotlightCard from './interactive/SpotlightCard.jsx'
import TierBadge from './TierBadge.jsx'

const STORAGE_KEY = 'quill.diet.log'

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function useDietLog() {
  const [log, setLog] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return {}
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)) } catch {}
  }, [log])

  const day = todayKey()
  const todays = log[day] || []

  function add(food, servings, slot) {
    const inc = Number(servings) || 1
    setLog((prev) => {
      const list = prev[day] || []
      // If this food+slot already exists, increment its servings instead
      // of creating a new entry. Stops "17 portions of salmon" from
      // building up when the user clicks Add multiple times.
      const existingIdx = list.findIndex((e) => e.id === food.id && e.slot === slot)
      if (existingIdx >= 0) {
        const next = [...list]
        next[existingIdx] = { ...next[existingIdx], servings: next[existingIdx].servings + inc }
        return { ...prev, [day]: next }
      }
      const entry = {
        id: food.id,
        name: food.name,
        serving: food.serving,
        kcal: food.kcal, p: food.p, c: food.c, f: food.f, fib: food.fib,
        cat: food.cat,
        servings: inc,
        slot,
        at: new Date().toISOString(),
        uid: `${food.id}-${slot}-${Date.now()}`,
      }
      return { ...prev, [day]: [...list, entry] }
    })
  }

  function setServings(uid, newServings) {
    const n = Math.max(0, Number(newServings) || 0)
    setLog((prev) => {
      const list = prev[day] || []
      if (n === 0) {
        return { ...prev, [day]: list.filter((e) => e.uid !== uid) }
      }
      return { ...prev, [day]: list.map((e) => e.uid === uid ? { ...e, servings: n } : e) }
    })
  }

  function remove(uid) {
    setLog((prev) => ({ ...prev, [day]: (prev[day] || []).filter((e) => e.uid !== uid) }))
  }

  function clearDay() {
    setLog((prev) => ({ ...prev, [day]: [] }))
  }

  return { todays, add, setServings, remove, clearDay }
}

function MacroBar({ label, current, target, accent }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  const over = current > target
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="editorial-label">{label}</span>
        <span className="text-xs text-ink-soft">
          <span className="num-display text-ink text-base">{Math.round(current)}</span>
          <span className="text-ink-softer"> / {target}{label === 'Calories' ? ' kcal' : ' g'}</span>
        </span>
      </div>
      <div className="h-1.5 bg-bone border border-ink/10 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: over ? '#C8654A' : accent,
          }}
        />
      </div>
    </div>
  )
}

export default function DietTracker({ initialGoal = 'balanced' }) {
  const { todays, add, setServings, remove, clearDay } = useDietLog()
  const [goal, setGoal] = useState(initialGoal)
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const queryRef = useRef(null)

  const target = goalTargets[goal] || goalTargets.balanced

  const totals = useMemo(() => todays.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal * m.servings,
      p: acc.p + m.p * m.servings,
      c: acc.c + m.c * m.servings,
      f: acc.f + m.f * m.servings,
      fib: acc.fib + m.fib * m.servings,
    }),
    { kcal: 0, p: 0, c: 0, f: 0, fib: 0 }
  ), [todays])

  const suggestion = useMemo(() => suggestNext({ logged: todays, target }), [todays, target])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return showAll ? foods : foods.slice(0, 12)
    return foods.filter((f) => f.name.toLowerCase().includes(q) || f.cat.includes(q))
  }, [query, showAll])

  const activeSlot = selectedSlot || currentMealSlot(new Date(), todays)

  function handleAdd(food) {
    add(food, 1, activeSlot)
    setQuery('')
  }

  const slotOrder = ['breakfast', 'lunch', 'dinner', 'snack']
  const todayDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="diet-tracker">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15 flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="editorial-label flex items-center gap-2">
              Track your day <TierBadge />
            </span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              What you ate <span className="display-italic text-clay">today.</span>
            </h2>
            <p className="text-sm text-ink-soft mt-3 max-w-xl">
              Log what you eat. Quill scores your day against your goal and suggests the next snack or meal to fill in what's missing.
            </p>
          </div>
          <div className="text-right">
            <p className="editorial-label">{todayDate}</p>
            <p className="display-italic text-2xl text-clay mt-1">your day</p>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT, Dashboard + suggestion */}
        <div className="lg:col-span-7 space-y-6">

          {/* Goal selector + macros */}
          <Reveal>
            <div className="border border-ink/15 bg-cream-light p-6 sm:p-8">
              <div className="flex items-baseline justify-between mb-5 pb-4 border-b border-ink/10">
                <div>
                  <span className="editorial-label">Today's totals</span>
                  <p className="font-display text-3xl text-ink mt-1">vs. {target.label}</p>
                </div>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="bg-cream-light border border-ink/20 px-3 py-1.5 text-xs font-medium tracking-wide hover:border-ink transition-colors cursor-pointer"
                  data-cursor-label="change goal"
                >
                  {Object.entries(goalTargets).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <MacroBar label="Calories" current={totals.kcal} target={target.kcal} accent="#1A1410" />
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <MacroBar label="Protein" current={totals.p} target={target.p} accent="#3D4A40" />
                  <MacroBar label="Carbs" current={totals.c} target={target.c} accent="#B08A2E" />
                  <MacroBar label="Fat" current={totals.f} target={target.f} accent="#9B4423" />
                  <MacroBar label="Fibre" current={totals.fib} target={target.fib} accent="#5A6B5D" />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Suggestion */}
          <Reveal>
            <SpotlightCard className="bg-ink text-cream p-6 sm:p-8 relative overflow-hidden rainbow-frame">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <span className="editorial-label text-gold">Next up · {slotLabel(suggestion.slot)}</span>
                  <h3 className="font-display text-3xl sm:text-4xl mt-2 leading-tight">
                    {suggestion.food.name}
                  </h3>
                  <p className="text-cream/70 text-sm mt-1">{suggestion.food.serving} · {suggestion.food.kcal} kcal</p>
                  <p className="display-italic text-cream/80 text-base mt-4 leading-relaxed">
                    {suggestion.reason}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5 text-[10px]">
                    <span className="border border-cream/30 px-2 py-1 text-cream/80">
                      <span className="num-display text-cream text-base">{suggestion.food.p}</span>g protein
                    </span>
                    <span className="border border-cream/30 px-2 py-1 text-cream/80">
                      <span className="num-display text-cream text-base">{suggestion.food.c}</span>g carbs
                    </span>
                    <span className="border border-cream/30 px-2 py-1 text-cream/80">
                      <span className="num-display text-cream text-base">{suggestion.food.fib}</span>g fibre
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => add(suggestion.food, 1, suggestion.slot)}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gold text-ink text-sm font-medium tracking-wide hover:bg-gold-light transition-colors"
                  data-cursor-label="log this"
                >
                  Log it <span className="display-italic">→</span>
                </button>
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Timeline of meals */}
          <Reveal>
            <div className="border border-ink/15 bg-cream-light">
              <div className="px-6 py-4 border-b border-ink/10 flex items-baseline justify-between">
                <span className="editorial-label">Today's timeline</span>
                {todays.length > 0 && (
                  <button
                    onClick={clearDay}
                    className="text-xs text-ink-soft hover:text-clay transition-colors display-italic"
                    data-cursor-label="clear day"
                  >
                    clear day
                  </button>
                )}
              </div>
              {todays.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="font-display text-2xl text-ink-softer italic">No meals yet today.</p>
                  <p className="text-xs text-ink-soft mt-2">Add your first food from the right.</p>
                </div>
              ) : (
                <div className="divide-y divide-ink/10">
                  {slotOrder.map((slot) => {
                    const meals = todays.filter((m) => m.slot === slot)
                    if (meals.length === 0) return null
                    return (
                      <div key={slot} className="px-6 py-4">
                        <p className="editorial-label mb-3">{slotLabel(slot)}</p>
                        <ul className="space-y-2">
                          {meals.map((m) => {
                            const style = categoryStyles[m.cat] || categoryStyles.composed
                            return (
                              <li key={m.uid} className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: style.dot }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-ink leading-tight">{m.name}</p>
                                  <p className="text-[11px] text-ink-softer mt-0.5">
                                    {m.serving} · {Math.round(m.kcal * m.servings)} kcal · {Math.round(m.p * m.servings)}p / {Math.round(m.c * m.servings)}c / {Math.round(m.f * m.servings)}f
                                  </p>
                                </div>
                                {/* Servings stepper, always visible, touch-friendly */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => setServings(m.uid, m.servings - 1)}
                                    aria-label="Decrease servings"
                                    className="w-7 h-7 flex items-center justify-center border border-ink/20 hover:border-ink hover:bg-bone text-ink text-base leading-none transition-all"
                                  >
                                    −
                                  </button>
                                  <span className="num-display text-sm text-ink min-w-[20px] text-center">{m.servings}×</span>
                                  <button
                                    onClick={() => setServings(m.uid, m.servings + 1)}
                                    aria-label="Increase servings"
                                    className="w-7 h-7 flex items-center justify-center border border-ink/20 hover:border-ink hover:bg-bone text-ink text-base leading-none transition-all"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() => remove(m.uid)}
                                  aria-label={`Remove ${m.name}`}
                                  className="w-7 h-7 flex items-center justify-center text-ink-softer hover:text-cream hover:bg-clay border border-ink/15 hover:border-clay transition-all text-xs flex-shrink-0"
                                  data-cursor-label="remove"
                                >
                                  ✕
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* RIGHT, Food picker */}
        <div className="lg:col-span-5">
          <Reveal>
            <div className="border border-ink/15 bg-cream-light sticky top-28">
              <div className="px-6 py-4 border-b border-ink/10">
                <span className="editorial-label">Log a food</span>
                <p className="font-display text-2xl text-ink mt-1 leading-tight">What did you eat?</p>
              </div>

              {/* Slot picker */}
              <div className="px-6 py-3 border-b border-ink/10 flex gap-1.5 flex-wrap bg-bone">
                {slotOrder.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSlot(s)}
                    className={`px-2.5 py-1 text-[11px] font-medium tracking-wide border transition-all ${
                      activeSlot === s
                        ? 'bg-ink text-cream border-ink'
                        : 'border-ink/20 text-ink-soft hover:border-ink bg-cream-light'
                    }`}
                    data-cursor-label={s}
                  >
                    {slotLabel(s)}
                  </button>
                ))}
              </div>

              <div className="px-6 py-4">
                <input
                  ref={queryRef}
                  type="text"
                  placeholder="Search foods…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-cream border border-ink/20 px-3 py-2.5 text-sm placeholder-ink-softer focus:outline-none focus:border-ink transition-colors"
                />
              </div>

              <div className="px-6 pb-4 max-h-[520px] overflow-y-auto panel-scroll space-y-1">
                {filtered.map((food) => {
                  const style = categoryStyles[food.cat] || categoryStyles.composed
                  const alreadyLogged = todays.some((m) => m.id === food.id && m.slot === activeSlot)
                  return (
                    <button
                      key={food.id}
                      onClick={() => handleAdd(food)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left border transition-all group ${
                        alreadyLogged
                          ? 'bg-sage-pale border-sage/40'
                          : 'bg-cream border-ink/10 hover:border-ink hover:bg-bone'
                      }`}
                      data-cursor-label={alreadyLogged ? 'add another' : 'add'}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: style.dot }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink leading-tight truncate">{food.name}</p>
                        <p className="text-[11px] text-ink-softer">{food.serving} · {food.kcal} kcal · {food.p}p / {food.c}c</p>
                      </div>
                      {alreadyLogged && (
                        <span className="text-[10px] text-sage-dark font-medium">logged</span>
                      )}
                      <span className="num-display text-lg text-ink-softer group-hover:text-clay transition-colors leading-none">+</span>
                    </button>
                  )
                })}
                {!query && !showAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full text-center py-3 text-xs text-ink-soft hover:text-ink transition-colors display-italic"
                  >
                    show all {foods.length} foods →
                  </button>
                )}
                {filtered.length === 0 && (
                  <p className="text-center py-6 text-sm text-ink-softer italic">No matches.</p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
