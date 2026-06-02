import { useState, useEffect, useMemo } from 'react'
import Reveal from './interactive/Reveal.jsx'
import SpotlightCard from './interactive/SpotlightCard.jsx'
import TierBadge from './TierBadge.jsx'

const STORAGE_KEY = 'quill.cycle'

const phaseData = {
  menstrual: {
    label: 'Menstrual',
    range: 'Days 1–5',
    color: '#C8654A',
    bg: '#F5E1D8',
    advice: 'Energy is naturally lowest. Honour rest, magnesium-rich foods (dark chocolate, leafy greens), and gentle yoga or walking over intense training.',
  },
  follicular: {
    label: 'Follicular',
    range: 'Days 6–13',
    color: '#D4A744',
    bg: '#F5EBD0',
    advice: 'Estrogen rising — energy, mood and recovery all improve. Best window for strength PRs, new habits, learning. Lean into harder training.',
  },
  ovulatory: {
    label: 'Ovulatory',
    range: 'Days 14–16',
    color: '#5A6B5D',
    bg: '#D5DDD6',
    advice: 'Peak energy, peak performance. Schedule social plans, important presentations, your hardest workouts. Drink extra water — body temp rises ~0.3°C.',
  },
  luteal: {
    label: 'Luteal',
    range: 'Days 17–28',
    color: '#9B4423',
    bg: '#FBEFE9',
    advice: 'Progesterone dominant — slightly slower recovery, more carb cravings (real, not weakness). Cut caffeine after midday, add 100-200 kcal, prioritise sleep.',
  },
}

function todayMidnight() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function daysBetween(a, b) {
  const ms = b.getTime() - a.getTime()
  return Math.floor(ms / 86400000)
}

function getPhase(dayOfCycle) {
  if (dayOfCycle <= 5) return 'menstrual'
  if (dayOfCycle <= 13) return 'follicular'
  if (dayOfCycle <= 16) return 'ovulatory'
  return 'luteal'
}

export default function CycleTracker() {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return { lastPeriod: '', cycleLength: 28, periodLength: 5 }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
  }, [data])

  function update(field, value) {
    setData((d) => ({ ...d, [field]: value }))
  }

  const stats = useMemo(() => {
    if (!data.lastPeriod) return null
    const lastDate = new Date(data.lastPeriod)
    lastDate.setHours(0, 0, 0, 0)
    const today = todayMidnight()
    const elapsed = daysBetween(lastDate, today)
    if (elapsed < 0) return null
    const cycleLen = Number(data.cycleLength) || 28
    const dayOfCycle = (elapsed % cycleLen) + 1
    const phase = getPhase(dayOfCycle)
    const nextPeriodInDays = cycleLen - dayOfCycle + 1
    const nextPeriodDate = new Date(today)
    nextPeriodDate.setDate(today.getDate() + nextPeriodInDays)
    return { dayOfCycle, phase, nextPeriodInDays, nextPeriodDate, cycleLen, lastDate }
  }, [data])

  // 30-day visualization
  const calendar = useMemo(() => {
    if (!stats) return []
    const days = []
    const today = todayMidnight()
    for (let i = -7; i < 23; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const elapsed = daysBetween(stats.lastDate, d)
      if (elapsed < 0) {
        days.push({ date: d, isToday: i === 0, phase: null, dayOfCycle: null, isPast: true })
        continue
      }
      const dayOfCycle = (elapsed % stats.cycleLen) + 1
      const phase = getPhase(dayOfCycle)
      days.push({ date: d, isToday: i === 0, phase, dayOfCycle, isPast: i < 0 })
    }
    return days
  }, [stats])

  const phase = stats ? phaseData[stats.phase] : null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="cycle-tracker">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15">
          <span className="editorial-label flex items-center gap-2">
            Cycle tracking <TierBadge />
          </span>
          <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
            Your cycle, <span className="display-italic text-clay">your map.</span>
          </h2>
          <p className="text-sm text-ink-soft mt-3 max-w-xl">
            Log your last period; Quill predicts your phases and tells you what to do in each. Energy, training, food — all flex with your hormones.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT — inputs */}
        <Reveal className="lg:col-span-4">
          <div className="border border-ink/15 bg-cream-light p-6 space-y-5">
            <div>
              <span className="editorial-label block mb-1.5">Last period started</span>
              <input
                type="date"
                value={data.lastPeriod}
                onChange={(e) => update('lastPeriod', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-cream border border-ink/20 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
              />
            </div>
            <div>
              <span className="editorial-label block mb-1.5">Average cycle length</span>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="21" max="40" step="1"
                  value={data.cycleLength}
                  onChange={(e) => update('cycleLength', Number(e.target.value))}
                  className="flex-1 accent-ink"
                />
                <span className="num-display text-2xl text-ink w-12 text-right">{data.cycleLength}</span>
                <span className="text-xs text-ink-soft">days</span>
              </div>
            </div>
            <div>
              <span className="editorial-label block mb-1.5">Period duration</span>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="2" max="9" step="1"
                  value={data.periodLength}
                  onChange={(e) => update('periodLength', Number(e.target.value))}
                  className="flex-1 accent-ink"
                />
                <span className="num-display text-2xl text-ink w-12 text-right">{data.periodLength}</span>
                <span className="text-xs text-ink-soft">days</span>
              </div>
            </div>
            <div className="pt-4 border-t border-ink/10">
              <p className="text-[11px] text-ink-softer italic leading-relaxed">
                Cycle length normal range: 21–35 days. Predictions improve once you've logged 2–3 cycles. Not a substitute for medical advice or contraception.
              </p>
            </div>
          </div>
        </Reveal>

        {/* RIGHT — phase + calendar */}
        <div className="lg:col-span-8 space-y-6">
          {stats && phase ? (
            <>
              {/* Phase card */}
              <Reveal>
                <SpotlightCard className="p-6 sm:p-8 relative overflow-hidden" style={{ background: phase.bg, borderLeft: `4px solid ${phase.color}` }}>
                  <div className="flex items-baseline justify-between flex-wrap gap-3 mb-4">
                    <div>
                      <span className="editorial-label" style={{ color: phase.color }}>{phase.range}</span>
                      <p className="font-display text-4xl text-ink mt-1 leading-tight">{phase.label} phase</p>
                    </div>
                    <div className="text-right">
                      <p className="num-display text-5xl leading-none" style={{ color: phase.color }}>
                        Day {stats.dayOfCycle}
                      </p>
                      <p className="text-[11px] text-ink-soft mt-1">of your {stats.cycleLen}-day cycle</p>
                    </div>
                  </div>
                  <p className="display-italic text-lg text-ink-soft leading-relaxed">
                    {phase.advice}
                  </p>
                </SpotlightCard>
              </Reveal>

              {/* Calendar */}
              <Reveal>
                <div className="border border-ink/15 bg-cream-light p-6">
                  <div className="flex items-baseline justify-between mb-5">
                    <span className="editorial-label">Next 30 days</span>
                    <span className="text-xs text-ink-soft">
                      Next period in <span className="num-display text-ink text-base">{stats.nextPeriodInDays}</span> days
                    </span>
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {calendar.map((d, i) => {
                      const p = d.phase ? phaseData[d.phase] : null
                      return (
                        <div
                          key={i}
                          className={`aspect-square flex items-center justify-center text-[10px] num-display border ${
                            d.isToday ? 'border-ink border-2 font-bold' : 'border-transparent'
                          } ${d.isPast ? 'opacity-50' : ''}`}
                          style={{
                            background: p ? p.bg : '#FBF7F0',
                            color: p ? p.color : '#9B8E82',
                          }}
                          title={`${d.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}${p ? ` · ${p.label}` : ''}`}
                        >
                          {d.date.getDate()}
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-[10px]">
                    {Object.entries(phaseData).map(([k, p]) => (
                      <span key={k} className="flex items-center gap-1.5 text-ink-soft">
                        <span className="w-3 h-3 inline-block" style={{ background: p.bg, border: `1.5px solid ${p.color}` }} />
                        {p.label}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </>
          ) : (
            <Reveal>
              <div className="border border-ink/15 bg-cream-light p-12 text-center">
                <p className="num-display text-6xl text-ink-softer">◐</p>
                <p className="font-display text-2xl text-ink mt-4">Log your last period</p>
                <p className="text-sm text-ink-soft mt-2 max-w-sm mx-auto leading-relaxed">
                  Pick the start date on the left to see your current phase, next period prediction, and a 30-day map.
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
