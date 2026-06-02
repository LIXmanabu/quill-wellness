// Personalized routines + advice generated from onboarding quiz answers.
// Profile shape: { name, skinType, goal, timePerDay, favorites }

/* ─────────────────────────────────────────────────────────────────
 * MORNING + EVENING ROUTINES (per goal × time bucket)
 * Time buckets: '5' (quick), '15' (real ritual), '30' (deep)
 * ────────────────────────────────────────────────────────────── */

const routines = {
  glow: {
    label: 'Glow & confidence',
    accent: 'clay',
    quote: 'Skin first, makeup second.',
    morning: {
      5: ['Splash face with lukewarm water', 'Moisturizer (3 pumps)', 'SPF 30+ — never skip'],
      15: ['Gentle cleanser', 'Hydrating toner or essence', 'Vitamin C serum', 'Moisturizer', 'SPF 30+'],
      30: ['Gentle cleanser', 'Hydrating toner', 'Vitamin C serum', 'Eye cream', 'Moisturizer', 'SPF 50+', 'Gua sha — 2 min upward strokes'],
    },
    evening: {
      5: ['Cleanse (double if you wear makeup)', 'Night moisturizer'],
      15: ['Oil or balm cleanse', 'Gentle cleanser', 'Niacinamide or hyaluronic serum', 'Moisturizer'],
      30: ['Oil cleanse', 'Gentle cleanser', 'Exfoliating toner (2-3×/wk)', 'Serum (retinol or peptides)', 'Eye cream', 'Heavy moisturizer or sleeping mask', 'Lip balm'],
    },
  },
  fitness: {
    label: 'Move & feel strong',
    accent: 'sage',
    quote: 'Consistency beats intensity. Always.',
    morning: {
      5: ['Glass of water + pinch of salt', '20 squats', '10 push-ups (knees OK)', '30-sec plank'],
      15: ['Dynamic warm-up (4 min)', '3 rounds: 15 squats + 10 push-ups + 20 mountain climbers', 'Cool-down stretch'],
      30: ['Warm-up + mobility (5 min)', 'Strength block: 4 compound moves × 3 sets', 'Conditioning finisher (5 min)', 'Full-body stretch (10 min)'],
    },
    evening: {
      5: ['10 min walk after dinner', 'Foam roll calves + back'],
      15: ['20 min easy zone-2 cardio (brisk walk or bike)', 'Hip openers + spinal twist'],
      30: ['30 min mobility + yoga flow', 'Hydration check + protein within 1h of training', 'Magnesium glycinate before bed (if training hard)'],
    },
  },
  calm: {
    label: 'Stress less, sleep better',
    accent: 'sage',
    quote: 'You cannot pour from an empty cup.',
    morning: {
      5: ['4-7-8 breathing × 4 rounds', '10 min outside in natural light'],
      15: ['Box breathing × 4 rounds', '10 min sunlight (no phone)', '3 things you\'re grateful for — on paper'],
      30: ['Box breathing × 6 rounds', '10 min outside walk (no podcast)', 'Journal: 3 wins, 1 worry, 1 intention', '5 min gentle stretch'],
    },
    evening: {
      5: ['Phone in another room by 9 pm', 'Box breathing in bed'],
      15: ['Dim lights at 9 pm', 'Chamomile tea + book (no screens)', '4-7-8 breathing as you settle'],
      30: ['Screens off 1h pre-bed', 'Warm shower → cool room → socks on', 'Yoga nidra or guided meditation (10 min)', 'Journal: brain dump anything circling'],
    },
  },
  body: {
    label: 'Understand my body',
    accent: 'gold',
    quote: 'Pay attention. Your body is talking.',
    morning: {
      5: ['Check urine colour (pale straw = good)', 'Body scan: where am I tight?', 'Glass of water + protein at breakfast'],
      15: ['Body scan + posture reset', 'Mobility flow (5 min)', '2-min walk after breakfast', 'Note energy 1-10'],
      30: ['Wake at same time daily', 'Full body scan + journaling', 'Mobility (10 min)', 'Track: sleep hours, mood, energy, hydration'],
    },
    evening: {
      5: ['Quick check-in: tension, hunger, mood'],
      15: ['Reflect on energy through the day', 'Stretch tight areas (5 min)', 'Same wind-down time daily'],
      30: ['Journal: what fuelled me, what drained me', 'Mobility for any niggles', 'Plan tomorrow\'s movement', 'Lights low + cool room'],
    },
  },
  eat: {
    label: 'Eat smarter',
    accent: 'sage',
    quote: 'Eat the rainbow. Mostly plants. Sit down.',
    morning: {
      5: ['Glass of water before coffee', '20g+ protein at breakfast (eggs, yogurt, tofu)'],
      15: ['Water first, then coffee', 'Protein + fibre breakfast (oats + berries + nuts)', 'Plan today\'s meals briefly'],
      30: ['Hydrate + electrolytes if you exercise', 'Slow breakfast: protein + complex carb + fruit', 'Log today\'s plan in the Quill diet tracker (Pro)', 'Prep lunch ahead'],
    },
    evening: {
      5: ['2-min walk after dinner', 'Stop eating 2h before bed'],
      15: ['Light dinner (protein + veg + olive oil)', 'Herbal tea instead of dessert', 'Walk after eating'],
      30: ['Mediterranean-style dinner', 'Log today\'s intake', 'Plan tomorrow\'s shopping/prep', 'Cup of chamomile to wind down'],
    },
  },
}

const skinAddons = {
  dry: ['Look for: hyaluronic acid, ceramides, squalane', 'Avoid: harsh foaming cleansers, alcohol-heavy toners'],
  oily: ['Look for: niacinamide, salicylic acid (BHA), gel cleansers', 'Avoid: heavy oils, occlusive butters'],
  combo: ['Multi-zone: BHA on T-zone, richer moisturizer on cheeks', 'Niacinamide works across both zones'],
  sensitive: ['Fragrance-free, short ingredient lists, no essential oils', 'Patch test everything for 48 h before face'],
  normal: ['You can experiment — introduce one active at a time', 'SPF is still the single best habit'],
  unsure: ['Start minimal: cleanser, moisturizer, SPF for 2 weeks', 'Note how your skin feels — then add one product'],
}

/* ─────────────────────────────────────────────────────────────────
 * ADVICE CARDS (3-4 cards per goal, customised by skinType when relevant)
 * ────────────────────────────────────────────────────────────── */

const adviceByGoal = {
  glow: [
    { title: 'SPF is non-negotiable', body: 'UVA is the single biggest cause of premature ageing. 30+ daily, cloudy or not, year-round. The difference at 40 will be obvious.' },
    { title: 'Less, but daily', body: 'A 3-step routine (cleanse, moisturize, SPF) done every day beats a 10-step routine done once a week. Build the habit first; layer later.' },
    { title: 'Sleep is skincare', body: 'Growth hormone — which repairs skin — peaks in deep sleep. Under 6 hours and no serum will outwork the damage.' },
    { title: 'Hydration shows', body: 'Skin reflects internal hydration within ~24 hours. Aim for pale-straw urine; your face will thank you.' },
  ],
  fitness: [
    { title: 'Progressive overload', body: 'Add 2.5kg or one rep every week. Linear progression is the most reliable engine for getting stronger — for years, not weeks.' },
    { title: 'Protein at every meal', body: '1.6–2.2 g per kg of bodyweight, spread over 4–5 meals. This is the threshold where muscle stops being limited by protein.' },
    { title: 'Recovery is training', body: 'Sleep 7-9h, eat enough, take rest days. Most plateaus are recovery problems, not training problems.' },
    { title: 'Walk every day', body: '8-10k daily steps under-rated for body composition. NEAT burns more weekly calories than most workouts.' },
  ],
  calm: [
    { title: 'Morning light wins', body: '10 min of outdoor light within 1h of waking sets your circadian rhythm. The single best lever for better sleep tonight.' },
    { title: 'Box breathing — anywhere', body: '4 in, 4 hold, 4 out, 4 hold. Repeat 4 times. Calms your nervous system inside 90 seconds, no app required.' },
    { title: 'Caffeine curfew', body: 'Half-life is 6 hours. No caffeine after 2pm if you want deep sleep. This is the easiest sleep upgrade most people skip.' },
    { title: 'Worry on paper', body: 'When the mind loops, dump it on a page for 5 minutes. Almost always reduces the felt load by half.' },
  ],
  body: [
    { title: 'Track three things', body: 'Sleep hours, energy 1-10, and one body sensation. Two weeks of data tells you more than any wearable summary.' },
    { title: 'Posture reset, every hour', body: 'Chin tucked, shoulders down and back, deep breath. Re-trains default posture over 4-6 weeks. Free.' },
    { title: 'Check your pee', body: 'Pale straw = hydrated. Dark yellow = drink more. Clear all day = back off the water. Your simplest biomarker.' },
    { title: 'Movement is information', body: 'Mobility limits and pain are signals, not problems. 5 min of daily mobility is more diagnostic than any imaging.' },
  ],
  eat: [
    { title: 'Protein anchors meals', body: '20-30g per meal — eggs, yogurt, tofu, chicken, fish, legumes. Stops cravings, supports muscle, blunts blood-sugar spikes.' },
    { title: 'Eat the rainbow', body: 'Aim for 30+ different plants per week. Fibre + polyphenol diversity drives gut health more than any single supplement.' },
    { title: 'Slow and seated', body: 'Sit down. Chew. No screens. The same calories digest differently when you actually taste them.' },
    { title: 'Water before coffee', body: 'You wake up dehydrated. Water first cuts headaches, false hunger, and the afternoon crash.' },
  ],
}

/* ─────────────────────────────────────────────────────────────────
 * COMPLEMENT — every goal has one practice that supports it most.
 * The complement routine is just the other goal's routine at the same
 * time bucket, framed as "what protects the work you're already doing".
 * ────────────────────────────────────────────────────────────── */

const complementMap = {
  glow: { goal: 'calm', why: 'Stress and poor sleep show up on your skin first. Calm is your hidden serum.' },
  fitness: { goal: 'calm', why: 'Most plateaus are recovery problems. Sleep and stress are training variables too.' },
  calm: { goal: 'fitness', why: 'Gentle movement releases anxiety faster than rest. Your body asks to be used.' },
  body: { goal: 'eat', why: 'Nutrition is body literacy. What you eat is the loudest signal you give yourself.' },
  eat: { goal: 'fitness', why: 'Movement is the other half of metabolism. Walking after meals beats any supplement.' },
}

/* ─────────────────────────────────────────────────────────────────
 * PROBLEM-FOCUSED TIPS — one routine-block per onboarding answer.
 * Used by MyQuill's "For each thing you told us" section.
 * ────────────────────────────────────────────────────────────── */

const skinTypeTips = {
  dry: {
    label: 'Dry skin',
    kicker: 'For your skin type',
    why: 'Tight, sometimes flaky. Lipids and water both run low.',
    steps: [
      'Cream or oil-based cleanser — never foaming or alcohol',
      'Apply hyaluronic acid serum to damp skin within 60 seconds',
      'Lock in moisture with a ceramide-rich cream',
      'Mineral SPF over chemical — gentler on a compromised barrier',
      'Run a humidifier at night, especially in winter',
    ],
  },
  oily: {
    label: 'Oily skin',
    kicker: 'For your skin type',
    why: 'Shiny T-zone, larger pores. Overactive sebum needs balance, not stripping.',
    steps: [
      'Gentle gel cleanser, morning and night — no harsh foam',
      'Niacinamide 5% serum — controls oil without irritation',
      'Lightweight, oil-free moisturizer (yes, you still need it)',
      'BHA (salicylic acid) toner 2-3× per week',
      'Blotting papers beat re-washing — don\'t strip more',
    ],
  },
  combo: {
    label: 'Combination skin',
    kicker: 'For your skin type',
    why: 'Oily T-zone, drier cheeks. Multi-zone routine wins.',
    steps: [
      'Mild gel cleanser, morning and night',
      'Niacinamide everywhere — works for both zones',
      'BHA only on T-zone (forehead, nose, chin)',
      'Richer moisturizer on cheeks, lighter on T-zone',
      'SPF 30+ — non-greasy, ideally fluid texture',
    ],
  },
  sensitive: {
    label: 'Sensitive skin',
    kicker: 'For your skin type',
    why: 'Reacts easily, prone to redness. Less is more — always.',
    steps: [
      'Cool water rinse in the morning — no cleanser if your skin behaves',
      'Fragrance-free, short ingredient lists — no essential oils',
      'Patch test new products behind the ear for 48 hours',
      'Mineral SPF (zinc oxide) — chemical filters can sting',
      'Skip retinol and acids unless prescribed; centella + panthenol calm flare-ups',
    ],
  },
  normal: {
    label: 'Normal skin',
    kicker: 'For your skin type',
    why: 'Balanced, rarely fussy. Keep the basics solid before experimenting.',
    steps: [
      'Gentle cleanser, morning and night',
      'A simple moisturizer — keep your barrier happy',
      'SPF 30+ every morning, year-round',
      'Add one active at a time (vitamin C is the safest start)',
      'Don\'t over-exfoliate just because you can',
    ],
  },
  unsure: {
    label: 'Still figuring it out',
    kicker: 'For your skin type',
    why: 'No data = no actives. Run a 2-week experiment first.',
    steps: [
      'Use only: gentle cleanser, plain moisturizer, SPF for 2 weeks',
      'Note: tight after washing? Dry. Shiny by noon? Oily.',
      'Redness or stinging from new products? Sensitive.',
      'Track for 14 days — then choose a routine from there',
      'Add nothing else until you have an answer',
    ],
  },
}

const goalTips = {
  glow: {
    label: 'Glow & confidence',
    kicker: 'For your goal',
    why: 'Skin reflects sleep, hydration, and consistency more than any product.',
    steps: [
      'SPF every single morning — the highest-ROI skincare habit',
      'Vitamin C serum in the AM for brightness',
      'Hydrate first thing: a glass of water before coffee',
      'Sleep 7-9 hours — growth hormone repairs skin overnight',
      'Eat omega-3 fish twice a week for skin lipids',
    ],
  },
  fitness: {
    label: 'Move & feel strong',
    kicker: 'For your goal',
    why: 'Consistency, progressive overload, and recovery — in that order.',
    steps: [
      '20 squats + 10 push-ups before your shower',
      'Protein-rich breakfast: 20-30g (eggs, yogurt, tofu)',
      'Walk between meetings — aim for 8-10k steps daily',
      'Strength train 3× a week, full-body, compound moves',
      'Sleep 7-9h — most plateaus are recovery problems',
    ],
  },
  calm: {
    label: 'Stress less, sleep better',
    kicker: 'For your goal',
    why: 'Nervous-system regulation, not just less to-do. Mornings set the tone.',
    steps: [
      '10 minutes of morning sunlight (no phone) — anchors circadian rhythm',
      'Box breathing × 4 rounds: 4 in, 4 hold, 4 out, 4 hold',
      'No caffeine after 2 pm — half-life is 6 hours',
      'One thing on paper for the day — beats a 10-item list',
      'Dim lights at 9 pm; phone out of the bedroom',
    ],
  },
  body: {
    label: 'Understand my body',
    kicker: 'For your goal',
    why: 'Your body is talking. Pay attention to the small signals daily.',
    steps: [
      'Morning body scan: where am I tight, hungry, tired?',
      'Check urine colour — pale straw = hydrated',
      'Posture reset every hour: chin tucked, shoulders down',
      '5 min mobility before screens — knees, hips, spine',
      'Track sleep + energy 1-10 for two weeks',
    ],
  },
  eat: {
    label: 'Eat smarter',
    kicker: 'For your goal',
    why: 'Protein anchors meals. Plants supply almost everything else.',
    steps: [
      'Water before coffee — you wake up dehydrated',
      'Protein + fibre breakfast (oats + berries + nuts, or eggs + greens)',
      'Aim for 30+ different plants per week',
      '2-minute walk after every meal — flattens blood sugar by 30%',
      'Stop eating 2 hours before bed for better sleep',
    ],
  },
}

const timeTips = {
  5: {
    label: '5 minutes a day',
    kicker: 'For your time',
    why: 'Tiny is better than nothing — and tiny, done daily, compounds.',
    steps: [
      'Pick one habit and chain it to brushing your teeth',
      'Done is better than done well — speed > perfection',
      'Track on a paper calendar — visible streaks motivate',
      'Skip a day? Restart the next. Two days is a pattern',
      'Add one more minute every two weeks',
    ],
  },
  15: {
    label: '15 minutes a day',
    kicker: 'For your time',
    why: 'The sweet spot. Long enough to matter, short enough to keep doing.',
    steps: [
      'Block the same 15 min daily — same time, same place',
      'Split: 5 min movement + 5 min mindset + 5 min skin or food',
      'Phone in another room while you ritual',
      'Track wins weekly — what stuck, what dropped',
      'Protect this slot like a meeting with yourself',
    ],
  },
  30: {
    label: '30+ minutes a day',
    kicker: 'For your time',
    why: 'You have space for a real ritual. Use it without burning out.',
    steps: [
      'Morning block (15 min) + evening block (15 min) beats one long session',
      'Rotate focus: skin Mon, movement Tue, mindset Wed, repeat',
      'Build in one full rest day a week — recovery is the work',
      'Journal weekly: what got easier, what got harder',
      'Variety > novelty — depth beats trying new things constantly',
    ],
  },
}

/* ─────────────────────────────────────────────────────────────────
 * RECOMMENDED PAGES (based on goal)
 * ────────────────────────────────────────────────────────────── */

const recommendedPages = {
  glow: [{ key: 'skincare', label: 'Skin care routines', why: 'tailored for your skin type' }, { key: 'tips', label: 'Glow tips', why: 'curated daily wisdom' }],
  fitness: [{ key: 'sport', label: 'Movement routines', why: 'strength + conditioning' }, { key: 'diet', label: 'Fuel for training', why: 'protein + carb timing' }],
  calm: [{ key: 'wellness', label: 'Wellness practices', why: 'breath, sleep, focus' }, { key: 'tips', label: 'Mindset tips', why: 'small daily shifts' }],
  body: [{ key: 'body', label: 'Body map', why: 'understand any area' }, { key: 'wellness', label: 'Wellness check-in', why: 'self-knowledge tools' }],
  eat: [{ key: 'diet', label: 'Diet protocols', why: 'six science-backed ways' }, { key: 'tips', label: 'Nutrition tips', why: 'small wins, big impact' }],
}

/* ─────────────────────────────────────────────────────────────────
 * PUBLIC API
 * ────────────────────────────────────────────────────────────── */

export function getRoutine(profile) {
  const goal = profile.goal || 'body'
  const time = profile.timePerDay || '15'
  const base = routines[goal] || routines.body
  const timeKey = base.morning[time] ? time : '15'

  let morning = [...base.morning[timeKey]]
  let evening = [...base.evening[timeKey]]

  // If it's a skincare-focused goal and we know skin type, append a tailored tip
  const addon = skinAddons[profile.skinType]
  const isSkinGoal = goal === 'glow' || goal === 'body'

  return {
    label: base.label,
    quote: base.quote,
    accent: base.accent,
    minutes: time,
    morning,
    evening,
    skinAddons: isSkinGoal && addon ? addon : null,
  }
}

export function getAdvice(profile) {
  const goal = profile.goal || 'body'
  return adviceByGoal[goal] || adviceByGoal.body
}

export function getRecommendations(profile) {
  const goal = profile.goal || 'body'
  return recommendedPages[goal] || recommendedPages.body
}

export function getProblemTips(profile) {
  // Returns one block per answered question — so the user sees how each
  // onboarding choice translates into specific morning-routine steps.
  const blocks = []
  if (profile.skinType && skinTypeTips[profile.skinType]) {
    blocks.push({ key: 'skin', ...skinTypeTips[profile.skinType] })
  }
  if (profile.goal && goalTips[profile.goal]) {
    blocks.push({ key: 'goal', ...goalTips[profile.goal] })
  }
  if (profile.timePerDay && timeTips[profile.timePerDay]) {
    blocks.push({ key: 'time', ...timeTips[profile.timePerDay] })
  }
  return blocks
}

export function getComplementaryRoutine(profile) {
  const goal = profile.goal || 'body'
  const pairing = complementMap[goal]
  if (!pairing) return null
  // Same time-bucket and skin-type, but routine shaped by the complement goal
  const complementRoutine = getRoutine({ ...profile, goal: pairing.goal })
  return {
    ...complementRoutine,
    why: pairing.why,
    sourceLabel: complementRoutine.label,
  }
}

export function getGoalLabel(profile) {
  const goal = profile.goal || 'body'
  return (routines[goal] || routines.body).label
}

export function isPersonalized(profile) {
  return !!(profile.goal || profile.skinType || profile.timePerDay)
}
