import { useEffect, useState } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal.js'

export default function AnimatedCounter({ to = 100, duration = 1600, suffix = '', prefix = '', className = '' }) {
  const [ref, visible] = useScrollReveal({ threshold: 0.4 })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!visible) return
    let start = null
    const from = 0
    const end = to
    function step(ts) {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(from + (end - from) * eased))
      if (progress < 1) requestAnimationFrame(step)
      else setValue(end)
    }
    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [visible, to, duration])

  return (
    <span ref={ref} className={`num-display tabular-nums ${className}`}>
      {prefix}{value}{suffix}
    </span>
  )
}
