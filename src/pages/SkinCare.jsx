import RoutineCard from '../components/RoutineCard.jsx'
import { skincareData } from '../data/skincareData.js'
import { usePro } from '../context/ProContext.jsx'
import { useUser } from '../context/UserContext.jsx'
import SplitText from '../components/interactive/SplitText.jsx'
import Reveal from '../components/interactive/Reveal.jsx'
import Marquee from '../components/interactive/Marquee.jsx'
import SpotlightCard from '../components/interactive/SpotlightCard.jsx'
import TierBadge from '../components/TierBadge.jsx'

const ingredients = [
  { name: 'Niacinamide', good: 'Redness, large pores, oil control', strength: '2–5%', notes: 'Plays well with everything. Start with 5% AM or PM.' },
  { name: 'Hyaluronic acid', good: 'Hydration, plumping', strength: 'Any %', notes: 'Apply to damp skin, seal with moisturizer.' },
  { name: 'Retinoids', good: 'Acne, fine lines, texture', strength: 'Start 0.025%', notes: 'PM only. Build up slowly. Always SPF the next day.' },
  { name: 'Vitamin C', good: 'Brightness, dullness, sun damage', strength: '10–20% L-ascorbic', notes: 'AM only, before SPF. Store dark and cool.' },
  { name: 'Salicylic acid', good: 'Blackheads, congested pores', strength: '0.5–2%', notes: 'Oil-soluble, gets into pores. Two or three times a week for beginners.' },
  { name: 'Ceramides', good: 'Barrier repair, sensitive skin', strength: 'Any', notes: 'Pair with retinoids or acids to rebuild the barrier.' },
]

const weeklyPlan = [
  { day: 'Mon', am: 'Cleanse → Vitamin C → SPF', pm: 'Cleanse → Moisturize' },
  { day: 'Tue', am: 'Cleanse → Niacinamide → SPF', pm: 'Cleanse → Retinoid → Moisturize' },
  { day: 'Wed', am: 'Cleanse → SPF', pm: 'Cleanse → Hydrating mask → Moisturize' },
  { day: 'Thu', am: 'Cleanse → Vitamin C → SPF', pm: 'Cleanse → Moisturize' },
  { day: 'Fri', am: 'Cleanse → Niacinamide → SPF', pm: 'Cleanse → Retinoid → Moisturize' },
  { day: 'Sat', am: 'Cleanse → SPF', pm: 'Cleanse → BHA → Moisturize' },
  { day: 'Sun', am: 'Cleanse → SPF', pm: 'Cleanse → Moisturize (rest day)' },
]

export default function SkinCare({ onNavigate }) {
  const { isPro } = usePro()
  const { profile } = useUser()
  const dailyRoutines = skincareData.filter((r) => ['morning', 'evening'].includes(r.id))
  const skinTypeRoutines = skincareData.filter((r) => !['morning', 'evening'].includes(r.id))

  return (
    <div className="bg-cream">
      {/* HERO */}
      <section style={{ viewTransitionName: 'hero-skincare' }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12">
        <div className="border-b border-ink/15 pb-3 mb-10 flex items-center justify-between">
          <span className="editorial-label">Chapter 03 · Ritual</span>
          <span className="editorial-label hidden sm:inline">Daily & by skin type</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8">
            <h1 className="font-display text-[14vw] sm:text-[10vw] lg:text-[8vw] text-ink leading-[0.9] tracking-tight">
              <SplitText byChar stagger={28}>Simple rituals,</SplitText>
              <br />
              <span className="display-italic text-clay"><SplitText byChar stagger={28} startDelay={500}>real skin.</SplitText></span>
            </h1>
            <Reveal delay={1200} className="mt-8 max-w-md">
              <p className="text-lg text-ink-soft leading-relaxed">
                Beginner-safe skincare for every skin type. Less is more, a consistent gentle routine beats a complicated one you cannot keep up with.
              </p>
            </Reveal>
          </div>
          <Reveal direction="right" delay={400} className="lg:col-span-4">
            <div className="border-l border-ink/15 pl-6">
              <p className="editorial-label mb-4">Three rules</p>
              <ul className="space-y-4 text-sm">
                {[
                  { n: '01', t: 'Patch test first', d: 'Inner arm, 48 hours.' },
                  { n: '02', t: 'One at a time', d: 'Add new products one per week.' },
                  { n: '03', t: 'SPF is everything', d: 'Daily, even when cloudy.' },
                ].map((r) => (
                  <li key={r.n} className="flex gap-3">
                    <span className="num-display text-2xl text-clay leading-none">{r.n}</span>
                    <div>
                      <p className="font-medium text-ink">{r.t}</p>
                      <p className="text-ink-soft text-xs mt-0.5">{r.d}</p>
                    </div>
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
          items={['Cleanse', 'Hydrate', 'Protect', 'Less is more', 'Barrier first', 'Glow comes after', 'SPF · SPF · SPF']}
          separator="✦"
          speed="slow"
          itemClassName="font-display text-2xl sm:text-3xl"
          separatorClassName="text-clay text-xl"
        />
      </section>

      {/* Daily routines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal>
          <div className="mb-10 pb-4 border-b border-ink/15">
            <span className="editorial-label">Daily</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              Morning & <span className="display-italic text-clay">evening.</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dailyRoutines.map((r, i) => (
            <RoutineCard key={r.id} data={r} delay={i * 80} num={String(i + 1).padStart(2, '0')} />
          ))}
        </div>
      </section>

      {/* By skin type */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal>
          <div className="mb-10 pb-4 border-b border-ink/15">
            <span className="editorial-label">By skin type</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              Tuned to <span className="display-italic text-clay">your skin.</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skinTypeRoutines.map((r, i) => (
            <RoutineCard key={r.id} data={r} delay={i * 80} num={String(i + 3).padStart(2, '0')} />
          ))}
        </div>
      </section>

      {/* Pro: Ingredients + weekly plan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isPro ? (
          <>
            <Reveal>
              <div className="mb-10 pb-4 border-b border-ink/15">
                <span className="editorial-label flex items-center gap-2">
                  Ingredients <TierBadge />
                </span>
                <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
                  The <span className="display-italic text-clay">active list.</span>
                </h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
              {ingredients.map((ing, i) => (
                <Reveal key={ing.name} delay={i * 50}>
                  <SpotlightCard className="bg-cream-light p-6 h-full">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="editorial-num text-2xl text-clay">{String(i + 1).padStart(2, '0')}</span>
                      <span className="editorial-label">{ing.strength}</span>
                    </div>
                    <h3 className="font-display text-2xl text-ink leading-tight">{ing.name}</h3>
                    <p className="editorial-label mt-3">Good for</p>
                    <p className="text-sm text-ink mt-1">{ing.good}</p>
                    <p className="text-xs text-ink-soft mt-3 leading-relaxed italic border-t border-ink/10 pt-3">{ing.notes}</p>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className="mt-16 mb-8 pb-4 border-b border-ink/15">
                <span className="editorial-label flex items-center gap-2">
                  Weekly plan <TierBadge />
                </span>
                <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
                  Your seven <span className="display-italic text-clay">days.</span>
                </h2>
                {profile.skinType && profile.skinType !== 'unsure' && (
                  <p className="text-sm text-ink-soft mt-3">Tuned for <span className="font-medium text-ink">{profile.skinType}</span> skin.</p>
                )}
              </div>
            </Reveal>

            <div className="border border-ink/15">
              <div className="hidden md:grid md:grid-cols-[80px_1fr_1fr] gap-4 px-6 py-3 bg-ink text-cream editorial-label">
                <div>Day</div>
                <div>☀ Morning</div>
                <div>☾ Evening</div>
              </div>
              {weeklyPlan.map((d, i) => (
                <Reveal key={d.day} delay={i * 30}>
                  <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_1fr] gap-2 md:gap-4 px-6 py-4 border-t border-ink/10 first:border-t-0 text-sm bg-cream-light hover:bg-bone transition-colors">
                    <div className="font-display text-xl text-ink">{d.day}</div>
                    <div className="text-ink-soft">{d.am}</div>
                    <div className="text-ink-soft">{d.pm}</div>
                  </div>
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
                  Ingredients & a <span className="display-italic text-clay">weekly plan.</span>
                </h3>
                <p className="text-ink-soft mt-3 leading-relaxed text-sm max-w-lg">
                  Niacinamide, retinoids, vitamin C, BHA, what they target, when to use them, how to layer them. Plus a 7-day rotation tuned to your skin type.
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

      {/* Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Reveal>
          <div className="border-t border-b border-ink/15 py-8 grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-6">
            <div>
              <p className="editorial-label">Skincare</p>
              <p className="editorial-num text-3xl text-clay mt-1">✿</p>
            </div>
            <div>
              <p className="font-display text-2xl text-ink mb-2">Everyone&apos;s skin is different.</p>
              <p className="text-sm text-ink-soft leading-relaxed">
                What works for one person may not work for another. If you experience persistent irritation, breakouts, or skin concerns, a dermatologist can give you personalised guidance.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
