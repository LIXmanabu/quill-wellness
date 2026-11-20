import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/*
  Procedural sculpt of the Body Atlas figure: a smooth, bisque "study cast"
  built from lathed profiles, so it ships with zero downloaded assets.

  Units are metres-ish: feet at y = 0, crown at y ≈ 1.74, facing +z.

  Every part is baked into world (group-local) space, so a hit point can be
  mapped straight back to a region. Parts are either:
   • fixed:     one region for the whole mesh (limbs, joints, hands, feet)
   • resolved:  a function decides the region per point (trunk, head), so the
                torso splits into chest / stomach / back / hips / neck and the
                head into face / head, by height and by front-vs-back.
*/

const V2 = (x, y) => new THREE.Vector2(x, y)
const lerp = (a, b, t) => a + (b - a) * t
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const bump = (dx, dy, s) => Math.exp(-(dx * dx + dy * dy) / (2 * s * s))

// Drop UVs/normals, weld the lathe seam and poles, then recompute smooth
// normals, so there are no creases where the profile closes on itself.
function finalize(geo) {
  geo.deleteAttribute('uv')
  geo.deleteAttribute('normal')
  const merged = mergeVertices(geo, 1e-4)
  merged.computeVertexNormals()
  merged.computeBoundingSphere()
  return merged
}

// Lathe a smooth Catmull-Rom profile of [radius, y] keys around the y axis.
// The seam starts at the back (phiStart = π) so any residue hides on the spine.
function smoothLathe(keys, segments, steps) {
  const curve = new THREE.SplineCurve(keys.map(([r, y]) => V2(r, y)))
  const pts = curve.getPoints(steps).map((p) => V2(Math.max(0, p.x), p.y))
  return new THREE.LatheGeometry(pts, segments, Math.PI, Math.PI * 2)
}

// ── Trunk: hips → waist → ribcage → shoulders → neck, one continuous surface ──
const TRUNK_KEYS = [
  [0.0,   0.775], [0.07,  0.785], [0.13,  0.81],  [0.162, 0.86],
  [0.158, 0.93],  [0.132, 1.0],   [0.116, 1.07],  [0.124, 1.14],
  [0.145, 1.22],  [0.152, 1.30],  [0.158, 1.37],  [0.14,  1.415],
  [0.095, 1.44],  [0.058, 1.47],  [0.052, 1.52],  [0.05,  1.56],
  [0.0,   1.575],
]

export function trunkRegion(x, y, z) {
  if (y > 1.435) return 'neck'
  if (y >= 1.12) return z >= 0 ? 'chest' : 'back'
  if (y >= 0.975) return z >= 0 ? 'stomach' : 'back'
  return 'hips'
}

function trunkGeometry() {
  const geo = smoothLathe(TRUNK_KEYS, 64, 140)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const { x, y } = v
    // Elliptical cross-section: shallow torso, slightly deeper pelvis, round neck.
    const depth = lerp(0.64 + 0.04 * bump(0, y - 0.88, 0.06), 1.0, smoothstep(1.41, 1.47, y))
    v.z *= depth
    const front = smoothstep(0.0, 0.05, v.z)
    const back = smoothstep(0.0, 0.05, -v.z)
    // Front: soft bust and a navel; back: glutes, shoulder blades, spine groove.
    v.z += front * 0.034 * (bump(x - 0.072, y - 1.255, 0.042) + bump(x + 0.072, y - 1.255, 0.042))
    v.z -= front * 0.005 * bump(x, y - 1.03, 0.008)
    v.z -= back * 0.016 * (bump(x - 0.07, y - 0.87, 0.05) + bump(x + 0.07, y - 0.87, 0.05))
    v.z -= back * 0.012 * (bump(x - 0.07, y - 1.33, 0.04) + bump(x + 0.07, y - 1.33, 0.04))
    v.z += back * 0.007 * Math.exp(-(x * x) / (2 * 0.012 * 0.012)) * smoothstep(0.98, 1.05, y) * (1 - smoothstep(1.36, 1.42, y))
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  return finalize(geo)
}

// ── Head: an ellipsoid with a tapered jaw and fuller cranium ──
const HEAD_C = new THREE.Vector3(0, 1.635, 0.005)
const HEAD_S = new THREE.Vector3(0.088, 0.115, 0.102)

export function headRegion(x, y, z) {
  const ly = y - HEAD_C.y
  const lz = z - HEAD_C.z
  return lz > 0 && ly < 0.085 ? 'face' : 'head'
}

function headGeometry() {
  const geo = new THREE.SphereGeometry(1, 56, 40)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const ux = pos.getX(i), uy = pos.getY(i), uz = pos.getZ(i)
    let x = ux * HEAD_S.x, y = uy * HEAD_S.y, z = uz * HEAD_S.z
    // All factors are continuous across uy = 0, so the skull has no ledge.
    if (uy < 0) {
      const t = -uy
      x *= 1 - 0.26 * Math.pow(t, 1.4)                         // jaw narrows to the chin
      z *= uz < 0 ? 1.06 - 0.4 * t * t : 1 - 0.08 * t          // tuck under the skull at the back
    } else if (uz < 0) {
      z *= 1.06 - 0.04 * uy * uy                               // fuller back of the cranium
    }
    pos.setXYZ(i, x + HEAD_C.x, y + HEAD_C.y, z + HEAD_C.z)
  }
  return finalize(geo)
}

// ── Limb segment: a tapered capsule with an optional muscle swell ──
function limb(from, to, r0, r1, { bulge = 0, at = 0.35, width = 0.3, flat = 1, seg = 32 } = {}) {
  const a = new THREE.Vector3(...from)
  const b = new THREE.Vector3(...to)
  const L = a.distanceTo(b)
  const pts = []
  for (let i = 0; i <= 8; i++) {
    const ang = -Math.PI / 2 + (i / 8) * (Math.PI / 2)
    pts.push(V2(r0 * Math.cos(ang), r0 + r0 * Math.sin(ang)))
  }
  const mid = Math.max(0.001, L - r0 - r1)
  for (let i = 1; i < 24; i++) {
    const s = i / 24
    pts.push(V2(lerp(r0, r1, s) + bulge * Math.exp(-(((s - at) / width) ** 2)), r0 + s * mid))
  }
  for (let i = 0; i <= 8; i++) {
    const ang = (i / 8) * (Math.PI / 2)
    pts.push(V2(r1 * Math.cos(ang), L - r1 + r1 * Math.sin(ang)))
  }
  const geo = new THREE.LatheGeometry(pts, seg)
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())
  geo.applyMatrix4(new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, flat)))
  return finalize(geo)
}

function ellipsoid(center, scale, rot = [0, 0, 0], seg = 32) {
  const geo = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75))
  geo.applyMatrix4(new THREE.Matrix4().compose(
    new THREE.Vector3(...center),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),
    new THREE.Vector3(...scale),
  ))
  return finalize(geo)
}

/** Build every part of the figure. Call once (memoised by the caller). */
export function buildBody() {
  const parts = [
    { key: 'trunk', geometry: trunkGeometry(), resolve: trunkRegion },
    { key: 'head', geometry: headGeometry(), resolve: headRegion },
    { key: 'nose', geometry: ellipsoid([0, 1.628, 0.103], [0.014, 0.024, 0.016], [-0.25, 0, 0], 20), region: 'face' },
  ]

  for (const s of [1, -1]) {
    const side = s > 0 ? 'l' : 'r'
    parts.push(
      // Ears
      { key: `ear-${side}`, geometry: ellipsoid([s * 0.087, 1.632, -0.005], [0.012, 0.028, 0.02], [0, s * 0.3, 0], 20), region: 'head' },
      // Shoulder caps (deltoids)
      { key: `shoulder-${side}`, geometry: ellipsoid([s * 0.165, 1.395, -0.004], [0.06, 0.054, 0.056]), region: 'shoulders' },
      // Arms, relaxed A-pose
      { key: `upperarm-${side}`, geometry: limb([s * 0.18, 1.375, 0], [s * 0.226, 1.1, -0.006], 0.048, 0.036, { bulge: 0.006, at: 0.3 }), region: 'arms' },
      { key: `forearm-${side}`, geometry: limb([s * 0.226, 1.105, -0.006], [s * 0.256, 0.862, 0.02], 0.037, 0.024, { bulge: 0.008, at: 0.22, flat: 0.86 }), region: 'arms' },
      // Hands: a flattened palm plus a thumb
      { key: `hand-${side}`, geometry: ellipsoid([s * 0.264, 0.8, 0.026], [0.024, 0.068, 0.04], [0.05, 0, s * 0.06]), region: 'hands' },
      { key: `thumb-${side}`, geometry: limb([s * 0.257, 0.842, 0.045], [s * 0.252, 0.8, 0.068], 0.012, 0.01, { seg: 16 }), region: 'hands' },
      // Legs
      { key: `thigh-${side}`, geometry: limb([s * 0.086, 0.86, 0], [s * 0.08, 0.49, 0.004], 0.086, 0.05, { bulge: 0.01, at: 0.28 }), region: 'legs' },
      { key: `knee-${side}`, geometry: ellipsoid([s * 0.08, 0.48, 0.014], [0.05, 0.054, 0.046]), region: 'knees' },
      { key: `shin-${side}`, geometry: limb([s * 0.08, 0.47, 0], [s * 0.075, 0.075, -0.004], 0.047, 0.028, { bulge: 0.011, at: 0.28 }), region: 'legs' },
      // Ankles and feet
      { key: `ankle-${side}`, geometry: ellipsoid([s * 0.075, 0.07, -0.002], [0.032, 0.034, 0.034], [0, 0, 0], 20), region: 'feet' },
      { key: `foot-${side}`, geometry: ellipsoid([s * 0.079, 0.034, 0.042], [0.038, 0.034, 0.104], [0.08, s * 0.08, 0]), region: 'feet' },
    )
  }

  // Precompute each vertex's region on resolved parts, for selection glow.
  for (const p of parts) {
    if (!p.resolve) continue
    const pos = p.geometry.attributes.position
    const regions = new Array(pos.count)
    for (let i = 0; i < pos.count; i++) regions[i] = p.resolve(pos.getX(i), pos.getY(i), pos.getZ(i))
    p.vertexRegions = regions
    p.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3))
  }
  return parts
}
