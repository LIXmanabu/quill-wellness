export const bodyData = {
  face: {
    label: 'Face',
    icon: '✨',
    color: 'bg-rose-50',
    concerns: [
      {
        title: 'Breakouts & Acne',
        suggestions: [
          'Cleanse gently twice a day with a mild, non-stripping face wash',
          'Avoid touching your face — hands carry bacteria',
          'Try a gentle salicylic acid or benzoyl peroxide spot treatment',
          'Change your pillowcase at least once a week',
          'Remove makeup before sleep every night',
          'Avoid popping or picking — it can cause scarring',
        ],
        safetyNote: 'If acne is severe, painful, or affecting your confidence, consider speaking with a dermatologist.',
      },
      {
        title: 'Dry Skin',
        suggestions: [
          'Use a gentle hydrating cleanser — not foaming or soap-based',
          'Apply a fragrance-free moisturiser while skin is still slightly damp',
          'Look for ingredients like hyaluronic acid, ceramides, or glycerin',
          'Drink enough water throughout the day',
          'Avoid very hot water when washing your face',
        ],
        safetyNote: 'Persistent extreme dryness or flaking may benefit from a dermatologist consultation.',
      },
      {
        title: 'Oily Skin',
        suggestions: [
          'Use a gentle gel or foam cleanser — twice daily',
          'Do not skip moisturiser — dehydrated skin overproduces oil',
          'Use a lightweight, oil-free moisturiser or gel formula',
          'Blotting papers are a great on-the-go helper',
          'Clay masks once a week can help manage oiliness',
        ],
        safetyNote: 'Over-cleansing can make oiliness worse. Be gentle.',
      },
      {
        title: 'Dark Circles',
        suggestions: [
          'Prioritise 7–9 hours of quality sleep',
          'Stay hydrated — dehydration makes circles more visible',
          'Cool compresses or chilled eye patches may reduce puffiness',
          'Elevate your head slightly when sleeping',
          'Reduce excessive screen time before bed',
        ],
        safetyNote: 'Dark circles are very common and completely normal. If sudden or severe, speak with a doctor.',
      },
      {
        title: 'Redness & Sensitivity',
        suggestions: [
          'Switch to fragrance-free, dye-free skincare products',
          'Avoid harsh scrubs or physical exfoliants',
          'Use SPF 30+ sunscreen daily — UV triggers redness',
          'Lukewarm (not hot) water when cleansing',
          'Test new products on a small patch of skin first',
        ],
        safetyNote: 'Persistent facial redness may be rosacea or another condition — a dermatologist can help.',
      },
    ],
    generalDisclaimer: 'These are general self-care suggestions, not medical advice. For persistent or worsening skin concerns, speak with a dermatologist.',
  },

  head: {
    label: 'Head',
    icon: '🧠',
    color: 'bg-purple-50',
    concerns: [
      {
        title: 'Headaches',
        suggestions: [
          'Drink a full glass of water — dehydration is a very common trigger',
          'Step away from screens and rest your eyes for 20 minutes',
          'Gentle temples massage in small circular motions',
          'A cool or warm cloth on your forehead or the back of your neck',
          'Rest in a quiet, dimly lit room if possible',
          'Ensure you are getting enough sleep each night',
        ],
        safetyNote: 'If headaches are frequent, sudden, severe, or come with other symptoms, please seek medical advice.',
      },
      {
        title: 'Stress & Tension',
        suggestions: [
          'Try box breathing: inhale 4s, hold 4s, exhale 4s — repeat 5 times',
          'A short walk outside can help reset your nervous system',
          'Journaling thoughts can help release mental clutter',
          'Stretching your neck and shoulders releases held tension',
          'Limit caffeine intake, especially later in the day',
        ],
        safetyNote: 'If stress feels overwhelming or persistent, speak with a trusted adult, school counsellor, or doctor.',
      },
      {
        title: 'Fatigue & Low Energy',
        suggestions: [
          'Check your sleep schedule — aim for 8–10 hours as a teen',
          'Eat regular meals with protein, complex carbs, and vegetables',
          'Drink water consistently throughout the day',
          'Short 10-minute outdoor walks boost energy naturally',
          'Limit very long naps (over 30 min) as they can disrupt night sleep',
        ],
        safetyNote: 'Persistent fatigue despite good sleep habits should be discussed with a doctor.',
      },
    ],
    generalDisclaimer: 'These are general wellness suggestions. If symptoms are severe, sudden, or worsening, seek medical advice.',
  },

  neck: {
    label: 'Neck',
    icon: '🧣',
    color: 'bg-pink-50',
    concerns: [
      {
        title: 'Tension & Stiffness',
        suggestions: [
          'Gently tilt your head side to side — hold each stretch 20–30 seconds',
          'Slowly roll your shoulders back and down, then repeat',
          'Check your phone and screen posture — avoid "tech neck"',
          'A warm compress or warm shower on the neck area can ease tension',
          'Take breaks every 30 minutes when sitting or studying',
        ],
        safetyNote: 'Sharp pain, numbness, or pain that radiates down your arms should be assessed by a doctor.',
      },
      {
        title: 'Posture Strain',
        suggestions: [
          'Hold your phone or book at eye level rather than looking down',
          'Sit back in your chair with your back supported',
          'Your computer screen should be roughly at eye level',
          'Gentle chin tucks: draw chin straight back, hold 5 seconds',
          'Shoulder rolls: 10 forward, 10 backward, several times a day',
        ],
        safetyNote: 'Persistent neck pain from posture may benefit from a physiotherapist visit.',
      },
    ],
    generalDisclaimer: 'These are general wellness suggestions. If pain is severe or includes numbness, please seek medical advice.',
  },

  shoulders: {
    label: 'Shoulders',
    icon: '💪',
    color: 'bg-orange-50',
    concerns: [
      {
        title: 'Tension & Tightness',
        suggestions: [
          'Cross-body arm stretch: pull one arm across your chest gently, hold 20s',
          'Shoulder circles: 10 slow rotations each direction',
          'Door frame chest stretch to open tight front shoulders',
          'A warm heat pack for 10–15 minutes can ease muscle tension',
          'Regular movement breaks — shoulders absorb a lot of desk stress',
        ],
        safetyNote: 'If shoulder pain is sharp, limits movement, or followed an injury, seek medical advice.',
      },
      {
        title: 'Stress Tension',
        suggestions: [
          'Many people hold stress in their shoulders without realising it',
          'Check in with yourself throughout the day: are your shoulders raised? Lower them',
          'Mindful breathing while releasing shoulder tension can help',
          'Gentle yoga poses like Child\'s Pose relieve shoulder tension naturally',
        ],
        safetyNote: 'Chronic stress affecting your body is worth discussing with a trusted adult or counsellor.',
      },
    ],
    generalDisclaimer: 'General wellness suggestions only. Seek medical advice for injury or severe pain.',
  },

  arms: {
    label: 'Arms',
    icon: '🦾',
    color: 'bg-yellow-50',
    concerns: [
      {
        title: 'Muscle Soreness',
        suggestions: [
          'Soreness 24–48 hours after exercise is normal (DOMS)',
          'Light movement and gentle stretching help blood flow and recovery',
          'Stay well hydrated — muscles recover better with good hydration',
          'A cool compress or gentle ice pack (wrapped in cloth) for 10–15 min',
          'Rest the area if soreness is intense',
        ],
        safetyNote: 'Sharp pain during exercise or swelling after minor activity should be checked by a doctor.',
      },
      {
        title: 'Dry Skin on Arms',
        suggestions: [
          'Moisturise daily after showering while skin is still slightly damp',
          'Use a fragrance-free, gentle body lotion or cream',
          'Avoid very hot showers — they strip natural skin oils',
          'Look for products with shea butter, ceramides, or urea for dry skin',
        ],
        safetyNote: 'Persistent very dry, itchy, or inflamed skin may be eczema — a doctor can advise.',
      },
    ],
    generalDisclaimer: 'General self-care suggestions. Seek medical advice for injury, swelling, or unusual symptoms.',
  },

  hands: {
    label: 'Hands',
    icon: '🤲',
    color: 'bg-amber-50',
    concerns: [
      {
        title: 'Dry & Cracked Hands',
        suggestions: [
          'Apply hand cream after washing hands — especially in winter',
          'Look for creams with glycerin, shea butter, or lanolin',
          'Overnight hand mask: apply thick cream and wear cotton gloves to sleep',
          'Avoid harsh soaps — use gentle, moisturising hand wash',
          'Wear gloves when doing housework or gardening',
        ],
        safetyNote: 'Very cracked or bleeding skin may need a prescription treatment — speak with a pharmacist or doctor.',
      },
      {
        title: 'Nail Care',
        suggestions: [
          'Keep nails clean and trim them regularly to avoid breaks',
          'Moisturise your cuticles with oil or a gentle cream',
          'Avoid biting nails — this introduces bacteria and damages nail beds',
          'Biotin-rich foods (eggs, nuts, salmon) support nail health',
          'Give nails regular breaks from nail polish',
        ],
        safetyNote: 'Unusual nail changes (discolouration, thickening) are worth mentioning to a doctor.',
      },
    ],
    generalDisclaimer: 'General self-care suggestions. Seek medical advice for persistent pain or unusual skin changes.',
  },

  chest: {
    label: 'Chest',
    icon: '🫀',
    color: 'bg-red-50',
    concerns: [
      {
        title: 'Chest Muscle Tension',
        suggestions: [
          'Door frame chest stretch: arms at 90°, lean gently forward through a doorway',
          'This is common from rounded posture or heavy backpacks',
          'Regular shoulder rolls and posture checks help prevent buildup',
          'Yoga poses like Cobra or Cat-Cow gently open the chest',
        ],
        safetyNote: 'Chest pain (especially with shortness of breath, dizziness, or arm pain) always warrants immediate medical attention.',
      },
      {
        title: 'Chest Skin Care',
        suggestions: [
          'The décolletage is often overlooked — apply sunscreen here daily',
          'Moisturise the chest area as you would your face',
          'Breakouts on the chest are common — use a gentle body wash with salicylic acid',
          'Wear breathable fabrics to reduce friction and sweat-related breakouts',
        ],
        safetyNote: 'Any unusual lumps, skin changes, or ongoing pain in the chest area should be discussed with a doctor.',
      },
    ],
    generalDisclaimer: 'Important: Any chest pain, especially sudden or severe, requires immediate medical attention. These are general self-care tips only.',
  },

  stomach: {
    label: 'Stomach',
    icon: '🌀',
    color: 'bg-green-50',
    concerns: [
      {
        title: 'Stomach Cramps',
        suggestions: [
          'A warm heat pad or hot water bottle on your stomach can bring relief',
          'Gentle movement like slow walking can help ease cramping',
          'Peppermint tea or warm water with ginger may soothe discomfort',
          'Avoid heavy, greasy, or very spicy foods when crampy',
          'Rest and give your body time — cramps often pass with time',
        ],
        safetyNote: 'Severe, sudden, or persistent stomach pain should always be assessed by a doctor.',
      },
      {
        title: 'Bloating',
        suggestions: [
          'Eat slowly and chew food thoroughly to reduce swallowed air',
          'Identify common bloating triggers: fizzy drinks, beans, dairy, onions',
          'Gentle walking after meals supports digestion',
          'Peppermint or fennel tea can help relieve gas discomfort',
          'Stay hydrated — constipation and dehydration worsen bloating',
        ],
        safetyNote: 'Frequent, severe bloating with pain or changes in digestion should be discussed with a doctor.',
      },
      {
        title: 'Period Cramps',
        suggestions: [
          'Heat therapy is very effective — use a heat pad on low heat',
          'Gentle yoga poses like Child\'s Pose or reclining twists bring relief',
          'Light exercise like slow walking or swimming can help',
          'Stay warm and rest when you need to — your body deserves it',
          'Staying hydrated and eating light, nourishing foods helps',
          'Over-the-counter pain relief (like ibuprofen) can be helpful — check with a parent or pharmacist',
        ],
        safetyNote: 'Period pain that is debilitating, very severe, or getting worse over time is worth discussing with a gynaecologist or doctor.',
      },
    ],
    generalDisclaimer: 'These are general wellness suggestions. Severe or persistent stomach pain should always be assessed by a doctor.',
  },

  back: {
    label: 'Back',
    icon: '🧘',
    color: 'bg-teal-50',
    concerns: [
      {
        title: 'Lower Back Pain',
        suggestions: [
          'Gentle cat-cow stretch: on hands and knees, alternate arching and rounding your back',
          'Child\'s Pose: sit back on your heels and stretch arms forward — hold 30–60 seconds',
          'Avoid sitting or standing in one position for too long — move every 30 minutes',
          'When lifting, bend your knees and keep the object close to your body',
          'Sleeping on your side with a pillow between knees can reduce strain',
        ],
        safetyNote: 'Back pain with numbness, tingling in legs, or pain after a fall should be seen by a doctor.',
      },
      {
        title: 'Poor Posture',
        suggestions: [
          'Sit back fully in your chair so your lower back is supported',
          'Screen at eye level to prevent neck-forward posture',
          'Strengthen your core — it supports your spine naturally',
          'Take standing or walking breaks every hour',
          'Backpacks should sit high on your back and be worn on both shoulders',
        ],
        safetyNote: 'A physiotherapist can assess posture and recommend targeted exercises.',
      },
      {
        title: 'Tight Back Muscles',
        suggestions: [
          'Foam rolling the upper and lower back can release muscle knots',
          'A warm shower or heat pack loosens tight back muscles',
          'Seated forward fold: sit on the floor, legs straight, reach toward toes slowly',
          'Gentle side stretches standing up — reach one arm overhead, lean softly to the side',
        ],
        safetyNote: 'If tightness is accompanied by fever or does not improve with rest, seek medical advice.',
      },
    ],
    generalDisclaimer: 'General wellness suggestions. Back pain with neurological symptoms (numbness, weakness) requires medical assessment.',
  },

  hips: {
    label: 'Hips',
    icon: '🌸',
    color: 'bg-fuchsia-50',
    concerns: [
      {
        title: 'Hip Tightness',
        suggestions: [
          'Pigeon pose (modified lying version) stretches the hip flexors and glutes gently',
          'Figure-four stretch: lying on back, cross ankle over opposite knee and gently pull toward chest',
          'Hip circles: standing, hands on hips, make slow large circles',
          'Regular stretching after sitting for long periods',
        ],
        safetyNote: 'Sharp pain or clicking in the hip during movement should be assessed by a doctor or physio.',
      },
      {
        title: 'Soreness After Exercise',
        suggestions: [
          'Rest the area and allow 24–48 hours recovery between intense sessions',
          'Light stretching and walking maintain blood flow without overloading',
          'Ice packs (wrapped in cloth) for the first 24 hours after intense exercise',
          'After 24 hours, a warm compress or bath helps muscle recovery',
        ],
        safetyNote: 'Exercise-related soreness should improve within 2–3 days. Persistent pain warrants medical advice.',
      },
    ],
    generalDisclaimer: 'General wellness suggestions. Seek medical advice for sharp, persistent, or injury-related hip pain.',
  },

  legs: {
    label: 'Legs',
    icon: '🦵',
    color: 'bg-indigo-50',
    concerns: [
      {
        title: 'Muscle Soreness',
        suggestions: [
          'Light walking is one of the best ways to ease sore legs',
          'Gentle quad and hamstring stretches held for 30 seconds',
          'Stay hydrated — muscles need water to recover efficiently',
          'Elevating your legs for 15–20 minutes reduces swelling and fatigue',
          'Massage the legs gently with a foam roller or your hands',
        ],
        safetyNote: 'Normal exercise soreness improves within 2–3 days. Sudden sharp pain during exercise is different — stop and rest.',
      },
      {
        title: 'Tired & Heavy Legs',
        suggestions: [
          'Elevate your legs above heart level for 15–20 minutes',
          'Cold water splashed on calves can reduce heaviness after a long day',
          'Calf raises (standing on tiptoes and back down) stimulate circulation',
          'Compression socks can help on long days on your feet',
          'Gentle walking is more effective than sitting still',
        ],
        safetyNote: 'Persistent swelling, redness, or warmth in one leg should be assessed by a doctor.',
      },
    ],
    generalDisclaimer: 'General self-care suggestions. Seek medical advice for swelling, persistent pain, or injury.',
  },

  knees: {
    label: 'Knees',
    icon: '🦿',
    color: 'bg-sky-50',
    concerns: [
      {
        title: 'Knee Discomfort & Soreness',
        suggestions: [
          'Rest the knee and avoid activities that worsen the pain',
          'Ice it: wrap ice in a cloth and apply for 10–15 minutes, a few times a day',
          'After 48 hours, a warm compress can ease stiffness',
          'Gentle quad stretches and straight-leg raises support the knee without impact',
          'Ensure your footwear has proper support — worn-out shoes cause knee stress',
          'Avoid sitting with knees bent for very long periods',
        ],
        safetyNote: 'If knee pain is sudden, severe, caused by a fall/impact, or if the knee is swollen and warm, seek medical advice promptly.',
      },
      {
        title: 'Growing Pain / Achiness',
        suggestions: [
          'Growing pains are common in teenage years — gentle movement and warmth help',
          'A warm bath or heat pad on the knees before sleep often gives relief',
          'Light stretching of the quad and calf muscles reduces strain on the knees',
          'Calcium and Vitamin D (from food or sunlight) support bone health',
        ],
        safetyNote: 'Growing pain that is severe, in joints rather than muscles, or only in one limb should be discussed with a doctor.',
      },
    ],
    generalDisclaimer: 'General self-care suggestions. Knee pain following an injury or with swelling always warrants medical assessment.',
  },

  feet: {
    label: 'Feet',
    icon: '🦶',
    color: 'bg-lime-50',
    concerns: [
      {
        title: 'Sore & Tired Feet',
        suggestions: [
          'Soak your feet in warm water with a little Epsom salt for 15–20 minutes',
          'Gently massage the soles using circular motion with your thumbs',
          'Roll a tennis ball under your foot while seated',
          'Elevate your feet when resting to reduce end-of-day swelling',
          'Ensure your shoes fit well and provide enough support',
        ],
        safetyNote: 'Persistent foot pain, especially in growing teens, should be discussed with a doctor or podiatrist.',
      },
      {
        title: 'Dry & Cracked Heels',
        suggestions: [
          'Soak feet in warm water, then gently exfoliate with a pumice stone',
          'Apply thick foot cream or plain coconut oil and wear socks overnight',
          'Keep feet moisturised daily, especially around heels and between toes',
          'Avoid walking barefoot on hard floors for extended periods',
        ],
        safetyNote: 'Deep cracks or bleeding heels may need a pharmacist or doctor recommendation.',
      },
    ],
    generalDisclaimer: 'General self-care suggestions. Seek medical advice for persistent foot pain or unusual symptoms.',
  },
}
