import { usePro } from '../context/ProContext.jsx'
import Reveal from './interactive/Reveal.jsx'
import SpotlightCard from './interactive/SpotlightCard.jsx'
import MagneticButton from './interactive/MagneticButton.jsx'

/**
 * Editorial-style "letters from readers" section shown on MyQuill.
 * Free users see Pro + Max reviews; Pro users see only Max reviews.
 * Max users see nothing (no further tier to upsell).
 */

const reviews = [
  // ─── Pro testimonials ─────────────────────────────────────────
  { name: 'Maya', age: 17, role: 'Student',         tier: 'pro', stars: 5, quote: 'The diet tracker basically turned me into a person who cooks. $5 felt like nothing for that.',                                        highlight: 'Live diet tracker' },
  { name: 'Eliana', age: 19, role: 'Yoga teacher',  tier: 'pro', stars: 5, quote: 'The per-answer routine on My Quill nailed my dry-skin needs better than every 10-step trend I tried before.',                          highlight: 'Per-answer routine' },
  { name: 'Sofia', age: 22, role: 'Designer',       tier: 'pro', stars: 5, quote: 'I open the daily tips first thing every morning. It\'s the only wellness app I actually kept past three weeks.',                      highlight: '60 daily tips' },
  { name: 'Naomi', age: 24, role: 'Lab analyst',    tier: 'pro', stars: 4, quote: 'Ingredient deep-dives saved me from buying three expensive serums I would have hated. Pays for itself in a month.',                  highlight: 'Ingredient deep-dives' },
  // ─── Max testimonials ─────────────────────────────────────────
  { name: 'Anya', age: 21, role: 'Marathon runner', tier: 'max', stars: 5, quote: 'Cycle-aware protocols finally explain why my training felt off two weeks every month. Genuinely a game changer.',                     highlight: 'Cycle tracking' },
  { name: 'Lila', age: 19, role: 'Triathlete',      tier: 'max', stars: 5, quote: 'My PT loves the Quill report. We adjusted my whole programme around the sleep + wearable data — eight weeks later I PR\'d.',         highlight: 'Sleep + wearable' },
  { name: 'Camille', age: 24, role: 'Founder',      tier: 'max', stars: 5, quote: 'The audio library + breathwork timer replaced three apps for me. Cleanest wellness tool in my phone, and the only one I pay for.',  highlight: 'Audio + breath' },
  { name: 'Jules', age: 28, role: 'Software lead',  tier: 'max', stars: 5, quote: 'The habit streak grid kept me honest for 40 days running. I built the morning routine the per-answer block recommended.',           highlight: 'Habit streaks' },
]

const stats = {
  free: { count: '47,000+', rating: 4.8, label: 'readers on Pro · ~$5/mo' },
  pro:  { count: '11,300+', rating: 4.9, label: 'readers on Max · ~$13/mo' },
}

function Stars({ n }) {
  return (
    <span aria-label={`${n} stars`} className="inline-flex gap-0.5 num-display text-base">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < n ? 'text-gold' : 'text-ink-softer'}>★</span>
      ))}
    </span>
  )
}

export default function TierReviews({ onNavigate }) {
  const { isPro, isMax } = usePro()
  if (isMax) return null

  // Free → show Pro + Max reviews mixed. Pro → show Max only.
  const list = isPro ? reviews.filter((r) => r.tier === 'max') : reviews
  const stat = isPro ? stats.pro : stats.free
  const ctaTier = isPro ? 'Max' : 'Pro'
  const ctaSub = isPro
    ? 'Concierge wellness. Sleep + cycle + wearable + family seats.'
    : 'Full library, live diet tracker, per-answer routine, 2 extra sounds.'

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15 flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="editorial-label">Letters from readers</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              What readers <span className="display-italic text-clay">are saying.</span>
            </h2>
            <p className="text-sm text-ink-soft mt-3 max-w-xl">
              {isPro
                ? 'Quotes from Quill Max members — the readers using the full set of biometric, cycle and audio tools.'
                : 'Real quotes from Quill Pro and Max members. The features they keep coming back for.'}
            </p>
          </div>
          <div className="text-right">
            <p className="editorial-label">Average rating</p>
            <p className="num-display text-3xl text-clay mt-1 leading-none flex items-center gap-1 justify-end">
              {stat.rating} <span className="text-gold text-base">★</span>
            </p>
            <p className="text-[10px] text-ink-softer mt-1">{stat.count} {stat.label}</p>
          </div>
        </div>
      </Reveal>

      {/* Reviews grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/15 border border-ink/15 mb-10">
        {list.map((r, i) => (
          <Reveal key={`${r.name}-${i}`} delay={i * 50}>
            <SpotlightCard className="bg-cream-light p-6 h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <Stars n={r.stars} />
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                  r.tier === 'max' ? 'bg-gold-paler text-gold-dark border-gold/30' : 'bg-bone text-ink-soft border-ink/20'
                }`}>
                  {r.tier}
                </span>
              </div>
              <p className="display-italic text-lg text-ink leading-snug flex-1">
                "{r.quote}"
              </p>
              <div className="mt-5 pt-4 border-t border-ink/10 flex items-baseline justify-between">
                <div>
                  <p className="font-medium text-sm text-ink">{r.name}, {r.age}</p>
                  <p className="text-[11px] text-ink-soft">{r.role}</p>
                </div>
                <span className="editorial-label text-clay">{r.highlight}</span>
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

      {/* Strong CTA */}
      <Reveal>
        <SpotlightCard className={`p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center ${ctaTier === 'Max' ? 'pro-card' : 'bg-ink text-cream'}`}>
          <div className="lg:col-span-9">
            <span className={`editorial-label ${ctaTier === 'Max' ? 'text-gold-dark' : 'text-gold'}`}>
              Join {stat.count.split(' ')[0]} readers on {ctaTier}
            </span>
            <h3 className={`font-display text-3xl sm:text-4xl mt-2 leading-tight ${ctaTier === 'Max' ? 'text-ink' : ''}`}>
              Try Quill {ctaTier} — <span className="display-italic text-clay">free first month.</span>
            </h3>
            <p className={`mt-3 leading-relaxed text-sm max-w-lg ${ctaTier === 'Max' ? 'text-ink-soft' : 'text-cream/70'}`}>
              {ctaSub} Cancel any time from My Quill — no questions, no friction.
            </p>
          </div>
          <div className="lg:col-span-3 lg:text-right">
            <MagneticButton
              onClick={() => onNavigate?.('pro')}
              className={`inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium tracking-wide transition-all ${
                ctaTier === 'Max'
                  ? 'bg-gold text-ink hover:bg-gold-light'
                  : 'bg-cream text-ink hover:bg-cream-light'
              }`}
            >
              See {ctaTier} <span className="display-italic">→</span>
            </MagneticButton>
          </div>
        </SpotlightCard>
      </Reveal>

      <Reveal>
        <p className="text-[10px] text-ink-softer italic mt-3 text-center">
          Reviews shown are illustrative — Quill is a prototype with no real subscribers (yet).
        </p>
      </Reveal>
    </section>
  )
}
