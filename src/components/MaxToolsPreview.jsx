import { usePro } from '../context/ProContext.jsx'
import Reveal from './interactive/Reveal.jsx'
import SpotlightCard from './interactive/SpotlightCard.jsx'
import MagneticButton from './interactive/MagneticButton.jsx'

/**
 * One-line previews of every Max-only tool. Shown to Free and Pro users
 * in the slot where the actual tools would render for Max members.
 * Same pattern as the Audio Library's locked-sound grid, show what
 * you'd get, lock it, single CTA.
 */

const tools = [
  {
    id: 'sleep',
    name: 'Sleep schedule analyzer',
    icon: '☾',
    one: 'Log seven nights, get your average, sleep debt, consistency score, and social-jetlag in one read.',
    visual: 'bar-chart',
  },
  {
    id: 'cycle',
    name: 'Cycle tracking',
    icon: '◯',
    one: 'A 30-day calendar with your current phase (menstrual / follicular / ovulatory / luteal) and phase-aware advice for training, food and mood.',
    visual: 'calendar',
  },
  {
    id: 'wearable',
    name: 'Wearable sync',
    icon: '◈',
    one: 'Connect Apple Watch, Oura, Whoop or Garmin. HRV, resting heart rate, sleep and steps with 7-day trends and a daily readiness score.',
    visual: 'metrics',
  },
  {
    id: 'habits',
    name: 'Habit streak tracker',
    icon: '✓',
    one: 'Pick from nine evidence-based habits, tap the dot daily, watch the 14-day grid fill in and the streak grow.',
    visual: 'grid',
  },
  {
    id: 'family',
    name: 'Family seats',
    icon: '✿',
    one: 'Share one subscription across four household members, each with their own goal, profile and routine.',
    visual: 'avatars',
  },
]

function Visual({ kind }) {
  const palette = { bar: '#5A6B5D', cal: '#C8654A', met: '#D4A744', grid: '#3D4A40', ava: '#9B4423' }
  if (kind === 'bar-chart') {
    const heights = [40, 65, 55, 80, 70, 45, 90]
    return (
      <div className="flex items-end gap-1 h-12 mt-3">
        {heights.map((h, i) => (
          <span key={i} className="flex-1 rounded-sm" style={{ background: palette.bar, height: `${h}%`, opacity: 0.6 + i * 0.05 }} />
        ))}
      </div>
    )
  }
  if (kind === 'calendar') {
    return (
      <div className="grid grid-cols-10 gap-0.5 mt-3">
        {[...Array(20)].map((_, i) => {
          const phase = i < 5 ? '#C8654A' : i < 13 ? '#D4A744' : i < 16 ? '#5A6B5D' : '#9B4423'
          return <span key={i} className="aspect-square" style={{ background: phase, opacity: 0.5 }} />
        })}
      </div>
    )
  }
  if (kind === 'metrics') {
    return (
      <div className="grid grid-cols-4 gap-2 mt-3">
        {['62', '55', '7.4', '8.2k'].map((v, i) => (
          <div key={i} className="text-center">
            <p className="num-display text-lg leading-none" style={{ color: palette.met }}>{v}</p>
            <p className="text-[8px] text-ink-softer mt-0.5">
              {['HRV', 'RHR', 'sleep', 'steps'][i]}
            </p>
          </div>
        ))}
      </div>
    )
  }
  if (kind === 'grid') {
    return (
      <div className="grid grid-cols-7 gap-0.5 mt-3">
        {[...Array(14)].map((_, i) => {
          const done = [0, 1, 2, 4, 5, 6, 8, 9, 10, 11].includes(i)
          return <span key={i} className="aspect-square" style={{ background: done ? palette.grid : '#E8DFD0' }} />
        })}
      </div>
    )
  }
  if (kind === 'avatars') {
    const init = ['JM', 'AL', 'SK', 'EM']
    const colors = ['#C8654A', '#5A6B5D', '#D4A744', '#9B4423']
    return (
      <div className="flex gap-2 mt-3">
        {init.map((i, idx) => (
          <span
            key={idx}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-cream font-display"
            style={{ background: colors[idx] }}
          >
            {i}
          </span>
        ))}
      </div>
    )
  }
  return null
}

export default function MaxToolsPreview({ onNavigate }) {
  const { isMax, isPro } = usePro()
  if (isMax) return null // Max users see the full tools, not the placeholder

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15">
          <span className="editorial-label flex items-center gap-2">
            The Max toolkit
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border bg-gold-paler text-gold-dark border-gold/30">
              Max only
            </span>
          </span>
          <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
            Five tools, <span className="display-italic text-clay">already built.</span>
          </h2>
          <p className="text-sm text-ink-soft mt-3 max-w-xl">
            Locked behind Max, but you can see exactly what you'd get. Every one of these is a working tool, not a roadmap promise.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/15 border border-ink/15 mb-6">
        {tools.map((t, i) => (
          <Reveal key={t.id} delay={i * 60}>
            <SpotlightCard className="bg-bone/60 p-6 h-full flex flex-col relative">
              {/* Lock icon top-right */}
              <span className="absolute top-4 right-4 inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border bg-gold-paler text-gold-dark border-gold/30">
                Max
              </span>
              <span className="num-display text-3xl text-clay leading-none">{t.icon}</span>
              <p className="font-display text-2xl text-ink mt-3 leading-tight pr-12">{t.name}</p>
              <p className="text-sm text-ink-soft leading-relaxed mt-3 flex-1">{t.one}</p>
              <Visual kind={t.visual} />
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

      {/* CTA */}
      <Reveal>
        <SpotlightCard className="pro-card p-6 sm:p-8 flex items-center gap-6 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <span className="editorial-label text-gold-dark">Unlock all five</span>
            <p className="font-display text-2xl text-ink mt-1 leading-tight">
              All Max tools for <span className="display-italic text-clay">$13 / month.</span>
            </p>
            <p className="text-xs text-ink-soft mt-1">{isPro ? 'You\'re on Pro, upgrade for the toolkit + rainbow theme.' : 'Includes the full Pro library plus everything here.'}</p>
          </div>
          <MagneticButton
            onClick={() => onNavigate?.('pro')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-ink text-sm font-medium hover:bg-gold-light transition-colors"
          >
            See Max <span className="display-italic">→</span>
          </MagneticButton>
        </SpotlightCard>
      </Reveal>
    </section>
  )
}
