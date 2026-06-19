import { useState } from 'react'
import { usePro } from '../context/ProContext.jsx'
import SplitText from '../components/interactive/SplitText.jsx'
import Reveal from '../components/interactive/Reveal.jsx'
import Marquee from '../components/interactive/Marquee.jsx'
import SpotlightCard from '../components/interactive/SpotlightCard.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'
import DietTracker from '../components/DietTracker.jsx'
import TierBadge from '../components/TierBadge.jsx'

/* ─── Diets ─── */
const diets = [
  {
    id: 'fat-loss', icon: '01', title: 'Fat loss',
    summary: 'Sustainable calorie deficit with high protein to preserve muscle.',
    targets: ['~500 kcal/day deficit', '1.6–2.2 g protein / kg', '25–35 g fibre/day'],
    eat: [
      'Lean protein at every meal: chicken, fish, tofu, Greek yogurt, eggs, legumes',
      'High-volume veg (leafy greens, peppers, cucumber, tomatoes), fills you up cheaply',
      'Whole grains: oats, quinoa, brown rice, wholemeal pasta',
      'Fruit (especially berries) for fibre + micronutrients',
      'Healthy fats in moderation: olive oil, avocado, nuts (portion-controlled)',
    ],
    limit: [
      'Liquid calories, soda, juice, sugary coffees',
      'Ultra-processed snacks engineered for overeating',
      'Alcohol (empty calories + disrupts sleep + muscle recovery)',
    ],
    evidence: 'Meta-analyses (Aragon et al. 2017) show calorie deficit + adequate protein + resistance training is the gold standard for losing fat while preserving lean mass.',
  },
  {
    id: 'muscle', icon: '02', title: 'Muscle gain',
    summary: 'Slight calorie surplus, high protein, progressive resistance training.',
    targets: ['+200–400 kcal/day surplus', '1.6–2.2 g protein / kg', '4–6 g carbs / kg on training days'],
    eat: [
      'Protein spread over 4–5 meals (~0.4 g/kg per meal optimal)',
      'Complex carbs around training: rice, potatoes, pasta, oats',
      'Creatine monohydrate 3–5 g/day (strongest evidence of any legal supplement)',
      'Whole milk, eggs, fatty fish, calorie-dense without ultra-processing',
      'Pre-bed casein-rich food (cottage cheese, Greek yogurt) for overnight protein',
    ],
    limit: [
      'Excessive surplus, fat gain outpaces muscle past ~+500 kcal',
      'Skipping vegetables, micronutrients drive recovery',
      'Chronic under-sleep (< 7h), directly cuts muscle protein synthesis',
    ],
    evidence: 'Schoenfeld & Aragon (ISSN 2018): 1.6 g/kg protein is the threshold where benefits plateau; combined with progressive overload, this is the most reliable hypertrophy formula.',
  },
  {
    id: 'longevity', icon: '03', title: 'Longevity',
    summary: 'Mediterranean, the most studied diet on Earth. Lowest all-cause mortality.',
    targets: ['Mostly plants', 'Fish 2×/week', 'Extra-virgin olive oil as main fat'],
    eat: [
      'Vegetables, fruits, legumes, nuts, seeds, whole grains, daily',
      'Extra-virgin olive oil as primary cooking + dressing fat',
      'Fatty fish (salmon, sardines, mackerel) 2× weekly for omega-3',
      'Moderate dairy (yogurt, cheese), poultry, eggs',
      'Herbs and spices instead of salt; fermented foods occasionally',
    ],
    limit: [
      'Red and processed meat, keep occasional, not daily',
      'Added sugar, refined grains, ultra-processed foods',
      'Excess alcohol, recent evidence: no amount is "healthy"',
    ],
    evidence: 'PREDIMED trial (NEJM 2013/2018): ~30% reduction in cardiovascular events vs. low-fat diet. Multiple cohorts link Mediterranean adherence to longer lifespan.',
  },
  {
    id: 'performance', icon: '04', title: 'Performance',
    summary: 'Endurance training, carbs fuel hard sessions. Periodise around them.',
    targets: ['5–10 g carbs / kg on heavy days', '1.2–1.6 g protein / kg', 'Sodium + fluids matched to sweat loss'],
    eat: [
      'Carb-rich meals 2–4 h before training: oats, rice, pasta, banana, dates',
      'During long sessions (>60 min): 30–90 g carbs/hour (sports drink, gels, fruit)',
      'Post-workout: ~20–40 g protein + carbs within 1–2 h',
      'Beetroot juice, small but real ~1–2% endurance boost (nitrate)',
      'Caffeine 3–6 mg/kg ~45 min pre-event for proven performance lift',
    ],
    limit: [
      'High-fat meals immediately pre-training (slow gastric emptying)',
      'Trying new foods on race day, practice fueling in training',
      'Under-eating overall, RED-S is common in endurance athletes',
    ],
    evidence: 'IOC and ACSM position stands consistently support carb periodisation; Cochrane reviews confirm carb intake during exercise improves endurance.',
  },
  {
    id: 'heart', icon: '05', title: 'Heart health',
    summary: 'Lower LDL, blood pressure, and inflammation, extend healthspan.',
    targets: ['< 5–6 g salt/day', '> 25 g soluble fibre/day', 'Sat fat < 10% of calories'],
    eat: [
      'Soluble fibre: oats, beans, lentils, barley, apples, lowers LDL directly',
      'Fatty fish 2×/week (or 1–2 g EPA+DHA via algae oil if vegan)',
      'Nuts: ~30 g/day of mixed nuts (PREDIMED arm)',
      'Plant sterols (some fortified spreads/yogurts), modest LDL drop',
      'Potassium-rich foods: bananas, potatoes, beans, leafy greens',
    ],
    limit: [
      'Salt, especially from bread, processed meat, ready meals',
      'Trans fats, read labels for "partially hydrogenated"',
      'Processed meats (WHO Group 1 carcinogen for colorectal cancer)',
    ],
    evidence: 'DASH and Mediterranean diets both reduce blood pressure and cardiovascular events in randomised trials. Estruch et al. NEJM 2018 confirmed long-term benefit.',
  },
  {
    id: 'brain', icon: '06', title: 'Brain & focus',
    summary: 'Steady blood sugar, omega-3s, polyphenols, sharper, calmer mind.',
    targets: ['Stable glucose meals', 'Omega-3 EPA+DHA 250–500 mg/day', 'Hydration: ~30–35 ml/kg/day'],
    eat: [
      'Eggs (choline), fatty fish (DHA), walnuts (ALA omega-3)',
      'Berries, flavonoids linked to slower cognitive decline',
      'Dark leafy greens (folate, vitamin K), MIND diet staple',
      'Extra-virgin olive oil, polyphenols cross blood-brain barrier',
      'Protein + fibre at breakfast, prevents mid-morning crash',
    ],
    limit: [
      'High-glycaemic breakfasts alone (white toast, juice, sugary cereal)',
      'Chronic alcohol, clearly neurotoxic at high doses',
      'Sleep deprivation, no food fixes < 6 h of sleep',
    ],
    evidence: 'MIND diet (Morris 2015), slower cognitive decline equivalent to ~7.5 fewer years of brain ageing in adherers. Omega-3 RCTs show modest mood and cognition benefits.',
  },
]

/* ─── Ideal plate ─── */
const plateSlices = [
  { id: 'veg', label: 'Vegetables', percent: 35, color: '#5A6B5D', soft: '#D5DDD6', examples: 'Leafy greens, broccoli, peppers, carrots, tomatoes', tip: 'The more variety + colour, the better. Potatoes do not count.' },
  { id: 'fruit', label: 'Fruit', percent: 15, color: '#C8654A', soft: '#F5E1D8', examples: 'Berries, apple, banana, citrus, kiwi, grapes', tip: 'Whole fruit beats juice. Aim for two portions a day.' },
  { id: 'grains', label: 'Whole grains', percent: 25, color: '#B08A2E', soft: '#F5EBD0', examples: 'Oats, brown rice, quinoa, wholemeal bread or pasta', tip: 'Brown over white. Limit refined grains and sugar.' },
  { id: 'protein', label: 'Healthy protein', percent: 25, color: '#3D4A40', soft: '#EAEFEA', examples: 'Fish, chicken, eggs, tofu, beans, lentils, nuts', tip: 'Limit red meat. Avoid bacon, sausage, deli meats.' },
]

function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function slicePath(cx, cy, r, startDeg, endDeg) {
  const [x1, y1] = polar(cx, cy, r, startDeg)
  const [x2, y2] = polar(cx, cy, r, endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${cx},${cy} L ${x1.toFixed(2)},${y1.toFixed(2)} A ${r},${r} 0 ${largeArc} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`
}

function IdealPlate() {
  const cx = 160, cy = 160, r = 130
  let acc = 0
  const slices = plateSlices.map((s) => {
    const start = (acc / 100) * 360
    acc += s.percent
    const end = (acc / 100) * 360
    const mid = (start + end) / 2
    const [lx, ly] = polar(cx, cy, r * 0.62, mid)
    return { ...s, start, end, lx, ly }
  })

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="ideal-plate">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15">
          <span className="editorial-label">What&apos;s on your plate</span>
          <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
            Your ideal <span className="display-italic text-clay">plate.</span>
          </h2>
          <p className="text-sm text-ink-soft mt-3 max-w-2xl">
            A rule of thumb based on the Harvard Healthy Eating Plate, half veg and fruit, a quarter whole grains, a quarter healthy protein. Works for almost any goal.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-ink/15 border border-ink/15">
        <Reveal>
          <div className="bg-cream-light p-8 flex justify-center">
            <svg viewBox="0 0 320 380" className="w-full max-w-[320px]">
              <ellipse cx={cx} cy={cy + 6} rx={r + 16} ry={r + 6} fill="#1A1410" opacity="0.06" />
              <circle cx={cx} cy={cy} r={r + 12} fill="#FBF7F0" stroke="#1A1410" strokeWidth="1.5" strokeOpacity="0.15" />
              <circle cx={cx} cy={cy} r={r + 4} fill="#F7F2EA" stroke="#1A1410" strokeWidth="1" strokeOpacity="0.10" />
              {slices.map((s) => (
                <path key={s.id} d={slicePath(cx, cy, r, s.start, s.end)} fill={s.soft} stroke="#FBF7F0" strokeWidth="3" />
              ))}
              {slices.map((s) => (
                <g key={`label-${s.id}`}>
                  <text x={s.lx} y={s.ly - 4} textAnchor="middle" fontSize="13" fontWeight="600" fill={s.color} style={{ fontFamily: 'Inter, sans-serif' }}>
                    {s.label}
                  </text>
                  <text x={s.lx} y={s.ly + 14} textAnchor="middle" fontSize="14" fill={s.color} style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>
                    {s.percent}%
                  </text>
                </g>
              ))}
              <g transform="translate(20, 280)">
                <path d="M 4,0 L 36,0 L 32,60 L 8,60 Z" fill="#D5DDD6" stroke="#3D4A40" strokeWidth="1.2" />
                <path d="M 8,8 L 32,8" stroke="#3D4A40" strokeWidth="0.8" opacity="0.4" />
                <text x="20" y="78" textAnchor="middle" fontSize="10" fontWeight="700" fill="#3D4A40" style={{ fontFamily: 'Inter', letterSpacing: '0.15em' }}>WATER</text>
              </g>
              <g transform="translate(264, 280)">
                <rect x="12" y="14" width="16" height="46" rx="2" fill="#F5EBD0" stroke="#B08A2E" strokeWidth="1.2" />
                <rect x="16" y="4" width="8" height="12" rx="1" fill="#B08A2E" />
                <text x="20" y="78" textAnchor="middle" fontSize="10" fontWeight="700" fill="#B08A2E" style={{ fontFamily: 'Inter', letterSpacing: '0.15em' }}>EVOO</text>
              </g>
            </svg>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="bg-cream-light p-8 space-y-4">
            {slices.map((s) => (
              <div key={s.id} className="border-b border-ink/10 pb-3 last:border-b-0">
                <div className="flex items-baseline gap-3">
                  <div className="w-3 h-3 mt-1.5 flex-shrink-0" style={{ background: s.soft, border: `1.5px solid ${s.color}` }} />
                  <div className="flex-1">
                    <p className="font-display text-xl text-ink">{s.label} <span className="display-italic text-base" style={{ color: s.color }}>{s.percent}%</span></p>
                    <p className="text-sm text-ink-soft leading-relaxed mt-1"><span className="editorial-label">Examples ·</span> {s.examples}</p>
                    <p className="text-xs text-ink-soft leading-relaxed mt-1 italic">{s.tip}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-3 grid grid-cols-2 gap-3 text-xs text-ink-soft">
              <div><span className="editorial-label">Water</span><p className="mt-0.5">~2 L/day. Skip soda.</p></div>
              <div><span className="editorial-label">Fats</span><p className="mt-0.5">Olive oil, nuts, avocado.</p></div>
              <div><span className="editorial-label">Move</span><p className="mt-0.5">150 min/week moderate.</p></div>
              <div><span className="editorial-label">Salt</span><p className="mt-0.5">Under 5–6 g/day.</p></div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── pH scale ─── */
const pHRanges = [
  { range: '0–4', midpoint: 2, label: 'Very acidic', color: 'bg-clay-dark', text: 'text-clay-dark',
    feel: ['Persistent tiredness, low energy in the afternoon', 'Frequent heartburn or acid reflux', 'Headaches or brain fog after meals', 'Joint or muscle stiffness'],
    see: ['Dull, breakout-prone skin; oily T-zone', 'White-coated tongue, bad breath in the morning', 'Cracked lips or mouth ulcers', 'Dark yellow urine consistently'],
    missing: ['Leafy greens (spinach, kale, rocket), magnesium, potassium', 'Hydration, most people undershoot by 0.5–1 L/day', 'Sleep regularity, chronic stress shifts you here', 'Cut back: soda, alcohol, ultra-processed meat, excess coffee'],
  },
  { range: '4–6', midpoint: 5, label: 'Acidic', color: 'bg-clay', text: 'text-clay',
    feel: ['Energy dips between meals', 'Cravings for sugar or salty snacks', 'Mild bloating after big meals', 'Sleep less restorative than you want'],
    see: ['Skin slightly congested, occasional spots', 'Slightly puffy under-eyes in the morning', 'Urine pale-to-medium yellow most of the day'],
    missing: ['More vegetables, aim for half your plate', 'Magnesium-rich foods: pumpkin seeds, almonds, dark chocolate', 'Slower meals, chew more, eat away from screens', 'Swap one coffee for water or herbal tea'],
  },
  { range: '6–8', midpoint: 7, label: 'Balanced', color: 'bg-sage', text: 'text-sage-dark',
    feel: ['Steady energy from morning to evening', 'Falling asleep easily, waking up rested', 'Even mood, clear thinking', 'Workouts feel strong; recovery is quick'],
    see: ['Clear, even-toned skin', 'Pink, healthy gums and lips', 'Pale-yellow urine through the day', 'Tongue pink without coating'],
    missing: ['Nothing major, keep what you are doing', 'Maintain protein at every meal', 'Keep variety: 30+ different plants per week', 'Stay hydrated as the weather changes'],
  },
  { range: '8–10', midpoint: 9, label: 'Slightly alkaline', color: 'bg-gold', text: 'text-gold-dark',
    feel: ['Light, energised, but occasionally lightheaded', 'Possibly under-eating protein or salt', 'Cold hands and feet more than usual'],
    see: ['Very clear urine all day, could be over-hydrated', 'Slightly pale skin or gums', 'Hair feels drier than normal'],
    missing: ['Adequate protein, aim 1.2–1.6 g/kg minimum', 'A pinch of sea salt if you sweat a lot or exercise hard', 'Healthy fats: olive oil, avocado, nuts', 'Whole grains for steady carbs'],
  },
  { range: '10–14', midpoint: 12, label: 'Very alkaline', color: 'bg-ink', text: 'text-ink',
    feel: ['Lightheaded standing up, weak grip', 'Tingling in hands, feet, or around lips', 'Muscle twitches or cramps', 'Anxious or jittery without obvious cause'],
    see: ['Very pale skin and gums', 'Eyes look sunken or tired', 'Urine almost colourless'],
    missing: ['Calories overall, extreme cleanses or juice fasts cause this', 'Electrolytes: sodium, potassium, magnesium', 'Protein, meat, fish, eggs, legumes, dairy', 'If symptoms persist > 24 h, speak to a doctor'],
  },
]

function rangeFor(value) {
  return pHRanges.find((r) => {
    const [lo, hi] = r.range.split('–').map(Number)
    return value >= lo && value <= hi
  }) ?? pHRanges[2]
}

function PHScale() {
  const [value, setValue] = useState(7)
  const current = rangeFor(value)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="ph-scale">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15">
          <span className="editorial-label">Self check-in</span>
          <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
            The pH <span className="display-italic text-clay">mirror.</span>
          </h2>
          <p className="text-sm text-ink-soft mt-3 max-w-2xl">
            Drag the slider to where you feel your body is right now. This is a wellness mirror, not a medical test.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="bg-cream-light border border-ink/15 p-8">
          <div className="flex items-center justify-between mb-3 editorial-label">
            <span>Acidic · 0</span>
            <span>Balanced · 7</span>
            <span>Alkaline · 14</span>
          </div>
          <div className="relative h-1.5 bg-gradient-to-r from-clay-dark via-sage to-ink mb-2" />
          <input type="range" min="0" max="14" step="1" value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full accent-ink cursor-pointer"
            aria-label="Select your perceived pH value from 0 to 14"
          />
          <div className="flex items-baseline gap-4 mt-6 border-t border-ink/10 pt-6">
            <span className="num-display text-7xl text-ink leading-none">{value}</span>
            <div>
              <p className="editorial-label">Reading</p>
              <p className={`font-display text-3xl mt-1 ${current.text}`}>{current.label}</p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/15 border border-ink/15 mt-px">
        {[
          { label: 'How you feel', key: 'feel', accent: 'clay' },
          { label: 'How you see it', key: 'see', accent: 'sage-dark' },
          { label: 'What you may be missing', key: 'missing', accent: 'gold-dark' },
        ].map((col, i) => (
          <Reveal key={col.key} delay={i * 80}>
            <div className="bg-cream-light p-6 h-full">
              <span className="editorial-label">{col.label}</span>
              <ul className="space-y-2 mt-4">
                {current[col.key].map((item, j) => (
                  <li key={j} className="flex items-baseline gap-3 text-sm">
                    <span className="num-display text-xs text-clay w-5 flex-shrink-0">{String(j + 1).padStart(2, '0')}</span>
                    <span className="text-ink-soft leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-6 border border-ink/15 bg-bone p-4">
          <p className="text-xs text-ink-soft leading-relaxed">
            <span className="editorial-label">Reality check ·</span> "Alkaline diet" claims that food changes blood pH are overstated, your body buffers blood pH very tightly. But eating more plants, drinking enough water, and sleeping well genuinely change how you feel and look.
          </p>
        </div>
      </Reveal>
    </section>
  )
}

/* ─── Pro meal plans ─── */
const mealPlans = {
  'fat-loss': {
    title: 'Fat loss starter day', target: '~1800 kcal · 130g protein · 35g fibre',
    meals: [
      { time: 'Breakfast', item: 'Greek yogurt + berries + 30g oats + a few almonds' },
      { time: 'Lunch', item: 'Chicken or tofu salad: leaves, peppers, cucumber, quinoa, olive oil + lemon' },
      { time: 'Snack', item: 'Apple + 1 tbsp peanut butter' },
      { time: 'Dinner', item: 'Baked salmon (or chickpea curry) + roasted veg + small portion brown rice' },
      { time: 'Evening', item: 'Cottage cheese + cinnamon (if hungry)' },
    ],
  },
  muscle: {
    title: 'Muscle gain day', target: '~2800 kcal · 160g protein · spread over 5 meals',
    meals: [
      { time: 'Breakfast', item: '3 eggs + 2 slices wholemeal toast + avocado + milk' },
      { time: 'Mid-morning', item: 'Smoothie: banana, 30g whey or pea protein, oats, peanut butter, milk' },
      { time: 'Lunch', item: 'Chicken thighs / tempeh + 150g rice + mixed veg + olive oil' },
      { time: 'Pre-workout (1h)', item: 'Rice cakes + jam + small Greek yogurt' },
      { time: 'Dinner', item: 'Salmon or lean steak / lentil bolognese + pasta + side salad' },
      { time: 'Pre-bed', item: 'Cottage cheese or casein shake, slow-digesting protein overnight' },
    ],
  },
  longevity: {
    title: 'Mediterranean day', target: 'Plant-forward, fish 2x/week, EVOO as main fat',
    meals: [
      { time: 'Breakfast', item: 'Wholegrain toast + smashed avocado + tomato + olive oil drizzle' },
      { time: 'Snack', item: 'Handful of walnuts + an orange' },
      { time: 'Lunch', item: 'Lentil + bulgur salad with herbs, feta, cucumber, EVOO + lemon' },
      { time: 'Snack', item: 'Hummus + carrot/pepper sticks' },
      { time: 'Dinner', item: 'Grilled sardines or chickpea stew + roasted veg + small portion bread' },
      { time: 'Dessert', item: 'Fresh fruit + a small piece of dark chocolate' },
    ],
  },
  performance: {
    title: 'Training day fueling', target: '7g carbs/kg · 1.4g protein/kg · sodium matched to sweat',
    meals: [
      { time: 'Breakfast (3h pre)', item: 'Porridge + banana + honey + a few walnuts' },
      { time: 'Pre-session (45 min)', item: 'Slice of toast + jam + black coffee' },
      { time: 'During (>60min)', item: 'Sports drink or 1 date per 20 min' },
      { time: 'Post-workout', item: '30g whey + banana + 80g rice within 1h' },
      { time: 'Dinner', item: 'Chicken or tofu + 200g pasta + tomato sauce + veg + olive oil' },
      { time: 'Evening', item: 'Greek yogurt + honey + tart cherries (sleep + recovery)' },
    ],
  },
  heart: {
    title: 'Heart-health day', target: '<5g salt · >25g soluble fibre · sat fat <10% cal',
    meals: [
      { time: 'Breakfast', item: 'Oats with milk + chia + berries + walnuts' },
      { time: 'Snack', item: 'Pear + 30g unsalted mixed nuts' },
      { time: 'Lunch', item: 'Lentil + barley soup + wholegrain bread + side salad' },
      { time: 'Snack', item: 'Hummus + cucumber' },
      { time: 'Dinner', item: 'Baked salmon + sweet potato + steamed broccoli + olive oil' },
      { time: 'Evening', item: 'Cup of green tea + a square of dark chocolate' },
    ],
  },
  brain: {
    title: 'Focus & mood day', target: 'Steady glucose · omega-3s · polyphenols',
    meals: [
      { time: 'Breakfast', item: 'Eggs + spinach + wholegrain toast + avocado' },
      { time: 'Mid-morning', item: 'Berries + a few walnuts' },
      { time: 'Lunch', item: 'Salmon or tofu poke bowl: quinoa, edamame, carrots, sesame, EVOO' },
      { time: 'Snack', item: 'Dark chocolate (70%+) + green tea' },
      { time: 'Dinner', item: 'Chickpea + spinach curry + brown rice + yogurt' },
      { time: 'Evening', item: 'Chamomile or rooibos tea' },
    ],
  },
}

function ProMealPlans() {
  const [selected, setSelected] = useState('fat-loss')
  const plan = mealPlans[selected]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15">
          <span className="editorial-label flex items-center gap-2">
            Meal plans <TierBadge />
          </span>
          <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
            Seven-day <span className="display-italic text-clay">templates.</span>
          </h2>
        </div>
      </Reveal>

      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(mealPlans).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`px-4 py-2 text-xs font-medium tracking-wide transition-all border ${
              selected === key
                ? 'bg-ink text-cream border-ink'
                : 'border-ink/20 text-ink-soft hover:border-ink hover:text-ink bg-cream-light'
            }`}
          >
            {p.title.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="border border-ink/15 bg-cream-light p-8">
        <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-ink/10">
          <h3 className="font-display text-3xl text-ink">{plan.title}</h3>
          <span className="editorial-label">{plan.target}</span>
        </div>
        <div className="space-y-px bg-ink/10">
          {plan.meals.map((m, i) => (
            <Reveal key={i} delay={i * 30}>
              <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-4 sm:gap-6 px-2 py-4 bg-cream-light hover:bg-bone transition-colors">
                <div>
                  <span className="num-display text-xs text-clay">{String(i + 1).padStart(2, '0')}</span>
                  <p className="font-display text-lg text-ink mt-0.5">{m.time}</p>
                </div>
                <p className="text-sm text-ink-soft leading-relaxed self-center">{m.item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Diet card ─── */
function DietCard({ diet, delay, num }) {
  const [open, setOpen] = useState(false)
  return (
    <Reveal delay={delay} className="h-full">
      <SpotlightCard className="card-paper card-paper-hover p-6 sm:p-8 h-full flex flex-col group">
        <div className="flex items-start justify-between mb-4">
          <span className="editorial-num text-3xl text-ink-softer group-hover:text-clay transition-colors">{num}</span>
          <FavoriteButton id={`diet:${diet.id}`} label={diet.title} size="sm" />
        </div>
        <h3 className="font-display text-3xl text-ink leading-tight">{diet.title}</h3>
        <p className="text-sm text-ink-soft leading-relaxed mt-3">{diet.summary}</p>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {diet.targets.map((t) => (
            <span key={t} className="text-[10px] font-medium bg-bone text-ink-soft px-2.5 py-1 border border-ink/10">
              {t}
            </span>
          ))}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-5 text-sm font-medium text-ink hover:text-clay transition-colors flex items-center gap-1.5 link-underline self-start"
        >
          {open ? 'Hide details' : 'Read the details'} <span className="display-italic">{open ? '↑' : '↓'}</span>
        </button>

        {open && (
          <div className="mt-5 space-y-5 border-t border-ink/10 pt-5 animate-fade-up">
            <div>
              <p className="editorial-label text-sage-dark mb-2">Eat regularly</p>
              <ul className="space-y-1.5">
                {diet.eat.map((item) => (
                  <li key={item} className="text-sm text-ink-soft leading-relaxed flex gap-2">
                    <span className="text-sage">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="editorial-label text-clay-dark mb-2">Limit</p>
              <ul className="space-y-1.5">
                {diet.limit.map((item) => (
                  <li key={item} className="text-sm text-ink-soft leading-relaxed flex gap-2">
                    <span className="text-clay">−</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-bone border border-ink/10">
              <p className="editorial-label mb-1">Evidence</p>
              <p className="text-xs text-ink-soft leading-relaxed">{diet.evidence}</p>
            </div>
          </div>
        )}
      </SpotlightCard>
    </Reveal>
  )
}

/* ─── Page ─── */
export default function Diet({ onNavigate }) {
  const { isPro } = usePro()

  return (
    <div className="bg-cream">
      {/* HERO */}
      <section style={{ viewTransitionName: 'hero-diet' }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12">
        <div className="border-b border-ink/15 pb-3 mb-10 flex items-center justify-between">
          <span className="editorial-label">Chapter 05 · Fuel</span>
          <span className="editorial-label hidden sm:inline">6 protocols · ideal plate · pH</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-10">
            <h1 className="font-display text-[14vw] sm:text-[10vw] lg:text-[8vw] text-ink leading-[0.9] tracking-tight">
              <SplitText byChar stagger={28}>Eat for</SplitText>
              <br />
              <span className="display-italic text-clay"><SplitText byChar stagger={28} startDelay={400}>the goal you have.</SplitText></span>
            </h1>
            <Reveal delay={1200} className="mt-8 max-w-md">
              <p className="text-lg text-ink-soft leading-relaxed">
                Six evidence-based ways to eat, pick the one that matches your goal. Each card shows targets, what to put on your plate, what to ease off, and the research behind it.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Live diet tracker — the headline tool, kept high so it's seen first */}
      {isPro ? (
        <>
          <DietTracker />
          <ProMealPlans />
        </>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Reveal>
            <SpotlightCard className="pro-card p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-9">
                <span className="editorial-label text-gold-dark">Pro Edition · the tool people love</span>
                <h3 className="font-display text-3xl sm:text-4xl text-ink mt-2 leading-tight">
                  Track your day. Get the <span className="display-italic text-clay">next bite.</span>
                </h3>
                <p className="text-ink-soft mt-3 leading-relaxed text-sm max-w-lg">
                  A live diet tracker that learns from what you ate today and suggests your next snack or meal, closing protein, fibre and calorie gaps against your goal. Plus seven-day meal templates for every goal.
                </p>
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-xs text-ink-soft">
                  <li className="flex items-baseline gap-2"><span className="text-clay">+</span> Log meals + snacks in one click</li>
                  <li className="flex items-baseline gap-2"><span className="text-clay">+</span> Live macro &amp; fibre dashboard</li>
                  <li className="flex items-baseline gap-2"><span className="text-clay">+</span> Smart next-meal suggestions</li>
                  <li className="flex items-baseline gap-2"><span className="text-clay">+</span> Seven-day meal templates</li>
                </ul>
              </div>
              <div className="lg:col-span-3 lg:text-right">
                <button onClick={() => onNavigate?.('pro')} className="btn-ink">
                  Unlock <span className="display-italic">→</span>
                </button>
              </div>
            </SpotlightCard>
          </Reveal>
        </section>
      )}

      {/* Marquee */}
      <section className="bg-cream-dark text-ink py-4 border-y border-ink/10 overflow-hidden">
        <Marquee
          items={['Whole foods', 'Slow over fast', 'Protein at every meal', 'Plants, mostly', 'Water first', 'Food is not morals']}
          separator="✿"
          speed="slow"
          itemClassName="font-display text-2xl sm:text-3xl"
          separatorClassName="text-clay text-xl"
        />
      </section>

      {/* Diet cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal>
          <div className="mb-10 pb-4 border-b border-ink/15">
            <span className="editorial-label">Six diets</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              By the <span className="display-italic text-clay">goal.</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {diets.map((diet, i) => (
            <DietCard key={diet.id} diet={diet} delay={i * 60} num={diet.icon} />
          ))}
        </div>
      </section>

      <IdealPlate />
      <PHScale />

      {/* Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Reveal>
          <div className="border-t border-b border-ink/15 py-8 grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-6">
            <div>
              <p className="editorial-label">Food</p>
              <p className="editorial-num text-3xl text-clay mt-1">✿</p>
            </div>
            <div>
              <p className="font-display text-2xl text-ink mb-2">Food is fuel, not morals.</p>
              <p className="text-sm text-ink-soft leading-relaxed">
                These are general nutrition principles, not medical or dietetic advice. If you have a health condition, take medication, or are pregnant, speak to a doctor or registered dietitian before making big changes. Eating disorders deserve professional care, please reach out if you are struggling.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
