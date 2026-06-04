import { useState } from 'react'
import { usePro } from '../context/ProContext.jsx'

const tiers = ['free', 'pro', 'max']
const labels = { free: 'Free', pro: 'Pro', max: 'Max' }

/**
 * Dev-mode tier switcher, only rendered when devUnlocked is true.
 * Includes a DEV badge so it's obvious this is the developer view,
 * and a tiny "lock" link to disable dev mode again.
 */
export default function ProToggle() {
  const { tier, setTier, setDevUnlocked } = usePro()
  const index = tiers.indexOf(tier)
  const [armed, setArmed] = useState(false)

  // Two-click confirm on the badge itself (no system dialog): first click
  // arms ("Lock?"), second locks. Disarms on mouse-leave.
  function lock() {
    setTier('free')
    setDevUnlocked(false)
    setArmed(false)
  }

  return (
    <div className="inline-flex items-center gap-2">
      {/* DEV badge */}
      <span
        onClick={() => (armed ? lock() : setArmed(true))}
        onMouseLeave={() => setArmed(false)}
        title={armed ? 'Click again to lock developer mode' : 'Click to lock developer mode'}
        className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] border border-clay text-clay bg-clay-paler cursor-pointer hover:bg-clay hover:text-cream transition-colors"
      >
        {armed ? 'Lock?' : 'Dev'}
      </span>

      {/* Tier slider */}
      <div
        role="radiogroup"
        aria-label="Plan tier (dev override)"
        className={`relative inline-flex items-center select-none border transition-all duration-300 ${
          tier === 'max'
            ? 'bg-cream-light border-gold-dark'
            : tier === 'pro'
              ? 'bg-ink text-cream border-ink'
              : 'bg-cream-light text-ink border-ink/20'
        }`}
      >
        <span className="relative flex items-center h-8 w-[135px]">
          <span
            className={`absolute top-0 bottom-0 w-[45px] transition-all duration-300 ease-out ${
              tier === 'max' ? 'bg-gold' : tier === 'pro' ? 'bg-gold' : 'bg-ink/10'
            }`}
            style={{ left: `${index * 45}px` }}
          />
          {tiers.map((t) => {
            const active = tier === t
            return (
              <button
                key={t}
                role="radio"
                aria-checked={active}
                onClick={() => setTier(t)}
                className={`relative z-10 w-[45px] h-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  active
                    ? t === 'pro' || t === 'max' ? 'text-ink' : 'text-ink'
                    : tier === 'pro' ? 'text-cream/40' : 'text-ink-softer'
                }`}
              >
                {labels[t]}
              </button>
            )
          })}
        </span>
      </div>
    </div>
  )
}
