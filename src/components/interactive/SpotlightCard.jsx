import { useRef } from 'react'

export default function SpotlightCard({ children, as: As = 'div', className = '', ...rest }) {
  const ref = useRef(null)

  function onMove(e) {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    node.style.setProperty('--mouse-x', `${x}%`)
    node.style.setProperty('--mouse-y', `${y}%`)
  }

  return (
    <As ref={ref} onMouseMove={onMove} className={`spotlight-card ${className}`} {...rest}>
      {children}
    </As>
  )
}
