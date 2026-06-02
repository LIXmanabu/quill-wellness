import { useRef } from 'react'

export default function MagneticButton({ children, className = '', strength = 0.35, as: As = 'button', ...rest }) {
  const ref = useRef(null)
  const innerRef = useRef(null)

  function onMove(e) {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    node.style.transform = `translate(${x * strength}px, ${y * strength}px)`
    if (innerRef.current) {
      innerRef.current.style.transform = `translate(${x * strength * 0.5}px, ${y * strength * 0.5}px)`
    }
  }

  function onLeave() {
    if (ref.current) ref.current.style.transform = 'translate(0, 0)'
    if (innerRef.current) innerRef.current.style.transform = 'translate(0, 0)'
  }

  return (
    <As
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block transition-transform duration-300 ease-out will-change-transform ${className}`}
      {...rest}
    >
      <span ref={innerRef} className="inline-flex items-center gap-2 transition-transform duration-300 ease-out">
        {children}
      </span>
    </As>
  )
}
