import { useState, useEffect, useMemo } from 'react'
import Reveal from './interactive/Reveal.jsx'
import SpotlightCard from './interactive/SpotlightCard.jsx'
import TierBadge from './TierBadge.jsx'
import ConfirmButton from './ConfirmButton.jsx'

const STORAGE_KEY = 'quill.sleep.log'
const TARGET_HOURS = 8

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function dayLabel(d) {
  return d.toLocaleDateString('en-GB', { weekday: 'short' })
}
function dayDate(d) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// Parse "HH:MM" to minutes since midnight
function parseTime(s) {
  if (!s) return null
  const [h, m] = s.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

// Hours of sleep given bedtime + waketime (both "HH:MM"); handles bedtime > waketime
function sleepHours(bed, wake) {
  const b = parseTime(bed)
  const w = parseTime(wake)
  if (b == null || w == null) return null
  let diff = w - b
  if (diff <= 0) diff += 24 * 60
  return Math.round((diff / 60) * 10) / 10
}

// Format bedtime as 24h string preserving wraparound; for consistency calc treat
// bedtime as minutes-from-noon so 22:00 and 01:00 don't look 23h apart
function bedtimeOffsetFromNoon(bed) {
  const m = parseTime(bed)
  if (m == null) return null
  // Shift so noon = 0; bedtimes 14:00–11:59 next day mapped into [0, 1440)
  return (m - 12 * 60 + 24 * 60) % (24 * 60)
}

function stdDev(values) {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function lastSevenDays() {
  const days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }
  return days
}

export default function SleepAnalyzer() {
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

  const days = lastSevenDays()

  function update(key, field, value) {
    setLog((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  function clearAll() {
    setLog({})
  }

  // Compute stats for the last 7 logged nights
  const stats = useMemo(() => {
    const nights = days.map((d) => {
      const k = dayKey(d)
      const entry = log[k] || {}
      const hours = sleepHours(entry.bed, entry.wake)
      const bedOffset = bedtimeOffsetFromNoon(entry.bed)
      const isWeekend = d.getDay() === 0 || d.getDay() === 6
      return { date: d, key: k, bed: entry.bed, wake: entry.wake, hours, bedOffset, isWeekend }
    })

    const valid = nights.filter((n) => n.hours != null)
    const totalHours = valid.reduce((a, n) => a + n.hours, 0)
    const avgHours = valid.length ? Math.round((totalHours / valid.length) * 10) / 10 : null
    const targetTotal = valid.length * TARGET_HOURS
    const debt = valid.length ? Math.round((targetTotal - totalHours) * 10) / 10 : null

    const bedOffsets = nights.filter((n) => n.bedOffset != null).map((n) => n.bedOffset)
    const bedtimeSdMin = stdDev(bedOffsets)
    // Consistency score: 100 if SD = 0 min, 0 if SD = 120 min+
    const consistency = bedOffsets.length >= 2
      ? Math.max(0, Math.min(100, Math.round(100 - (bedtimeSdMin / 120) * 100)))
      : null

    // Social jetlag: difference in average wake time between weekend and weekday
    const wakeMins = nights.filter((n) => n.wake != null).map((n) => ({
      m: parseTime(n.wake),
      isWeekend: n.isWeekend,
    }))
    const weekday = wakeMins.filter((w) => !w.isWeekend).map((w) => w.m)
    const weekend = wakeMins.filter((w) => w.isWeekend).map((w) => w.m)
    let socialJetlag = null
    if (weekday.length && weekend.length) {
      const avgWeekday = weekday.reduce((a, m) => a + m, 0) / weekday.length
      const avgWeekend = weekend.reduce((a, m) => a + m, 0) / weekend.length
      socialJetlag = Math.round((avgWeekend - avgWeekday) / 6) / 10 // hours, 1 dp
    }

    return { nights, valid, avgHours, debt, consistency, socialJetlag }
  }, [log, days])

  // Build a recommendation from the stats
  const recommendation = useMemo(() => {
    if (!stats.valid.length) return { kicker: 'No data yet', text: 'Log a few nights to get your first analysis.' }
    if (stats.avgHours == null) return { kicker: '—', text: '—' }

    const tips = []
    if (stats.avgHours < 7) {
      tips.push(`You're averaging ${stats.avgHours}h — under the 7-9h adult target. Aim to add 30 minutes by going to bed earlier, not waking later.`)
    } else if (stats.avgHours > 9.5) {
      tips.push(`You're averaging ${stats.avgHours}h. Oversleep can mean poor sleep quality — check your bedroom temperature (~18°C) and light exposure in the morning.`)
    } else {
      tips.push(`You're averaging ${stats.avgHours}h — right in the healthy 7-9h range. Hold this rhythm.`)
    }
    if (stats.consistency != null && stats.consistency < 70) {
      tips.push(`Your bedtime varies a lot (consistency ${stats.consistency}/100). Pick one bedtime and protect it for two weeks — it's the highest-leverage sleep change.`)
    }
    if (stats.socialJetlag != null && Math.abs(stats.socialJetlag) > 1) {
      tips.push(`Your weekend wake-up is ${stats.socialJetlag > 0 ? `${stats.socialJetlag}h later` : `${Math.abs(stats.socialJetlag)}h earlier`} than weekdays. This is "social jetlag" — it disrupts your circadian rhythm. Try staying within an hour.`)
    }
    if (stats.debt > 5) {
      tips.push(`Your weekly sleep debt is ${stats.debt}h. You can't fully repay it on weekends — chip away with 30-minute earlier bedtimes.`)
    }

    const lead = stats.avgHours < 7
      ? 'You need more sleep'
      : stats.consistency != null && stats.consistency < 70
        ? 'Your timing is the problem'
        : 'Your sleep looks healthy'

    return { kicker: lead, text: tips.join(' ') }
  }, [stats])

  const maxBarHeight = 120
  const barScale = (h) => Math.min(maxBarHeight, (h / 12) * maxBarHeight)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="sleep-analyzer">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15 flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="editorial-label flex items-center gap-2">
              Sleep schedule analysis <TierBadge />
            </span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              Seven nights, <span className="display-italic text-clay">honest data.</span>
            </h2>
            <p className="text-sm text-ink-soft mt-3 max-w-xl">
              Log your bedtime and wake time for the last seven nights. Quill calculates duration, consistency, sleep debt, and weekend jetlag — and tells you the one thing to change first.
            </p>
          </div>
          {Object.keys(log).length > 0 && (
            <ConfirmButton onConfirm={clearAll} question="Clear all sleep data?" confirm="Clear" className="text-xs text-ink-soft hover:text-clay transition-colors display-italic">
              clear data
            </ConfirmButton>
          )}
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT — log form */}
        <Reveal className="lg:col-span-5">
          <div className="border border-ink/15 bg-cream-light">
            <div className="px-6 py-4 border-b border-ink/10">
              <span className="editorial-label">Log your nights</span>
              <p className="font-display text-2xl text-ink mt-1 leading-tight">Last 7 days</p>
            </div>
            <div className="divide-y divide-ink/10">
              {stats.nights.map((n) => (
                <div key={n.key} className="px-6 py-3 grid grid-cols-[60px_1fr_1fr_60px] gap-3 items-center text-sm">
                  <div>
                    <p className="font-display text-base text-ink leading-none">{dayLabel(n.date)}</p>
                    <p className="text-[10px] text-ink-softer mt-0.5">{dayDate(n.date)}</p>
                  </div>
                  <label className="block">
                    <span className="editorial-label block text-[9px]">Bed</span>
                    <input
                      type="time"
                      value={n.bed || ''}
                      onChange={(e) => update(n.key, 'bed', e.target.value)}
                      className="w-full bg-cream border border-ink/20 px-2 py-1 text-sm focus:outline-none focus:border-ink"
                    />
                  </label>
                  <label className="block">
                    <span className="editorial-label block text-[9px]">Wake</span>
                    <input
                      type="time"
                      value={n.wake || ''}
                      onChange={(e) => update(n.key, 'wake', e.target.value)}
                      className="w-full bg-cream border border-ink/20 px-2 py-1 text-sm focus:outline-none focus:border-ink"
                    />
                  </label>
                  <div className="text-right">
                    {n.hours != null ? (
                      <span className="num-display text-lg text-clay">{n.hours}h</span>
                    ) : (
                      <span className="text-ink-softer text-xs">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* RIGHT — analysis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Bar chart */}
          <Reveal>
            <div className="border border-ink/15 bg-cream-light p-6">
              <div className="flex items-baseline justify-between mb-5">
                <span className="editorial-label">Hours per night</span>
                <span className="text-xs text-ink-softer">Target 8h</span>
              </div>
              <div className="flex items-end justify-between gap-2 px-2" style={{ minHeight: `${maxBarHeight + 30}px` }}>
                {stats.nights.map((n) => (
                  <div key={n.key} className="flex-1 flex flex-col items-center">
                    <div className="text-[10px] text-ink-soft num-display mb-1">
                      {n.hours != null ? `${n.hours}` : ''}
                    </div>
                    <div className="w-full flex justify-center" style={{ height: `${maxBarHeight}px` }}>
                      <div
                        className="w-full max-w-[28px] rounded-t transition-all duration-700"
                        style={{
                          height: n.hours != null ? `${barScale(n.hours)}px` : '0px',
                          marginTop: 'auto',
                          background: n.hours == null
                            ? '#E8DFD0'
                            : n.hours < 7
                              ? '#C8654A'
                              : n.hours < 9
                                ? '#5A6B5D'
                                : '#D4A744',
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-ink-softer mt-1">{dayLabel(n.date).slice(0, 1)}</div>
                  </div>
                ))}
                {/* Target line — 8h */}
              </div>
              <div className="mt-4 flex items-center gap-4 text-[10px] text-ink-soft editorial-label">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-clay inline-block" /> under 7h</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-sage inline-block" /> 7–9h</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gold inline-block" /> over 9h</span>
              </div>
            </div>
          </Reveal>

          {/* Stat grid */}
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-ink/15 border border-ink/15">
              <Stat label="7-day average" value={stats.avgHours != null ? `${stats.avgHours}h` : '—'} sub="hours / night" />
              <Stat label="Sleep debt" value={stats.debt != null ? `${stats.debt > 0 ? '+' : ''}${stats.debt}h` : '—'} sub="vs 8h target" colored={stats.debt != null && stats.debt > 3} />
              <Stat label="Consistency" value={stats.consistency != null ? `${stats.consistency}` : '—'} sub="out of 100" />
              <Stat label="Social jetlag" value={stats.socialJetlag != null ? `${Math.abs(stats.socialJetlag)}h` : '—'} sub="weekday vs weekend" />
            </div>
          </Reveal>

          {/* Recommendation */}
          <Reveal>
            <SpotlightCard className="bg-ink text-cream p-6 sm:p-8 relative overflow-hidden rainbow-frame">
              <span className="editorial-label text-gold">Your one change</span>
              <p className="font-display text-2xl sm:text-3xl mt-2 leading-tight">{recommendation.kicker}.</p>
              <p className="display-italic text-cream/80 text-base mt-4 leading-relaxed">{recommendation.text}</p>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value, sub, colored = false }) {
  return (
    <div className="bg-cream-light p-5">
      <span className="editorial-label">{label}</span>
      <p className={`num-display text-4xl mt-2 leading-none ${colored ? 'text-clay' : 'text-ink'}`}>{value}</p>
      <p className="text-[10px] text-ink-softer mt-1">{sub}</p>
    </div>
  )
}
