import { useState, useEffect, useMemo } from 'react'
import Reveal from './interactive/Reveal.jsx'
import SpotlightCard from './interactive/SpotlightCard.jsx'
import TierBadge from './TierBadge.jsx'

const STORAGE_KEY = 'quill.wearable'
const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&q=60`

const devices = [
  { id: 'apple', name: 'Apple Watch', tagline: 'Series 9 / Ultra', img: U('1551816230-ef5deaed4a26') },
  { id: 'oura', name: 'Oura Ring', tagline: 'Gen 4', img: U('1614613535308-eb5fbd3d2c17') },
  { id: 'whoop', name: 'Whoop 4.0', tagline: 'Performance band', img: U('1579586337278-3befd40fd17a') },
  { id: 'garmin', name: 'Garmin', tagline: 'Forerunner / Venu', img: U('1617043786394-f977fa12eddf') },
]

// Stable pseudo-random per date, gives realistic-looking mock data
// when the user hasn't manually logged a day.
function seededValue(dateStr, salt, min, max) {
  let h = 0
  for (let i = 0; i < (dateStr + salt).length; i++) {
    h = ((h << 5) - h) + (dateStr + salt).charCodeAt(i)
    h |= 0
  }
  const r = Math.abs(h % 1000) / 1000
  return Math.round(min + r * (max - min))
}

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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

function getMetric(key, day, manualLog, device) {
  const k = dayKey(day)
  if (manualLog[k] && manualLog[k][key] != null) return manualLog[k][key]
  // Realistic ranges per device
  const ranges = {
    hrv: [35, 70],
    rhr: [50, 68],
    sleep: [55, 90], // tenths of hours -> /10
    steps: [4500, 12000],
  }
  const [lo, hi] = ranges[key]
  return seededValue(k + device, key, lo, hi)
}

export default function WearableSync() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return { connectedDevice: null, manualLog: {} }
  })
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state])

  function connect(deviceId) {
    setSyncing(true)
    setTimeout(() => {
      setState((s) => ({ ...s, connectedDevice: deviceId }))
      setSyncing(false)
    }, 1500)
  }

  function disconnect() {
    // No confirm, manually logged values stay in localStorage either way.
    setState((s) => ({ ...s, connectedDevice: null }))
  }

  function logToday(key, value) {
    const today = dayKey(new Date())
    setState((s) => ({
      ...s,
      manualLog: {
        ...s.manualLog,
        [today]: { ...(s.manualLog[today] || {}), [key]: value },
      },
    }))
  }

  const days = lastSevenDays()
  const device = devices.find((d) => d.id === state.connectedDevice)

  const todayMetrics = useMemo(() => {
    if (!device) return null
    const today = new Date()
    return {
      hrv: getMetric('hrv', today, state.manualLog, device.id),
      rhr: getMetric('rhr', today, state.manualLog, device.id),
      sleep: getMetric('sleep', today, state.manualLog, device.id) / 10,
      steps: getMetric('steps', today, state.manualLog, device.id),
    }
  }, [device, state.manualLog])

  const trends = useMemo(() => {
    if (!device) return null
    const series = (key) => days.map((d) => getMetric(key, d, state.manualLog, device.id))
    return {
      hrv: series('hrv'),
      rhr: series('rhr'),
      sleep: series('sleep').map((v) => v / 10),
      steps: series('steps'),
    }
  }, [device, days, state.manualLog])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="wearable-sync">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15">
          <span className="editorial-label flex items-center gap-2">
            Wearable sync <TierBadge />
          </span>
          <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
            Your body, <span className="display-italic text-clay">in numbers.</span>
          </h2>
          <p className="text-sm text-ink-soft mt-3 max-w-xl">
            Connect a wearable or log manually. Quill reads your HRV, resting heart rate, sleep, and steps, and weighs them as one signal of readiness.
          </p>
        </div>
      </Reveal>

      {/* Back-to-devices bar, always visible when a device is connected */}
      {device && (
        <Reveal>
          <button
            onClick={disconnect}
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-cream-light border border-ink/20 hover:border-ink hover:bg-bone text-sm font-medium tracking-wide transition-all"
            data-cursor-label="change device"
          >
            <span className="display-italic text-lg leading-none">←</span> Back to all devices
          </button>
        </Reveal>
      )}

      {!device ? (
        /* Device picker */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {devices.map((d, i) => (
            <Reveal key={d.id} delay={i * 80}>
              <button
                onClick={() => connect(d.id)}
                disabled={syncing}
                className="w-full card-paper card-paper-hover p-0 text-left overflow-hidden group disabled:opacity-50"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-bone">
                  <img
                    src={d.img}
                    alt={d.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-4">
                  <p className="font-display text-xl text-ink leading-tight">{d.name}</p>
                  <p className="text-xs text-ink-soft mt-1">{d.tagline}</p>
                  <p className="display-italic text-xs text-clay mt-2 link-underline">Connect →</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      ) : (
        /* Connected view */
        <div className="space-y-6">
          {/* Connected header card */}
          <Reveal>
            <SpotlightCard className="bg-ink text-cream p-6 sm:p-8 flex items-center gap-5 flex-wrap">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold flex-shrink-0">
                <img src={device.img} alt={device.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <span className="editorial-label text-gold">Connected</span>
                <p className="font-display text-3xl mt-1">{device.name}</p>
                <p className="text-xs text-cream/60 mt-1">Last sync: just now · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
              </div>
              <button
                onClick={disconnect}
                className="text-xs text-gold hover:text-cream display-italic transition-colors px-3 py-2 border border-gold/30 hover:border-cream"
              >
                change device
              </button>
              <div className="w-3 h-3 rounded-full bg-sage animate-pulse-soft" />
            </SpotlightCard>
          </Reveal>

          {/* Today's metrics */}
          <Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink/15 border border-ink/15">
              <Metric
                label="HRV"
                value={todayMetrics.hrv}
                unit="ms"
                trend={trends.hrv}
                onLog={(v) => logToday('hrv', v)}
                color="#5A6B5D"
                hint={todayMetrics.hrv > 50 ? 'Good recovery' : 'Push gently today'}
              />
              <Metric
                label="Resting HR"
                value={todayMetrics.rhr}
                unit="bpm"
                trend={trends.rhr}
                onLog={(v) => logToday('rhr', v)}
                color="#C8654A"
                hint={todayMetrics.rhr < 60 ? 'Healthy baseline' : 'Slightly elevated'}
                inverse
              />
              <Metric
                label="Sleep"
                value={todayMetrics.sleep}
                unit="h"
                decimals={1}
                trend={trends.sleep}
                onLog={(v) => logToday('sleep', Math.round(v * 10))}
                color="#D4A744"
                hint={todayMetrics.sleep >= 7 ? 'On target' : 'Below 7h'}
              />
              <Metric
                label="Steps"
                value={todayMetrics.steps}
                unit=""
                trend={trends.steps}
                onLog={(v) => logToday('steps', v)}
                color="#9B4423"
                hint={todayMetrics.steps >= 8000 ? 'Solid' : 'Add a walk'}
              />
            </div>
          </Reveal>

          {/* Readiness summary */}
          <Reveal>
            <SpotlightCard className="bg-cream-light border border-ink/15 p-6 sm:p-8">
              <span className="editorial-label">Readiness summary</span>
              <p className="font-display text-3xl text-ink mt-2 leading-tight">
                {readinessText(todayMetrics)}
              </p>
              <p className="display-italic text-sm text-ink-soft mt-3 leading-relaxed">
                {readinessAdvice(todayMetrics)}
              </p>
            </SpotlightCard>
          </Reveal>
        </div>
      )}

      {/* Sync overlay */}
      {syncing && (
        <div className="fixed inset-0 z-[90] bg-ink/40 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="bg-cream-light border border-ink/15 p-10 text-center shadow-soft-lg animate-fade-up">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-ink/15 border-t-clay rounded-full animate-rotate-slow" />
            <p className="font-display text-2xl text-ink">Syncing your device…</p>
            <p className="display-italic text-sm text-ink-soft mt-2">Pulling the last 7 days</p>
          </div>
        </div>
      )}
    </section>
  )
}

function readinessText(m) {
  const hrvGood = m.hrv > 50
  const sleepGood = m.sleep >= 7
  const rhrGood = m.rhr < 62
  const score = [hrvGood, sleepGood, rhrGood].filter(Boolean).length
  if (score === 3) return 'You\'re primed to push.'
  if (score === 2) return 'Solid foundation, train as planned.'
  if (score === 1) return 'Recover today, push tomorrow.'
  return 'Rest day. Body is asking.'
}

function readinessAdvice(m) {
  if (m.hrv < 45 && m.rhr > 62) return 'HRV down + resting HR up, classic under-recovery. Skip the hard session, walk instead, and prioritise sleep tonight.'
  if (m.sleep < 6.5) return `Only ${m.sleep}h last night. Cut caffeine after midday, dim lights at 9pm, and aim to be in bed an hour earlier.`
  if (m.steps < 6000) return 'You\'re tracking light on movement. A 15-minute walk after lunch closes most of the gap without changing your day.'
  return 'Numbers look balanced. Train your planned session, eat enough protein, and keep the bedtime you\'ve been holding.'
}

function Metric({ label, value, unit, trend, decimals = 0, onLog, color, hint, inverse }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const max = Math.max(...trend)
  const min = Math.min(...trend)
  const range = max - min || 1

  function submit() {
    const v = Number(draft)
    if (!Number.isNaN(v) && v > 0) onLog(v)
    setEditing(false)
    setDraft('')
  }

  return (
    <div className="bg-cream-light p-5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="editorial-label">{label}</span>
        <button
          onClick={() => { setDraft(String(value)); setEditing((v) => !v) }}
          className="text-[10px] text-ink-softer hover:text-clay transition-colors display-italic"
        >
          {editing ? 'cancel' : 'log'}
        </button>
      </div>
      {editing ? (
        <div className="flex items-center gap-2 mt-1">
          <input
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoFocus
            step={decimals ? '0.1' : '1'}
            className="w-full bg-cream border border-ink/30 px-2 py-1 text-lg num-display focus:outline-none focus:border-ink"
          />
          <button onClick={submit} className="text-xs text-ink hover:text-clay">↵</button>
        </div>
      ) : (
        <p className="num-display text-4xl leading-none" style={{ color }}>
          {decimals ? value.toFixed(decimals) : value.toLocaleString()}
          <span className="text-base text-ink-softer ml-1">{unit}</span>
        </p>
      )}
      {/* 7-day mini sparkline */}
      <div className="mt-3 flex items-end gap-0.5 h-8">
        {trend.map((v, i) => {
          const h = Math.max(2, ((v - min) / range) * 28 + 4)
          return (
            <span
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: `${h}px`,
                background: i === trend.length - 1 ? color : `${color}66`,
              }}
            />
          )
        })}
      </div>
      <p className="text-[10px] text-ink-softer italic mt-2">{hint}</p>
    </div>
  )
}
