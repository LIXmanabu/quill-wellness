import { useEffect, useState, useRef } from 'react'

const TRAIL_LENGTH = 10

export default function CustomCursor() {
  const [hovering, setHovering] = useState(false)
  const [label, setLabel] = useState('')
  const dotRef = useRef(null)
  const labelRef = useRef(null)
  const trailRefs = useRef([])
  const rafRef = useRef(null)
  const target = useRef({ x: -100, y: -100 })
  const dotPos = useRef({ x: -100, y: -100 })
  // History of past positions for the trail
  const history = useRef(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 }))
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    function onMove(e) {
      target.current = { x: e.clientX, y: e.clientY }
    }

    function onOver(e) {
      const t = e.target
      if (!t) return
      const interactive = t.closest('a, button, [role="button"], input, label, [data-cursor-hover]')
      setHovering(!!interactive)
      if (interactive) {
        setLabel(interactive.getAttribute('data-cursor-label') || '')
      } else {
        setLabel('')
      }
    }

    function animate() {
      // Lead dot — fast follow
      dotPos.current.x += (target.current.x - dotPos.current.x) * 0.4
      dotPos.current.y += (target.current.y - dotPos.current.y) * 0.4

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%)`
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(18px, 16px)`
      }

      // Each trail particle eases toward the previous one — chain follows the head
      const prev = { x: dotPos.current.x, y: dotPos.current.y }
      for (let i = 0; i < history.current.length; i++) {
        const node = history.current[i]
        // Slower easing the further down the chain → smoother, longer trail
        const ease = 0.32 - i * 0.012
        node.x += (prev.x - node.x) * Math.max(0.08, ease)
        node.y += (prev.y - node.y) * Math.max(0.08, ease)
        const el = trailRefs.current[i]
        if (el) {
          el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0) translate(-50%, -50%)`
        }
        prev.x = node.x
        prev.y = node.y
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      {Array.from({ length: TRAIL_LENGTH }).map((_, i) => {
        // Uniform small dots — a thin line of points following the cursor
        const opacity = (1 - i / TRAIL_LENGTH) * 0.7
        return (
          <div
            key={i}
            ref={(el) => (trailRefs.current[i] = el)}
            className={`cursor-trail ${hovering ? 'is-hover' : ''}`}
            style={{
              width: '4px',
              height: '4px',
              opacity,
            }}
            aria-hidden="true"
          />
        )
      })}
      <div
        ref={dotRef}
        className={`cursor-dot ${hovering ? 'is-hover' : ''}`}
        aria-hidden="true"
      />
      {label && (
        <div ref={labelRef} className="cursor-label" aria-hidden="true">
          {label}
        </div>
      )}
    </>
  )
}
