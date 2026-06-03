import { useRef, useState, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// ─── Stylized female figure in react-three-fiber ──────────────────────
// A procedurally sculpted, editorial mannequin (no external model files):
// a lathe-revolved torso with bust/waist/hip curves plus capsule limbs.
// Each body region is its own mesh, so clicks still drive the concern panel.
// Colours follow the Quill palette and highlight on hover / selection.

const BASE = '#E7D7C4'   // warm bone "skin"
const HOVER = '#E0A98C'  // soft clay tint
const SELECT = '#C8654A' // clay (selected region)

function colorFor(region, selectedRegion, hovered) {
  if (region && region === selectedRegion) return SELECT
  if (region && region === hovered) return HOVER
  return BASE
}

// A single sculpted piece. `children` is the geometry element; the material
// (with a soft sheen for a skin-like finish) is attached here.
function Part({ region, ctx, children, ...meshProps }) {
  const color = colorFor(region, ctx.selectedRegion, ctx.hovered)
  const interactive = Boolean(region)
  return (
    <mesh
      {...meshProps}
      castShadow
      receiveShadow
      onPointerOver={interactive ? (e) => { e.stopPropagation(); ctx.setHovered(region); document.body.style.cursor = 'pointer' } : undefined}
      onPointerOut={interactive ? () => { ctx.setHovered(null); document.body.style.cursor = '' } : undefined}
      onClick={interactive ? (e) => { e.stopPropagation(); ctx.onSelect(region) } : undefined}
    >
      {children}
      <meshPhysicalMaterial
        color={color}
        roughness={0.62}
        metalness={0.02}
        sheen={0.5}
        sheenRoughness={0.7}
        sheenColor={'#f3d9c4'}
        clearcoat={0.12}
        clearcoatRoughness={0.6}
      />
    </mesh>
  )
}

// Build a revolved torso segment from a radius/height profile.
function lathePoints(pairs) {
  return pairs.map(([r, y]) => new THREE.Vector2(r, y))
}

function Figure({ ctx }) {
  // Profiles (radius, height). Boundaries share a radius so segments meet
  // seamlessly: chest (bust) → stomach (waist) → hips (flare).
  const chest = useMemo(() => lathePoints([
    [0.40, 5.75], [0.47, 5.46], [0.53, 5.16], [0.48, 4.88], [0.40, 4.62], [0.38, 4.50],
  ]), [])
  const stomach = useMemo(() => lathePoints([
    [0.38, 4.50], [0.34, 4.30], [0.33, 4.08], [0.40, 3.92],
  ]), [])
  const hips = useMemo(() => lathePoints([
    [0.40, 3.92], [0.55, 3.64], [0.60, 3.46], [0.52, 3.24], [0.44, 3.12],
  ]), [])

  return (
    <group position={[0, -3.0, 0]}>
      {/* Head + neck (region: face) */}
      <Part region="face" ctx={ctx} position={[0, 6.55, 0]} scale={[1, 1.16, 1]}>
        <sphereGeometry args={[0.42, 48, 48]} />
      </Part>
      {/* Hair cap — non-interactive accent */}
      <Part ctx={ctx} position={[0, 6.78, -0.05]} scale={[1.06, 1.0, 1.08]}>
        <sphereGeometry args={[0.43, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
      </Part>
      <Part region="neck" ctx={ctx} position={[0, 5.92, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.42, 24]} />
      </Part>

      {/* Torso segments */}
      <Part region="chest" ctx={ctx}>
        <latheGeometry args={[chest, 48]} />
      </Part>
      {/* Bust contour — part of chest */}
      <Part region="chest" ctx={ctx} position={[-0.16, 5.06, 0.34]} scale={[1, 1, 0.85]}>
        <sphereGeometry args={[0.15, 32, 32]} />
      </Part>
      <Part region="chest" ctx={ctx} position={[0.16, 5.06, 0.34]} scale={[1, 1, 0.85]}>
        <sphereGeometry args={[0.15, 32, 32]} />
      </Part>
      <Part region="stomach" ctx={ctx}>
        <latheGeometry args={[stomach, 48]} />
      </Part>
      <Part region="hips" ctx={ctx}>
        <latheGeometry args={[hips, 48]} />
      </Part>

      {/* Shoulders */}
      <Part region="shoulders" ctx={ctx} position={[-0.45, 5.6, 0]}>
        <sphereGeometry args={[0.19, 32, 32]} />
      </Part>
      <Part region="shoulders" ctx={ctx} position={[0.45, 5.6, 0]}>
        <sphereGeometry args={[0.19, 32, 32]} />
      </Part>

      {/* Arms (upper + fore) hugging the body, angled slightly outward */}
      <Part region="arms" ctx={ctx} position={[-0.53, 4.95, 0]} rotation={[0, 0, 0.12]}>
        <capsuleGeometry args={[0.115, 1.05, 12, 24]} />
      </Part>
      <Part region="arms" ctx={ctx} position={[0.53, 4.95, 0]} rotation={[0, 0, -0.12]}>
        <capsuleGeometry args={[0.115, 1.05, 12, 24]} />
      </Part>
      <Part region="arms" ctx={ctx} position={[-0.66, 3.85, 0]} rotation={[0, 0, 0.08]}>
        <capsuleGeometry args={[0.10, 1.05, 12, 24]} />
      </Part>
      <Part region="arms" ctx={ctx} position={[0.66, 3.85, 0]} rotation={[0, 0, -0.08]}>
        <capsuleGeometry args={[0.10, 1.05, 12, 24]} />
      </Part>
      {/* Hands */}
      <Part region="hands" ctx={ctx} position={[-0.72, 3.18, 0]}>
        <sphereGeometry args={[0.13, 24, 24]} />
      </Part>
      <Part region="hands" ctx={ctx} position={[0.72, 3.18, 0]}>
        <sphereGeometry args={[0.13, 24, 24]} />
      </Part>

      {/* Legs: thigh + shin, with knees and feet */}
      <Part region="legs" ctx={ctx} position={[-0.24, 2.55, 0]}>
        <capsuleGeometry args={[0.19, 0.95, 12, 24]} />
      </Part>
      <Part region="legs" ctx={ctx} position={[0.24, 2.55, 0]}>
        <capsuleGeometry args={[0.19, 0.95, 12, 24]} />
      </Part>
      <Part region="knees" ctx={ctx} position={[-0.24, 1.82, 0]}>
        <sphereGeometry args={[0.18, 24, 24]} />
      </Part>
      <Part region="knees" ctx={ctx} position={[0.24, 1.82, 0]}>
        <sphereGeometry args={[0.18, 24, 24]} />
      </Part>
      <Part region="legs" ctx={ctx} position={[-0.24, 1.05, 0]}>
        <capsuleGeometry args={[0.155, 1.0, 12, 24]} />
      </Part>
      <Part region="legs" ctx={ctx} position={[0.24, 1.05, 0]}>
        <capsuleGeometry args={[0.155, 1.0, 12, 24]} />
      </Part>
      {/* Feet */}
      <Part region="feet" ctx={ctx} position={[-0.24, 0.14, 0.16]}>
        <boxGeometry args={[0.26, 0.18, 0.56]} />
      </Part>
      <Part region="feet" ctx={ctx} position={[0.24, 0.14, 0.16]}>
        <boxGeometry args={[0.26, 0.18, 0.56]} />
      </Part>
    </group>
  )
}

// Eases the orbit controls toward a requested azimuth (Front/Back buttons),
// and provides the gentle default turn unless the user is dragging or
// reduced-motion is on.
function Rig({ controls, targetRef, autoRef }) {
  useFrame((_, delta) => {
    const c = controls.current
    if (!c) return
    if (targetRef.current != null) {
      const cur = c.getAzimuthalAngle()
      let diff = targetRef.current - cur
      // shortest path
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      if (Math.abs(diff) < 0.01) {
        c.setAzimuthalAngle(targetRef.current)
        targetRef.current = null
      } else {
        c.setAzimuthalAngle(cur + diff * Math.min(1, delta * 6))
      }
      c.update()
    } else if (autoRef.current) {
      c.setAzimuthalAngle(c.getAzimuthalAngle() + delta * 0.25)
      c.update()
    }
  })
  return null
}

export default function BodyModel3D({ selectedRegion, onRegionClick, onRegionHover }) {
  const [hovered, setHovered] = useState(null)
  const controls = useRef(null)
  const targetRef = useRef(null)
  const autoRef = useRef(true)
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) autoRef.current = false

  const ctx = {
    selectedRegion,
    hovered,
    setHovered: (r) => { setHovered(r); onRegionHover?.(r) },
    onSelect: (r) => onRegionClick?.(r),
  }

  function turn(front) {
    autoRef.current = false
    targetRef.current = front ? 0 : Math.PI
  }

  return (
    <div className="w-full relative select-none" style={{ height: 460 }}>
      {/* Front / Back quick-turn */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 inline-flex border border-ink/20 z-10 bg-cream/70 backdrop-blur-sm">
        <button onClick={() => turn(true)}
          className="px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-soft hover:text-ink hover:bg-cream-dark transition-colors">
          Front
        </button>
        <button onClick={() => turn(false)}
          className="px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-soft hover:text-ink hover:bg-cream-dark transition-colors border-l border-ink/20">
          Back
        </button>
      </div>

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.7, 6.9], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        aria-label="Interactive 3D body figure"
      >
        {/* Lighting: key + fill + rim + hemisphere for soft, even sculpting */}
        <hemisphereLight args={['#fff6ec', '#caa', 0.55]} />
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[4, 8, 6]} intensity={1.5} castShadow
          shadow-mapSize-width={1024} shadow-mapSize-height={1024}
          shadow-camera-near={1} shadow-camera-far={20}
          shadow-camera-left={-5} shadow-camera-right={5}
          shadow-camera-top={6} shadow-camera-bottom={-6}
        />
        <directionalLight position={[-5, 3, 2]} intensity={0.5} />
        <directionalLight position={[0, 4, -6]} intensity={0.7} color="#ffe9d6" />

        <Suspense fallback={null}>
          <Figure ctx={ctx} />
          <ContactShadows position={[0, -3.0, 0]} opacity={0.32} scale={9} blur={2.6} far={4} resolution={512} color="#3a2c20" />
        </Suspense>

        <OrbitControls
          ref={controls}
          target={[0, 0.4, 0]}
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.30}
          maxPolarAngle={Math.PI * 0.62}
          onStart={() => { autoRef.current = false; targetRef.current = null }}
        />
        <Rig controls={controls} targetRef={targetRef} autoRef={autoRef} />
      </Canvas>
    </div>
  )
}
