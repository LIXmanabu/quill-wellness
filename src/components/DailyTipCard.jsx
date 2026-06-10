import { getTipOfDay, categoryMeta } from '../data/dailyTips.js'
import FavoriteButton from './FavoriteButton.jsx'
import SpotlightCard from './interactive/SpotlightCard.jsx'

export default function DailyTipCard({ onNavigateLibrary }) {
  const tip = getTipOfDay()
  const meta = categoryMeta[tip.category]
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <SpotlightCard className="card-paper card-paper-hover relative overflow-hidden">
      {/* soft gold "almanac" warmth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(85% 70% at 100% 0%, rgba(212,167,68,0.12), transparent 55%)' }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-8 sm:p-10 lg:p-12">
        {/* Left meta */}
        <div className="lg:col-span-3">
          <p className="editorial-label text-clay text-balance">{today}</p>
          <p className="font-display text-2xl mt-2 leading-tight text-ink">Tip of the day</p>
          <span className="chip chip-ink mt-4 text-[10px]">{meta.label}</span>
        </div>

        {/* Tip content */}
        <div className="lg:col-span-8">
          <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ink leading-[0.95]">
            {tip.title}
          </h3>
          <p className="display-italic text-ink-soft text-xl mt-5 leading-relaxed max-w-2xl">
            {tip.body}
          </p>

          {onNavigateLibrary && (
            <button
              onClick={onNavigateLibrary}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-clay hover:text-clay-dark transition-colors link-underline"
            >
              Browse all tips <span className="display-italic">→</span>
            </button>
          )}
        </div>

        {/* Right action: top-right on phones (not an orphan row), grid cell on desktop */}
        <div className="absolute top-5 right-5 lg:static lg:col-span-1 lg:flex lg:justify-end items-start">
          <FavoriteButton id={`tip:${tip.id}`} label={tip.title} size="sm" />
        </div>
      </div>
    </SpotlightCard>
  )
}
