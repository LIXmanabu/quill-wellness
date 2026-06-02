import { getTipOfDay, categoryMeta } from '../data/dailyTips.js'
import FavoriteButton from './FavoriteButton.jsx'
import SpotlightCard from './interactive/SpotlightCard.jsx'

export default function DailyTipCard({ onNavigateLibrary }) {
  const tip = getTipOfDay()
  const meta = categoryMeta[tip.category]
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <SpotlightCard className="bg-ink text-cream relative overflow-hidden rainbow-frame">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 sm:p-10 lg:p-12">
        {/* Left meta */}
        <div className="lg:col-span-3">
          <p className="editorial-label text-gold">{today}</p>
          <p className="font-display text-2xl mt-2 leading-tight">Tip of the day</p>
          <span className="chip text-cream border-cream/30 mt-4 text-[10px]">{meta.label}</span>
        </div>

        {/* Tip content */}
        <div className="lg:col-span-8">
          <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl text-cream leading-[0.95]">
            {tip.title}
          </h3>
          <p className="display-italic text-cream/80 text-xl mt-5 leading-relaxed max-w-2xl">
            {tip.body}
          </p>

          {onNavigateLibrary && (
            <button
              onClick={onNavigateLibrary}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-light transition-colors link-underline cta-rainbow"
            >
              Browse all tips <span className="display-italic">→</span>
            </button>
          )}
        </div>

        {/* Right action */}
        <div className="lg:col-span-1 lg:flex lg:justify-end items-start">
          <FavoriteButton id={`tip:${tip.id}`} label={tip.title} size="sm" />
        </div>
      </div>
    </SpotlightCard>
  )
}
