// ─────────────────────────────────────────────────────────────────────────
//  Today hub — "something for you" activities.
//
//  These are deliberately RESTORATIVE / EXPRESSIVE, never muscle-building.
//  The daily check-in (energy × how-today-feels, after the Mood Meter model)
//  maps to one of three kinds: a slow stretch, a skin ritual, or a little
//  makeup moment. Steps are self-contained so the card is useful on its own.
// ─────────────────────────────────────────────────────────────────────────
import { skincareData } from './skincareData.js'

// ── Gentle stretch / mobility flows (calming, not strength) ──
export const stretchFlows = [
  {
    id: 'unwind',
    title: 'Slow Unwind',
    icon: '🧘‍♀️',
    duration: '6 min',
    blurb: 'A few grounding stretches to let the day fall off your shoulders.',
    steps: [
      'Neck rolls — 5 slow circles each way, jaw soft',
      'Seated cat–cow — round and arch the spine, 8 breaths',
      'Cross-body shoulder stretch — 30s each side',
      'Forward fold — let your head hang heavy, knees soft, 5 breaths',
      "Child's pose — one quiet minute, breathe into your back",
    ],
  },
  {
    id: 'reset',
    title: 'Desk Reset',
    icon: '🌀',
    duration: '4 min',
    blurb: 'Undo a day of sitting — open the chest, hips, and wrists.',
    steps: [
      'Seated spinal twist — 30s each side, grow tall first',
      'Chest opener — clasp hands behind back, lift gently, 5 breaths',
      'Figure-four hip stretch — ankle over knee, 30s each side',
      'Wrist circles + finger spreads — 20s each way',
      'Side body reach — one arm overhead, lean, 4 breaths each side',
    ],
  },
  {
    id: 'open',
    title: 'Morning Open',
    icon: '🌅',
    duration: '5 min',
    blurb: 'A soft wake-up for the whole body — no intensity, just space.',
    steps: [
      'Full-body reach + yawn — stretch tall, 3 big breaths',
      'Standing forward fold — sway side to side, knees soft',
      'Low lunge — sink the hips, 4 breaths each side',
      'Gentle backbend — hands on low back, open the front',
      'Shoulder rolls — 8 back, 8 forward, slow',
    ],
  },
]

// ── Specific, low-pressure makeup moments (expressive, optional, fun).
//    Steps name real products + technique so they're useful for beginners. ──
export const makeupLooks = [
  {
    id: 'fresh',
    title: 'Five-Minute Fresh Face',
    icon: '🤍',
    duration: '5 min',
    blurb: 'The everyday no-makeup makeup — you, a little more awake.',
    steps: [
      'Press a pea-sized amount of tinted moisturiser or skin tint into skin with clean fingers — start at the centre of the face and blend outward so it fades into the hairline and jaw',
      'Spot-conceal only where you need it (inner corners under the eyes, any blemish), then pat — never rub — to blend the edges',
      'Tap cream blush on the apples of your cheeks (smile to find them) and blend up toward the temple with two fingers — warmth, not a stripe',
      'Brush brow hairs straight up with a clear or tinted gel, then press flat at the tails to set',
      'Wiggle one coat of mascara at the roots, then pull straight up through the tips',
      'Smooth on a tinted lip balm and blot once with a fingertip for soft, lived-in colour',
    ],
  },
  {
    id: 'glow',
    title: 'Soft Glow',
    icon: '✨',
    duration: '6 min',
    blurb: 'Lit-from-within, for when you feel like a little shine.',
    steps: [
      'Moisturise and wait 2–3 minutes so it sinks in and nothing slides',
      'Tap a liquid or cream highlighter onto the tops of the cheekbones, down the bridge of the nose, and on the cupid\'s bow with a fingertip',
      'Curl lashes — squeeze gently at the base, the middle, then the tips — before one coat of mascara',
      'Sweep a warm champagne cream shadow over the lid with your finger and blend the edge up into the crease',
      'Dab a clear or sheer-pink gloss in the centre of the lips and press them together so it spreads outward',
      'Skip powder entirely — the glow is the whole point',
    ],
  },
  {
    id: 'one-feature',
    title: 'One-Feature Day',
    icon: '💋',
    duration: '4 min',
    blurb: 'Pick a single thing and have fun with it — nothing else needed.',
    steps: [
      'Even skin only where you want to — spot-conceal redness or a blemish and leave the rest bare',
      'Choose ONE feature to play with: a bold lip, a wash of liner, or a strong flush of blush',
      'If lips: line the natural edge and fill with a creamy bullet, then blot once so colour stays put',
      'If eyes: press a pencil along the upper lash base (tightline) and smudge slightly — softer and easier than a wing',
      'If cheeks: build cream blush in two thin layers until it reads from across the room',
      'Brush brows up to frame whatever you chose — and stop there',
    ],
  },
  {
    id: 'polished',
    title: 'Pulled Together',
    icon: '🌟',
    duration: '7 min',
    blurb: 'Ten extra percent, for a day that asks for it.',
    steps: [
      'Tinted moisturiser all over, then concealer in a small triangle under the eyes and blended out with a damp sponge',
      'Set just the centre of the face and under-eyes with a light dusting of powder — leave the perimeter dewy',
      'Fill brows with short, hair-like strokes only in the sparse spots, then brush through to soften',
      'A neutral matte shadow buffed into the crease for quiet depth; curl lashes and add two coats of mascara',
      'Cream blush on the apples, then a touch of bronzer along the cheekbone and temple for warmth',
      'A satin "your-lips-but-better" lipstick, blotted so it lasts through coffee',
    ],
  },
  {
    id: 'colour',
    title: 'A Little Colour',
    icon: '🧡',
    duration: '6 min',
    blurb: 'One unexpected shade, kept completely easy.',
    steps: [
      'Pick a single warm shade you\'re drawn to — terracotta, soft copper, or dusty rose',
      'With a fingertip, press it onto the centre of the lid, then blend the edges with a clean finger so there are no hard lines',
      'Smudge a tiny bit of the same shade under the lower lash line for a soft halo',
      'One or two coats of mascara on the top lashes only',
      'Keep skin fresh and lips balmy so the colour stays the whole story',
    ],
  },
]

// ── Map a check-in (energy × feeling) to an activity kind + an intro line.
//    Designed so all three kinds appear across the 3×3 grid. ──
const MATRIX = {
  'low-heavy':    { kind: 'stretch',  intro: "Low and heavy today. No pushing — a few slow stretches to soften things." },
  'low-okay':     { kind: 'skincare', intro: "Quiet energy. A slow skin ritual is exactly the right size for now." },
  'low-bright':   { kind: 'skincare', intro: "Calm and content — savour it with an unhurried skin ritual." },
  'steady-heavy': { kind: 'stretch',  intro: "Steady, but carrying something. Let's move it through with gentle stretching." },
  'steady-okay':  { kind: 'stretch',  intro: "A steady middle. Some easy stretching will keep you right here." },
  'steady-bright':{ kind: 'makeup',   intro: "Steady and bright — five playful minutes of makeup, just because." },
  'high-heavy':   { kind: 'stretch',  intro: "Lots of energy, but it's prickly. Let's discharge it with stretching, not bottle it up." },
  'high-okay':    { kind: 'makeup',   intro: "Good energy — channel a little of it into a makeup moment." },
  'high-bright':  { kind: 'makeup',   intro: "Bright and buzzing. This is a play day; a look to match." },
}

// Normalise a skincare routine into the same shape as stretch/makeup.
function skincareActivity(hour) {
  const wantId = hour < 12 ? 'morning' : 'evening'
  const r = skincareData.find((x) => x.id === wantId) || skincareData[0]
  return {
    id: r.id,
    title: r.title,
    icon: r.icon,
    duration: r.tag || 'Daily',
    blurb: r.description,
    steps: r.steps.map((s) => s.name),
    chapter: 'skincare',
    chapterLabel: 'Open the skin ritual',
  }
}

export function pickActivity({ energy, feeling, hour = new Date().getHours(), seed = 0 }) {
  const map = MATRIX[`${energy}-${feeling}`] || MATRIX['steady-okay']
  let activity
  if (map.kind === 'skincare') {
    activity = skincareActivity(hour)
  } else if (map.kind === 'makeup') {
    activity = { ...makeupLooks[seed % makeupLooks.length], kind: 'makeup' }
  } else {
    activity = { ...stretchFlows[seed % stretchFlows.length], kind: 'stretch' }
  }
  return { ...activity, kind: map.kind, intro: map.intro }
}

// ── Evening wind-down — a curated, evidence-informed set written for the
//    Today hub (warmer and more specific than the generic sleep tips). One
//    is shown per day, rotating. Each reads well as a single line. ──
export const windDownTips = [
  'Dim the overhead lights an hour before bed and switch to one warm lamp. Bright light reads as daytime and holds your melatonin back.',
  'Take a warm shower about 90 minutes before bed. The drop in body temperature afterwards is one of the strongest natural sleep signals there is.',
  "Write tomorrow's three worries on paper, then close the notebook. Offloading them stops your mind rehearsing them at 2am.",
  'Try 4-7-8 breathing — inhale for 4, hold for 7, exhale slowly for 8. Three rounds is usually enough to slow your heart rate.',
  "Charge your phone in another room tonight. If it's your alarm, a cheap clock fixes that — and removes the midnight scroll.",
  'Make the room properly dark and a touch cool, around 18°C. Cooler, darker rooms reliably mean deeper sleep.',
  'Call it on caffeine after about 2pm. It half-lives at ~5–6 hours, so an afternoon coffee is still half-awake in you at bedtime.',
  'Keep your wake-up time steady, even tomorrow. A consistent morning anchors your whole body clock more than any bedtime rule.',
  'Read a few pages of something gentle on paper — fiction, not the news. A small screen-free ritual tells your body the day is closing.',
  'Make a mug of something warm and caffeine-free — chamomile, rooibos, or just hot water and lemon. The ritual matters as much as the drink.',
  'Do a slow body scan from toes to scalp, softening each part as you pass it. It pulls your attention out of your head and into rest.',
  'Lay out tomorrow morning tonight — clothes, bag, water. Morning-you gets ten calmer minutes and tonight-you closes one more open loop.',
]

// Labels for the check-in buttons (kept here so the page stays declarative).
export const ENERGY_OPTIONS = [
  { id: 'low',    label: 'Low',    desc: 'running on empty' },
  { id: 'steady', label: 'Steady', desc: 'somewhere in the middle' },
  { id: 'high',   label: 'Buzzing',desc: 'plenty to spare' },
]
export const FEELING_OPTIONS = [
  { id: 'heavy',  label: 'Heavy',  desc: 'a lot to carry' },
  { id: 'okay',   label: 'Okay',   desc: 'just fine, honestly' },
  { id: 'bright', label: 'Bright', desc: 'light and good' },
]
