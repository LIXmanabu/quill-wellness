// ─── Plan blueprints ──────────────────────────────────────────────────────
// One starter blueprint per Community category. Each carries the practical
// "craft" of that category — the order things go in, and the one tip people
// most often miss (e.g. a hydrating mask/primer layer before makeup). Used to
// draft a guided plan; the user edits freely from there.
//
// Keyed by the same category `value`s as src/data/communityCategories.js.

export const BLUEPRINTS = {
  skincare_routine: {
    blurb: 'Thinnest to thickest, SPF on top',
    tip: 'Order matters — apply thinnest to thickest, and SPF every morning out-performs every other step.',
    steps: [
      'Gentle cleanser with lukewarm water — no scrubbing or tugging',
      'Hydrating toner or essence, pressed into damp skin',
      'Treatment serum — vitamin C in the morning, retinol or niacinamide at night',
      'Eye cream, patted in with your ring finger',
      'Moisturiser to seal everything in',
      'Morning only: SPF 30+ as the very last step',
    ],
    products: ['Gentle cleanser', 'Hydrating serum', 'Moisturiser', 'SPF 30+'],
  },

  beauty_plan: {
    blurb: 'A full face, prepped to last',
    tip: 'Skin prep is the secret to makeup that lasts — lay down a hydrating mask or primer layer before foundation so it sits smoothly instead of sinking into lines.',
    steps: [
      'Start on clean, moisturised skin — let SPF/moisturiser absorb for 5 minutes',
      'Lay down a hydrating mask or primer as a base layer',
      'Colour-correct and conceal only where you need it',
      'Foundation or tinted base — thin layers, buffed in',
      'Cream blush and a little bronzer for warmth',
      'Set just the T-zone with a light powder (leave the rest dewy)',
      'Brows, mascara, lip — lock it in with a setting spray',
    ],
    products: ['Hydrating primer or mask', 'Concealer', 'Foundation or tinted base', 'Setting spray'],
  },

  workout_plan: {
    blurb: 'Full-body, three times a week',
    tip: 'Consistency beats intensity — three short full-body sessions a week with a little more each time beats one heroic workout.',
    steps: [
      'Warm up 5 minutes — dynamic moves to raise your heart rate',
      'Squats — 3 sets of 8–12',
      'Push-ups (knees down is fine) — 3 sets to near-failure',
      'Hinge or row — 3 sets of 8–12',
      'Core finisher — plank + dead bug, 3 rounds',
      'Cool-down stretch, 5 minutes',
    ],
    products: ['A mat', 'Dumbbells or a resistance band', 'Water bottle'],
  },

  hair_care: {
    blurb: 'Wash less, condition more',
    tip: 'Most hair thrives on 2–3 washes a week and a weekly deep mask — over-washing strips it. Always heat-protect before hot tools.',
    steps: [
      'Brush through before washing to loosen tangles',
      'Shampoo the scalp only — not the lengths',
      'Condition mid-lengths to ends, comb through, leave 2–3 minutes',
      'Once a week: swap conditioner for a deep mask',
      'Rinse cool to seal the cuticle and add shine',
      'Heat protectant before any hot tools',
    ],
    products: ['Sulphate-free shampoo', 'Conditioner', 'Weekly hair mask', 'Heat protectant'],
  },

  nutrition: {
    blurb: 'Protein + a plant, prepped ahead',
    tip: 'Anchor every meal with protein and a plant. Prep two components ahead — a protein and a grain — and the week cooks itself.',
    steps: [
      'Pick one protein for the week (chicken, tofu, eggs, beans)',
      'Batch-cook a grain and roast a tray of vegetables',
      'Build each plate: protein + plants + a smart carb + healthy fat',
      'Pre-portion 3–4 lunches into containers',
      'Water before coffee; a 2-minute walk after meals',
    ],
    products: ['Meal-prep containers', 'A protein source', 'Mixed vegetables', 'A whole grain'],
  },

  wellness: {
    blurb: 'Regulate, don’t just relax',
    tip: 'Calm the nervous system first — 10 minutes of morning light and slow breathing do more than any app.',
    steps: [
      '10 minutes of morning light, no phone',
      'Box breathing — 4 in, 4 hold, 4 out, 4 hold, four rounds',
      'Write one small thing to focus on today',
      'A short walk or stretch in the afternoon',
      'Screens off an hour before bed, lights low',
    ],
    products: ['A journal', 'A water bottle', 'Comfortable shoes'],
  },

  transformation: {
    blurb: 'One habit at a time, tracked',
    tip: 'Measure the start honestly, then change one thing at a time. Weekly photos and small habits beat weighing yourself daily.',
    steps: [
      'Take a “day one” photo and note where you are now',
      'Pick ONE keystone habit to start (movement, sleep, or food)',
      'Set a tiny daily minimum you can’t fail',
      'Check in weekly — a photo and one note, not the scale every day',
      'Add the next habit only once the first one sticks',
    ],
    products: ['A way to take progress photos', 'A notebook or app to track'],
  },

  morning_routine: {
    blurb: 'Win the first hour',
    tip: 'Light, water, and movement in the first hour set your energy for the day and your sleep for the night.',
    steps: [
      'Water before coffee',
      '10 minutes of daylight, ideally outside',
      '5 minutes of movement — stretch, walk, or squats',
      'A protein-forward breakfast',
      'Set one intention for the day',
    ],
    products: ['A glass for water', 'Comfortable shoes'],
  },

  evening_routine: {
    blurb: 'Tomorrow starts tonight',
    tip: 'Your morning starts the night before — dim, unplug, and let your body downshift into sleep.',
    steps: [
      'Stop eating about 2 hours before bed',
      'Dim the lights at 9pm; screens off an hour before sleep',
      'A warm shower, then a cool room',
      'Skincare: cleanse and moisturise',
      '5-minute wind-down — read, stretch, or breathe',
    ],
    products: ['Night moisturiser', 'A book', 'Blackout curtains or an eye mask'],
  },
}

export function getBlueprint(categoryValue) {
  return BLUEPRINTS[categoryValue] || null
}
