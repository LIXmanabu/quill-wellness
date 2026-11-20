import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { buildBody } from './geometry.js'

// ─── Palette (bisque cast, Quill clay for hover/selection) ─────────────────
const C_BASE   = new THREE.Color('#EADFD1')
const C_HOVER  = new THREE.Color('#E5A9BB')
const C_ACTIVE = new THREE.Color('#B23A5E')

const LABELS = {
  face: 'Face', head: 'Head', neck: 'Neck', shoulders: 'Shoulders', arms: 'Arms',
  hands: 'Hands', chest: 'Chest', stomach: 'Stomach', back: 'Back', hips: 'Hips',
  legs: 'Legs', knees: 'Knees', feet: 'Feet',
}
// Regions that live on one side of the body: picking one turns the figure to it.
const BACK_REGIONS  = new Set(['back', 'head'])
const FRONT_REGIONS = new Set(['face', 'chest', 'stomach'])

const TAU = Math.PI * 2
const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function surfaceMaterial(color, vertexColors = false) {
  return new THREE.MeshPhysicalMaterial({
    color: vertexColors ? '#ffffff' : color,
    vertexColors,
    roughness: 0.62,
    sheen: 0.5,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color('#FFF0E4'),
  })
}

// Soft contact shadow: a radial-gradient decal on the floor (no extra render pass).
function useShadowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, 'rgba(29,36,64,0.34)')
    grad.addColorStop(0.55, 'rgba(29,36,64,0.12)')
    grad.addColorStop(1, 'rgba(29,36,64,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

function Figure({ ctl, selected, hovered, setHovered, onSelect, onHover, setIsFront }) {
  const group = useRef()
  const frontRef = useRef(true)
  const invalidate = useThree((s) => s.invalidate)
  ctl.current.invalidate = invalidate

  const parts = useMemo(() => buildBody(), [])
  const mats = useMemo(() => ({
    base: surfaceMaterial(C_BASE),
    hover: surfaceMaterial(C_HOVER),
    active: surfaceMaterial(C_ACTIVE),
    vertex: surfaceMaterial(null, true),
  }), [])
  const shadow = useShadowTexture()

  // Free GPU memory when the figure unmounts (e.g. leaving the Body page).
  useEffect(() => () => {
    parts.forEach((p) => p.geometry.dispose())
    Object.values(mats).forEach((m) => m.dispose())
    shadow.dispose()
  }, [parts, mats, shadow])

  // Repaint the per-vertex glow on the trunk and head.
  useEffect(() => {
    for (const p of parts) {
      if (!p.vertexRegions) continue
      const col = p.geometry.attributes.color
      p.vertexRegions.forEach((r, i) => {
        const c = r === selected ? C_ACTIVE : r === hovered ? C_HOVER : C_BASE
        col.setXYZ(i, c.r, c.g, c.b)
      })
      col.needsUpdate = true
    }
    invalidate()
  }, [parts, selected, hovered, invalidate])

  useFrame((_, rawDt) => {
    const c = ctl.current
    const dt = Math.min(rawDt, 1 / 30)   // demand mode: delta can be huge after idle
    if (!c.dragging) {
      const d = c.target - c.angle
      if (Math.abs(d) > 0.0008) {
        c.angle += d * (1 - Math.exp(-dt * 7))
        invalidate()
      } else {
        c.angle = c.target
      }
    }
    group.current.rotation.y = c.angle
    const front = Math.cos(c.angle) >= 0
    if (front !== frontRef.current) { frontRef.current = front; setIsFront(front) }
  })

  function resolve(e, part) {
    if (!part.resolve) return part.region
    const p = group.current.worldToLocal(e.point.clone())
    return part.resolve(p.x, p.y, p.z)
  }

  return (
    <>
      <hemisphereLight args={['#FFF8EE', '#B49C86', 1.15]} />
      <directionalLight position={[2.4, 4, 3.2]} intensity={2.3} color="#FFF0E0" />
      <directionalLight position={[-3, 2.6, -2.8]} intensity={1.5} color="#FFD8C2" />
      <directionalLight position={[-1.5, 0.6, 3]} intensity={0.35} color="#F2ECFF" />

      <mesh rotation-x={-Math.PI / 2} position-y={0.001} scale={[0.95, 0.5, 1]} renderOrder={-1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>

      <group ref={group}>
        {parts.map((part) => {
          const material = part.vertexRegions
            ? mats.vertex
            : part.region === selected ? mats.active : part.region === hovered ? mats.hover : mats.base
          return (
            <mesh
              key={part.key}
              geometry={part.geometry}
              material={material}
              onPointerMove={(e) => {
                e.stopPropagation()
                if (e.pointerType !== 'mouse' || ctl.current.dragging) return
                const r = resolve(e, part)
                if (r !== hovered) { setHovered(r); onHover(r) }
              }}
              onPointerOut={(e) => {
                if (e.pointerType !== 'mouse') return
                setHovered(null); onHover(null)
              }}
              onClick={(e) => {
                e.stopPropagation()
                if (e.delta > 8) return   // it was a drag-to-turn, not a tap
                onSelect(resolve(e, part))
              }}
            />
          )
        })}
      </group>
    </>
  )
}

/**
 * Interactive 3D body figure. Drag (or arrow keys) to turn it, tap a region to
 * select it. Same props as the flat SVG map it replaces.
 */
export default function BodyFigure3D({ selectedRegion, onRegionClick, onRegionHover }) {
  const reduce = reducedMotion()
  // One quiet entrance: the figure turns in from a three-quarter view.
  const ctl = useRef({ angle: reduce ? 0 : 0.75, target: 0, dragging: false, lastX: 0, vel: 0, invalidate: () => {} })
  const [isFront, setIsFront] = useState(true)
  const [hovered, setHovered] = useState(null)

  function kick() { ctl.current.invalidate() }

  function turnTo(front) {
    const c = ctl.current
    const off = front ? 0 : Math.PI
    c.target = off + Math.round((c.angle - off) / TAU) * TAU
    if (reduce) c.angle = c.target
    kick()
  }

  // Picking a front- or back-only region (from the figure or the list) turns
  // the figure so that region faces the reader.
  useEffect(() => {
    if (BACK_REGIONS.has(selectedRegion)) turnTo(false)
    else if (FRONT_REGIONS.has(selectedRegion)) turnTo(true)
  }, [selectedRegion]) // eslint-disable-line react-hooks/exhaustive-deps

  // Horizontal drag turns the figure. touch-action: pan-y keeps vertical
  // swipes scrolling the page on phones (the browser cancels our pointer).
  useEffect(() => {
    const c = ctl.current
    function move(e) {
      if (!c.dragging) return
      const dx = e.clientX - c.lastX
      c.lastX = e.clientX
      c.angle += dx * 0.012
      c.target = c.angle
      c.vel = dx * 0.012
      kick()
    }
    function up() {
      if (!c.dragging) return
      c.dragging = false
      if (!reduce) c.target = c.angle + c.vel * 6   // a little inertia
      kick()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [reduce])

  function onPointerDown(e) {
    const c = ctl.current
    c.dragging = true
    c.lastX = e.clientX
    c.vel = 0
  }

  function onKeyDown(e) {
    const c = ctl.current
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      c.target += (e.key === 'ArrowRight' ? 1 : -1) * (Math.PI / 8)
      if (reduce) c.angle = c.target
      kick()
    }
  }

  const caption = hovered ? LABELS[hovered] : 'Drag to turn it, tap a region to read about it'

  return (
    <div className="w-full flex flex-col select-none" style={{ height: 460 }}>
      {/* Front / Back (in flow above the canvas, so it never covers the head) */}
      <div className="self-center mt-3 inline-flex border border-ink/20 rounded-full overflow-hidden">
        <button
          onClick={() => turnTo(true)}
          aria-pressed={isFront}
          className={`px-4 py-1 text-xs font-semibold   transition-colors
            ${isFront ? 'bg-ink text-cream' : 'text-ink-soft hover:text-ink hover:bg-cream-dark'}`}
        >
          Front
        </button>
        <button
          onClick={() => turnTo(false)}
          aria-pressed={!isFront}
          className={`px-4 py-1 text-xs font-semibold   transition-colors border-l border-ink/20
            ${!isFront ? 'bg-ink text-cream' : 'text-ink-soft hover:text-ink hover:bg-cream-dark'}`}
        >
          Back
        </button>
      </div>

      <div
        className="relative flex-1 min-h-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/60"
        style={{ touchAction: 'pan-y', cursor: hovered ? 'pointer' : 'grab' }}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="img"
        aria-label="3D body figure. Drag or use the arrow keys to turn it; tap a region to read about it, or pick one from the region list."
      >
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ fov: 28, position: [0, 0.86, 4.35], near: 0.1, far: 20 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          onCreated={({ camera }) => camera.lookAt(0, 0.9, 0)}
        >
          <Figure
            ctl={ctl}
            selected={selectedRegion}
            hovered={hovered}
            setHovered={setHovered}
            onSelect={onRegionClick}
            onHover={onRegionHover ?? (() => {})}
            setIsFront={setIsFront}
          />
        </Canvas>

        <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-ink-soft pointer-events-none" aria-hidden="true">
          {caption}
        </p>
      </div>
    </div>
  )
}
