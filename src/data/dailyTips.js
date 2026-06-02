// 60 evidence-informed wellness tips, rotated by day-of-year.
// Categories: hydration, sleep, movement, mood, skincare, nutrition, mindset
// Each tip has a unique curated Unsplash photo (no duplicates across the set).

const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=480&q=50`

export const dailyTips = [
  { id: 't1', category: 'hydration', icon: '💧', title: 'Start with a glass', body: 'Drink a full glass of water before your first coffee — it rehydrates you after sleep and curbs the false-hunger signal.', img: U('1548839140-29a749e1cf4d') },
  { id: 't2', category: 'sleep', icon: '🌙', title: 'Dim the lights at 9 pm', body: 'Bright light past sunset suppresses melatonin. Swap overhead lights for warm lamps an hour before bed for easier sleep.', img: U('1519710164239-da123dc03ef4') },
  { id: 't3', category: 'movement', icon: '🚶', title: '2-min walk after meals', body: 'A short walk after eating lowers post-meal blood-sugar spikes by up to 30% — gentle, not strenuous.', img: U('1476480862126-209bfaa8edc8') },
  { id: 't4', category: 'mood', icon: '📓', title: 'Three good things', body: 'Write down three small good things from today. Done nightly for a week, it measurably lifts mood (Seligman 2005).', img: U('1517842645767-c639042777db') },
  { id: 't5', category: 'skincare', icon: '☀️', title: 'SPF even on cloudy days', body: 'UVA penetrates clouds and ages your skin faster than anything else. SPF 30+ every morning is the single best skin habit.', img: U('1556228720-195a672e8a03') },
  { id: 't6', category: 'nutrition', icon: '🥬', title: 'Eat the rainbow', body: 'Aim for 5 different plant colours daily. Polyphenols and fibre work better as a team than any single supplement.', img: U('1490645935967-10de6ba17061') },
  { id: 't7', category: 'mindset', icon: '🧘', title: 'Box breathing', body: 'Inhale 4s, hold 4s, exhale 4s, hold 4s — repeat 4 times. Calms the nervous system in under 90 seconds.', img: U('1518611012118-696072aa579a') },
  { id: 't8', category: 'hydration', icon: '🍋', title: 'Flavour your water', body: 'Lemon, cucumber, or mint make plain water far easier to drink consistently. Hydration > willpower.', img: U('1556679343-c7306c1976bc') },
  { id: 't9', category: 'sleep', icon: '📵', title: 'Phone out of the bedroom', body: 'Even on silent, the temptation to check disrupts sleep onset. A real alarm clock is a quiet game-changer.', img: U('1505693416388-ac5ce068fe85') },
  { id: 't10', category: 'movement', icon: '💪', title: 'Two minutes of stretching', body: 'Shoulder rolls + neck circles + cat-cow before screens fight tension headaches before they start.', img: U('1487412947147-5cebf100ffc2') },
  { id: 't11', category: 'mood', icon: '🌳', title: 'Touch grass', body: '10 minutes outside daily — sun, trees, or sky — lowers cortisol and improves mood, regardless of weather.', img: U('1500382017468-9049fed747ef') },
  { id: 't12', category: 'skincare', icon: '🧴', title: 'Less is more', body: 'A 3-step routine (cleanse, moisturize, SPF) done daily beats a 10-step routine done occasionally.', img: U('1514315384763-ba401779410f') },
  { id: 't13', category: 'nutrition', icon: '🥚', title: 'Protein at breakfast', body: '20-30g of protein in the morning curbs cravings for the rest of the day. Eggs, yogurt, or tofu all work.', img: U('1525351484163-7529414344d8') },
  { id: 't14', category: 'mindset', icon: '🪞', title: 'Talk to yourself like a friend', body: 'Notice harsh self-talk this week. Would you say it to your best friend? If not, rephrase it.', img: U('1499209974431-9dddcece7f88') },
  { id: 't15', category: 'hydration', icon: '🍵', title: 'Herbal tea counts', body: 'Caffeine-free teas count toward hydration and add antioxidants. Chamomile in the evening also supports sleep.', img: U('1576092768241-dec231879fc3') },
  { id: 't16', category: 'sleep', icon: '🛌', title: 'Same wake time daily', body: 'Consistent wake time (even weekends) anchors your circadian rhythm faster than any bedtime trick.', img: U('1495365200479-c4ed1d35e1aa') },
  { id: 't17', category: 'movement', icon: '🏃', title: 'Stairs over lifts', body: 'Choosing stairs adds 30-60 cardio minutes per week without setting foot in a gym.', img: U('1473445730015-841f29a9490b') },
  { id: 't18', category: 'mood', icon: '🎵', title: 'One song dance break', body: 'A 3-minute dance to a song you love is mood-tested medicine. Move alone if you must.', img: U('1493612276216-ee3925520721') },
  { id: 't19', category: 'skincare', icon: '💧', title: 'Moisturize damp skin', body: 'Apply moisturizer within 60 seconds of washing — it locks in 10x more water than dry-skin application.', img: U('1531746020798-e6953c6e8e04') },
  { id: 't20', category: 'nutrition', icon: '🥑', title: 'Fats keep you full', body: 'Healthy fats (avocado, nuts, olive oil) slow digestion and prevent the 3 pm energy crash.', img: U('1528825871115-3581a5387919') },
  { id: 't21', category: 'mindset', icon: '⏸️', title: 'The 5-minute pause', body: 'Before reacting to a stressful message, wait 5 minutes. Most regretted replies happen in the first 60 seconds.', img: U('1542144612-1b3641ec3459') },
  { id: 't22', category: 'hydration', icon: '🚰', title: 'Bottle on your desk', body: 'Visible water = drunk water. Out-of-sight bottles are forgotten bottles.', img: U('1602143407151-7111542de6e8') },
  { id: 't23', category: 'sleep', icon: '🌡️', title: 'Cool room, warm feet', body: 'Bedroom around 18°C with socks on falls asleep fastest. Cool core + warm extremities is the sweet spot.', img: U('1525755662778-989d0524087e') },
  { id: 't24', category: 'movement', icon: '🧎', title: 'Posture reset', body: 'Every hour: chin tucked, shoulders down and back, deep breath. Re-trains your default posture over weeks.', img: U('1545205597-3d9d02c29597') },
  { id: 't25', category: 'mood', icon: '💌', title: 'Send a thank-you', body: 'Text one person something specific you appreciate about them. Boosts your mood as much as theirs.', img: U('1554080353-a576cf803bda') },
  { id: 't26', category: 'skincare', icon: '🌿', title: 'Patch test new products', body: 'Apply behind your ear for 2 days before your face. Saves you from full-face reactions.', img: U('1556228453-efd6c1ff04f6') },
  { id: 't27', category: 'nutrition', icon: '🌾', title: 'Whole over refined', body: 'Brown rice, whole oats, wholemeal bread — the fibre alone is worth the swap for steady energy.', img: U('1574323347407-f5e1ad6d020b') },
  { id: 't28', category: 'mindset', icon: '🎯', title: 'One thing only', body: 'Pick the single most important task tomorrow before bed. Decision fatigue eats willpower in the morning.', img: U('1571019613454-1cb2f99b2d8b') },
  { id: 't29', category: 'hydration', icon: '🌅', title: 'Hydrate before caffeine', body: 'Caffeine is a mild diuretic. Water first, coffee second — less afternoon headache, less crash.', img: U('1495474472287-4d71bcdd2085') },
  { id: 't30', category: 'sleep', icon: '☀️', title: 'Morning sunlight', body: '10 minutes of outdoor light within 1 hour of waking sets your circadian clock for the day.', img: U('1470770841072-f978cf4d019e') },
  { id: 't31', category: 'movement', icon: '🤸', title: 'Dynamic warm-up', body: 'Skip static stretching pre-workout. Leg swings, arm circles, and walking lunges prepare muscles better and prevent injury.', img: U('1543007630-9710e4a00a20') },
  { id: 't32', category: 'mood', icon: '😊', title: 'Smile on purpose', body: 'Forcing a smile for 30 seconds genuinely triggers a small dopamine release — facial-feedback hypothesis at work.', img: U('1583394838336-acd977736f90') },
  { id: 't33', category: 'skincare', icon: '🧖', title: 'Pillow case rotation', body: 'Swap pillow cases every 2-3 days to reduce bacteria, oil, and breakout risk on cheek/jaw areas.', img: U('1503602642458-232111445657') },
  { id: 't34', category: 'nutrition', icon: '🐟', title: 'Omega-3 twice a week', body: 'Salmon, sardines, or mackerel 2x/week meets your omega-3 target without supplements.', img: U('1485921325833-c519f76c4927') },
  { id: 't35', category: 'mindset', icon: '🧠', title: 'Single-task for 25 min', body: 'A Pomodoro of one task (no tabs, no phone) gets more done than 2 hours of half-attention multi-tasking.', img: U('1576566588028-4147f3842f27') },
  { id: 't36', category: 'hydration', icon: '🍉', title: 'Hydrate through food', body: 'Watermelon, cucumber, oranges, and lettuce are 90%+ water — they count.', img: U('1563114773-84221bd62daa') },
  { id: 't37', category: 'sleep', icon: '🎧', title: 'White noise trick', body: 'A fan, rain sounds, or pink noise masks micro-wakeups and improves sleep quality on noisy nights.', img: U('1606787366850-de6330128bfc') },
  { id: 't38', category: 'movement', icon: '🦵', title: 'Glute bridges daily', body: 'Sitting all day shuts off your glutes. 20 bridges in the morning re-wakes them and protects your lower back.', img: U('1554284126-aa88f22d8b74') },
  { id: 't39', category: 'mood', icon: '📞', title: 'Voice over text', body: 'A 5-minute voice note to a friend builds connection 3x more than the same content in text.', img: U('1611605698335-8b1569810432') },
  { id: 't40', category: 'skincare', icon: '🧊', title: 'Cold rinse on puffy days', body: 'Splash cold water on your face for 30 seconds in the morning to reduce overnight puffiness fast.', img: U('1490806843957-31f4c9a91c65') },
  { id: 't41', category: 'nutrition', icon: '🌶️', title: 'Spice it up', body: 'Turmeric, ginger, cinnamon, garlic — all anti-inflammatory and add zero calories. Cooking with them daily adds up.', img: U('1551892374-ecf8754cf8b0') },
  { id: 't42', category: 'mindset', icon: '✏️', title: 'Brain dump on paper', body: 'When overwhelmed, write everything in your head on paper for 5 minutes. Almost always reduces the load by half.', img: U('1593359677879-a4bb92f829d1') },
  { id: 't43', category: 'hydration', icon: '⚡', title: 'Pinch of salt in water', body: 'After hard exercise, a pinch of salt + lemon in water rehydrates better than plain water (electrolytes).', img: U('1518779578993-ec3579fee39f') },
  { id: 't44', category: 'sleep', icon: '🕯️', title: 'Wind-down ritual', body: 'A repeated 20-minute pre-bed routine (tea, book, dim lights) signals "sleep mode" to your brain.', img: U('1611080626919-7cf5a9dbab5b') },
  { id: 't45', category: 'movement', icon: '🚲', title: 'NEAT matters', body: 'Non-exercise movement (walking, fidgeting, standing) burns more weekly calories than most workouts. Stand more.', img: U('1485965120184-e220f721d03e') },
  { id: 't46', category: 'mood', icon: '🎨', title: 'Make something today', body: 'Cooking, drawing, writing, fixing — making anything with your hands lifts mood differently than consuming content.', img: U('1452860606245-08befc0ff44b') },
  { id: 't47', category: 'skincare', icon: '🌃', title: 'Never sleep in makeup', body: 'Sleeping in makeup clogs pores all night and is linked to faster skin ageing. Even a wipe is better than nothing.', img: U('1488477181946-6428a0291777') },
  { id: 't48', category: 'nutrition', icon: '🥛', title: 'Calcium for bones', body: 'Teens and young women need ~1300mg calcium daily for peak bone density. Dairy, fortified plant milks, leafy greens.', img: U('1550583724-b2692b85b150') },
  { id: 't49', category: 'mindset', icon: '🌱', title: 'Yet — add that word', body: '"I can\'t do this" → "I can\'t do this yet". One word, big mindset shift (Dweck — growth mindset).', img: U('1535930891776-0c2dfb7fda1a') },
  { id: 't50', category: 'hydration', icon: '🥤', title: 'Cut one sugary drink', body: 'Replacing one soda or juice per day with water saves ~150 kcal and 35g sugar daily — easiest health win.', img: U('1622543925917-763c34d1a86e') },
  { id: 't51', category: 'sleep', icon: '☕', title: 'Caffeine curfew', body: 'No caffeine after 2 pm. Half-life is ~6 hours — afternoon coffee still affects 10 pm sleep quality.', img: U('1571645163064-77faa9676a46') },
  { id: 't52', category: 'movement', icon: '🧗', title: 'Hang from a bar', body: '30 seconds of dead-hang daily improves grip, shoulder mobility, and decompresses the spine.', img: U('1519331379826-f10be5486c6f') },
  { id: 't53', category: 'mood', icon: '🐾', title: 'Pet a friendly animal', body: 'Even 10 minutes lowers cortisol and raises oxytocin — measurable in saliva tests. Pets are mood medicine.', img: U('1517849845537-4d257902454a') },
  { id: 't54', category: 'skincare', icon: '🌸', title: 'Niacinamide is gentle', body: 'For redness, large pores, and oil control — niacinamide 5% is the most-tolerated active in skincare.', img: U('1547592180-85f173990554') },
  { id: 't55', category: 'nutrition', icon: '🌰', title: 'Handful of nuts', body: '30g of mixed nuts daily lowers cardiovascular risk and keeps you full longer than crisps.', img: U('1508061253366-f7da158b6d46') },
  { id: 't56', category: 'mindset', icon: '📚', title: 'Read 10 pages', body: '10 pages a day = 12+ books a year. Consistency beats marathon reading every time.', img: U('1481627834876-b7833e8f5570') },
  { id: 't57', category: 'hydration', icon: '🌡️', title: 'Check your pee', body: 'Pale straw = hydrated. Dark yellow = drink more. Clear = you might be overdoing it.', img: U('1604014237800-1c9102c219da') },
  { id: 't58', category: 'sleep', icon: '🧦', title: 'No screens in bed', body: 'Bed = sleep + intimacy only. Using bed for scrolling weakens the sleep association over time.', img: U('1471193945509-9ad0617afabf') },
  { id: 't59', category: 'movement', icon: '🧘', title: 'Spinal twist before bed', body: 'Lying supine spinal twist for 1 minute per side decompresses the back and signals relaxation.', img: U('1502741224143-90386d7f8c82') },
  { id: 't60', category: 'mindset', icon: '🌟', title: 'Celebrate small wins', body: 'Finished a workout? Drank water? Said no to something draining? Out-loud acknowledgement rewires reward pathways.', img: U('1490750967868-88aa4486c946') },
]

export function getTipOfDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return dailyTips[dayOfYear % dailyTips.length]
}

export const categoryMeta = {
  hydration: { label: 'Hydration', color: 'from-sky-100 to-blue-50', text: 'text-sky-700', accent: 'bg-sky-100' },
  sleep: { label: 'Sleep', color: 'from-indigo-100 to-purple-50', text: 'text-indigo-700', accent: 'bg-indigo-100' },
  movement: { label: 'Movement', color: 'from-orange-100 to-peach/40', text: 'text-orange-700', accent: 'bg-orange-100' },
  mood: { label: 'Mood', color: 'from-pink-100 to-blush/40', text: 'text-pink-700', accent: 'bg-pink-100' },
  skincare: { label: 'Skin Care', color: 'from-lavender/60 to-purple-50', text: 'text-purple-700', accent: 'bg-purple-100' },
  nutrition: { label: 'Nutrition', color: 'from-sage/60 to-green-50', text: 'text-green-700', accent: 'bg-green-100' },
  mindset: { label: 'Mindset', color: 'from-amber-100 to-yellow-50', text: 'text-amber-700', accent: 'bg-amber-100' },
}
