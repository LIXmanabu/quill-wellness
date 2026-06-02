import { useState } from 'react'

export default function ConcernPanel({ region, data, onClose }) {
  const [openConcern, setOpenConcern] = useState(0)

  if (!data) return null

  const concern = data.concerns[openConcern]

  return (
    <div className="animate-slide-in-right fixed right-0 top-16 bottom-0 w-full sm:w-96 bg-cream-light shadow-soft-lg z-40 flex flex-col border-l border-ink/15">
      {/* Panel header */}
      <div className="bg-bone px-5 py-4 border-b border-ink/15 flex items-center justify-between">
        <div>
          <p className="editorial-label">Region</p>
          <h2 className="font-display text-2xl text-ink leading-tight mt-0.5">{data.label}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center border border-ink/20 hover:border-ink hover:bg-ink hover:text-cream transition-all text-lg display-italic"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Concern tabs */}
      {data.concerns.length > 1 && (
        <div className="px-5 py-3 flex gap-1.5 flex-wrap border-b border-ink/10 bg-cream">
          {data.concerns.map((c, i) => (
            <button
              key={i}
              onClick={() => setOpenConcern(i)}
              className={`px-3 py-1.5 text-xs font-medium tracking-wide border transition-all ${
                openConcern === i
                  ? 'bg-ink text-cream border-ink'
                  : 'bg-cream-light text-ink-soft border-ink/15 hover:border-ink'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto panel-scroll px-5 py-5">
        <div className="animate-fade-up">
          <h3 className="font-display text-2xl text-ink mb-5 leading-tight">{concern.title}</h3>

          <ul className="space-y-3">
            {concern.suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-baseline gap-3">
                <span className="num-display text-xs text-clay w-5 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm text-ink-soft leading-relaxed">{suggestion}</p>
              </li>
            ))}
          </ul>

          {concern.safetyNote && (
            <div className="mt-5 p-3 bg-clay-paler border border-clay/20">
              <p className="editorial-label text-clay-dark mb-1">Safety</p>
              <p className="text-xs text-ink-soft leading-relaxed">{concern.safetyNote}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="px-5 py-4 border-t border-ink/15 bg-bone">
        <p className="text-xs text-ink-softer italic leading-relaxed">
          {data.generalDisclaimer || 'These are general wellness suggestions, not medical advice. If symptoms are severe, persistent, or worsening, please seek medical advice.'}
        </p>
      </div>
    </div>
  )
}
