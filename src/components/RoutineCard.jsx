import { useState } from 'react'
import FavoriteButton from './FavoriteButton.jsx'
import Reveal from './interactive/Reveal.jsx'

export default function RoutineCard({ data, delay = 0, num }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Reveal delay={delay} className="h-full">
      <div className="card-paper card-paper-hover h-full overflow-hidden relative group">
        {/* Card header */}
        <div className="bg-bone px-6 pt-5 pb-4 border-b border-ink/10 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {num && <span className="editorial-num text-2xl text-ink-softer">{num}</span>}
            <span className="editorial-label block mt-0.5">{data.tag}</span>
            <h3 className="font-display text-2xl text-ink mt-1 leading-tight">{data.title}</h3>
          </div>
          <FavoriteButton id={`routine:${data.id}`} label={data.title} size="sm" />
        </div>

        {/* Short description */}
        <div className="px-6 pt-4 pb-3">
          <p className="text-sm text-ink-soft leading-relaxed">{data.description}</p>
        </div>

        {/* Expandable steps */}
        <div className={`overflow-hidden transition-all duration-500 ease-out ${expanded ? 'max-h-[800px]' : 'max-h-0'}`}>
          <div className="px-6 pb-5">
            <ol className="space-y-4 mt-2">
              {data.steps.map((step) => (
                <li key={step.step} className="flex items-start gap-4 border-t border-ink/10 pt-3 first:border-t-0 first:pt-0">
                  <span className="flex-shrink-0 num-display text-xl text-clay leading-none">
                    {String(step.step).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-sm">{step.name}</p>
                    <p className="text-sm text-ink-soft mt-0.5 leading-relaxed">{step.description}</p>
                    {step.productType && (
                      <span className="inline-block mt-2 chip chip-cream text-[10px]">
                        {step.productType}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-5 text-xs text-ink-softer italic border-t border-ink/10 pt-3 leading-relaxed">
              {data.disclaimer}
            </p>
          </div>
        </div>

        {/* Toggle button */}
        <div className="px-6 pb-5">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-sm font-medium text-ink hover:text-clay transition-colors flex items-center gap-1.5 link-underline"
          >
            {expanded ? 'Close steps' : 'Read the steps'} <span className="display-italic">{expanded ? '↑' : '↓'}</span>
          </button>
        </div>
      </div>
    </Reveal>
  )
}
