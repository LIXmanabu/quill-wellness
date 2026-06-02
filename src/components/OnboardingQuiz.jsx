import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext.jsx'

const skinTypes = [
  { id: 'dry', label: 'Dry', desc: 'Tight, sometimes flaky' },
  { id: 'oily', label: 'Oily', desc: 'Shiny T-zone, larger pores' },
  { id: 'combo', label: 'Combination', desc: 'Oily T-zone, dry cheeks' },
  { id: 'sensitive', label: 'Sensitive', desc: 'Reacts easily, redness' },
  { id: 'normal', label: 'Normal', desc: 'Balanced, rarely fussy' },
  { id: 'unsure', label: 'Not sure', desc: "We'll help you find out" },
]

const goals = [
  { id: 'glow', label: 'Glow & confidence' },
  { id: 'fitness', label: 'Move & feel strong' },
  { id: 'calm', label: 'Stress less, sleep better' },
  { id: 'body', label: 'Understand my body' },
  { id: 'eat', label: 'Eat smarter' },
]

const times = [
  { id: '5', label: '5 min/day', desc: 'Quick & simple' },
  { id: '15', label: '15 min/day', desc: 'A real ritual' },
  { id: '30', label: '30+ min/day', desc: 'I love self-care' },
]

export default function OnboardingQuiz({ onClose }) {
  const { completeOnboarding, profile } = useUser()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name: profile.name || '',
    skinType: profile.skinType || '',
    goal: profile.goal || '',
    timePerDay: profile.timePerDay || '',
  })

  // Allow dismissing the modal via Escape key — without this, the modal
  // (z-100, full-screen blur) blocks navbar clicks and traps the user.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const steps = [
    {
      kicker: '01 · Hello',
      title: 'Welcome to Quill.',
      sub: "Let's set you up in thirty seconds. First — what should we call you?",
      content: (
        <div className="space-y-3 mt-8">
          <input
            type="text"
            autoFocus
            placeholder="Your name or nickname"
            value={data.name}
            onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && data.name.trim() && setStep(1)}
            className="w-full px-5 py-4 bg-cream-light border-2 border-ink/20 text-lg text-ink font-display placeholder-ink-softer focus:border-ink focus:outline-none transition-colors"
            maxLength={20}
          />
          <button
            onClick={() => setStep(1)}
            className="text-xs text-ink-softer hover:text-ink underline transition-colors"
          >
            Skip — keep it anonymous
          </button>
        </div>
      ),
    },
    {
      kicker: '02 · Skin',
      title: data.name ? `Hi ${data.name}.` : 'Nice to meet you.',
      sub: "What's your skin type? You can change this later.",
      content: (
        <div className="grid grid-cols-2 gap-px bg-ink/15 border border-ink/15 mt-8">
          {skinTypes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setData((d) => ({ ...d, skinType: s.id }))
                setTimeout(() => setStep(2), 200)
              }}
              className={`p-5 text-left transition-all ${
                data.skinType === s.id ? 'bg-ink text-cream' : 'bg-cream-light text-ink hover:bg-bone'
              }`}
            >
              <span className={`editorial-num text-2xl ${data.skinType === s.id ? 'text-gold' : 'text-clay'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="font-display text-2xl mt-1 leading-tight">{s.label}</p>
              <p className={`text-xs mt-1 leading-snug ${data.skinType === s.id ? 'text-cream/70' : 'text-ink-soft'}`}>{s.desc}</p>
            </button>
          ))}
        </div>
      ),
    },
    {
      kicker: '03 · Goal',
      title: 'What matters most?',
      sub: "We'll tailor your home to this. Pick one — change it anytime.",
      content: (
        <div className="space-y-px bg-ink/15 border border-ink/15 mt-8">
          {goals.map((g, i) => (
            <button
              key={g.id}
              onClick={() => {
                setData((d) => ({ ...d, goal: g.id }))
                setTimeout(() => setStep(3), 200)
              }}
              className={`w-full p-5 flex items-center gap-5 text-left transition-all ${
                data.goal === g.id ? 'bg-ink text-cream' : 'bg-cream-light text-ink hover:bg-bone'
              }`}
            >
              <span className={`num-display text-xl flex-shrink-0 ${data.goal === g.id ? 'text-gold' : 'text-clay'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-display text-xl">{g.label}</span>
              <span className={`ml-auto display-italic transition-transform ${data.goal === g.id ? 'translate-x-2 text-gold' : ''}`}>→</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      kicker: '04 · Time',
      title: 'How much time?',
      sub: 'Honest answers get better suggestions. No pressure either way.',
      content: (
        <div className="space-y-px bg-ink/15 border border-ink/15 mt-8">
          {times.map((t, i) => (
            <button
              key={t.id}
              onClick={() => {
                setData((d) => ({ ...d, timePerDay: t.id }))
                setTimeout(() => {
                  completeOnboarding({ ...data, timePerDay: t.id })
                  onClose()
                }, 250)
              }}
              className={`w-full p-5 flex items-baseline justify-between text-left transition-all ${
                data.timePerDay === t.id ? 'bg-ink text-cream' : 'bg-cream-light text-ink hover:bg-bone'
              }`}
            >
              <span className="flex items-baseline gap-5">
                <span className={`num-display text-xl ${data.timePerDay === t.id ? 'text-gold' : 'text-clay'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-xl">{t.label}</span>
              </span>
              <span className={`text-xs ${data.timePerDay === t.id ? 'text-cream/70' : 'text-ink-softer'}`}>{t.desc}</span>
            </button>
          ))}
        </div>
      ),
    },
  ]

  const current = steps[step]
  const progress = ((step + 1) / steps.length) * 100

  function handleSkip() {
    completeOnboarding(data)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="absolute inset-0 bg-cream-dark/95 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-cream-light border border-ink/15 p-6 sm:p-8 animate-pop-in shadow-soft-lg">
        {/* Big X close button — top-right */}
        <button
          onClick={onClose}
          aria-label="Close onboarding"
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center border border-ink/20 hover:border-ink hover:bg-ink hover:text-cream transition-all display-italic text-lg z-10"
        >
          ✕
        </button>

        {/* Progress */}
        <div className="mb-8 pr-12">
          <div className="flex items-center justify-between mb-2">
            <span className="editorial-label">Step {String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span>
            <button onClick={handleSkip} className="editorial-label hover:text-clay transition-colors">Skip for now</button>
          </div>
          <div className="h-px bg-ink/15 relative">
            <div
              className="absolute inset-y-0 left-0 bg-ink transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div key={step} className="animate-fade-up">
          <span className="editorial-label text-clay">{current.kicker}</span>
          <h2 className="font-display text-4xl sm:text-5xl text-ink mt-2 leading-tight">{current.title}</h2>
          <p className="text-sm text-ink-soft mt-3 leading-relaxed">{current.sub}</p>
          {current.content}
        </div>

        {step === 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(1)}
              disabled={!data.name.trim()}
              className="btn-ink disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue <span className="display-italic">→</span>
            </button>
          </div>
        )}

        {step > 0 && (
          <div className="mt-5 flex justify-between">
            <button onClick={() => setStep(step - 1)} className="editorial-label hover:text-clay transition-colors">
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
