import { useEffect, useState, useRef } from 'react'
import WellnessCard from '../components/WellnessCard.jsx'
import { wellnessData } from '../data/wellnessData.js'
import { usePro } from '../context/ProContext.jsx'
import SplitText from '../components/interactive/SplitText.jsx'
import Reveal from '../components/interactive/Reveal.jsx'
import Marquee from '../components/interactive/Marquee.jsx'
import SpotlightCard from '../components/interactive/SpotlightCard.jsx'

const techniques = [
  { id: 'box', name: 'Box', desc: 'Even and calming. Used by pilots and athletes.', phases: [['Inhale', 4], ['Hold', 4], ['Exhale', 4], ['Hold', 4]] },
  { id: '478', name: '4-7-8', desc: 'Activates the parasympathetic system — for falling asleep.', phases: [['Inhale', 4], ['Hold', 7], ['Exhale', 8]] },
  { id: 'coherent', name: 'Coherent', desc: 'Slow six breaths a minute — balances heart rhythm.', phases: [['Inhale', 5], ['Exhale', 5]] },
]

function BreathingExercise() {
  const [techId, setTechId] = useState('box')
  const [running, setRunning] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [count, setCount] = useState(0)
  const [round, setRound] = useState(0)
  const intervalRef = useRef(null)

  const tech = techniques.find((t) => t.id === techId)
  const [phaseLabel, phaseSecs] = tech.phases[phaseIdx]

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setCount((c) => {
        if (c + 1 >= phaseSecs) {
          setPhaseIdx((p) => {
            const next = p + 1
            if (next >= tech.phases.length) {
              setRound((r) => r + 1)
              return 0
            }
            return next
          })
          return 0
        }
        return c + 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, phaseSecs, tech.phases.length])

  function start() { setPhaseIdx(0); setCount(0); setRound(0); setRunning(true) }
  function stop() { setRunning(false); setPhaseIdx(0); setCount(0) }

  const isInhale = phaseLabel === 'Inhale'
  const isExhale = phaseLabel === 'Exhale'
  const scale = running
    ? isInhale ? 1 + (count / phaseSecs) * 0.6
      : isExhale ? 1.6 - (count / phaseSecs) * 0.6
      : phaseLabel === 'Hold' && phaseIdx === 1 ? 1.6 : 1
    : 1

  return (
    <div className="bg-ink text-cream p-8 sm:p-12">
      <div className="flex items-baseline justify-between mb-2">
        <span className="editorial-label text-gold">Guided Breathing</span>
        <span className="editorial-num text-2xl text-cream/40">Pro</span>
      </div>
      <h3 className="font-display text-4xl sm:text-5xl mb-2 leading-tight">Breathe with <span className="display-italic text-gold">the circle.</span></h3>
      <p className="text-cream/60 mb-6 text-sm">Pick a technique. Follow the pace.</p>

      {/* Technique selector */}
      <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-cream/15">
        {techniques.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTechId(t.id); stop() }}
            className={`px-4 py-2 text-xs font-medium tracking-wide transition-all border ${
              techId === t.id
                ? 'bg-gold text-ink border-gold'
                : 'border-cream/30 text-cream/80 hover:border-cream'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <p className="display-italic text-cream/80 mb-8 text-lg">{tech.desc}</p>

      {/* Animated breathing circle */}
      <div className="flex flex-col items-center justify-center py-12 mb-6">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          <div className="absolute inset-0 border border-cream/30 rounded-full" />
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-gold/30 via-clay/30 to-gold/30 transition-transform duration-1000 ease-in-out"
            style={{ transform: `scale(${scale})` }}
          />
          <div className="relative text-center">
            <p className="font-display text-3xl mb-1">{running ? phaseLabel : 'Ready'}</p>
            <p className="num-display text-6xl text-gold tabular-nums">
              {running ? phaseSecs - count : phaseSecs}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-cream/50 num-display tracking-wider">
          {running ? `ROUND ${String(round + 1).padStart(2, '0')}` : 'TAP START TO BEGIN'}
        </p>
        {running ? (
          <button onClick={stop} className="px-6 py-3 border border-cream/30 text-cream text-sm font-medium tracking-wide hover:border-cream transition-colors">
            Stop
          </button>
        ) : (
          <button onClick={start} className="px-6 py-3 bg-gold text-ink text-sm font-medium tracking-wide hover:bg-gold-light transition-colors">
            ▶ Start
          </button>
        )}
      </div>
    </div>
  )
}

export default function Wellness({ onNavigate }) {
  const { isPro } = usePro()

  return (
    <div className="bg-cream">
      {/* HERO */}
      <section style={{ viewTransitionName: 'hero-wellness' }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12">
        <div className="border-b border-ink/15 pb-3 mb-10 flex items-center justify-between">
          <span className="editorial-label">Chapter 04 · Rest</span>
          <span className="editorial-label hidden sm:inline">{wellnessData.length} concerns</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8">
            <h1 className="font-display text-[14vw] sm:text-[10vw] lg:text-[8vw] text-ink leading-[0.9] tracking-tight">
              <SplitText byChar stagger={28}>Care for</SplitText>
              <br />
              <span className="display-italic text-clay"><SplitText byChar stagger={28} startDelay={400}>your whole self.</SplitText></span>
            </h1>
            <Reveal delay={1200} className="mt-8 max-w-md">
              <p className="text-lg text-ink-soft leading-relaxed">
                Gentle, evidence-informed self-care for the things that affect everyday life — stress, sleep, energy, pain, and more.
              </p>
            </Reveal>
          </div>
          <Reveal direction="right" delay={400} className="lg:col-span-4">
            <div className="border-l border-ink/15 pl-6">
              <p className="editorial-label mb-4">In this chapter</p>
              <ul className="space-y-2 text-sm">
                {wellnessData.map((w, i) => (
                  <li key={w.id} className="flex items-baseline gap-3 text-ink-soft">
                    <span className="num-display text-xs text-clay w-6">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-medium text-ink">{w.title}</span>
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
          items={['Stress', 'Sleep', 'Energy', 'Breath', 'Hydration', 'Mood', 'Rest is medicine']}
          separator="☽"
          speed="slow"
          itemClassName="font-display text-2xl sm:text-3xl"
          separatorClassName="text-clay text-xl"
        />
      </section>

      {/* Wellness cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal>
          <div className="mb-10 pb-4 border-b border-ink/15">
            <span className="editorial-label">The wellness pages</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              Soft, useful, <span className="display-italic text-clay">honest.</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wellnessData.map((item, i) => (
            <WellnessCard key={item.id} data={item} delay={i * 60} num={String(i + 1).padStart(2, '0')} />
          ))}
        </div>
      </section>

      {/* Pro: Breathing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isPro ? (
          <Reveal><BreathingExercise /></Reveal>
        ) : (
          <Reveal>
            <SpotlightCard className="pro-card p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-9">
                <span className="editorial-label text-gold-dark">Pro Edition</span>
                <h3 className="font-display text-3xl sm:text-4xl text-ink mt-2 leading-tight">
                  Guided <span className="display-italic text-clay">breathing.</span>
                </h3>
                <p className="text-ink-soft mt-3 leading-relaxed text-sm max-w-lg">
                  Box, 4-7-8, and coherent breathing — with a visual circle that paces you. Calms anxiety in under two minutes.
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
              <p className="editorial-label">Care</p>
              <p className="editorial-num text-3xl text-clay mt-1">♡</p>
            </div>
            <div>
              <p className="font-display text-2xl text-ink mb-2">A kind reminder.</p>
              <p className="text-sm text-ink-soft leading-relaxed">
                These suggestions are general self-care — not medical advice. If you are struggling with your mental or physical health, please reach out to a trusted adult, doctor, or counsellor. You deserve support.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
