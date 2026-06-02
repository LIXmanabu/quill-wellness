import { useState } from 'react'
import FavoriteButton from './FavoriteButton.jsx'
import Reveal from './interactive/Reveal.jsx'
import SpotlightCard from './interactive/SpotlightCard.jsx'

export default function WellnessCard({ data, delay = 0, num }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Reveal delay={delay} className="h-full">
      <SpotlightCard className="card-paper card-paper-hover h-full p-6 sm:p-7 group">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {num && <span className="editorial-num text-3xl text-ink-softer group-hover:text-clay transition-colors">{num}</span>}
            <h3 className="font-display text-3xl text-ink mt-1 leading-tight">{data.title}</h3>
          </div>
          <FavoriteButton id={`wellness:${data.id}`} label={data.title} size="sm" />
        </div>

        {/* Short description */}
        <p className="text-sm text-ink-soft mb-5 leading-relaxed">{data.shortDescription}</p>

        {/* Suggestions */}
        <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-[800px]' : 'max-h-0 md:max-h-[800px]'}`}>
          <ul className="space-y-2.5 mb-4 border-t border-ink/10 pt-4">
            {data.suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-baseline gap-3">
                <span className="text-xs num-display text-clay w-5 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm text-ink-soft leading-relaxed">{suggestion}</p>
              </li>
            ))}
          </ul>

          <p className="text-xs text-ink-softer italic border-t border-ink/10 pt-3 leading-relaxed">
            {data.disclaimer}
          </p>
        </div>

        {/* Mobile expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="md:hidden mt-2 text-xs font-medium text-clay hover:text-clay-dark transition-colors flex items-center gap-1"
        >
          {expanded ? 'Less ↑' : 'Show suggestions ↓'}
        </button>
      </SpotlightCard>
    </Reveal>
  )
}
