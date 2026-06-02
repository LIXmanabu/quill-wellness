import { useState } from 'react'
import BodyModel3D from '../components/BodyModel3D.jsx'
import ConcernPanel from '../components/ConcernPanel.jsx'
import { bodyData } from '../data/bodyData.js'
import { usePro } from '../context/ProContext.jsx'
import SplitText from '../components/interactive/SplitText.jsx'
import Reveal from '../components/interactive/Reveal.jsx'
import Marquee from '../components/interactive/Marquee.jsx'
import SpotlightCard from '../components/interactive/SpotlightCard.jsx'
import TierBadge from '../components/TierBadge.jsx'

const regionList = [
  { id: 'face', label: 'Face' },
  { id: 'head', label: 'Head' },
  { id: 'neck', label: 'Neck' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Arms' },
  { id: 'hands', label: 'Hands' },
  { id: 'chest', label: 'Chest' },
  { id: 'stomach', label: 'Stomach' },
  { id: 'back', label: 'Back' },
  { id: 'hips', label: 'Hips' },
  { id: 'legs', label: 'Legs' },
  { id: 'knees', label: 'Knees' },
  { id: 'feet', label: 'Feet' },
]

const relatedPairs = [
  { areas: 'Neck · Shoulders · Head', tip: 'Tension headaches usually start in upper traps. Stretch shoulders before chasing the headache.' },
  { areas: 'Hips · Lower back · Knees', tip: 'Tight hip flexors yank the lumbar spine and shift knee tracking. Foam-roll hips first.' },
  { areas: 'Stomach · Mood · Sleep', tip: 'The gut-brain axis is real. Bloating + low mood + bad sleep often share a root: stress + diet.' },
  { areas: 'Feet · Calves · Lower back', tip: 'Tight calves shorten stride and tilt the pelvis. Daily 30s calf stretch can help low-back pain.' },
  { areas: 'Face · Hydration · Sleep', tip: 'Dull skin + dark circles correlate more with sleep + water than with any product. Fix those first.' },
  { areas: 'Chest · Posture · Breathing', tip: 'Slouched posture compresses the diaphragm. Sit tall to breathe deeper — and feel calmer.' },
]

export default function Body({ onNavigate }) {
  const { isPro } = usePro()
  const [selectedRegion, setSelectedRegion] = useState(null)

  function closePanel() { setSelectedRegion(null) }

  return (
    <div className="bg-cream">
      {/* HERO */}
      <section style={{ viewTransitionName: 'hero-body' }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-10">
        <div className="border-b border-ink/15 pb-3 mb-10 flex items-center justify-between">
          <span className="editorial-label">Chapter 01 · Atlas</span>
          <span className="editorial-label hidden sm:inline">{regionList.length} regions</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-9">
            <h1 className="font-display text-[14vw] sm:text-[10vw] lg:text-[8vw] text-ink leading-[0.9] tracking-tight">
              <SplitText byChar stagger={28}>Your body,</SplitText>
              <br />
              <span className="display-italic text-clay"><SplitText byChar stagger={28} startDelay={400}>your atlas.</SplitText></span>
            </h1>
            <Reveal delay={1200} className="mt-8 max-w-md">
              <p className="text-lg text-ink-soft leading-relaxed">
                Tap any area on the body map to explore wellness tips, self-care suggestions, and gentle guidance for that part of your body.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="bg-ink text-cream py-4 border-y border-ink overflow-hidden">
        <Marquee
          items={['Head', 'Shoulders', 'Knees', 'Toes', 'And every soft thing in between', 'No part of you is wrong']}
          separator="◐"
          speed="slow"
          itemClassName="font-display text-2xl sm:text-3xl"
          separatorClassName="text-clay text-xl"
        />
      </section>

      {/* Body map + regions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: body map */}
          <div className="lg:col-span-4 xl:col-span-4">
            <div className="card-paper sticky top-28 overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-ink/10">
                <p className="editorial-label">The map</p>
                {selectedRegion && (
                  <button
                    onClick={closePanel}
                    className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-soft hover:text-ink transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <BodyModel3D
                selectedRegion={selectedRegion}
                onRegionClick={(region) => setSelectedRegion(region === selectedRegion ? null : region)}
              />

              {selectedRegion && (
                <div className="px-5 pb-4 pt-2 border-t border-ink/10 text-center">
                  <p className="editorial-label">Selected</p>
                  <p className="font-display text-xl text-ink mt-1">{bodyData[selectedRegion]?.label}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-8 xl:col-span-8 min-w-0">
            {selectedRegion ? (
              <Reveal>
                <div className="card-paper overflow-hidden">
                  <div className="bg-bone px-6 py-5 border-b border-ink/15 flex items-center justify-between">
                    <div>
                      <p className="editorial-label">Region</p>
                      <h2 className="font-display text-3xl text-ink leading-tight mt-1">{bodyData[selectedRegion]?.label}</h2>
                    </div>
                    <button onClick={closePanel} className="w-9 h-9 flex items-center justify-center border border-ink/20 hover:border-ink hover:bg-ink hover:text-cream transition-all text-lg display-italic">
                      ✕
                    </button>
                  </div>

                  <div className="p-6 space-y-3">
                    {bodyData[selectedRegion]?.concerns.map((concern, i) => (
                      <ConcernAccordionItem key={i} concern={concern} defaultOpen={i === 0} num={String(i + 1).padStart(2, '0')} />
                    ))}

                    <div className="pt-3 border-t border-ink/10">
                      <p className="text-xs text-ink-softer italic leading-relaxed">
                        {bodyData[selectedRegion]?.generalDisclaimer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ) : (
              <Reveal>
                <div>
                  <p className="editorial-label mb-6">Or, jump straight to a region</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {regionList.map((r, i) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRegion(r.id)}
                        className="card-paper card-paper-hover p-4 text-left group"
                      >
                        <span className="editorial-num text-2xl text-ink-softer group-hover:text-clay transition-colors">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="font-display text-xl text-ink mt-1 leading-none">{r.label}</p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-10 p-6 border border-ink/15 bg-cream-light">
                    <p className="editorial-label mb-2">Important</p>
                    <p className="text-sm text-ink-soft leading-relaxed">
                      This body map provides general wellness and self-care suggestions only. It does not diagnose conditions or replace medical advice. If you experience severe, sudden, persistent, or worsening symptoms, please seek medical attention.
                    </p>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Mobile overlay panel */}
      {selectedRegion && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={closePanel} />
          <ConcernPanel region={selectedRegion} data={bodyData[selectedRegion]} onClose={closePanel} />
        </div>
      )}

      {/* Pro: Related areas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isPro ? (
          <>
            <Reveal>
              <div className="mb-10 pb-4 border-b border-ink/15">
                <span className="editorial-label flex items-center gap-2">
                  Cross-references <TierBadge />
                </span>
                <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
                  When one part <span className="display-italic text-clay">complains.</span>
                </h2>
                <p className="text-sm text-ink-soft mt-3 max-w-xl">
                  Bodies are systems. Cross-references for the most common pairings — fix causes, not symptoms.
                </p>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
              {relatedPairs.map((r, i) => (
                <Reveal key={r.areas} delay={i * 50}>
                  <SpotlightCard className="bg-cream-light p-6 h-full">
                    <span className="editorial-num text-2xl text-clay">{String(i + 1).padStart(2, '0')}</span>
                    <p className="font-display text-xl text-ink mt-1 leading-tight">{r.areas}</p>
                    <p className="text-sm text-ink-soft mt-3 leading-relaxed">{r.tip}</p>
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
                  Related-areas <span className="display-italic text-clay">cheat-sheet.</span>
                </h3>
                <p className="text-ink-soft mt-3 leading-relaxed text-sm max-w-lg">
                  When your neck hurts, your shoulders probably need attention too. Cross-referenced tips so you fix the cause, not just the symptom.
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
    </div>
  )
}

function ConcernAccordionItem({ concern, defaultOpen = false, num }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-ink/15">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-baseline gap-3 px-4 py-3 bg-bone hover:bg-cream-dark transition-colors text-left"
      >
        {num && <span className="num-display text-sm text-clay flex-shrink-0">{num}</span>}
        <span className="font-medium text-ink text-sm flex-1">{concern.title}</span>
        <span className="text-ink-softer text-xs ml-2 flex-shrink-0 display-italic">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 animate-fade-up">
          <ul className="space-y-2.5 mb-3">
            {concern.suggestions.map((s, i) => (
              <li key={i} className="flex items-baseline gap-3">
                <span className="text-xs num-display text-clay w-5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-sm text-ink-soft leading-relaxed">{s}</p>
              </li>
            ))}
          </ul>
          {concern.safetyNote && (
            <div className="p-3 bg-clay-paler border border-clay/20">
              <p className="editorial-label text-clay-dark mb-1">Safety</p>
              <p className="text-xs text-ink-soft leading-relaxed">{concern.safetyNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
