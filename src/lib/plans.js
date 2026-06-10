import { getRoutine, getGoalLabel, getSkinPlan } from '../data/personalization.js'
import { getBlueprint } from '../data/blueprints.js'
import { categoryLabel } from '../data/communityCategories.js'

// ─── Personal plans ───────────────────────────────────────────────────────
// A plan is a private routine the user builds (or has Quill draft for them) and
// keeps on their account. Stored in localStorage per account — exactly like the
// Joy journal — so it works offline, stays private, and needs no extra backend
// setup. (If cross-device sync is wanted later, this is the one place to swap in
// a Supabase `plans` table; the rest of the UI calls only these functions.)

function storageKey(user) {
  return user?.id ? `quill.plans.${user.id}` : 'quill.plans.guest'
}

export function loadPlans(user) {
  try { return JSON.parse(localStorage.getItem(storageKey(user))) || [] } catch { return [] }
}

function writePlans(user, plans) {
  try { localStorage.setItem(storageKey(user), JSON.stringify(plans)) } catch {}
}

const emptyPlan = () => ({
  id: crypto.randomUUID(),
  title: '',
  category: 'wellness',
  steps: [''],
  products: [''],
  media: [],                  // [{ url, type:'image'|'video', path }]
  notes: '',
  source: 'manual',           // 'manual' | 'guided'
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

export function newBlankPlan() {
  return emptyPlan()
}

// Persist a plan (insert or update by id). Returns the saved, cleaned plan.
export function savePlan(user, plan) {
  const cleaned = {
    ...plan,
    title: (plan.title || '').trim() || 'Untitled plan',
    steps: (plan.steps || []).map((s) => (s || '').trim()).filter(Boolean),
    products: (plan.products || []).map((p) => (p || '').trim()).filter(Boolean),
    media: Array.isArray(plan.media) ? plan.media : [],
    notes: (plan.notes || '').trim(),
    updatedAt: Date.now(),
  }
  const plans = loadPlans(user)
  const idx = plans.findIndex((p) => p.id === cleaned.id)
  if (idx >= 0) plans[idx] = cleaned
  else plans.unshift(cleaned)
  writePlans(user, plans)
  return cleaned
}

export function deletePlan(user, id) {
  writePlans(user, loadPlans(user).filter((p) => p.id !== id))
}

// Map an onboarding goal to the closest Community category, so a plan shared to
// the community lands in a sensible place.
const GOAL_TO_CATEGORY = {
  glow: 'skincare_routine',
  fitness: 'workout_plan',
  eat: 'nutrition',
  calm: 'wellness',
  body: 'wellness',
}

/**
 * Draft a plan from the user's profile (goal × time, plus skin-type add-ons).
 * Returns a fully-formed, editable plan the user can tweak before saving.
 * `null` if there's nothing to base a plan on yet (no goal answered).
 */
export function makeGuidedDraft(profile) {
  if (!profile?.goal) return null
  const routine = getRoutine(profile)
  const label = getGoalLabel(profile)

  const steps = [
    ...routine.morning.map((s) => `Morning · ${s}`),
    ...routine.evening.map((s) => `Evening · ${s}`),
  ]

  const noteBits = [`Tailored to your goal (${label.toLowerCase()}) and your ${routine.minutes}-minute window.`]
  if (routine.skinAddons?.length) noteBits.push(routine.skinAddons.join(' '))
  if (routine.quote) noteBits.push(`“${routine.quote}”`)

  return {
    ...emptyPlan(),
    title: `My ${label.toLowerCase()} plan`,
    category: GOAL_TO_CATEGORY[profile.goal] || 'wellness',
    steps: steps.length ? steps : [''],
    products: [''],
    notes: noteBits.join(' '),
    source: 'guided',
  }
}

/**
 * Draft a plan from a CATEGORY blueprint (e.g. "Beauty Plan" → the makeup-prep
 * steps, including the masking/primer-layer tip). Lightly personalised: for
 * skincare/beauty we fold in the user's skin-type guidance when we have it.
 */
export function makeBlueprintDraft(categoryValue, profile = {}) {
  const bp = getBlueprint(categoryValue)
  if (!bp) return null

  const notes = [bp.tip]
  if ((categoryValue === 'skincare_routine' || categoryValue === 'beauty_plan') && profile.skinType) {
    const sp = getSkinPlan(profile)
    if (sp?.lookFor?.length) notes.push(`For your ${sp.label.toLowerCase()}, look for ${sp.lookFor.join(', ')}.`)
    if (sp?.avoid?.length) notes.push(`Avoid ${sp.avoid.join(', ')}.`)
  }

  return {
    ...emptyPlan(),
    title: `My ${categoryLabel(categoryValue).toLowerCase()}`,
    category: categoryValue,
    steps: [...bp.steps],
    products: [...bp.products],
    notes: notes.join(' '),
    source: 'guided',
  }
}

// Stash a plan as a Community draft and let the Community tab pick it up.
const COMMUNITY_DRAFT_KEY = 'quill.community.draft'
export function stashCommunityDraft(plan) {
  try {
    localStorage.setItem(COMMUNITY_DRAFT_KEY, JSON.stringify({
      title: plan.title,
      category: plan.category,
      description: plan.notes || '',
      steps: (plan.steps || []).filter(Boolean),
      products: (plan.products || []).filter(Boolean),
      media: Array.isArray(plan.media) ? plan.media : [],
    }))
  } catch {}
}
export function takeCommunityDraft() {
  try {
    const raw = localStorage.getItem(COMMUNITY_DRAFT_KEY)
    if (!raw) return null
    localStorage.removeItem(COMMUNITY_DRAFT_KEY)
    return JSON.parse(raw)
  } catch { return null }
}
