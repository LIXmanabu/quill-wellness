import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useUser } from '../context/UserContext.jsx'
import Reveal from './interactive/Reveal.jsx'
import MediaUploader, { pathsToCleanup } from './community/MediaUploader.jsx'
import { deleteMediaPaths } from '../lib/communityMedia.js'
import { CATEGORIES, categoryLabel, categoryAccent } from '../data/communityCategories.js'
import { getBlueprint } from '../data/blueprints.js'
import {
  loadPlans, savePlan, deletePlan, newBlankPlan, makeGuidedDraft, makeBlueprintDraft, stashCommunityDraft,
} from '../lib/plans.js'

// ─── "Your plans" — build a private routine, or have Quill draft one ──────
export default function PlansSection({ onNavigate }) {
  const { user } = useAuth()
  const { profile } = useUser()
  const [plans, setPlans] = useState([])
  const [editing, setEditing] = useState(null)   // plan object being edited, or null
  const [picking, setPicking] = useState(false)   // blueprint picker open?
  const [notice, setNotice] = useState('')

  useEffect(() => { setPlans(loadPlans(user)) }, [user?.id])

  function refresh() { setPlans(loadPlans(user)) }

  function startManual() { setEditing(newBlankPlan()) }
  function chooseBlueprint(categoryValue) {
    setPicking(false)
    setEditing(makeBlueprintDraft(categoryValue, profile))
  }
  function chooseTailored() {
    const draft = makeGuidedDraft(profile)
    setPicking(false)
    if (!draft) {
      setNotice('Tell us your goal first — take the quick quiz and a tailored plan will be ready here.')
      setTimeout(() => setNotice(''), 4000)
      return
    }
    setEditing(draft)
  }
  function editPlan(p) { setEditing({ ...p, steps: p.steps.length ? p.steps : [''], products: p.products.length ? p.products : [''] }) }

  function handleSave(plan) { savePlan(user, plan); refresh(); setEditing(null) }
  function handleDelete(id) { deletePlan(user, id); refresh() }
  function handleShare(plan) {
    // Sharing posts to the Community, which needs a signed-in account. Guests
    // keep their plan locally — nudge them to make a free account rather than
    // dropping them into a post form they can't submit.
    if (!user?.id) {
      setNotice('Create a free account to share to the Community — your plan stays saved here meanwhile.')
      setTimeout(() => setNotice(''), 5000)
      return
    }
    stashCommunityDraft(plan)
    onNavigate?.('community')
  }
  function handleSaveAndShare(plan) {
    const saved = savePlan(user, plan)
    refresh(); setEditing(null)
    handleShare(saved)
  }

  if (editing) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PlanEditor plan={editing} userId={user?.id} onSave={handleSave} onSaveAndShare={handleSaveAndShare} onCancel={() => setEditing(null)} />
      </section>
    )
  }

  if (picking) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlueprintPicker profile={profile} onPick={chooseBlueprint} onTailored={chooseTailored} onCancel={() => setPicking(false)} />
      </section>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Reveal>
        <div className="mb-8 pb-4 border-b border-ink/15 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="editorial-label">Your plans</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              Make it <span className="display-italic text-clay">yours.</span>
            </h2>
            <p className="text-sm text-ink-soft mt-3 max-w-xl">
              Build your own routine step by step, or let Quill draft one from what you told us. Plans are private to you — share one to the Community whenever you like.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setPicking(true)} className="btn-clay" data-cursor-label="blueprints">
              <span className="display-italic">✦</span> Make a guided plan
            </button>
            <button onClick={startManual} className="btn-cream">+ New plan</button>
          </div>
        </div>
      </Reveal>

      {notice && <p className="text-sm text-gold-dark mb-4 display-italic">{notice}</p>}

      {plans.length === 0 ? (
        <Reveal>
          <div className="card-bone p-10 sm:p-14 text-center">
            <span className="editorial-num text-6xl text-clay/30">❖</span>
            <p className="font-display text-2xl sm:text-3xl text-ink mt-3">No plans yet</p>
            <p className="text-sm text-ink-soft mt-2 max-w-sm mx-auto leading-relaxed">
              Start from scratch, or tap <span className="text-clay font-medium">Make a guided plan</span> and Quill will draft one tailored to your goal — then you edit it freely.
            </p>
          </div>
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 6) * 50} className="h-full">
              <PlanCard plan={p} onEdit={() => editPlan(p)} onDelete={() => handleDelete(p.id)} onShare={() => handleShare(p)} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}

function PlanCard({ plan, onEdit, onDelete, onShare }) {
  const [confirmDel, setConfirmDel] = useState(false)
  const cover = (plan.media || [])[0]
  return (
    <div className="card-paper card-paper-hover p-6 h-full flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className="chip chip-cream text-[10px] py-0.5">{categoryLabel(plan.category)}</span>
        {plan.source === 'guided' && <span className="editorial-label text-clay">✦ Guided</span>}
      </div>
      {cover && (
        <div className="mt-3 -mx-1 rounded-sm overflow-hidden bg-ink/5 aspect-[16/9] relative">
          {cover.type === 'video'
            ? <video src={cover.url} className="w-full h-full object-cover" muted />
            : <img src={cover.url} alt="" className="w-full h-full object-cover" />}
          {(plan.media.length > 1 || cover.type === 'video') && (
            <span className="absolute bottom-1.5 right-1.5 chip bg-ink/70 text-cream border-transparent text-[10px] py-0.5">
              {cover.type === 'video' ? '▶ video' : `${plan.media.length} photos`}
            </span>
          )}
        </div>
      )}
      <h3 className="font-display text-2xl text-ink mt-3 leading-tight">{plan.title}</h3>
      {plan.notes && <p className="text-sm text-ink-soft mt-2 leading-relaxed line-clamp-2">{plan.notes}</p>}

      <ol className="mt-4 space-y-1.5 flex-1">
        {plan.steps.slice(0, 4).map((s, i) => (
          <li key={i} className="flex items-baseline gap-2.5 text-sm text-ink leading-snug">
            <span className="num-display text-xs text-clay w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
            <span className="line-clamp-1">{s}</span>
          </li>
        ))}
        {plan.steps.length > 4 && <li className="text-xs text-ink-softer pl-7 italic">+ {plan.steps.length - 4} more</li>}
      </ol>

      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-ink/10">
        <button onClick={onEdit} className="btn-ghost text-clay text-sm">Open &amp; edit</button>
        <button onClick={onShare} title="Share this plan to the Community"
          className="btn-ghost text-ink-soft hover:text-ink text-sm">Share to Community ↗</button>
        {confirmDel ? (
          <button onClick={onDelete} className="btn-ghost text-clay text-sm ml-auto">Confirm?</button>
        ) : (
          <button onClick={() => { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000) }}
            className="btn-ghost text-ink-softer hover:text-clay text-sm ml-auto">Delete</button>
        )}
      </div>
    </div>
  )
}

// ─── Blueprint picker — choose what to base a guided plan on ──────────────
function BlueprintPicker({ profile, onPick, onTailored, onCancel }) {
  const tailoredAvailable = !!profile?.goal
  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onCancel} className="btn-ghost mb-5"><span className="display-italic text-base">←</span> Back to plans</button>
      <span className="editorial-label text-clay">Start from a blueprint</span>
      <h2 className="font-display text-4xl sm:text-5xl text-ink leading-[0.98] mt-2">
        Pick a <span className="display-italic text-clay">starting point.</span>
      </h2>
      <p className="text-sm text-ink-soft mt-3 max-w-xl leading-relaxed">
        Each blueprint knows its craft — the right order, and the tips people miss (like a hydrating layer under makeup). Pick one and edit it to make it yours.
      </p>

      {tailoredAvailable && (
        <button onClick={onTailored}
          className="mt-7 w-full text-left card-clay p-6 hover:opacity-90 transition-opacity flex items-center justify-between gap-4">
          <span>
            <span className="editorial-label text-clay-dark">✦ Tailored to you</span>
            <span className="block font-display text-2xl text-ink mt-1 leading-tight">Build it from your answers</span>
            <span className="block text-sm text-ink-soft mt-1">Uses your goal{profile.skinType ? ' and skin type' : ''} and the time you have.</span>
          </span>
          <span className="display-italic text-3xl text-ink-softer">→</span>
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
        {CATEGORIES.map((c) => {
          const bp = getBlueprint(c.value)
          if (!bp) return null
          return (
            <button key={c.value} onClick={() => onPick(c.value)}
              className={`text-left card-${categoryAccent(c.value)} p-5 hover:opacity-90 transition-opacity h-full flex flex-col`}>
              <span className="editorial-label text-ink-soft">{bp.blurb}</span>
              <span className="block font-display text-2xl text-ink mt-1 leading-tight">{c.label}</span>
              <span className="block text-sm text-ink-soft mt-2 leading-relaxed flex-1">{bp.tip}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-clay mt-4">
                Use this blueprint <span className="display-italic">→</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── The plan editor (used for both manual + guided drafts) ───────────────
function PlanEditor({ plan, userId, onSave, onSaveAndShare, onCancel }) {
  const [title, setTitle] = useState(plan.title)
  const [category, setCategory] = useState(plan.category)
  const [steps, setSteps] = useState(plan.steps.length ? plan.steps : [''])
  const [products, setProducts] = useState(plan.products.length ? plan.products : [''])
  const [media, setMedia] = useState(plan.media || [])
  const [notes, setNotes] = useState(plan.notes)

  const initialMedia = plan.media || []

  const setStep = (i, v) => setSteps((s) => s.map((x, idx) => (idx === i ? v : x)))
  const addStep = () => setSteps((s) => [...s, ''])
  const removeStep = (i) => setSteps((s) => (s.length > 1 ? s.filter((_, idx) => idx !== i) : ['']))
  const setProduct = (i, v) => setProducts((p) => p.map((x, idx) => (idx === i ? v : x)))
  const addProduct = () => setProducts((p) => [...p, ''])
  const removeProduct = (i) => setProducts((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : ['']))

  // Load the chosen category's blueprint into the steps/products/notes, so the
  // category genuinely shapes the suggestions (e.g. Beauty → the masking layer).
  function loadBlueprint() {
    const bp = getBlueprint(category)
    if (!bp) return
    const hasContent = steps.some((s) => s.trim())
    if (hasContent && !window.confirm(`Replace the current steps with the ${categoryLabel(category)} blueprint?`)) return
    setSteps([...bp.steps])
    setProducts([...bp.products])
    setNotes((n) => (n?.trim() ? `${bp.tip}\n\n${n}` : bp.tip))
  }

  async function commit() {
    // A removed pre-existing file should be deleted from storage.
    await deleteMediaPaths(pathsToCleanup(initialMedia, media))
    return { ...plan, title, category, steps, products, media, notes }
  }
  async function save() { onSave(await commit()) }
  async function saveAndShare() { onSaveAndShare(await commit()) }
  async function cancel() {
    // Media uploaded this session but not saved → clean up.
    await deleteMediaPaths(pathsToCleanup(media, initialMedia))
    onCancel()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={cancel} className="btn-ghost mb-5"><span className="display-italic text-base">←</span> Back to plans</button>
      <span className="editorial-label text-clay">{plan.source === 'guided' ? 'Guided draft · edit freely' : 'New plan'}</span>
      <h2 className="font-display text-4xl sm:text-5xl text-ink leading-[0.98] mt-2">
        {plan.source === 'guided' ? 'Quill drafted this' : 'Build your plan'}
        <span className="display-italic text-clay">.</span>
      </h2>
      {plan.source === 'guided' && (
        <p className="text-sm text-ink-soft mt-3 max-w-lg leading-relaxed">
          Based on what you told us. Change anything — add steps, swap products, rename it. It’s yours.
        </p>
      )}

      <div className="mt-7 space-y-7">
        <div>
          <span className="editorial-label block mb-2.5">Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90}
            placeholder="e.g. My calm evening wind-down" className="input-line" />
        </div>

        <div>
          <span className="editorial-label block mb-2.5">Category</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button type="button" key={c.value} onClick={() => setCategory(c.value)}
                className={`chip transition-colors ${category === c.value ? 'chip-ink' : 'chip-cream hover:border-ink/40'}`}>
                {c.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={loadBlueprint} className="btn-ghost text-clay text-sm mt-3">
            <span className="display-italic">✦</span> Use the {categoryLabel(category)} blueprint
          </button>
        </div>

        <div>
          <span className="editorial-label block mb-2.5">Steps</span>
          <div className="space-y-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="num-display text-clay text-sm w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <input value={s} onChange={(e) => setStep(i, e.target.value)} placeholder={`Step ${i + 1}`} className="input-line flex-1" />
                <button type="button" onClick={() => removeStep(i)} aria-label="Remove step"
                  className="text-ink-softer hover:text-clay w-8 h-8 flex items-center justify-center shrink-0">✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addStep} className="btn-ghost mt-2 text-clay">+ Add step</button>
        </div>

        <div>
          <span className="editorial-label block mb-2.5">Products &amp; tools (optional)</span>
          <div className="space-y-2">
            {products.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-clay/60 w-6 shrink-0 text-center">◦</span>
                <input value={p} onChange={(e) => setProduct(i, e.target.value)} placeholder="e.g. Vitamin C serum" className="input-line flex-1" />
                <button type="button" onClick={() => removeProduct(i)} aria-label="Remove product"
                  className="text-ink-softer hover:text-clay w-8 h-8 flex items-center justify-center shrink-0">✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addProduct} className="btn-ghost mt-2 text-clay">+ Add product</button>
        </div>

        <div>
          <span className="editorial-label block mb-2.5">Photos &amp; video (optional)</span>
          <MediaUploader userId={userId} value={media} onChange={setMedia} />
        </div>

        <div>
          <span className="editorial-label block mb-2.5">Notes (optional)</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={1000}
            placeholder="Why this plan, reminders to yourself…" className="input-line resize-none" />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 flex-wrap">
          <button type="button" onClick={cancel} className="btn-ghost">Cancel</button>
          <button type="button" onClick={saveAndShare} className="btn-cream" title="Save this plan and share it to the Community">
            Save &amp; share to Community ↗
          </button>
          <button type="button" onClick={save} className="btn-clay">Save plan <span className="display-italic">→</span></button>
        </div>
      </div>
    </div>
  )
}
