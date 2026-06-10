import { useState } from 'react'
import { CATEGORIES } from '../../data/communityCategories.js'
import { VisibilityIcon } from './ui.jsx'
import MediaUploader, { pathsToCleanup } from './MediaUploader.jsx'
import { deleteMediaPaths } from '../../lib/communityMedia.js'
import { moderateText } from '../../lib/moderation.js'

const VIS_OPTIONS = [
  { value: 'public',  label: 'Public',  desc: 'Anyone in the community can see it' },
  { value: 'friends', label: 'Friends', desc: 'Only people you’ve accepted as friends' },
  { value: 'private', label: 'Only me', desc: 'A private plan, just for you' },
]

// ─── Create / share a routine ─────────────────────────────────────────────
// `initial` optionally pre-fills the form (e.g. when sharing a personal plan),
// including any media the plan already carried.
export default function CreateCommunityPostForm({ userId, onBack, onCreate, initial }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [category, setCategory] = useState(initial?.category || CATEGORIES[0].value)
  const [visibility, setVisibility] = useState('public')
  const [description, setDescription] = useState(initial?.description || '')
  const [steps, setSteps] = useState(initial?.steps?.length ? initial.steps : [''])
  const [products, setProducts] = useState(initial?.products?.length ? initial.products : [''])
  const [media, setMedia] = useState(initial?.media || [])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Media that arrived with the form (from a shared plan) belongs to the plan —
  // never delete it on cancel. Only media uploaded during THIS session is ours.
  const initialMedia = initial?.media || []

  const textVerdict = moderateText({ title, description, steps, products })
  const willReview = textVerdict.verdict === 'review'

  const setStep = (i, v) => setSteps((s) => s.map((x, idx) => (idx === i ? v : x)))
  const addStep = () => setSteps((s) => [...s, ''])
  const removeStep = (i) => setSteps((s) => (s.length > 1 ? s.filter((_, idx) => idx !== i) : s))
  const setProduct = (i, v) => setProducts((p) => p.map((x, idx) => (idx === i ? v : x)))
  const addProduct = () => setProducts((p) => [...p, ''])
  const removeProduct = (i) => setProducts((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p))

  // Delete media uploaded this session (not the plan's own) before leaving.
  async function cleanupNewMedia() {
    await deleteMediaPaths(pathsToCleanup(media, initialMedia))
  }
  async function handleBack() { await cleanupNewMedia(); onBack() }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Please add a title.'); return }
    const v = moderateText({ title, description, steps, products })
    if (v.verdict === 'block') { setError(v.reason); return }

    setSubmitting(true)
    try {
      const payload = {
        title, category, visibility, description,
        steps: steps.map((s) => s.trim()).filter(Boolean),
        products: products.map((p) => p.trim()).filter(Boolean),
        media,
      }
      const res = await onCreate(payload)
      if (res?.blocked) { setError(res.reason); await cleanupNewMedia() }
      else if (res?.error) { setError(res.error.message || 'Could not publish.'); await cleanupNewMedia() }
      // success → parent navigates away (keeps the media)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <button onClick={handleBack} className="btn-ghost mb-5">
        <span className="display-italic text-base">←</span> Back to community
      </button>

      <p className="editorial-label text-clay">Share with the community</p>
      <h1 className="font-display text-[clamp(2rem,7vw,3rem)] text-ink leading-[0.96] tracking-tight mt-2">
        Share a <span className="display-italic text-clay">routine</span>
      </h1>

      {initial && (
        <div className="card-clay p-4 mt-5 text-sm leading-relaxed">
          <p className="font-medium text-ink">From your plan — it’s all filled in.</p>
          <p className="text-ink-soft mt-1">Just choose who can see it below, tweak anything you like, and post.</p>
        </div>
      )}

      <form onSubmit={submit} className="mt-7 space-y-7">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90}
            placeholder="e.g. My 4-step glass-skin evening routine" className="input-line" />
        </Field>

        <Field label="Category">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button type="button" key={c.value} onClick={() => setCategory(c.value)}
                className={`chip transition-colors ${category === c.value ? 'chip-ink' : 'chip-cream hover:border-ink/40'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Who can see this?">
          <div className="grid sm:grid-cols-3 gap-2">
            {VIS_OPTIONS.map((o) => (
              <button type="button" key={o.value} onClick={() => setVisibility(o.value)}
                className={`text-left p-3 border transition-colors ${visibility === o.value ? 'border-ink bg-bone' : 'border-ink/15 hover:border-ink/30'}`}>
                <span className="flex items-center gap-1.5 font-medium text-ink text-sm">
                  <VisibilityIcon visibility={o.value} /> {o.label}
                </span>
                <span className="block text-xs text-ink-soft mt-1 leading-snug">{o.desc}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000}
            placeholder="What is this routine for? Who is it good for?" className="input-line resize-none" />
        </Field>

        <Field label="Step-by-step">
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
        </Field>

        <Field label="Products & tools (optional)">
          <div className="space-y-2">
            {products.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-clay/60 w-6 shrink-0 text-center">◦</span>
                <input value={p} onChange={(e) => setProduct(i, e.target.value)}
                  placeholder="e.g. Gentle foaming cleanser" className="input-line flex-1" />
                <button type="button" onClick={() => removeProduct(i)} aria-label="Remove product"
                  className="text-ink-softer hover:text-clay w-8 h-8 flex items-center justify-center shrink-0">✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addProduct} className="btn-ghost mt-2 text-clay">+ Add product</button>
        </Field>

        <Field label="Photos & video (optional)">
          <MediaUploader userId={userId} value={media} onChange={setMedia} />
        </Field>

        {/* Moderation notice */}
        <div className={`p-4 border text-sm leading-relaxed ${willReview ? 'card-gold' : 'card-bone'}`}>
          <p className="font-medium text-ink">
            {willReview ? 'This post will be checked before it appears publicly.' : 'Be kind and keep it wellness-related.'}
          </p>
          <p className="text-ink-soft mt-1">
            {willReview
              ? (textVerdict.reason || 'A moderator will take a quick look before this is public.')
              : 'Posts are community-moderated. Anything unsafe or off-topic can be reported and hidden.'}
          </p>
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={handleBack} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-clay disabled:opacity-50">
            {submitting ? 'Sharing…' : willReview ? 'Submit for review' : 'Share routine'} <span className="display-italic">→</span>
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <span className="editorial-label block mb-2.5">{label}</span>
      {children}
    </div>
  )
}
