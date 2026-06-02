import { useUser } from '../context/UserContext.jsx'
import { usePro } from '../context/ProContext.jsx'
import DailyTipCard from '../components/DailyTipCard.jsx'
import Marquee from '../components/interactive/Marquee.jsx'
import SplitText from '../components/interactive/SplitText.jsx'
import Reveal from '../components/interactive/Reveal.jsx'
import AnimatedCounter from '../components/interactive/AnimatedCounter.jsx'
import MagneticButton from '../components/interactive/MagneticButton.jsx'
import SpotlightCard from '../components/interactive/SpotlightCard.jsx'

const sections = [
  { num: '01', key: 'body', label: 'Body Map', kicker: 'Atlas', desc: 'Thirteen regions, mapped from the inside out — head to toe, with the wisdom of how they relate.', bg: 'card-bone', accent: 'text-clay' },
  { num: '02', key: 'sport', label: 'Movement', kicker: 'Practice', desc: 'Beginner-safe routines for legs, core, glutes, arms — no gym, no shame.', bg: 'card-sage', accent: 'text-sage-dark' },
  { num: '03', key: 'skincare', label: 'Skin Care', kicker: 'Ritual', desc: 'Morning, evening, and skin-type routines. Less is more — consistency beats complication.', bg: 'card-blush', accent: 'text-rust' },
  { num: '04', key: 'wellness', label: 'Wellness', kicker: 'Rest', desc: 'Stress, sleep, cramps, hydration — gentle, evidence-informed self-care for the whole self.', bg: 'card-sage', accent: 'text-sage-dark' },
  { num: '05', key: 'diet', label: 'Diet', kicker: 'Fuel', desc: 'Six evidence-based ways to eat, by goal — plus a pH self check-in and the ideal plate.', bg: 'card-clay', accent: 'text-clay-dark' },
  { num: '06', key: 'tips', label: 'Daily Tips', kicker: 'Almanac', desc: 'Sixty bite-sized habits across hydration, sleep, mood, movement, mindset and more.', bg: 'card-gold', accent: 'text-gold-dark' },
]

const goalGreeting = {
  glow: { line: 'A little extra glow today. You are in the right place.', primary: 'skincare', primaryLabel: 'Today\'s Skin Ritual' },
  fitness: { line: 'Ready to move? Let\'s find something that feels good.', primary: 'sport', primaryLabel: 'Today\'s Movement' },
  calm: { line: 'Take a breath. Let\'s find your calm.', primary: 'wellness', primaryLabel: 'Stress Relief' },
  body: { line: 'Your body is the only one you get. Let\'s understand it.', primary: 'body', primaryLabel: 'Open the Atlas' },
  eat: { line: 'Fuel that fits the goal you actually have.', primary: 'diet', primaryLabel: 'See the Diets' },
}

function getTimeGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Home({ onNavigate }) {
  const { profile } = useUser()
  const { isPro } = usePro()
  const isReturning = profile.dismissedOnboarding && (profile.name || profile.goal)
  const greeting = goalGreeting[profile.goal]

  return (
    <div className="bg-cream">

      {/* ══════════════════════════════════════ HERO — dark ══════════════════════════════════════ */}
      <section className="bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20">

          {/* Top kicker */}
          <div className="flex items-center justify-between border-b border-cream/10 pb-3 mb-10 sm:mb-14">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/50 font-sans">
              {isReturning
                ? `${getTimeGreeting()}${profile.name ? `, ${profile.name}` : ''}`
                : 'A wellness companion'}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/30 font-sans hidden sm:inline">
              Vol. 01 · Spring Edition
            </span>
          </div>

          {/* Asymmetric two-column hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Headline column */}
            <div className="lg:col-span-8">
              <h1 className="font-display text-[clamp(2.6rem,12.5vw,4.75rem)] sm:text-[13vw] lg:text-[10.5vw] xl:text-[9.5vw] text-cream leading-[0.9] sm:leading-[0.88] tracking-tight">
                <SplitText byChar stagger={28}>Feel good,</SplitText>
                <br />
                <span className="display-italic text-clay">
                  <SplitText byChar stagger={28} startDelay={400}>from the inside</SplitText>
                </span>
                <br />
                <SplitText byChar stagger={28} startDelay={900}>out.</SplitText>
              </h1>
              <Reveal delay={1400} className="mt-8 max-w-md">
                <p className="text-lg text-cream/55 leading-relaxed">
                  {isReturning && greeting
                    ? greeting.line
                    : 'A quiet, beginner-safe guide for fitness, skin, body, and the small things that build a whole self.'}
                </p>
              </Reveal>
              <Reveal delay={1600} className="mt-8 flex flex-wrap items-center gap-3">
                <MagneticButton onClick={() => onNavigate(greeting?.primary || 'body')} className="btn-cream">
                  {greeting?.primaryLabel || 'Open the Atlas'} <span className="display-italic">→</span>
                </MagneticButton>
                <button
                  onClick={() => onNavigate('today')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-cream/30 text-cream text-sm font-medium tracking-wide transition-all duration-300 hover:border-cream hover:-translate-y-0.5"
                >
                  Start with Today <span className="display-italic">→</span>
                </button>
                <button
                  onClick={() => onNavigate(isPro ? 'tips' : 'wellness')}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-cream/80 hover:text-cream transition-colors link-underline cta-rainbow"
                >
                  Or, browse {isPro ? 'today\'s tips' : 'wellness'} <span className="display-italic">→</span>
                </button>
              </Reveal>
            </div>

            {/* Right column: Index */}
            <Reveal delay={400} direction="right" className="lg:col-span-4 lg:pt-4">
              <div className="border-l border-cream/10 pl-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/35 font-sans mb-4">
                  In this issue
                </p>
                <ol className="space-y-2.5">
                  {sections.map((s) => (
                    <li key={s.key}>
                      <button
                        onClick={() => onNavigate(s.key)}
                        className="group flex items-baseline gap-3 text-left w-full"
                      >
                        <span className="text-xs num-display text-cream/25 w-6 flex-shrink-0">
                          {s.num}
                        </span>
                        <span className="font-display text-xl text-cream/65 group-hover:text-cream transition-colors duration-200">
                          {s.label}
                        </span>
                        <span className="display-italic text-sm text-cream/25 ml-auto group-hover:text-clay transition-colors duration-200">
                          {s.kicker}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ MARQUEE — flows from hero ══════════════════════════════════════ */}
      <section className="bg-ink text-cream py-4 sm:py-5 border-t border-cream/8 overflow-hidden">
        <Marquee
          items={['Calm', 'Confident', 'Rooted', 'Curious', 'Soft strength', 'Body-positive', 'Slow over fast', 'Evidence over hype', 'No login', 'No tracking', 'No shame']}
          speed="slow"
          separator="✺"
          itemClassName="font-display text-2xl sm:text-3xl"
          separatorClassName="text-clay text-xl"
        />
      </section>

      {/* ══════════════════════════════════════ IN THIS VOLUME — editorial count line ══════════════════════════════════════ */}
      <section className="border-b border-ink/12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 lg:items-baseline">
            <Reveal className="lg:col-span-3">
              <span className="editorial-label">In this volume</span>
            </Reveal>
            <Reveal delay={120} className="lg:col-span-9">
              <p className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink leading-snug text-balance">
                <AnimatedCounter to={13} className="text-clay" /> body regions,{' '}
                <AnimatedCounter to={60} className="text-clay" /> daily tips,{' '}
                <AnimatedCounter to={6} className="text-clay" /> ways to eat, and{' '}
                <AnimatedCounter to={7} className="text-clay" /> kinds of rest.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ DAILY TIP ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-8">
          <Reveal className="lg:col-span-7">
            <span className="editorial-label">Today, in your almanac</span>
            <h2 className="font-display text-6xl sm:text-7xl text-ink mt-2 leading-none">
              Tip of the <span className="display-italic text-clay">day</span>
            </h2>
          </Reveal>
          <Reveal delay={150} className="lg:col-span-5 lg:text-right">
            <button onClick={() => onNavigate('tips')} className="btn-ghost link-underline cta-rainbow">
              Browse all 60 tips →
            </button>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <DailyTipCard onNavigateLibrary={() => onNavigate('tips')} />
        </Reveal>
      </section>

      {/* ══════════════════════════════════════ INDEX — bento grid ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 pb-4 border-b border-ink/15">
            <div>
              <span className="editorial-label">The index</span>
              <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
                Six chapters,<br />
                <span className="display-italic text-clay">one quiet life.</span>
              </h2>
            </div>
            <p className="text-sm text-ink-soft max-w-xs sm:text-right">
              Each chapter is self-contained. Read them in any order — Quill follows you, not the other way around.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          {sections.map((s, i) => {
            const layoutClasses = [
              'md:col-span-7 md:row-span-2',
              'md:col-span-5',
              'md:col-span-5',
              'md:col-span-4',
              'md:col-span-4',
              'md:col-span-4',
            ]
            const isFeatured = i === 0
            const isRecommended = profile.goal && (
              (profile.goal === 'body' && s.key === 'body') ||
              (profile.goal === 'fitness' && s.key === 'sport') ||
              (profile.goal === 'glow' && s.key === 'skincare') ||
              (profile.goal === 'calm' && s.key === 'wellness') ||
              (profile.goal === 'eat' && s.key === 'diet')
            )

            return (
              <Reveal key={s.key} delay={i * 80} className={layoutClasses[i]}>
                <SpotlightCard
                  as="button"
                  onClick={() => onNavigate(s.key)}
                  style={{ viewTransitionName: `hero-${s.key}` }}
                  className={`group relative w-full h-full text-left p-6 sm:p-8 border transition-all duration-500 hover:-translate-y-1 ${
                    isFeatured
                      ? 'bg-ink border-ink min-h-[420px]'
                      : `${s.bg} border-ink/10 hover:border-ink/40 min-h-[200px]`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-6">
                    <span className={`editorial-num text-3xl sm:text-4xl leading-none transition-colors duration-300 ${
                      isFeatured
                        ? 'text-cream/25 group-hover:text-clay'
                        : 'text-ink/30 group-hover:text-clay'
                    }`}>
                      {s.num}
                    </span>
                    {isRecommended ? (
                      <span className={`chip text-[9px] flex-shrink-0 ${isFeatured ? 'bg-cream/10 text-cream border-cream/20' : 'chip-ink'}`}>
                        For you
                      </span>
                    ) : (
                      <span className={`editorial-label ${isFeatured ? 'text-cream/40' : ''}`}>{s.kicker}</span>
                    )}
                  </div>
                  <h3 className={`font-display leading-none ${
                    isFeatured
                      ? 'text-6xl sm:text-7xl text-cream'
                      : 'text-4xl sm:text-5xl text-ink'
                  }`}>
                    {s.label}
                  </h3>
                  <p className={`mt-4 leading-relaxed break-words ${
                    isFeatured
                      ? 'text-lg text-cream/55 max-w-md'
                      : 'text-sm text-ink-soft line-clamp-3'
                  }`}>
                    {s.desc}
                  </p>
                  <div className={`mt-6 flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${
                    isFeatured
                      ? 'text-cream/50 group-hover:text-cream'
                      : 'text-ink group-hover:text-clay'
                  }`}>
                    <span className="link-underline">Read chapter</span>
                    <span className="display-italic transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </SpotlightCard>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════ PULL QUOTE — dark band ══════════════════════════════════════ */}
      <section className="bg-ink py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="relative">
              <span
                className="absolute -top-8 sm:-top-14 left-1/2 -translate-x-1/2 font-display text-[160px] sm:text-[220px] leading-none text-cream/[0.04] select-none pointer-events-none"
                aria-hidden="true"
              >"</span>
              <p className="display-italic text-3xl sm:text-5xl lg:text-[3.5rem] text-cream leading-[1.12] text-balance relative z-10">
                Self-care isn't a luxury.<br />
                It's how you stay in the same body<br className="hidden sm:block" /> for eighty years.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <span className="w-16 h-px bg-cream/20" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/35 font-sans">A Quill principle</span>
                <span className="w-16 h-px bg-cream/20" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════ PRO UPSELL ══════════════════════════════════════ */}
      {!isPro && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Reveal>
            <SpotlightCard className="pro-card p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <span className="editorial-label text-gold-dark">Quill, Pro Edition</span>
                <h3 className="font-display text-4xl sm:text-5xl text-ink mt-2 leading-tight">
                  Want the <span className="display-italic text-clay">unabridged</span> version?
                </h3>
                <p className="text-ink-soft mt-4 max-w-lg">
                  Sixty tips uncapped. Ingredient deep-dives. Three-week progression plans. Guided breathing. Seven-day meal templates. Unlimited favorites. All the depth a real practice needs.
                </p>
              </div>
              <div className="lg:col-span-4 lg:text-right">
                <MagneticButton onClick={() => onNavigate('pro')} className="btn-ink">
                  See Pro — free preview <span className="display-italic">→</span>
                </MagneticButton>
              </div>
            </SpotlightCard>
          </Reveal>
        </section>
      )}

      {/* ══════════════════════════════════════ COLOPHON ══════════════════════════════════════ */}
      <section className="border-t border-ink/15 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <p className="editorial-label mb-3">Colophon</p>
              <p className="font-display text-2xl text-ink leading-tight">Quill — Wellness, <span className="display-italic">quietly.</span></p>
              <p className="text-sm text-ink-soft mt-3 leading-relaxed">
                A wellness companion for the practice of being human. Built with care. Hand-set in Fraunces & Instrument Serif. Your account and progress live only in this browser — no server, no tracking.
              </p>
            </div>
            <div>
              <p className="editorial-label mb-3">Not medical advice</p>
              <p className="text-sm text-ink-soft leading-relaxed">
                Quill provides general self-care information. For health concerns, talk to a doctor, dermatologist, or trusted adult. You deserve real care.
              </p>
            </div>
            <div>
              <p className="editorial-label mb-3">Principles</p>
              <ul className="space-y-1.5 text-sm text-ink-soft">
                <li>· Body-positive, always</li>
                <li>· Evidence over hype</li>
                <li>· Slow over fast</li>
                <li>· No shame, ever</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] num-display text-ink-softer uppercase tracking-[0.25em]">
            <span>Quill · Vol. 01 · 2026</span>
            <span>Made with attention, not algorithms</span>
          </div>
        </div>
      </section>

    </div>
  )
}
