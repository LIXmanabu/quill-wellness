import ExerciseCard from '../components/ExerciseCard.jsx'
import { sportData } from '../data/sportData.js'
import { usePro } from '../context/ProContext.jsx'
import SplitText from '../components/interactive/SplitText.jsx'
import Reveal from '../components/interactive/Reveal.jsx'
import Marquee from '../components/interactive/Marquee.jsx'
import SpotlightCard from '../components/interactive/SpotlightCard.jsx'
import TierBadge from '../components/TierBadge.jsx'

const proPlans = [
  { week: 'Week One', focus: 'Form & rhythm', notes: 'Master technique at lower volume — three sessions, twenty minutes each. Rest days are non-negotiable.' },
  { week: 'Week Two', focus: 'Progressive overload', notes: 'Add two reps per set or five seconds to holds. Sleep eight hours plus. Track perceived effort one to ten.' },
  { week: 'Week Three', focus: 'Peak & deload', notes: 'Push harder days one to four, then ease off day five to seven. Recovery is when you adapt.' },
]

export default function Sport({ onNavigate }) {
  const { isPro } = usePro()

  return (
    <div className="bg-cream">
      {/* HERO */}
      <section style={{ viewTransitionName: 'hero-sport' }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12">
        <div className="border-b border-ink/15 pb-3 mb-10 flex items-center justify-between">
          <span className="editorial-label">Chapter 02 · Practice</span>
          <span className="editorial-label hidden sm:inline">{sportData.length} routines</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8">
            <h1 className="font-display text-[14vw] sm:text-[10vw] lg:text-[8vw] text-ink leading-[0.9] tracking-tight">
              <SplitText byChar stagger={28}>Move your body,</SplitText>
              <br />
              <span className="display-italic text-clay"><SplitText byChar stagger={28} startDelay={500}>love your body.</SplitText></span>
            </h1>
            <Reveal delay={1200} className="mt-8 max-w-md">
              <p className="text-lg text-ink-soft leading-relaxed">
                Beginner-safe routines built around common fitness goals. No gym needed — just you, your body, and a little space.
              </p>
            </Reveal>
          </div>
          <Reveal direction="right" delay={400} className="lg:col-span-4">
            <div className="border-l border-ink/15 pl-6">
              <p className="editorial-label mb-4">In this chapter</p>
              <ul className="space-y-2 text-sm">
                {sportData.map((r, i) => (
                  <li key={r.id} className="flex items-baseline gap-3 text-ink-soft">
                    <span className="num-display text-xs text-clay w-6">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-medium text-ink">{r.title}</span>
                    <span className="display-italic text-xs ml-auto">{r.duration}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Marquee */}
      <section className="bg-ink text-cream py-4 border-y border-ink overflow-hidden">
        <Marquee
          items={['Strength', 'Mobility', 'Steady breath', 'Form first', 'Rest is training', 'No PRs needed', 'Slow over fast']}
          separator="◆"
          speed="slow"
          itemClassName="font-display text-2xl sm:text-3xl"
          separatorClassName="text-clay text-xl"
        />
      </section>

      {/* Routines grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal>
          <div className="mb-10 pb-4 border-b border-ink/15">
            <span className="editorial-label">The routines</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              Six ways to <span className="display-italic text-clay">move.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sportData.map((item, i) => (
            <ExerciseCard key={item.id} data={item} delay={i * 60} num={String(i + 1).padStart(2, '0')} />
          ))}
        </div>
      </section>

      {/* Pro: 3-week progression */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isPro ? (
          <>
            <Reveal>
              <div className="mb-10 pb-4 border-b border-ink/15 flex items-baseline justify-between">
                <div>
                  <span className="editorial-label flex items-center gap-2">
                    Pro Edition <TierBadge />
                  </span>
                  <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
                    A three-week <span className="display-italic text-clay">progression.</span>
                  </h2>
                </div>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
              {proPlans.map((p, i) => (
                <Reveal key={p.week} delay={i * 100}>
                  <SpotlightCard className="bg-cream-light p-8 h-full">
                    <span className="editorial-num text-4xl text-clay">{String(i + 1).padStart(2, '0')}</span>
                    <p className="editorial-label mt-2">{p.week}</p>
                    <h3 className="font-display text-2xl text-ink mt-3">{p.focus}</h3>
                    <p className="text-sm text-ink-soft mt-3 leading-relaxed">{p.notes}</p>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          <Reveal>
            <SpotlightCard className="pro-card p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-9">
                <span className="editorial-label text-gold-dark">Pro Edition</span>
                <h3 className="font-display text-3xl sm:text-4xl text-ink mt-2 leading-tight">
                  Want a <span className="display-italic text-clay">three-week plan?</span>
                </h3>
                <p className="text-ink-soft mt-3 leading-relaxed max-w-lg text-sm">
                  Structured cycles that build strength week by week — instead of guessing what to do next session.
                </p>
              </div>
              <div className="lg:col-span-3 lg:text-right">
                <button onClick={() => onNavigate?.('pro')} className="btn-ink">
                  Unlock <span className="display-italic">→</span>
                </button>
              </div>
            </SpotlightCard>
          </Reveal>
        )}
      </section>

      {/* Safety footer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Reveal>
          <div className="border-t border-b border-ink/15 py-8 grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-6">
            <div>
              <p className="editorial-label">Safety</p>
              <p className="editorial-num text-3xl text-clay mt-1">▲</p>
            </div>
            <div>
              <p className="font-display text-2xl text-ink mb-2">A fitness reminder.</p>
              <p className="text-sm text-ink-soft leading-relaxed">
                Always warm up before and cool down after. Listen to your body — rest when you need to. Avoid overtraining: muscle soreness is normal, but sharp pain is not. Rest days are part of your progress, not a break from it. If you are new to exercise or have any health concerns, check with a doctor before starting a new routine.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
