import { useMemo, useState } from 'react'
import { useUser } from '../context/UserContext.jsx'
import { usePro } from '../context/ProContext.jsx'
import TierBadge from '../components/TierBadge.jsx'
import { getTipOfDay, categoryMeta } from '../data/dailyTips.js'
import {
  pickActivity, ENERGY_OPTIONS, FEELING_OPTIONS, windDownTips,
} from '../data/todayActivities.js'
import DailyTipCard from '../components/DailyTipCard.jsx'
import { getRoutine, isPersonalized } from '../data/personalization.js'
import Reveal from '../components/interactive/Reveal.jsx'
import SpotlightCard from '../components/interactive/SpotlightCard.jsx'
import { useDailyStreak } from '../hooks/useDailyStreak.js'

// ── Day-of-year: every "today" pick is deterministic, so the page is
//    stable through the day and quietly rotates overnight. ──
function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date - start) / 86400000)
}
function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function timeGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  return 'Good evening'
}
const isEvening = () => new Date().getHours() >= 17

// ── Cycle phase, replicates CycleTracker's pure logic so this page stays
//    decoupled (reads the same localStorage key it writes). ──
const phaseData = {
  menstrual:  { label: 'Menstrual',  range: 'Days 1–5',   color: '#C8654A', advice: 'Energy is naturally lowest. Honour rest, magnesium-rich foods, and gentle movement over intensity.' },
  follicular: { label: 'Follicular', range: 'Days 6–13',  color: '#D4A744', advice: 'Estrogen rising, energy and mood climb. A good window for strength, new habits, and learning.' },
  ovulatory:  { label: 'Ovulatory',  range: 'Days 14–16', color: '#5A6B5D', advice: 'Peak energy. Schedule your hardest workouts and the things that need confidence. Drink extra water.' },
  luteal:     { label: 'Luteal',     range: 'Days 17–28', color: '#9B4423', advice: 'Progesterone dominant, slower recovery, real carb cravings. Cut afternoon caffeine, protect your sleep.' },
}
function getPhase(d) {
  if (d <= 5) return 'menstrual'
  if (d <= 13) return 'follicular'
  if (d <= 16) return 'ovulatory'
  return 'luteal'
}
function readCycle() {
  try {
    const raw = localStorage.getItem('quill.cycle')
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data.lastPeriod) return null
    const last = new Date(data.lastPeriod); last.setHours(0, 0, 0, 0)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const elapsed = Math.floor((today - last) / 86400000)
    if (elapsed < 0) return null
    const len = Number(data.cycleLength) || 28
    const dayOfCycle = (elapsed % len) + 1
    return { dayOfCycle, phase: phaseData[getPhase(dayOfCycle)], nextIn: len - dayOfCycle + 1 }
  } catch { return null }
}

// ── Persistence helpers for the daily check-in ──
const CHECKIN_KEY = 'quill.today.checkin'
const WINDDOWN_KEY = 'quill.today.windDownHidden'
function readCheckin() {
  try {
    const raw = localStorage.getItem(CHECKIN_KEY)
    if (!raw) return null
    const c = JSON.parse(raw)
    return c.date === todayStr() ? c : null   // only today's answers count
  } catch { return null }
}

export default function Today({ onNavigate }) {
  const { profile } = useUser()
  const { isPro } = usePro()
  const streak = useDailyStreak()
  const personalized = isPersonalized(profile)
  const routine = getRoutine(profile)
  const doy = dayOfYear()

  const tip = getTipOfDay()
  const tipMeta = categoryMeta[tip.category]
  const cycle = useMemo(() => readCycle(), [])

  // Daily check-in state
  const [checkin, setCheckin] = useState(() => readCheckin())
  const [draft, setDraft] = useState({ energy: '', feeling: '' })

  function choose(field, value) {
    const next = { ...draft, [field]: value }
    setDraft(next)
    if (next.energy && next.feeling) {
      const saved = { ...next, date: todayStr() }
      try { localStorage.setItem(CHECKIN_KEY, JSON.stringify(saved)) } catch {}
      setCheckin(saved)
    }
  }
  function retake() {
    try { localStorage.removeItem(CHECKIN_KEY) } catch {}
    setDraft({ energy: '', feeling: '' })
    setCheckin(null)
  }

  const activity = useMemo(
    () => (checkin ? pickActivity({ energy: checkin.energy, feeling: checkin.feeling, seed: doy }) : null),
    [checkin, doy],
  )

  // Wind-down section is optional, preference persists across days.
  const [windDownHidden, setWindDownHidden] = useState(() => {
    try { return localStorage.getItem(WINDDOWN_KEY) === '1' } catch { return false }
  })
  function hideWindDown() {
    try { localStorage.setItem(WINDDOWN_KEY, '1') } catch {}
    setWindDownHidden(true)
  }
  function showWindDown() {
    try { localStorage.removeItem(WINDDOWN_KEY) } catch {}
    setWindDownHidden(false)
  }
  const windDown = useMemo(() => windDownTips[doy % windDownTips.length], [doy])

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="bg-cream min-h-screen">

      {/* ═══════════════ HEADER ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
        <Reveal>
          <div className="flex items-center justify-between border-b border-ink/12 pb-3 mb-8">
            <span className="editorial-label">{today}</span>
            <span className="editorial-label text-ink-softer hidden sm:inline">Vol. 01 · The Daily</span>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <Reveal className="lg:col-span-8">
            <span className="editorial-label text-clay">
              {timeGreeting()}{profile.name ? `, ${profile.name}` : ''}
            </span>
            <h1 className="font-display text-7xl sm:text-8xl lg:text-[8.5rem] text-ink leading-[0.85] mt-2">
              Today, <span className="display-italic text-clay">gently.</span>
            </h1>
          </Reveal>
          <Reveal delay={150} className="lg:col-span-4 lg:text-right">
            <p className="text-sm text-ink-soft leading-relaxed max-w-xs lg:ml-auto">
              A few small things, chosen for this day. Do one, do all, or just read. Nothing here is owed.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ YOUR ROUTINE (from your answers) ═══════════════ */}
      {personalized && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Reveal>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="editorial-num text-2xl text-clay">✦</span>
              <span className="editorial-label">Your routine · {routine.minutes} min · {routine.label}</span>
            </div>
            <SpotlightCard className="card-paper p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="editorial-label text-clay">Morning</p>
                  <ul className="mt-3 space-y-2">
                    {routine.morning.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-ink leading-snug">
                        <span className="num-display text-ink-softer flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="editorial-label text-clay">Evening</p>
                  <ul className="mt-3 space-y-2">
                    {routine.evening.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-ink leading-snug">
                        <span className="num-display text-ink-softer flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {routine.skinAddons && (
                <div className="mt-6 pt-5 border-t border-ink/10">
                  <p className="editorial-label text-clay">For your skin type</p>
                  <ul className="mt-2 space-y-1">
                    {routine.skinAddons.map((a, i) => (
                      <li key={i} className="text-sm text-ink-soft leading-relaxed">{a}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button onClick={() => onNavigate('myquill')} className="btn-ghost link-underline mt-6">
                See your full plan <span className="display-italic">→</span>
              </button>
            </SpotlightCard>
          </Reveal>
        </section>
      )}

      {/* ═══════════════ 01 · TIP OF THE DAY (featured) ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Reveal>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="editorial-num text-2xl text-clay">01</span>
            <span className="editorial-label">From the almanac</span>
          </div>
          <DailyTipCard onNavigateLibrary={() => onNavigate('tips')} />
        </Reveal>
      </section>

      {/* ═══════════════ 02 · CHECK-IN → SOMETHING FOR YOU ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Reveal>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="editorial-num text-2xl text-clay">02</span>
            <span className="editorial-label">A small check-in</span>
          </div>
        </Reveal>

        {!checkin ? (
          /* ── The two-tap check-in ── */
          <Reveal>
            <div className="card-bone border border-ink/10 p-7 sm:p-10">
              <h3 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
                Before anything, <span className="display-italic text-clay">how are you, really?</span>
              </h3>
              <p className="text-sm text-ink-soft mt-3 max-w-md leading-relaxed">
                Two taps. We'll suggest one kind thing that fits where you actually are today, not where you think you should be.
              </p>

              {/* Energy */}
              <div className="mt-8">
                <p className="editorial-label mb-3">Your energy right now</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {ENERGY_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => choose('energy', o.id)}
                      className={`p-3 sm:p-4 text-left border transition-all duration-200 ${
                        draft.energy === o.id
                          ? 'bg-ink text-cream border-ink'
                          : 'bg-cream-light border-ink/15 hover:border-ink text-ink'
                      }`}
                    >
                      <span className="font-display text-2xl sm:text-3xl leading-none">{o.label}</span>
                      <span className={`block text-[11px] mt-1.5 leading-snug ${draft.energy === o.id ? 'text-cream/60' : 'text-ink-softer'}`}>{o.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feeling */}
              <div className="mt-6">
                <p className="editorial-label mb-3">And how today feels</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {FEELING_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => choose('feeling', o.id)}
                      className={`p-3 sm:p-4 text-left border transition-all duration-200 ${
                        draft.feeling === o.id
                          ? 'bg-ink text-cream border-ink'
                          : 'bg-cream-light border-ink/15 hover:border-ink text-ink'
                      }`}
                    >
                      <span className="font-display text-2xl sm:text-3xl leading-none">{o.label}</span>
                      <span className={`block text-[11px] mt-1.5 leading-snug ${draft.feeling === o.id ? 'text-cream/60' : 'text-ink-softer'}`}>{o.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ) : (
          /* ── The tailored "something for you" result ── */
          <Reveal>
            <SpotlightCard
              as="div"
              className="group block w-full text-left card-clay border border-clay/20 p-7 sm:p-10 transition-all duration-500"
            >
              <p className="display-italic text-xl sm:text-2xl text-ink/80 leading-snug max-w-2xl">{activity.intro}</p>

              <div className="mt-6 flex items-center gap-3">
                <span className="text-4xl" aria-hidden="true">{activity.icon}</span>
                <div>
                  <p className="editorial-label text-clay-dark">Something for you · {activity.duration}</p>
                  <h3 className="font-display text-4xl sm:text-5xl text-ink leading-none mt-1">{activity.title}</h3>
                </div>
              </div>
              <p className="text-sm text-ink-soft mt-4 max-w-lg leading-relaxed">{activity.blurb}</p>

              <ol className="mt-6 space-y-2.5 max-w-xl">
                {activity.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink leading-relaxed">
                    <span className="num-display text-clay flex-shrink-0 w-5">{String(i + 1).padStart(2, '0')}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>

              {/* Mark done → daily streak (shown in Your Quill) */}
              <div className="mt-7 pt-5 border-t border-ink/10">
                {!streak.todayDone ? (
                  <button type="button" onClick={streak.markDone} className="btn-ink">
                    I did this <span className="display-italic">✓</span>
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="chip chip-ink text-[11px]">✓ Done today</span>
                    <span className="text-sm text-ink">
                      That’s{' '}
                      <span className="font-display text-3xl text-clay align-middle leading-none">{streak.total}</span>{' '}
                      day{streak.total === 1 ? '' : 's'} you’ve shown up. Lovely.
                    </span>
                    <button type="button" onClick={streak.toggleToday} className="editorial-label text-ink-softer hover:text-clay transition-colors">
                      undo
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                {activity.chapter && (
                  <button
                    type="button"
                    onClick={() => onNavigate(activity.chapter)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-clay transition-colors"
                  >
                    <span className="link-underline">{activity.chapterLabel}</span>
                    <span className="display-italic">→</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={retake}
                  className="editorial-label text-ink-softer hover:text-clay transition-colors"
                >
                  ↺ Change today's answers
                </button>
              </div>
            </SpotlightCard>
          </Reveal>
        )}
      </section>

      {/* ═══════════════ 03 · YOUR RHYTHM (cycle, Pro & Max) ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Reveal>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="editorial-num text-2xl text-clay">03</span>
            <span className="editorial-label flex items-center gap-2">Your rhythm <TierBadge /></span>
          </div>

          {!isPro ? (
            /* ── Free: cycle tracking is a Pro & Max feature ── */
            <div className="pro-card p-7 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8">
                  <span className="editorial-label text-gold-dark">Pro &amp; Max edition</span>
                  <h3 className="font-display text-4xl sm:text-5xl text-ink mt-2 leading-tight">
                    Track your <span className="display-italic text-clay">cycle</span>
                  </h3>
                  <p className="text-sm text-ink-soft mt-4 max-w-lg leading-relaxed">
                    Log your last period once, and Today shows your phase each day, with what tends to feel
                    good in it: energy, movement, food, rest. Cycle tracking is part of Pro &amp; Max.
                  </p>
                </div>
                <div className="lg:col-span-4 lg:text-right">
                  <button onClick={() => onNavigate('pro')} className="btn-ink">
                    Unlock with Pro <span className="display-italic">→</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
          <SpotlightCard
            as="button"
            onClick={() => onNavigate('wellness')}
            className="group w-full text-left p-7 sm:p-9 border transition-all duration-500 hover:-translate-y-1"
            style={cycle ? { backgroundColor: '#FBEFE9', borderColor: `${cycle.phase.color}40` } : undefined}
          >
            {cycle ? (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-4">
                  <span className="font-display text-6xl sm:text-7xl text-ink leading-none">Day {cycle.dayOfCycle}</span>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cycle.phase.color }} aria-hidden="true" />
                    <span className="text-sm font-semibold text-ink">{cycle.phase.label}</span>
                    <span className="text-xs text-ink-softer">· {cycle.phase.range}</span>
                  </div>
                </div>
                <div className="sm:col-span-8">
                  <p className="text-sm text-ink-soft leading-relaxed">{cycle.phase.advice}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink group-hover:text-clay transition-colors">
                    <span className="link-underline">Open cycle tracker</span>
                    <span className="display-italic transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="card-blush -m-7 sm:-m-9 p-7 sm:p-9 border-0">
                <h3 className="font-display text-4xl sm:text-5xl text-ink leading-none">Track your <span className="display-italic text-clay">cycle</span></h3>
                <p className="text-sm text-ink-soft mt-4 leading-relaxed max-w-md">
                  Set your last period once, and Today will show your phase and what tends to feel good in it, energy, training, food, rest.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink group-hover:text-clay transition-colors">
                  <span className="link-underline">Set it up</span>
                  <span className="display-italic transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </div>
            )}
          </SpotlightCard>
          )}
        </Reveal>
      </section>

      {/* ═══════════════ 04 · WIND DOWN (optional) ═══════════════ */}
      {!windDownHidden && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Reveal>
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <div className="flex items-baseline gap-3">
                <span className="editorial-num text-2xl text-clay">04</span>
                <span className="editorial-label">{isEvening() ? 'Tonight' : 'Later tonight'}</span>
              </div>
              <button onClick={hideWindDown} className="editorial-label text-ink-softer hover:text-clay transition-colors">
                Hide this ✕
              </button>
            </div>
            <SpotlightCard
              as="button"
              onClick={() => onNavigate('wellness')}
              className="card-ink group w-full text-left p-7 sm:p-10 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden rainbow-frame"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pl-2">
                <div className="lg:col-span-3">
                  <p className="font-display text-3xl text-cream leading-tight">Wind down</p>
                  <p className="editorial-label text-gold mt-1">One small thing</p>
                </div>
                <div className="lg:col-span-9">
                  <p className="display-italic text-2xl sm:text-3xl text-cream leading-snug max-w-2xl">{windDown}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gold group-hover:text-gold-light transition-colors">
                    <span className="link-underline">More ways to rest</span>
                    <span className="display-italic transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        </section>
      )}

      {/* ═══════════════ CLOSING ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
        <Reveal>
          <div className="border-t border-ink/12 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="display-italic text-2xl text-ink/70">That's today. The rest of the issue keeps.</p>
            <div className="flex items-center gap-6">
              {windDownHidden && (
                <button onClick={showWindDown} className="editorial-label text-ink-softer hover:text-clay transition-colors">
                  + Show wind-down
                </button>
              )}
              <button onClick={() => onNavigate('home')} className="btn-ghost link-underline">
                Browse all six chapters →
              </button>
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  )
}
