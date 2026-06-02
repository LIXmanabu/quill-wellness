import { useScrollReveal } from '../../hooks/useScrollReveal.js'

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function SplitText({ children, className = '', wordClassName = '', stagger = 50, startDelay = 0, byChar = false }) {
  const [ref, visible] = useScrollReveal({ threshold: 0.1, once: true })
  const text = String(children)

  if (reducedMotion) {
    return <span ref={ref} className={`inline ${className}`}>{children}</span>
  }

  if (byChar) {
    const chars = text.split('')
    return (
      <span ref={ref} className={`inline-block ${className}`}>
        {chars.map((c, i) => (
          <span
            key={i}
            className="inline-block overflow-hidden align-baseline"
            style={{ width: c === ' ' ? '0.3em' : 'auto' }}
          >
            <span
              className="inline-block"
              style={{
                transform: visible ? 'translateY(0)' : 'translateY(110%)',
                opacity: visible ? 1 : 0,
                transition: `transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${startDelay + i * stagger}ms, opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${startDelay + i * stagger}ms`,
              }}
            >
              {c === ' ' ? ' ' : c}
            </span>
          </span>
        ))}
      </span>
    )
  }

  const words = text.split(' ')
  return (
    <span ref={ref} className={`inline ${className}`}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-baseline" style={{ paddingRight: '0.25em' }}>
          <span
            className={`inline-block ${wordClassName}`}
            style={{
              transform: visible ? 'translateY(0)' : 'translateY(110%)',
              opacity: visible ? 1 : 0,
              transition: `transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${startDelay + i * stagger}ms, opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${startDelay + i * stagger}ms`,
            }}
          >
            {w}
          </span>
        </span>
      ))}
    </span>
  )
}
