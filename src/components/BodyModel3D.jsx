import { Component, Suspense, lazy, useState } from 'react'
import BodyFigureFlat from './BodyFigureFlat.jsx'

// The 3D figure (three.js + react-three-fiber) ships as its own chunk, only
// fetched when the Body page actually shows the map.
const BodyFigure3D = lazy(() => import('./body3d/BodyFigure3D.jsx'))

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()   // release the probe context
    return !!gl
  } catch {
    return false
  }
}

// If the 3D view throws (lost context, driver bug), drop to the flat map
// instead of taking the whole page down.
class FallbackOnError extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function Placeholder() {
  return (
    <div className="w-full flex items-center justify-center" style={{ height: 460 }} aria-hidden="true">
      <div className="w-16 h-40 rounded-full bg-ink/5 animate-pulse" />
    </div>
  )
}

/**
 * Body Atlas figure: a sculpted, rotatable 3D model where WebGL is available,
 * otherwise the flat front/back SVG map. Same props either way.
 */
export default function BodyModel3D(props) {
  const [use3D] = useState(webglAvailable)
  const flat = <BodyFigureFlat {...props} />
  if (!use3D) return flat
  return (
    <FallbackOnError fallback={flat}>
      <Suspense fallback={<Placeholder />}>
        <BodyFigure3D {...props} />
      </Suspense>
    </FallbackOnError>
  )
}
