/* Interactive SVG body map — clean human drawing with natural proportions.
   ViewBox: 0 0 200 466 (portrait). Front and back views. */

const FRONT_REGIONS = [
  { id: 'head',      label: 'Head',      type: 'ellipse', attrs: { cx: 100, cy: 36, rx: 22, ry: 26 } },
  { id: 'face',      label: 'Face',      type: 'ellipse', attrs: { cx: 100, cy: 38, rx: 14, ry: 18 } },
  { id: 'neck',      label: 'Neck',      type: 'path', d: 'M 92,62 L 92,82 L 108,82 L 108,62 Z' },
  {
    id: 'shoulders', label: 'Shoulders', type: 'path',
    d: 'M 92,82 C 76,84 60,92 50,104 C 46,114 50,124 60,128 C 70,124 80,114 88,100 C 90,92 92,86 92,82 Z M 108,82 C 124,84 140,92 150,104 C 154,114 150,124 140,128 C 130,124 120,114 112,100 C 110,92 108,86 108,82 Z',
  },
  {
    id: 'arms', label: 'Arms', type: 'path',
    d: 'M 50,104 C 42,124 38,150 36,180 C 36,206 40,224 44,238 L 58,238 C 56,222 56,204 58,182 C 60,154 64,134 70,118 C 64,112 56,108 50,104 Z M 150,104 C 158,124 162,150 164,180 C 164,206 160,224 156,238 L 142,238 C 144,222 144,204 142,182 C 140,154 136,134 130,118 C 136,112 144,108 150,104 Z',
  },
  {
    id: 'hands', label: 'Hands', type: 'path',
    d: 'M 36,238 C 30,246 28,256 32,266 C 38,272 48,272 54,266 C 58,258 58,248 56,240 Z M 164,238 C 170,246 172,256 168,266 C 162,272 152,272 146,266 C 142,258 142,248 144,240 Z',
  },
  {
    id: 'chest', label: 'Chest', type: 'path',
    d: 'M 70,108 C 64,128 62,148 64,164 L 136,164 C 138,148 136,128 130,108 C 122,98 110,94 100,94 C 90,94 78,98 70,108 Z',
  },
  {
    id: 'stomach', label: 'Stomach', type: 'path',
    d: 'M 64,164 C 60,184 58,202 60,222 L 140,222 C 142,202 140,184 136,164 Z',
  },
  {
    id: 'hips', label: 'Hips', type: 'path',
    d: 'M 60,222 C 54,234 52,250 56,266 C 68,272 84,274 100,274 C 116,274 132,272 144,266 C 148,250 146,234 140,222 Z',
  },
  {
    id: 'legs', label: 'Legs', type: 'path',
    d: 'M 56,274 C 50,308 50,344 52,378 C 52,408 54,428 56,442 C 64,448 78,448 86,442 C 90,432 92,418 92,400 C 92,372 90,340 88,310 C 86,290 84,278 82,274 Z M 144,274 C 116,278 114,290 112,310 C 110,340 108,372 108,400 C 108,418 110,432 114,442 C 122,448 136,448 144,442 C 146,428 148,408 148,378 C 150,344 150,308 144,274 Z',
  },
  {
    id: 'knees', label: 'Knees', type: 'path',
    d: 'M 58,360 C 56,374 56,386 60,394 C 70,398 82,398 88,392 C 90,380 90,366 88,358 C 78,354 64,356 58,360 Z M 112,358 C 110,366 110,380 112,392 C 118,398 130,398 140,394 C 144,386 144,374 142,360 C 136,356 122,354 112,358 Z',
  },
  {
    id: 'feet', label: 'Feet', type: 'path',
    d: 'M 56,442 C 46,444 38,450 36,458 C 38,464 48,466 62,466 C 78,466 90,462 92,454 C 92,446 86,440 80,440 C 70,438 62,440 56,442 Z M 144,442 C 138,440 130,438 120,440 C 114,440 108,446 108,454 C 110,462 122,466 138,466 C 152,466 162,464 164,458 C 162,450 154,444 144,442 Z',
  },
]

const BACK_REGIONS = [
  { id: 'head',      label: 'Head',      type: 'ellipse', attrs: { cx: 100, cy: 36, rx: 22, ry: 26 } },
  { id: 'neck',      label: 'Neck',      type: 'path', d: 'M 92,62 L 92,82 L 108,82 L 108,62 Z' },
  {
    id: 'shoulders', label: 'Shoulders', type: 'path',
    d: 'M 92,82 C 76,84 60,92 50,104 C 46,114 50,124 60,128 C 70,124 80,114 88,100 C 90,92 92,86 92,82 Z M 108,82 C 124,84 140,92 150,104 C 154,114 150,124 140,128 C 130,124 120,114 112,100 C 110,92 108,86 108,82 Z',
  },
  {
    id: 'arms', label: 'Arms', type: 'path',
    d: 'M 50,104 C 42,124 38,150 36,180 C 36,206 40,224 44,238 L 58,238 C 56,222 56,204 58,182 C 60,154 64,134 70,118 C 64,112 56,108 50,104 Z M 150,104 C 158,124 162,150 164,180 C 164,206 160,224 156,238 L 142,238 C 144,222 144,204 142,182 C 140,154 136,134 130,118 C 136,112 144,108 150,104 Z',
  },
  {
    id: 'hands', label: 'Hands', type: 'path',
    d: 'M 36,238 C 30,246 28,256 32,266 C 38,272 48,272 54,266 C 58,258 58,248 56,240 Z M 164,238 C 170,246 172,256 168,266 C 162,272 152,272 146,266 C 142,258 142,248 144,240 Z',
  },
  {
    id: 'back', label: 'Back', type: 'path',
    d: 'M 70,108 C 60,138 58,180 60,222 L 140,222 C 142,180 140,138 130,108 C 122,98 110,94 100,94 C 90,94 78,98 70,108 Z',
  },
  {
    id: 'hips', label: 'Hips', type: 'path',
    d: 'M 60,222 C 54,234 52,250 56,266 C 68,272 84,274 100,274 C 116,274 132,272 144,266 C 148,250 146,234 140,222 Z',
  },
  {
    id: 'legs', label: 'Legs', type: 'path',
    d: 'M 56,274 C 50,308 50,344 52,378 C 52,408 54,428 56,442 C 64,448 78,448 86,442 C 90,432 92,418 92,400 C 92,372 90,340 88,310 C 86,290 84,278 82,274 Z M 144,274 C 116,278 114,290 112,310 C 110,340 108,372 108,400 C 108,418 110,432 114,442 C 122,448 136,448 144,442 C 146,428 148,408 148,378 C 150,344 150,308 144,274 Z',
  },
  {
    id: 'knees', label: 'Knees', type: 'path',
    d: 'M 58,360 C 56,374 56,386 60,394 C 70,398 82,398 88,392 C 90,380 90,366 88,358 C 78,354 64,356 58,360 Z M 112,358 C 110,366 110,380 112,392 C 118,398 130,398 140,394 C 144,386 144,374 142,360 C 136,356 122,354 112,358 Z',
  },
  {
    id: 'feet', label: 'Feet', type: 'path',
    d: 'M 56,442 C 46,444 38,450 36,458 C 38,464 48,466 62,466 C 78,466 90,462 92,454 C 92,446 86,440 80,440 C 70,438 62,440 56,442 Z M 144,442 C 138,440 130,438 120,440 C 114,440 108,446 108,454 C 110,462 122,466 138,466 C 152,466 162,464 164,458 C 162,450 154,444 144,442 Z',
  },
]

function RegionShape({ region, isSelected }) {
  const fill    = isSelected ? '#C8654A' : '#1A1410'
  const stroke  = isSelected ? '#1A1410' : '#1A1410'
  const opacity = isSelected ? 0.45 : 0

  const sharedProps = {
    'data-region': region.id,
    className: 'cursor-pointer transition-all duration-300 hover:opacity-30',
    fill, stroke, strokeWidth: isSelected ? 1.5 : 0, opacity,
  }
  if (region.type === 'ellipse') return <ellipse {...sharedProps} {...region.attrs} />
  if (region.type === 'rect')    return <rect    {...sharedProps} {...region.attrs} />
  if (region.type === 'path')    return <path    {...sharedProps} d={region.d} />
  return null
}

function BodySilhouette({ view }) {
  // Clean drawing — flat skin tone + crisp dark outline (no gradient shading)
  const skin    = '#f7d3b6'
  const outline = '#7a4a2c'
  const hair    = '#5a3a22'
  const line    = '#a06846'

  return (
    <g fill={skin} stroke={outline} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      {/* ── Hair (back layer) ── */}
      {view === 'front' ? (
        <path
          d="M 78,18 C 78,8 88,4 100,4 C 112,4 122,8 122,18 C 124,22 124,28 122,34 C 120,30 116,28 110,28 C 106,18 94,18 90,28 C 84,28 80,30 78,34 C 76,28 76,22 78,18 Z"
          fill={hair} stroke={hair} strokeWidth="0.5"
        />
      ) : (
        <path
          d="M 76,16 C 76,6 86,2 100,2 C 114,2 124,6 124,16 C 126,28 124,44 122,56 C 118,60 108,62 100,62 C 92,62 82,60 78,56 C 76,44 74,28 76,16 Z"
          fill={hair} stroke={hair} strokeWidth="0.5"
        />
      )}

      {/* ── Head ── */}
      <ellipse cx="100" cy="36" rx="22" ry="26" />

      {/* ── Neck ── */}
      <path d="M 92,58 L 92,82 L 108,82 L 108,58" fill={skin} />

      {/* ── Torso ── */}
      <path
        d="M 92,82
           C 76,84 60,92 50,104
           C 46,116 48,128 52,138
           C 56,160 58,182 56,206
           C 54,228 54,250 60,268
           C 70,276 84,278 100,278
           C 116,278 130,276 140,268
           C 146,250 146,228 144,206
           C 142,182 144,160 148,138
           C 152,128 154,116 150,104
           C 140,92 124,84 108,82
           L 108,82 L 92,82 Z"
      />

      {/* ── Left arm ── */}
      <path
        d="M 50,108
           C 42,128 38,154 38,182
           C 38,204 40,224 44,238
           L 58,238
           C 58,222 58,204 60,184
           C 62,156 66,136 72,120
           C 64,114 56,110 50,108 Z"
      />
      {/* ── Right arm ── */}
      <path
        d="M 150,108
           C 158,128 162,154 162,182
           C 162,204 160,224 156,238
           L 142,238
           C 142,222 142,204 140,184
           C 138,156 134,136 128,120
           C 136,114 144,110 150,108 Z"
      />

      {/* ── Left hand ── */}
      <path
        d="M 38,238
           C 32,246 30,256 34,266
           C 40,272 50,272 56,266
           C 58,258 58,250 56,242 Z"
      />
      {/* ── Right hand ── */}
      <path
        d="M 162,238
           C 168,246 170,256 166,266
           C 160,272 150,272 144,266
           C 142,258 142,250 144,242 Z"
      />

      {/* ── Left leg ── */}
      <path
        d="M 60,272
           C 54,304 52,338 54,374
           C 54,406 56,428 58,442
           C 66,448 80,448 86,442
           C 90,430 92,414 92,396
           C 92,368 90,338 88,310
           C 86,290 84,278 82,272 Z"
      />
      {/* ── Right leg ── */}
      <path
        d="M 140,272
           C 116,276 114,290 112,310
           C 110,338 108,368 108,396
           C 108,414 110,430 114,442
           C 120,448 134,448 142,442
           C 144,428 146,406 146,374
           C 148,338 146,304 140,272 Z"
      />

      {/* ── Left foot ── */}
      <path
        d="M 58,442
           C 46,444 38,450 36,458
           C 38,464 48,466 62,466
           C 78,466 90,462 92,454
           C 92,446 86,440 80,440
           C 70,438 62,440 58,442 Z"
      />
      {/* ── Right foot ── */}
      <path
        d="M 142,442
           C 138,440 130,438 120,440
           C 114,440 108,446 108,454
           C 110,462 122,466 138,466
           C 152,466 162,464 164,458
           C 162,450 154,444 142,442 Z"
      />

      {/* ══════════ FRONT-VIEW DETAILS ══════════ */}
      {view === 'front' ? (
        <g fill="none" stroke={line} strokeWidth="1.1">
          {/* Eyes */}
          <ellipse cx="91"  cy="34" rx="2.5" ry="1.6" fill={outline} stroke="none" />
          <ellipse cx="109" cy="34" rx="2.5" ry="1.6" fill={outline} stroke="none" />
          {/* Eyebrows */}
          <path d="M 86,29 C 88,28 92,28 95,29" />
          <path d="M 105,29 C 108,28 112,28 114,29" />
          {/* Nose */}
          <path d="M 100,38 C 98,42 97,46 99,47 C 100,47 101,47 102,47 C 103,46 102,42 100,38" strokeWidth="0.9" />
          {/* Mouth */}
          <path d="M 94,52 C 96,54 100,54 100,54 C 100,54 104,54 106,52" strokeWidth="1.2" />
          {/* Ear hints */}
          <path d="M 78,34 C 76,36 76,40 78,42" />
          <path d="M 122,34 C 124,36 124,40 122,42" />

          {/* Collarbone */}
          <path d="M 92,86 C 84,88 76,92 66,98" strokeWidth="0.9" opacity="0.6" />
          <path d="M 108,86 C 116,88 124,92 134,98" strokeWidth="0.9" opacity="0.6" />
          {/* Subtle chest centre line */}
          <line x1="100" y1="100" x2="100" y2="160" strokeWidth="0.7" opacity="0.35" />
          {/* Belly button */}
          <circle cx="100" cy="200" r="1.8" strokeWidth="0.9" opacity="0.5" />
          {/* Subtle waist curves */}
          <path d="M 62,170 C 60,184 60,196 62,206" strokeWidth="0.7" opacity="0.3" />
          <path d="M 138,170 C 140,184 140,196 138,206" strokeWidth="0.7" opacity="0.3" />
          {/* Knee hints */}
          <path d="M 64,378 C 72,374 84,374 88,378" strokeWidth="0.8" opacity="0.4" />
          <path d="M 112,378 C 116,374 128,374 136,378" strokeWidth="0.8" opacity="0.4" />
          {/* Toe lines */}
          <line x1="48" y1="458" x2="48" y2="464" strokeWidth="0.6" opacity="0.5" />
          <line x1="58" y1="460" x2="58" y2="465" strokeWidth="0.6" opacity="0.5" />
          <line x1="68" y1="461" x2="68" y2="465" strokeWidth="0.6" opacity="0.5" />
          <line x1="78" y1="460" x2="78" y2="464" strokeWidth="0.6" opacity="0.5" />
          <line x1="122" y1="460" x2="122" y2="464" strokeWidth="0.6" opacity="0.5" />
          <line x1="132" y1="461" x2="132" y2="465" strokeWidth="0.6" opacity="0.5" />
          <line x1="142" y1="460" x2="142" y2="465" strokeWidth="0.6" opacity="0.5" />
          <line x1="152" y1="458" x2="152" y2="464" strokeWidth="0.6" opacity="0.5" />
        </g>
      ) : (
        <g fill="none" stroke={line} strokeWidth="1.1">
          {/* Subtle spine line */}
          <line x1="100" y1="84" x2="100" y2="260" strokeWidth="0.9" opacity="0.4" strokeDasharray="3,3" />
          {/* Shoulder blade hints */}
          <path d="M 76,108 C 70,124 70,142 76,154" strokeWidth="0.8" opacity="0.4" />
          <path d="M 124,108 C 130,124 130,142 124,154" strokeWidth="0.8" opacity="0.4" />
          {/* Lower back dimples */}
          <circle cx="92"  cy="246" r="1.6" strokeWidth="0.8" opacity="0.45" />
          <circle cx="108" cy="246" r="1.6" strokeWidth="0.8" opacity="0.45" />
          {/* Knee crease */}
          <path d="M 60,380 C 70,378 82,378 88,380" strokeWidth="0.8" opacity="0.4" />
          <path d="M 112,380 C 118,378 130,378 140,380" strokeWidth="0.8" opacity="0.4" />
          {/* Calf hints */}
          <path d="M 68,400 C 64,416 66,430 70,440" strokeWidth="0.7" opacity="0.35" />
          <path d="M 132,400 C 136,416 134,430 130,440" strokeWidth="0.7" opacity="0.35" />
        </g>
      )}
    </g>
  )
}

export default function BodyMap({ view, selectedRegion, onRegionClick }) {
  const regions = view === 'front' ? FRONT_REGIONS : BACK_REGIONS

  function handleClick(e) {
    const el = e.target.closest('[data-region]')
    if (el) onRegionClick(el.dataset.region)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox="0 0 200 470"
        className="w-full max-w-[220px] sm:max-w-[260px] drop-shadow-sm"
        onClick={handleClick}
        style={{ cursor: 'default' }}
        role="img"
        aria-label="Interactive body map — tap a body area to learn more"
      >
        <BodySilhouette view={view} />

        {regions.map((region) => (
          <RegionShape
            key={region.id}
            region={region}
            isSelected={selectedRegion === region.id}
          />
        ))}

        {regions.map((region) => {
          if (!selectedRegion || region.id !== selectedRegion) return null
          const cx = region.type === 'ellipse' ? region.attrs.cx : 100
          const cy = region.type === 'ellipse' ? region.attrs.cy : null
          if (!cy) return null
          return (
            <text
              key={`label-${region.id}`}
              x={cx} y={cy + 4}
              textAnchor="middle"
              fontSize="7"
              fill="#9d174d"
              className="pointer-events-none select-none font-semibold"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {region.label}
            </text>
          )
        })}
      </svg>

      <p className="text-xs text-neutral-400 text-center max-w-[220px]">
        Tap any highlighted area to explore wellness tips
      </p>
    </div>
  )
}
