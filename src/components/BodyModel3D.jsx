import { useState, useRef } from 'react'

// ─── Palette ─────────────────────────────────────────────────────────
const C_FILL   = '#E8DFD0'
const C_HOVER  = '#E08570'
const C_ACTIVE = '#C8654A'
const C_STROKE = '#9C8878'

// ─── Region helpers ───────────────────────────────────────────────────
const HEAD_IDS  = new Set(['face', 'head'])
const TORSO_IDS = new Set(['chest', 'stomach', 'back'])

function resolveRegion(r, isFront) {
  if (r === '_head')    return isFront ? 'face'    : 'head'
  if (r === '_torso_u') return isFront ? 'chest'   : 'back'
  if (r === '_torso_l') return isFront ? 'stomach' : 'back'
  return r
}

function isHighlighted(r, selected) {
  if (!selected) return false
  if (r === '_head')    return HEAD_IDS.has(selected)
  if (r === '_torso_u') return TORSO_IDS.has(selected)
  if (r === '_torso_l') return TORSO_IDS.has(selected)
  return r === selected
}

// ─── Body parts ───────────────────────────────────────────────────────
// ViewBox "0 0 400 510", figure centred at x = 200.
//
// views: 'both' | 'front' | 'back'
// r: null  → decorative, non-interactive
//
// Feminine proportions:
//   shoulders ~100 px  →  waist 44 px  →  hips 92 px
//
// Front torso: bezier bows outward at chest (breast silhouette).
// Back  torso: bezier curves straight inward (no breast bulge).
// Front extras: eyes, breast-contour arc, navel.
// Back  extras: dashed spine, shoulder-blade ovals, lumbar dimples.
const PARTS = [

  // ── Both views ─────────────────────────────────────────────────

  // Head — tall oval (feminine)
  { r: '_head',     views: 'both',  el: 'ellipse', props: { cx: 200, cy: 50,  rx: 30, ry: 38 } },
  // Neck
  { r: 'neck',      views: 'both',  el: 'rect',    props: { x: 186,  y: 85,   width: 28,  height: 30, rx: 5 } },
  // Lower torso (stomach / back)
  { r: '_torso_l',  views: 'both',  el: 'rect',    props: { x: 178,  y: 235,  width: 44,  height: 45, rx: 5 } },
  // Hips — wide pelvis flare with bezier curves
  { r: 'hips',      views: 'both',  el: 'path',    props: { d: 'M178,280 L222,280 C232,292 246,306 246,318 L154,318 C154,306 168,292 178,280 Z' } },
  // Shoulder joints
  { r: 'shoulders', views: 'both',  el: 'ellipse', props: { cx: 150, cy: 122, rx: 13, ry: 12 } },
  { r: 'shoulders', views: 'both',  el: 'ellipse', props: { cx: 250, cy: 122, rx: 13, ry: 12 } },
  // Upper arms — centred on shoulder cx
  { r: 'arms',      views: 'both',  el: 'rect',    props: { x: 139,  y: 130,  width: 22,  height: 78, rx: 11 } },
  { r: 'arms',      views: 'both',  el: 'rect',    props: { x: 239,  y: 130,  width: 22,  height: 78, rx: 11 } },
  // Elbow joints
  { r: 'arms',      views: 'both',  el: 'circle',  props: { cx: 150, cy: 210, r: 10 } },
  { r: 'arms',      views: 'both',  el: 'circle',  props: { cx: 250, cy: 210, r: 10 } },
  // Forearms
  { r: 'arms',      views: 'both',  el: 'rect',    props: { x: 141,  y: 216,  width: 18,  height: 64, rx: 9 } },
  { r: 'arms',      views: 'both',  el: 'rect',    props: { x: 241,  y: 216,  width: 18,  height: 64, rx: 9 } },
  // Hands
  { r: 'hands',     views: 'both',  el: 'ellipse', props: { cx: 150, cy: 290, rx: 10, ry: 12 } },
  { r: 'hands',     views: 'both',  el: 'ellipse', props: { cx: 250, cy: 290, rx: 10, ry: 12 } },
  // Thighs — wider spacing for feminine hips
  { r: 'legs',      views: 'both',  el: 'rect',    props: { x: 160,  y: 318,  width: 30,  height: 74, rx: 15 } },
  { r: 'legs',      views: 'both',  el: 'rect',    props: { x: 210,  y: 318,  width: 30,  height: 74, rx: 15 } },
  // Knee joints
  { r: 'knees',     views: 'both',  el: 'circle',  props: { cx: 175, cy: 395, r: 13 } },
  { r: 'knees',     views: 'both',  el: 'circle',  props: { cx: 225, cy: 395, r: 13 } },
  // Shins
  { r: 'legs',      views: 'both',  el: 'rect',    props: { x: 164,  y: 405,  width: 22,  height: 68, rx: 11 } },
  { r: 'legs',      views: 'both',  el: 'rect',    props: { x: 214,  y: 405,  width: 22,  height: 68, rx: 11 } },
  // Ankle joints
  { r: 'feet',      views: 'both',  el: 'circle',  props: { cx: 175, cy: 477, r: 9 } },
  { r: 'feet',      views: 'both',  el: 'circle',  props: { cx: 225, cy: 477, r: 9 } },
  // Feet
  { r: 'feet',      views: 'both',  el: 'rect',    props: { x: 159,  y: 482,  width: 30,  height: 14, rx: 6 } },
  { r: 'feet',      views: 'both',  el: 'rect',    props: { x: 209,  y: 482,  width: 30,  height: 14, rx: 6 } },

  // ── Front only ─────────────────────────────────────────────────

  // Upper torso FRONT — bezier bows outward at chest, creating breast silhouette
  { r: '_torso_u',  views: 'front', el: 'path',    props: { d: 'M150,117 L250,117 C272,140 242,205 222,235 L178,235 C158,205 128,140 150,117 Z' } },
  // Breast contour arc — gentle underside curve (decorative)
  { r: null,        views: 'front', el: 'path',    props: { d: 'M175,186 C179,199 190,205 200,205 C210,205 221,199 225,186', fill: 'none', stroke: C_STROKE, strokeWidth: 1.2, strokeLinecap: 'round' } },
  // Eyes
  { r: null,        views: 'front', el: 'circle',  props: { cx: 191, cy: 46, r: 2.5, fill: C_STROKE, stroke: 'none' } },
  { r: null,        views: 'front', el: 'circle',  props: { cx: 209, cy: 46, r: 2.5, fill: C_STROKE, stroke: 'none' } },
  // Navel
  { r: null,        views: 'front', el: 'circle',  props: { cx: 200, cy: 256, r: 2,  fill: C_STROKE, stroke: 'none' } },

  // ── Back only ──────────────────────────────────────────────────

  // Upper torso BACK — bezier curves straight inward (no breast bulge)
  { r: '_torso_u',  views: 'back',  el: 'path',    props: { d: 'M150,117 L250,117 C246,148 226,196 222,235 L178,235 C174,196 154,148 150,117 Z' } },
  // Spine — dashed centre line
  { r: null,        views: 'back',  el: 'line',    props: { x1: 200, y1: 117, x2: 200, y2: 316, stroke: C_STROKE, strokeWidth: 1, strokeDasharray: '3 3' } },
  // Shoulder blades
  { r: null,        views: 'back',  el: 'ellipse', props: { cx: 178, cy: 158, rx: 14, ry: 20, fill: 'none', stroke: C_STROKE, strokeWidth: 1, opacity: 0.55 } },
  { r: null,        views: 'back',  el: 'ellipse', props: { cx: 222, cy: 158, rx: 14, ry: 20, fill: 'none', stroke: C_STROKE, strokeWidth: 1, opacity: 0.55 } },
  // Lumbar dimples
  { r: null,        views: 'back',  el: 'circle',  props: { cx: 194, cy: 272, r: 2.5, fill: C_STROKE, stroke: 'none' } },
  { r: null,        views: 'back',  el: 'circle',  props: { cx: 206, cy: 272, r: 2.5, fill: C_STROKE, stroke: 'none' } },
]

// ─── Single body part ─────────────────────────────────────────────────
function Part({ part, isFront, selected, onSelect, onHover }) {
  const [hovered, setHovered] = useState(false)
  const isDecor  = part.r === null
  const resolved = isDecor ? null : resolveRegion(part.r, isFront)
  const active   = !isDecor && isHighlighted(part.r, selected)
  const fill     = isDecor
    ? (part.props.fill ?? C_FILL)
    : (active ? C_ACTIVE : hovered ? C_HOVER : C_FILL)

  const Tag = part.el

  if (isDecor) {
    const { fill: _f, ...rest } = part.props
    return <Tag fill={fill} pointerEvents="none" {...rest} />
  }

  const { fill: _f, stroke: _s, strokeWidth: _sw, ...svgProps } = part.props
  return (
    <Tag
      fill={fill}
      stroke={C_STROKE}
      strokeWidth={1.5}
      strokeLinejoin="round"
      style={{ cursor: 'pointer', transition: 'fill 0.14s ease' }}
      onClick={()       => onSelect(resolved)}
      onMouseEnter={()  => { setHovered(true);  onHover(resolved) }}
      onMouseLeave={()  => { setHovered(false); onHover(null) }}
      {...svgProps}
    />
  )
}

// ─── Flip animation ───────────────────────────────────────────────────
// Sequence: 'idle' → 'out' (rotate to 90°) → 'switching' (snap to -90°,
// swap content) → 'in' (rotate to 0°) → 'idle'. Total ≈ 400 ms.
function flipStyle(phase) {
  switch (phase) {
    case 'out':       return { transform: 'perspective(700px) rotateY(90deg)',  transition: 'transform 0.20s ease-in',  transformOrigin: 'center' }
    case 'switching': return { transform: 'perspective(700px) rotateY(-90deg)', transition: 'none',                     transformOrigin: 'center' }
    case 'in':        return { transform: 'perspective(700px) rotateY(0deg)',   transition: 'transform 0.20s ease-out',  transformOrigin: 'center' }
    default:          return { transform: 'perspective(700px) rotateY(0deg)',   transition: 'none',                     transformOrigin: 'center' }
  }
}

// ─── Public component ─────────────────────────────────────────────────
export default function BodyModel3D({ selectedRegion, onRegionClick, onRegionHover }) {
  const [isFront, setIsFront] = useState(true)
  const [phase,   setPhase]   = useState('idle')
  const timerRef = useRef(null)

  function flipTo(front) {
    if (front === isFront || phase !== 'idle') return
    clearTimeout(timerRef.current)
    setPhase('out')
    timerRef.current = setTimeout(() => {
      setIsFront(front)
      setPhase('switching')
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setPhase('in')
        timerRef.current = setTimeout(() => setPhase('idle'), 200)
      }))
    }, 200)
  }

  const visible = (views) =>
    views === 'both' || (views === 'front' && isFront) || (views === 'back' && !isFront)

  return (
    <div className="w-full relative select-none" style={{ height: 440 }}>
      {/* Toggle sits at the top — keeps the entire figure (including feet) freely clickable */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 inline-flex border border-ink/20 z-10">
        <button
          onClick={() => flipTo(true)}
          className={`px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors
            ${isFront ? 'bg-ink text-cream' : 'text-ink-soft hover:text-ink hover:bg-cream-dark'}`}
        >
          Front
        </button>
        <button
          onClick={() => flipTo(false)}
          className={`px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors border-l border-ink/20
            ${!isFront ? 'bg-ink text-cream' : 'text-ink-soft hover:text-ink hover:bg-cream-dark'}`}
        >
          Back
        </button>
      </div>

      <svg
        viewBox="0 0 400 510"
        className="w-full h-full"
        style={flipStyle(phase)}
        aria-label="Interactive body diagram"
      >
        {PARTS.map((part, i) =>
          visible(part.views)
            ? <Part
                key={i}
                part={part}
                isFront={isFront}
                selected={selectedRegion}
                onSelect={onRegionClick}
                onHover={onRegionHover ?? (() => {})}
              />
            : null
        )}
      </svg>
    </div>
  )
}
