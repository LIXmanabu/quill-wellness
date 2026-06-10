// Community post categories. `value` is what's stored in the DB; `label` is
// shown in the UI; `accent` maps to one of Quill's card/chip colour families.
export const CATEGORIES = [
  { value: 'skincare_routine', label: 'Skincare Routine',        accent: 'blush' },
  { value: 'beauty_plan',      label: 'Beauty Plan',             accent: 'clay'  },
  { value: 'workout_plan',     label: 'Workout Plan',            accent: 'sage'  },
  { value: 'hair_care',        label: 'Hair Care',               accent: 'gold'  },
  { value: 'nutrition',        label: 'Nutrition / Meal Prep',   accent: 'sage'  },
  { value: 'wellness',         label: 'Wellness / Self-Care',    accent: 'blush' },
  { value: 'transformation',   label: 'Transformation Journey',  accent: 'clay'  },
  { value: 'morning_routine',  label: 'Morning Routine',         accent: 'gold'  },
  { value: 'evening_routine',  label: 'Evening Routine',         accent: 'clay'  },
]

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value)

export function categoryLabel(value) {
  return CATEGORIES.find((c) => c.value === value)?.label || value
}
export function categoryAccent(value) {
  return CATEGORIES.find((c) => c.value === value)?.accent || 'clay'
}
