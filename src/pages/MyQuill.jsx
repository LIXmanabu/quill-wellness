import { useState } from 'react'
import { useUser } from '../context/UserContext.jsx'
import { usePro } from '../context/ProContext.jsx'
import { dailyTips, categoryMeta } from '../data/dailyTips.js'
import { skincareData } from '../data/skincareData.js'
import { sportData } from '../data/sportData.js'
import { wellnessData } from '../data/wellnessData.js'
import { getRoutine, getComplementaryRoutine, getProblemTips, getAdvice, getRecommendations, isPersonalized } from '../data/personalization.js'
import FavoriteButton from '../components/FavoriteButton.jsx'
import TierBadge from '../components/TierBadge.jsx'
import ConfirmButton from '../components/ConfirmButton.jsx'
import SleepAnalyzer from '../components/SleepAnalyzer.jsx'
import HabitStreaks from '../components/HabitStreaks.jsx'
import CycleTracker from '../components/CycleTracker.jsx'
import WearableSync from '../components/WearableSync.jsx'
import AudioLibrary from '../components/AudioLibrary.jsx'
import FamilySeats from '../components/FamilySeats.jsx'
import TierReviews from '../components/TierReviews.jsx'
import SkinJournal from '../components/SkinJournal.jsx'
import PlansSection from '../components/PlansSection.jsx'
import TesterCodeEntry from '../components/TesterCodeEntry.jsx'
import SplitText from '../components/interactive/SplitText.jsx'
import Reveal from '../components/interactive/Reveal.jsx'
import { useDailyStreak } from '../hooks/useDailyStreak.js'
import SpotlightCard from '../components/interactive/SpotlightCard.jsx'
import MagneticButton from '../components/interactive/MagneticButton.jsx'

const skinTypeLabels = {
  dry: 'Dry skin',
  oily: 'Oily skin',
  combo: 'Combination skin',
  sensitive: 'Sensitive skin',
  normal: 'Normal skin',
  unsure: 'Still figuring it out',
}

const goalLabels = {
  glow: 'Glow & confidence',
  fitness: 'Move & feel strong',
  calm: 'Stress less, sleep better',
  body: 'Understand my body',
  eat: 'Eat smarter',
}

// The instruments live behind a single picker so the page stays calm.
// `max: true` tools are full-featured only on Max; otherwise they route to Pro.
const INSTRUMENTS = [
  { id: 'journal',  label: 'Skin Journal', kicker: 'On-device', desc: 'Note how your skin feels, day to day.',     max: false },
  { id: 'sounds',   label: 'Calm Sounds',  kicker: 'Ambient',   desc: 'Loops to focus, settle, or drift off.',       max: false },
  { id: 'sleep',    label: 'Sleep',        kicker: 'Analysis',  desc: 'See your sleep schedule take shape.',          max: true },
  { id: 'cycle',    label: 'Cycle',        kicker: 'Rhythm',    desc: 'Map your phases and what they ask for.',       max: true },
  { id: 'wearable', label: 'Wearables',    kicker: 'Sync',      desc: 'Connect a watch or band.',                     max: true },
  { id: 'habits',   label: 'Habits',       kicker: 'Check-ins', desc: 'Gentle daily habit dots.',                     max: true },
  { id: 'family',   label: 'Family',       kicker: 'Together',  desc: 'Share seats with people you love.',            max: true },
]

function resolveFavorite(id) {
  const [type, key] = id.split(':')
  if (type === 'tip') {
    const tip = dailyTips.find((t) => t.id === key)
    if (!tip) return null
    return { type, kicker: categoryMeta[tip.category].label, title: tip.title, body: tip.body }
  }
  if (type === 'routine') {
    const r = skincareData.find((x) => x.id === key)
    if (!r) return null
    return { type, kicker: 'Skincare routine', title: r.title, body: r.description }
  }
  if (type === 'exercise') {
    const e = sportData.find((x) => x.id === key)
    if (!e) return null
    return { type, kicker: `${e.duration} · ${e.difficulty}`, title: e.title, body: e.description }
  }
  if (type === 'wellness') {
    const w = wellnessData.find((x) => x.id === key)
    if (!w) return null
    return { type, kicker: 'Wellness', title: w.title, body: w.shortDescription }
  }
  if (type === 'diet') {
    return { type, kicker: 'Diet protocol', title: key.charAt(0).toUpperCase() + key.slice(1), body: '' }
  }
  return { type, kicker: type, title: key, body: '' }
}

export default function MyQuill({ onNavigate }) {
  const { profile, resetProfile } = useUser()
  const { isPro, isMax, tier } = usePro()
  const tierLabel = isMax ? 'Max' : isPro ? 'Pro' : 'Free'
  const streak = useDailyStreak()
  const [openTool, setOpenTool] = useState(null)
  const [showMorePlan, setShowMorePlan] = useState(false)

  const resolved = profile.favorites.map((id) => ({ id, ...resolveFavorite(id) })).filter((f) => f && f.title)
  // Strip trailing punctuation/spaces off the name so the heading's own comma
  // doesn't stack into "Hello, Lix,," when a nickname was saved with a comma.
  const cleanName = (profile.name || '').trim().replace(/[,\s]+$/, '')
  const greeting = cleanName ? `Hello, ${cleanName}` : 'Your Quill'
  const personalized = isPersonalized(profile)

  const routine = personalized ? getRoutine(profile) : null
  const complement = personalized ? getComplementaryRoutine(profile) : null
  const problemTips = personalized ? getProblemTips(profile) : []
  const advice = personalized ? getAdvice(profile) : []
  const recs = personalized ? getRecommendations(profile) : []
  const hasMorePlan = personalized && (complement || problemTips.length > 0 || advice.length > 0)

  return (
    <div className="bg-cream">
      {/* HERO */}
      <section style={{ viewTransitionName: 'hero-myquill' }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12">
        <div className="border-b border-ink/15 pb-3 mb-10 flex items-center justify-between">
          <span className="editorial-label">Your space · Personal</span>
          <span className="editorial-label">{resolved.length} saved</span>
        </div>
        <h1 className="font-display text-[14vw] sm:text-[10vw] lg:text-[8vw] text-ink leading-[0.9] tracking-tight">
          <span className={isMax ? 'tier-gradient-text' : ''}>
            <SplitText byChar stagger={28}>{greeting},</SplitText>
          </span>
          <br />
          <span className="display-italic text-clay"><SplitText byChar stagger={28} startDelay={500}>here you are.</SplitText></span>
        </h1>
        <Reveal delay={400} className="mt-8 max-w-md">
          <p className="text-lg text-ink-soft leading-relaxed">
            {personalized
              ? `Tailored to your goal, ${goalLabels[profile.goal] || 'understand your body'}, and the time you have for it.`
              : 'Take the quick quiz to get a routine made for you.'}
          </p>
        </Reveal>
      </section>

      {/* Profile card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Reveal>
          <div className={`${isPro ? 'pro-card' : 'card-paper'} p-8 sm:p-10`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-6 border-b border-ink/15">
              <div>
                <span className="editorial-label flex items-center gap-2">Your profile {isPro && <TierBadge />}</span>
                <h2 className="font-display text-4xl sm:text-5xl text-ink mt-1 leading-tight">
                  {profile.name || 'Anonymous reader'}
                </h2>
              </div>
              <ConfirmButton
                onConfirm={resetProfile}
                question="Reset profile and favorites?"
                confirm="Yes, reset"
                className="btn-ghost link-underline self-start text-xs"
                armedClassName="self-start"
              >
                Reset profile
              </ConfirmButton>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
              <ProfileChip num="01" label="Skin type" value={skinTypeLabels[profile.skinType] || 'Not set'} />
              <ProfileChip num="02" label="Goal" value={goalLabels[profile.goal] || 'Not set'} />
              <ProfileChip num="03" label="Time / day" value={profile.timePerDay ? `${profile.timePerDay} min` : 'Not set'} />
            </div>

            {/* Beta access — redeem a tester code here, from your account. */}
            <div className="mt-6 pt-6 border-t border-ink/15 max-w-sm">
              <span className="editorial-label">Beta access</span>
              <TesterCodeEntry />
            </div>
          </div>
        </Reveal>
      </section>

      {/* DAILY STREAK, driven by the Today task */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Reveal>
          <div className="card-bone border border-ink/10 p-8 sm:p-10">
            <div>
              <span className="editorial-label">Days you showed up · from Today</span>
              <div className="flex items-end gap-3 mt-2">
                <span className="font-display text-7xl sm:text-8xl text-ink leading-none">{streak.total}</span>
                <span className="font-display text-2xl text-clay leading-none mb-2">
                  day{streak.total === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-sm text-ink-soft mt-3 max-w-md leading-relaxed">
                {streak.total === 0
                  ? 'Nothing logged yet. Open Today, do one small thing, and mark it. That’s all this is.'
                  : streak.todayDone
                    ? 'You showed up today. That’s the whole point; come back whenever it suits you.'
                    : 'Whenever you’re ready, mark today’s small thing. Nothing to keep alive, nothing to lose.'}
              </p>
            </div>

            {/* Last seven days */}
            <div className="mt-8 pt-6 border-t border-ink/10">
              <p className="editorial-label mb-3">This week</p>
              <div className="flex gap-2">
                {[6, 5, 4, 3, 2, 1, 0].map((n) => {
                  const done = streak.doneNDaysAgo(n)
                  const d = new Date(); d.setDate(d.getDate() - n)
                  return (
                    <div key={n} className="flex flex-col items-center gap-1.5 flex-1">
                      <span className={`w-full aspect-square max-w-[44px] flex items-center justify-center border display-italic ${done ? 'bg-ink text-cream border-ink' : 'bg-cream-light border-ink/15 text-ink-softer'}`}>
                        {done ? '✓' : ''}
                      </span>
                      <span className="text-[10px] text-ink-softer uppercase">
                        {d.toLocaleDateString('en-GB', { weekday: 'narrow' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <button onClick={() => onNavigate?.('today')} className="btn-ghost link-underline mt-6">
              Go to Today →
            </button>
          </div>
        </Reveal>
      </section>

      {/* PERSONALIZED ROUTINE */}
      {routine && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Reveal>
            <div className="mb-10 pb-4 border-b border-ink/15">
              <span className="editorial-label">Your routine</span>
              <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
                A day, <span className="display-italic text-clay">your way.</span>
              </h2>
              <p className="text-sm text-ink-soft mt-3 max-w-xl">
                Built around your goal ({routine.label.toLowerCase()}) and your {routine.minutes}-minute window. Adapt it; don't worship it.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ink/15 border border-ink/15">
            <Reveal>
              <RoutineColumn time="Morning" kicker="Start the day" steps={routine.morning} accent="#D4A744" />
            </Reveal>
            <Reveal delay={80}>
              <RoutineColumn time="Evening" kicker="Wind it down" steps={routine.evening} accent="#5A6B5D" />
            </Reveal>
          </div>

          {routine.skinAddons && (
            <Reveal delay={120}>
              <div className="mt-px border-x border-b border-ink/15 bg-bone p-6">
                <span className="editorial-label">For your {skinTypeLabels[profile.skinType]?.toLowerCase()}</span>
                <ul className="mt-3 space-y-1.5">
                  {routine.skinAddons.map((a, i) => (
                    <li key={i} className="text-sm text-ink-soft leading-relaxed flex gap-2">
                      <span className="text-clay">·</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <p className="display-italic text-2xl text-ink-soft mt-6 text-center">"{routine.quote}"</p>
          </Reveal>
        </section>
      )}

      {/* YOUR PLANS, build your own or have Quill draft one */}
      <PlansSection onNavigate={onNavigate} />

      {/* MORE OF YOUR PLAN, folded away by default so the page stays calm */}
      {hasMorePlan && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <Reveal>
            <button onClick={() => setShowMorePlan((v) => !v)} className="btn-ghost link-underline">
              {showMorePlan ? 'Hide the rest of your plan ↑' : 'See the rest of your plan →'}
            </button>
          </Reveal>
        </section>
      )}
      {showMorePlan && (
        <>
      {/* COMPLEMENTARY ROUTINE, the thing that supports your main thing */}
      {complement && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Reveal>
            <div className="mb-10 pb-4 border-b border-ink/15 flex items-end justify-between flex-wrap gap-4">
              <div>
                <span className="editorial-label">The other routine</span>
                <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
                  What <span className="display-italic text-clay">protects it.</span>
                </h2>
                <p className="text-sm text-ink-soft mt-3 max-w-xl">
                  {complement.why}
                </p>
              </div>
              <span className="editorial-label text-clay">↳ {complement.sourceLabel}</span>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ink/15 border border-ink/15">
            <Reveal>
              <RoutineColumn time="Morning" kicker="Supporting AM" steps={complement.morning} accent="#C8654A" />
            </Reveal>
            <Reveal delay={80}>
              <RoutineColumn time="Evening" kicker="Supporting PM" steps={complement.evening} accent="#8FA694" />
            </Reveal>
          </div>

          <Reveal delay={150}>
            <p className="display-italic text-2xl text-ink-soft mt-6 text-center">"{complement.quote}"</p>
          </Reveal>
        </section>
      )}

      {/* PROBLEM-FOCUSED TIPS, Pro-exclusive */}
      {problemTips.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Reveal>
            <div className="mb-10 pb-4 border-b border-ink/15">
              <span className="editorial-label flex items-center gap-2">
                Your answers, your tips <TierBadge />
              </span>
              <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
                For each thing <span className="display-italic text-clay">you told us.</span>
              </h2>
              <p className="text-sm text-ink-soft mt-3 max-w-xl">
                A morning routine, broken down by every answer you gave. One block for your skin type, one for your goal, one for the time you have.
              </p>
            </div>
          </Reveal>

          {isPro ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
              {problemTips.map((block, i) => (
                <Reveal key={block.key} delay={i * 80}>
                  <div className="bg-cream-light p-6 sm:p-8 h-full flex flex-col">
                    <div className="pb-4 mb-5 border-b border-ink/10">
                      <span className="editorial-label">{block.kicker}</span>
                      <p className="font-display text-3xl text-ink mt-1 leading-tight">{block.label}</p>
                      <p className="display-italic text-sm text-clay mt-2 leading-relaxed">{block.why}</p>
                    </div>
                    <ol className="space-y-3 flex-1">
                      {block.steps.map((step, j) => (
                        <li key={j} className="flex items-baseline gap-4">
                          <span className="num-display text-base text-clay flex-shrink-0 w-7">
                            {String(j + 1).padStart(2, '0')}
                          </span>
                          <span className="text-sm text-ink leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            /* Locked teaser */
            <Reveal>
              <SpotlightCard className="pro-card p-8 sm:p-12 relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10 mb-8 opacity-50 blur-[2px] pointer-events-none select-none">
                  {problemTips.map((block) => (
                    <div key={block.key} className="bg-cream-light p-6">
                      <span className="editorial-label">{block.kicker}</span>
                      <p className="font-display text-2xl text-ink mt-1 leading-tight">{block.label}</p>
                      <ol className="space-y-2 mt-4">
                        {block.steps.slice(0, 2).map((step, j) => (
                          <li key={j} className="flex items-baseline gap-3 text-sm text-ink-soft">
                            <span className="num-display text-xs text-clay">{String(j + 1).padStart(2, '0')}</span>
                            <span className="leading-snug">{step}</span>
                          </li>
                        ))}
                        <li className="text-xs text-ink-softer pl-7 italic">+ more</li>
                      </ol>
                    </div>
                  ))}
                </div>
                <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-9">
                    <span className="editorial-label text-gold-dark">Pro Edition</span>
                    <h3 className="font-display text-3xl sm:text-4xl text-ink mt-2 leading-tight">
                      Tailored routines for <span className="display-italic text-clay">each of your answers.</span>
                    </h3>
                    <p className="text-ink-soft mt-3 leading-relaxed text-sm max-w-lg">
                      Five concrete morning-routine steps for your skin type, five for your goal, and five for the time you have, all explained, all editable.
                    </p>
                  </div>
                  <div className="lg:col-span-3 lg:text-right">
                    <MagneticButton onClick={() => onNavigate?.('pro')} className="btn-ink">
                      Unlock <span className="display-italic">→</span>
                    </MagneticButton>
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>
          )}
        </section>
      )}

      {/* PERSONALIZED ADVICE */}
      {advice.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Reveal>
            <div className="mb-10 pb-4 border-b border-ink/15">
              <span className="editorial-label">Advice</span>
              <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
                The four <span className="display-italic text-clay">that matter most.</span>
              </h2>
              <p className="text-sm text-ink-soft mt-3 max-w-xl">
                If you only took four things from Quill, based on what you're working toward, these would be them.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-ink/15 border border-ink/15">
            {advice.map((a, i) => (
              <Reveal key={i} delay={i * 50}>
                <SpotlightCard className="bg-cream-light p-6 sm:p-8 h-full group">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="editorial-num text-3xl text-clay">{String(i + 1).padStart(2, '0')}</span>
                    <span className="editorial-label">Advice</span>
                  </div>
                  <h3 className="font-display text-2xl text-ink leading-tight">{a.title}</h3>
                  <p className="text-sm text-ink-soft mt-3 leading-relaxed">{a.body}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </section>
      )}
        </>
      )}

      {/* YOUR INSTRUMENTS, progressive disclosure; one open at a time */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Reveal>
          <div className="mb-8 pb-4 border-b border-ink/15">
            <span className="editorial-label">Your instruments</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              Tools, <span className="display-italic text-clay">when you reach for them.</span>
            </h2>
            <p className="text-sm text-ink-soft mt-3 max-w-xl">
              Open one at a time. They stay folded away until you want them, so this page stays calm.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
          {INSTRUMENTS.map((t) => {
            const locked = t.max && !isMax
            const open = openTool === t.id
            return (
              <button
                key={t.id}
                onClick={() => (locked ? onNavigate?.('pro') : setOpenTool(open ? null : t.id))}
                aria-expanded={open}
                className={`text-left p-6 transition-colors ${open ? 'bg-ink text-cream' : 'bg-cream-light hover:bg-bone'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`editorial-label ${open ? 'text-cream/60' : ''}`}>{t.kicker}</span>
                  {t.max && <TierBadge />}
                </div>
                <p className="font-display text-2xl mt-2 leading-tight">{t.label}</p>
                <p className={`text-xs mt-1 leading-snug ${open ? 'text-cream/60' : 'text-ink-soft'}`}>{t.desc}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-medium mt-4 ${open ? 'text-gold' : 'text-clay'}`}>
                  {open ? 'Close' : locked ? 'Unlock with Pro' : 'Open'}
                  <span className="display-italic">{open ? '↑' : '→'}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* The opened instrument renders its own full section */}
      {openTool === 'journal' && <SkinJournal />}
      {openTool === 'sounds' && <AudioLibrary />}
      {isMax && openTool === 'sleep' && <SleepAnalyzer />}
      {isMax && openTool === 'cycle' && <CycleTracker />}
      {isMax && openTool === 'wearable' && <WearableSync />}
      {isMax && openTool === 'habits' && <HabitStreaks />}
      {isMax && openTool === 'family' && <FamilySeats />}

      {/* RECOMMENDED CONTENT */}
      {recs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Reveal>
            <div className="mb-8 pb-4 border-b border-ink/15">
              <span className="editorial-label">Read next</span>
              <h2 className="font-display text-4xl sm:text-5xl text-ink mt-2 leading-none">
                Made for <span className="display-italic text-clay">your day.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recs.map((r, i) => (
              <Reveal key={r.key} delay={i * 60}>
                <button
                  onClick={() => onNavigate?.(r.key)}
                  className="w-full text-left card-paper card-paper-hover p-6 sm:p-7 flex items-center justify-between group"
                >
                  <div>
                    <span className="editorial-label text-clay">Recommended</span>
                    <p className="font-display text-2xl text-ink mt-1">{r.label}</p>
                    <p className="display-italic text-sm text-ink-soft mt-1">— {r.why}</p>
                  </div>
                  <span className="display-italic text-3xl text-ink-softer group-hover:text-clay group-hover:translate-x-1 transition-all">→</span>
                </button>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Favorites */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Reveal>
          <div className="flex items-baseline justify-between mb-10 pb-4 border-b border-ink/15">
            <div>
              <span className="editorial-label">Your collection</span>
              <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
                Favorites <span className="display-italic text-clay">({resolved.length})</span>
              </h2>
            </div>
            {!isPro && <span className="editorial-label">Free · 3 max</span>}
          </div>
        </Reveal>

        {resolved.length === 0 ? (
          <Reveal>
            <div className="card-paper p-12 text-center">
              <p className="font-display text-5xl text-ink-softer">∅</p>
              <p className="font-display text-2xl text-ink mt-4">No favorites yet</p>
              <p className="text-sm text-ink-soft mt-2 max-w-sm mx-auto leading-relaxed">
                Tap the heart on any tip, routine, or exercise to save it here for quick access.
              </p>
              <button onClick={() => onNavigate?.('tips')} className="btn-ink mt-6">
                Browse tips <span className="display-italic">→</span>
              </button>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resolved.map((f, i) => (
              <Reveal key={f.id} delay={i * 40} className="h-full">
                <SpotlightCard className="card-paper card-paper-hover p-6 h-full relative group">
                  <div className="absolute top-4 right-4">
                    <FavoriteButton id={f.id} label={f.title} size="sm" />
                  </div>
                  <span className="editorial-num text-2xl text-ink-softer group-hover:text-clay transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="editorial-label mt-1">{f.kicker}</p>
                  <h3 className="font-display text-2xl text-ink mt-2 leading-tight pr-8">{f.title}</h3>
                  {f.body && <p className="text-sm text-ink-soft mt-3 leading-relaxed line-clamp-3">{f.body}</p>}
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Letters from readers, Free sees Pro+Max, Pro sees Max-only, Max sees nothing */}
      <TierReviews onNavigate={onNavigate} />
    </div>
  )
}

function RoutineColumn({ time, kicker, steps, accent }) {
  return (
    <div className="bg-cream-light p-6 sm:p-8 h-full">
      <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-ink/10">
        <div>
          <span className="editorial-label">{kicker}</span>
          <p className="font-display text-3xl text-ink mt-1 leading-none">{time}</p>
        </div>
        <span className="num-display text-5xl leading-none" style={{ color: accent }}>
          {time === 'Morning' ? '☀' : '☾'}
        </span>
      </div>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-baseline gap-4">
            <span className="num-display text-base flex-shrink-0 w-7" style={{ color: accent }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-sm text-ink leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function ProfileChip({ num, label, value }) {
  return (
    <div className="bg-cream-light p-5">
      <div className="flex items-baseline justify-between">
        <span className="editorial-num text-2xl text-clay">{num}</span>
        <span className="editorial-label">{label}</span>
      </div>
      <p className="font-display text-xl text-ink mt-3 leading-tight">{value}</p>
    </div>
  )
}
