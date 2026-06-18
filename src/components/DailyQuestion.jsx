import { useEffect } from 'react'
import { useUser } from '../context/UserContext.jsx'
import { goals, skinTypes, times } from './OnboardingQuiz.jsx'

/* ─────────────────────────────────────────────────────────────────────────
   DailyQuestion — the signed-in counterpart to the guest onboarding quiz.
   Instead of asking everything up front (and never the name — that comes from
   their account), it asks ONE unanswered profile question per calendar day.
   Once the profile is complete, it stops for good.
   ──────────────────────────────────────────────────────────────────────── */

// Profile questions asked one-per-day, in order. `name` is deliberately absent.
const DAILY_QUESTIONS = [
  { field: 'goal',       kicker: 'Goal', title: 'What matters most right now?', sub: 'We tailor your home to this — change it anytime.', options: goals,     layout: 'list' },
  { field: 'skinType',   kicker: 'Skin', title: "What's your skin type?",       sub: 'You can change this later.',                       options: skinTypes, layout: 'grid' },
  { field: 'timePerDay', kicker: 'Time', title: 'How much time most days?',      sub: 'Honest answers get better suggestions.',           options: times,     layout: 'list' },
]

const todayKey  = () => new Date().toISOString().slice(0, 10)   // YYYY-MM-DD, local-ish
const storeKey  = (id) => `quill.dailyQ.${id || 'me'}`

function askedToday(id) {
  try { return localStorage.getItem(storeKey(id)) === todayKey() } catch { return false }
}
function markAskedToday(id) {
  try { localStorage.setItem(storeKey(id), todayKey()) } catch {}
}

// The question to ask now: the first unanswered profile field, but only if we
// haven't already asked (or been answered/skipped) today. null = nothing to ask.
export function nextDailyQuestion(profile, id) {
  if (askedToday(id)) return null
  return DAILY_QUESTIONS.find((q) => !profile[q.field]) || null
}

export default function DailyQuestion({ question, userId, name, onClose }) {
  const { updateProfile } = useUser()

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') dismiss() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Either path closes for the day so nothing pops up again until tomorrow.
  function dismiss() { markAskedToday(userId); onClose() }
  function answer(id) { updateProfile({ [question.field]: id }); markAskedToday(userId); onClose() }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div className="absolute inset-0 bg-cream-dark/95 backdrop-blur-md" onClick={dismiss} />

      <div className="relative w-full max-w-lg bg-cream-light border border-ink/15 p-6 sm:p-8 animate-pop-in shadow-soft-lg">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center border border-ink/20 hover:border-ink hover:bg-ink hover:text-cream transition-all display-italic text-lg z-10"
        >
          ✕
        </button>

        <div className="flex items-center justify-between mb-6 pr-12">
          <span className="editorial-label text-clay">
            {name ? `One quick thing, ${name}` : 'One quick thing'}
          </span>
          <button onClick={dismiss} className="editorial-label hover:text-clay transition-colors">
            Not today
          </button>
        </div>

        <span className="editorial-label text-clay">{question.kicker}</span>
        <h2 className="font-display text-4xl sm:text-5xl text-ink mt-2 leading-tight">{question.title}</h2>
        <p className="text-sm text-ink-soft mt-3 leading-relaxed">{question.sub}</p>

        {question.layout === 'grid' ? (
          <div className="grid grid-cols-2 gap-px bg-ink/15 border border-ink/15 mt-8">
            {question.options.map((o, i) => (
              <button
                key={o.id}
                onClick={() => answer(o.id)}
                className="p-5 text-left bg-cream-light text-ink hover:bg-ink hover:text-cream transition-all group"
              >
                <span className="editorial-num text-2xl text-clay group-hover:text-gold">{String(i + 1).padStart(2, '0')}</span>
                <p className="font-display text-2xl mt-1 leading-tight">{o.label}</p>
                {o.desc && <p className="text-xs mt-1 leading-snug text-ink-soft group-hover:text-cream/70">{o.desc}</p>}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-px bg-ink/15 border border-ink/15 mt-8">
            {question.options.map((o, i) => (
              <button
                key={o.id}
                onClick={() => answer(o.id)}
                className="w-full p-5 flex items-baseline justify-between gap-5 text-left bg-cream-light text-ink hover:bg-ink hover:text-cream transition-all group"
              >
                <span className="flex items-baseline gap-5">
                  <span className="num-display text-xl text-clay group-hover:text-gold">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-xl">{o.label}</span>
                </span>
                {o.desc && <span className="text-xs text-ink-softer group-hover:text-cream/70">{o.desc}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
