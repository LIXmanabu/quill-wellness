import { useState } from 'react'
import InfoModal from './InfoModal.jsx'
import FavoriteButton from './FavoriteButton.jsx'
import Reveal from './interactive/Reveal.jsx'
import SpotlightCard from './interactive/SpotlightCard.jsx'

const difficultyConfig = {
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced',
  'All Levels': 'All Levels',
}

export default function ExerciseCard({ data, delay = 0, num }) {
  const [modalOpen, setModalOpen] = useState(false)
  const diff = difficultyConfig[data.difficulty] || 'All Levels'

  return (
    <>
      <Reveal delay={delay} className="h-full">
        <SpotlightCard className="card-paper card-paper-hover relative h-full p-6 sm:p-7 flex flex-col gap-4 group">
          {/* Favorite + Num */}
          <div className="flex items-start justify-between">
            {num && <span className="editorial-num text-3xl text-ink-softer group-hover:text-clay transition-colors">{num}</span>}
            <FavoriteButton id={`exercise:${data.id}`} label={data.title} size="sm" />
          </div>

          {/* Title */}
          <div>
            <span className="editorial-label">{diff} · {data.duration}</span>
            <h3 className="font-display text-3xl text-ink mt-1 leading-tight">{data.title}</h3>
          </div>

          {/* Description */}
          <p className="text-sm text-ink-soft leading-relaxed">{data.description}</p>

          {/* Exercise preview list */}
          <ul className="space-y-2 border-t border-ink/10 pt-3">
            {data.exercises.slice(0, 3).map((ex, i) => (
              <li key={i} className="flex items-baseline gap-3 text-sm">
                <span className="text-xs num-display text-clay w-5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-ink font-medium">{ex.name}</span>
                <span className="text-xs text-ink-softer ml-auto flex-shrink-0">{ex.reps}</span>
              </li>
            ))}
          </ul>

          {/* View Routine button */}
          <button
            onClick={() => setModalOpen(true)}
            className="mt-auto pt-3 text-sm font-medium text-ink hover:text-clay transition-colors flex items-center gap-1.5 link-underline self-start"
          >
            Read the full routine <span className="display-italic transition-transform group-hover:translate-x-1">→</span>
          </button>
        </SpotlightCard>
      </Reveal>

      {/* Full routine modal */}
      {modalOpen && <InfoModal data={data} onClose={() => setModalOpen(false)} />}
    </>
  )
}
