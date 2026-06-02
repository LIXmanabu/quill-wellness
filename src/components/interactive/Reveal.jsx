import { useScrollReveal } from '../../hooks/useScrollReveal.js'

export default function Reveal({ children, as: As = 'div', className = '', direction = 'up', delay = 0, threshold = 0.15, once = true }) {
  const [ref, visible] = useScrollReveal({ threshold, once })

  const classMap = {
    up: 'reveal',
    left: 'reveal-slide-left',
    right: 'reveal-slide-right',
  }

  return (
    <As
      ref={ref}
      className={`${classMap[direction] || 'reveal'} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </As>
  )
}
