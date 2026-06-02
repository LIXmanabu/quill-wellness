import { useState } from 'react'
import { usePro } from '../context/ProContext.jsx'
import SplitText from '../components/interactive/SplitText.jsx'
import Reveal from '../components/interactive/Reveal.jsx'
import Marquee from '../components/interactive/Marquee.jsx'
import AnimatedCounter from '../components/interactive/AnimatedCounter.jsx'
import MagneticButton from '../components/interactive/MagneticButton.jsx'
import SpotlightCard from '../components/interactive/SpotlightCard.jsx'
import CheckoutModal from '../components/CheckoutModal.jsx'

const features = [
  // ── Real, built today ─────────────────────────────────────────
  { num: '01', icon: '∞', title: 'Saved favorites', free: 'Three', pro: 'Unlimited', max: 'Unlimited', status: 'live' },
  { num: '02', icon: '☉', title: 'Tip library', free: '~5 per category', pro: 'All 60', max: 'All 60', status: 'live' },
  { num: '03', icon: '✺', title: 'Personalized MyQuill', free: '—', pro: 'Full routine + advice', max: 'Full routine + advice', status: 'live' },
  { num: '04', icon: '♆', title: 'Per-answer routine block', free: '—', pro: 'Included', max: 'Included', status: 'live' },
  { num: '05', icon: '☄', title: 'Complementary routine', free: '—', pro: 'Included', max: 'Included', status: 'live' },
  { num: '06', icon: '☽', title: 'Live diet tracker', free: '—', pro: 'Macros + smart suggestions', max: 'Macros + smart suggestions', status: 'live' },
  { num: '07', icon: '⊕', title: '7-day meal templates', free: 'Diet overview only', pro: 'All 6 protocols', max: 'All 6 protocols', status: 'live' },
  { num: '08', icon: '⚘', title: 'Body Map cross-refs', free: 'Single region', pro: 'Related areas', max: 'Related areas', status: 'live' },
  // ── Max-only tools, all live ──────────────────────────────────
  { num: '09', icon: '☾', title: 'Sleep schedule analyzer', free: '—', pro: '—', max: '7-night log · consistency score · jetlag', status: 'live' },
  { num: '10', icon: '✓', title: 'Habit streak tracker', free: '—', pro: '—', max: '9 presets · 14-day grid · live streaks', status: 'live' },
  { num: '11', icon: '◯', title: 'Cycle tracking', free: '—', pro: '—', max: '4-phase calendar · phase-aware advice', status: 'live' },
  { num: '12', icon: '◈', title: 'Wearable sync', free: '—', pro: '—', max: 'Apple · Oura · Whoop · Garmin · manual', status: 'live' },
  { num: '13', icon: '◐', title: 'Audio library', free: '4 ambient sounds', pro: '6 sounds', max: '8 sounds · breathwork timer', status: 'live' },
  { num: '14', icon: '✿', title: 'Family seats', free: '1', pro: '1', max: '4 — share with household', status: 'live' },
]

const testimonials = [
  { name: 'Maya, 17', role: 'Student', plan: 'Pro', quote: 'I actually open Quill every morning now. The daily tip + my saved routines are everything I want from a wellness app.' },
  { name: 'Anya, 21', role: 'Designer', plan: 'Max', quote: 'My Oura data flows in, the AI catches what I miss, and the monthly coach call keeps me honest. It feels like the wellness app finally caught up.' },
  { name: 'Lila, 19', role: 'Athlete', plan: 'Max', quote: 'Cycle-aware training is the killer feature for me. Programming that knows my hormones means I stop overtraining the second week of every month.' },
]

const proValue = [
  { num: 60, label: 'Daily tips, uncapped' },
  { num: 13, label: 'Body regions, cross-referenced' },
  { num: 6, label: 'Diet protocols, with meal plans' },
  { num: 4, label: 'Family seats on Max' },
]

const tiers = [
  {
    key: 'free',
    label: 'Free',
    sub: 'The essentials, generously.',
    price: 0,
    period: 'forever',
    accent: 'cream',
    bullets: [
      'Body map — all thirteen regions',
      'Core sport routines',
      'Daily skincare basics',
      'Three saved favorites',
      'Five tips per category',
      'Full diet & pH guide',
      '4 ambient sounds + breathwork timer',
    ],
  },
  {
    key: 'pro',
    label: 'Pro',
    sub: 'Depth that turns wellness into a practice.',
    price: 5,
    period: 'month',
    accent: 'ink',
    bullets: [
      'Unlimited favorites + collections',
      'All 60 wellness tips, full library',
      'Ingredient & science deep-dives',
      'Per-answer routine on My Quill',
      'Live diet tracker + smart suggestions',
      'Seven-day meal templates',
      '6 ambient sounds (4 free + 2 Pro)',
    ],
  },
  {
    key: 'max',
    label: 'Max',
    sub: 'Six working tools. Real data, real cycle tracking, real audio.',
    price: 13,
    crossedPrice: 20,
    period: 'month',
    accent: 'gold',
    bullets: [
      'Everything in Pro',
      'Sleep schedule analyzer — 7-night log, consistency + jetlag stats',
      'Cycle tracking — 4-phase calendar with phase-aware advice',
      'Wearable sync — Apple Health, Oura, Whoop, Garmin (or manual)',
      'Audio library — 8 ambient sounds + 3 breathwork timers',
      'Habit streak tracker — 9 presets with a 14-day visual grid',
      'Family seats — 4 members on one plan',
      'Rainbow Max theme + 30-day early access to new tools',
    ],
  },
]

export default function Pro({ onNavigate }) {
  const { tier, isPro, isMax, setTier } = usePro()
  const [checkoutPlan, setCheckoutPlan] = useState(null)

  function openCheckout(plan) { setCheckoutPlan(plan) }
  function closeCheckout() { setCheckoutPlan(null) }

  return (
    <div className="bg-cream">
      {checkoutPlan && <CheckoutModal plan={checkoutPlan} onClose={closeCheckout} />}

      {/* ════════════════════════════════════════ HERO ════════════════════════════════════════ */}
      <section style={{ viewTransitionName: 'hero-pro' }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16">
        <div className="border-b border-ink/15 pb-3 mb-12 flex items-center justify-between">
          <span className="editorial-label">Pro Edition · Issue 01</span>
          <span className="editorial-label">{isMax ? 'Quill Max · active' : isPro ? 'Quill Pro · active' : 'Free reader'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8">
            <h1 className="font-display text-[14vw] sm:text-[11vw] lg:text-[9vw] text-ink leading-[0.9] tracking-tight">
              <SplitText byChar stagger={30}>Quill,</SplitText>
              <br />
              <span className="display-italic">
                <SplitText byChar stagger={30} startDelay={400}>unabridged.</SplitText>
              </span>
            </h1>
            <Reveal delay={600} className="mt-8 max-w-md">
              <p className="text-lg text-ink-soft leading-relaxed">
                The depth, the personalization, the patience to follow you through seasons — for the practice of being well, on your terms.
              </p>
            </Reveal>
            <Reveal delay={700} className="mt-8 flex flex-wrap items-center gap-3">
              {isMax ? (
                <>
                  <div className="btn-ink pointer-events-none opacity-75">✓ Max is active</div>
                  <button onClick={() => setTier('free')} className="btn-ghost link-underline">
                    Cancel subscription
                  </button>
                </>
              ) : isPro ? (
                <>
                  <MagneticButton onClick={() => openCheckout('max')} className="inline-flex items-center gap-2 px-6 py-3.5 bg-gold text-ink text-sm font-medium hover:bg-gold-light transition-colors">
                    Upgrade to Max <span className="display-italic">→</span>
                  </MagneticButton>
                  <button onClick={() => setTier('free')} className="btn-ghost link-underline">
                    Switch back to Free
                  </button>
                </>
              ) : (
                <>
                  <MagneticButton onClick={() => openCheckout('pro')} className="btn-ink">
                    Start Pro — $5/mo <span className="display-italic">→</span>
                  </MagneticButton>
                  <MagneticButton onClick={() => openCheckout('max')} className="inline-flex items-center gap-2 px-6 py-3.5 bg-gold text-ink text-sm font-medium hover:bg-gold-light transition-colors">
                    Or go Max — $13/mo <span className="display-italic">→</span>
                  </MagneticButton>
                  <button onClick={() => onNavigate?.('home')} className="btn-ghost link-underline">
                    Or, stay on Free
                  </button>
                </>
              )}
            </Reveal>
            <p className="text-xs text-ink-softer mt-3">
              Prototype mockup. Cancel anytime from My Quill — no real charge is taken.
            </p>
          </div>

          <Reveal direction="right" delay={300} className="lg:col-span-4 lg:pt-4">
            <div className="border-l border-ink/15 pl-6 space-y-5">
              <p className="editorial-label">In numbers</p>
              {proValue.map((p) => (
                <div key={p.label} className="border-b border-ink/10 pb-4 last:border-b-0">
                  <AnimatedCounter to={p.num} className="text-5xl text-ink" />
                  <p className="editorial-label mt-1 text-ink-soft">{p.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════ MARQUEE ════════════════════════════════════════ */}
      <section className="bg-ink text-cream py-4 sm:py-5 border-y border-ink overflow-hidden">
        <Marquee
          items={['Free', 'Pro · $5/mo', 'Max · $13/mo', 'Family seats', 'AI assistant', 'PT-written cycles', 'RD-built meal plans']}
          separator="✺"
          speed="slow"
          itemClassName="font-display text-2xl sm:text-3xl"
          separatorClassName="text-gold text-xl"
        />
      </section>

      {/* ════════════════════════════════════════ PRICING (3 tiers) ════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20" id="pricing">
        <Reveal>
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-10 pb-4 border-b border-ink/15">
            <h2 className="font-display text-5xl sm:text-6xl text-ink leading-none">
              The three <span className="display-italic text-clay">editions.</span>
            </h2>
            <p className="editorial-label">Cancel anytime — no commitment.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
          {tiers.map((t, i) => {
            const active = tier === t.key
            const isInk = t.accent === 'ink'
            const isGold = t.accent === 'gold'
            return (
              <Reveal key={t.key} delay={i * 80}>
                <SpotlightCard className={`p-8 sm:p-10 h-full relative flex flex-col ${
                  isInk ? 'bg-ink text-cream' : isGold ? 'pro-card bg-cream-light' : 'bg-cream-light'
                }`}>
                  <div className="flex items-baseline justify-between mb-6">
                    <p className={`editorial-label ${isInk ? 'text-gold' : isGold ? 'text-gold-dark' : ''}`}>
                      Edition {String(i + 1).padStart(2, '0')} — {t.label}
                    </p>
                    <span className={`editorial-num text-2xl ${isInk ? 'text-cream/40' : 'text-ink-softer'}`}>
                      0{i + 1}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-1">
                    {t.crossedPrice && (
                      <span className={`num-display text-2xl line-through ${isInk ? 'text-cream/40' : 'text-ink-softer'}`}>
                        ${t.crossedPrice}
                      </span>
                    )}
                    <span className={`font-display text-7xl leading-none ${isInk ? 'text-cream' : 'text-ink'}`}>
                      ${t.price}
                    </span>
                    <span className={`text-sm ml-1 ${isInk ? 'text-cream/50' : 'text-ink-softer'}`}>
                      /{t.period}
                    </span>
                  </div>

                  {t.crossedPrice && (
                    <p className="editorial-label text-clay mt-1">Launch offer · save ${t.crossedPrice - t.price}/mo</p>
                  )}

                  <p className={`text-sm mt-3 mb-6 leading-relaxed ${isInk ? 'text-cream/80' : 'text-ink-soft'}`}>
                    {t.sub}
                  </p>

                  <div className={`space-y-3 border-t pt-6 flex-1 ${isInk ? 'border-cream/20' : 'border-ink/15'}`}>
                    {t.bullets.map((b) => (
                      <div key={b} className={`flex items-baseline gap-3 text-sm ${isInk ? '' : 'text-ink'}`}>
                        <span className={isInk ? 'text-gold' : isGold ? 'text-gold-dark' : 'text-clay'}>
                          {isInk || isGold ? '✦' : '+'}
                        </span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    {active ? (
                      <div className={`btn-ink w-full justify-center pointer-events-none opacity-75 ${isInk ? 'bg-cream text-ink' : ''}`}>
                        ✓ Your plan
                      </div>
                    ) : t.key === 'free' ? (
                      <button
                        onClick={() => setTier('free')}
                        className="btn-cream w-full justify-center"
                      >
                        Stay on Free
                      </button>
                    ) : (
                      <MagneticButton
                        onClick={() => openCheckout(t.key)}
                        className={`w-full justify-center inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium tracking-wide transition-all ${
                          isGold ? 'bg-gold text-ink hover:bg-gold-light' : 'bg-gold text-ink hover:bg-gold-light'
                        }`}
                      >
                        {t.key === 'pro' ? 'Start Pro' : 'Go Max'} <span className="display-italic">→</span>
                      </MagneticButton>
                    )}
                  </div>
                </SpotlightCard>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════ FEATURE COMPARISON ════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <Reveal>
          <div className="mb-8 pb-4 border-b border-ink/15">
            <span className="editorial-label">Specifications</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              The <span className="display-italic text-clay">complete list.</span>
            </h2>
            <p className="text-sm text-ink-soft mt-3 max-w-xl">
              Honest about what's live versus planned. "Live" features work today; "preview" rows are on the Max roadmap.
            </p>
          </div>
        </Reveal>

        <div className="border border-ink/15 overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[60px_minmax(180px,1fr)_80px_120px_140px_180px] gap-3 px-4 sm:px-6 py-3 bg-ink text-cream editorial-label">
              <div>№</div>
              <div>Feature</div>
              <div className="text-center">Status</div>
              <div className="text-center">Free</div>
              <div className="text-center">Pro</div>
              <div className="text-center">Max</div>
            </div>
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 20}>
                <div className={`grid grid-cols-[60px_minmax(180px,1fr)_80px_120px_140px_180px] gap-3 px-4 sm:px-6 py-4 border-t border-ink/10 text-sm items-center ${f.status === 'planned' ? 'bg-bone' : 'bg-cream-light'}`}>
                  <div className="num-display text-xl text-ink-softer">{f.num}</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg text-clay">{f.icon}</span>
                    <span className="font-medium text-ink">{f.title}</span>
                  </div>
                  <div className="text-center">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                      f.status === 'live' ? 'bg-sage-pale text-sage-dark border-sage/30' : 'bg-gold-pale text-gold-dark border-gold/30'
                    }`}>
                      {f.status}
                    </span>
                  </div>
                  <div className="text-center text-ink-softer text-xs">{f.free}</div>
                  <div className="text-center text-ink text-xs font-medium">{f.pro}</div>
                  <div className="text-center text-gold-dark text-xs font-medium">{f.max}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════ TESTIMONIALS ════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <Reveal>
          <div className="mb-10 pb-4 border-b border-ink/15">
            <span className="editorial-label">Letters from readers</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              What they're <span className="display-italic text-clay">saying.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="bg-cream-light p-8 h-full flex flex-col">
                <span className="editorial-label text-clay">On {t.plan}</span>
                <p className="display-italic text-xl text-ink leading-relaxed flex-1 mt-3">
                  "{t.quote}"
                </p>
                <figcaption className="mt-6 pt-6 border-t border-ink/15 flex items-baseline justify-between">
                  <span className="font-medium text-ink">{t.name}</span>
                  <span className="editorial-label">{t.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════ FAQ ════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <Reveal>
          <div className="mb-10 pb-4 border-b border-ink/15">
            <span className="editorial-label">Frequently asked</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              Honest <span className="display-italic text-clay">answers.</span>
            </h2>
          </div>
        </Reveal>
        <div className="border-b border-ink/15">
          {[
            { q: 'Is this a real subscription?', a: 'No — Quill is a prototype. The checkout looks real but no payment is taken; your card details stay in your browser.' },
            { q: 'What\'s the difference between Pro and Max?', a: 'Pro gives you the full software — all 60 tips, per-answer routine, live diet tracker, ingredient deep-dives, 7-day meal templates. Max adds six dedicated tools that live on MyQuill: sleep schedule analyzer, cycle tracking, wearable sync (with sample data + manual logging), audio library with browser-generated sounds + breathwork timer, habit streak tracker, and four family seats. Plus the rainbow theme and 30-day early access to new tools.' },
            { q: 'Can I cancel anytime?', a: 'Yes — monthly with no commitment. In this prototype, cancel from My Quill or the hero CTA above.' },
            { q: 'Do you store my data?', a: 'Everything stays in your browser via localStorage. No account, no servers, no tracking — even on Max.' },
            { q: 'Is content medically reviewed?', a: 'All in-app content is general wellness guidance, evidence-informed but not medical advice. Max-tier custom plans are built by registered professionals.' },
          ].map((item, i) => (
            <Reveal key={item.q} delay={i * 50}>
              <details className="group border-t border-ink/15 first:border-t-0">
                <summary className="cursor-pointer py-6 flex items-center justify-between gap-4 list-none hover:text-clay transition-colors">
                  <span className="font-display text-2xl text-ink group-hover:text-clay transition-colors">
                    {item.q}
                  </span>
                  <span className="text-2xl text-ink-soft group-open:rotate-45 transition-transform display-italic">+</span>
                </summary>
                <p className="pb-6 pr-8 text-ink-soft leading-relaxed">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════ FINAL CTA ════════════════════════════════════════ */}
      <section className="bg-ink text-cream py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="editorial-label text-gold mb-6">A closing note</p>
            <h3 className="font-display text-5xl sm:text-7xl leading-tight text-balance">
              Ready to feel <span className="display-italic text-gold">the difference?</span>
            </h3>
            <p className="text-cream/70 max-w-md mx-auto mt-6 mb-10 leading-relaxed">
              Start with Pro for the depth, or go Max for the concierge experience. Cancel anytime.
            </p>
            {!isPro && !isMax && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <MagneticButton onClick={() => openCheckout('pro')} className="inline-flex items-center gap-2 px-8 py-4 bg-cream text-ink text-sm font-medium hover:bg-cream-light transition-colors">
                  Start Pro — $5/mo
                </MagneticButton>
                <MagneticButton onClick={() => openCheckout('max')} className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink text-sm font-medium hover:bg-gold-light transition-colors">
                  ✦ Go Max — $13/mo
                </MagneticButton>
              </div>
            )}
            {isPro && !isMax && (
              <MagneticButton onClick={() => openCheckout('max')} className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink text-sm font-medium hover:bg-gold-light transition-colors">
                ✦ Upgrade to Max — $13/mo
              </MagneticButton>
            )}
            {isMax && (
              <p className="display-italic text-2xl text-gold">You're on Max. Enjoy.</p>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  )
}
