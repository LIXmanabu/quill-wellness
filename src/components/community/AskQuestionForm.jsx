import { useState } from 'react'

// ─── Ask a question (Q&A forum) ───────────────────────────────────────────
// A deliberately tiny composer: just a question + optional detail. It posts
// through the same createPost path as routines (so moderation applies), tagged
// kind:'question'. Answers and upvotes are handled by the existing comments and
// likes on the resulting post.
export default function AskQuestionForm({ onCreate, onBack }) {
  const [title, setTitle] = useState('')
  const [body, setBody]   = useState('')
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  const valid = title.trim().length >= 8

  async function submit(e) {
    e.preventDefault()
    if (!valid || busy) return
    setBusy(true); setError('')
    const res = await onCreate({
      title: title.trim(),
      description: body.trim(),
      category: 'question',
      kind: 'question',
      visibility: 'public',
      steps: [], products: [], media: [],
    })
    setBusy(false)
    if (res?.blocked) { setError(res.reason || 'That can’t be posted.'); return }
    if (res?.error)   { setError('Couldn’t post that. Try again.'); return }
    // success → the parent navigates to the feed
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <button onClick={onBack} className="btn-ghost mb-6"><span className="display-italic text-base">←</span> Back</button>

      <p className="editorial-label text-clay">Quill Q&amp;A</p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mt-1">Ask the community</h1>
      <p className="text-ink-soft mt-2 leading-relaxed">
        A clear question gets better answers. Anyone can reply, and the most helpful answers rise with upvotes.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-5">
        <div>
          <label className="editorial-label block mb-1.5">Your question</label>
          <input
            value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} autoFocus
            placeholder="e.g. How do I stop my moisturiser pilling under SPF?"
            className="input-line py-2.5 w-full" />
          <p className="text-[11px] text-ink-softer mt-1">
            {title.trim().length < 8 ? 'A few more words…' : `${140 - title.length} characters left`}
          </p>
        </div>

        <div>
          <label className="editorial-label block mb-1.5">
            Details <span className="text-ink-softer normal-case tracking-normal">· optional</span>
          </label>
          <textarea
            value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} rows={5}
            placeholder="Add context — what you've tried, your skin type, anything that helps people answer well."
            className="input-line py-2.5 w-full resize-y" />
        </div>

        {error && <p className="text-sm text-clay bg-clay/10 border border-clay/20 px-3 py-2">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={!valid || busy} className="btn-clay disabled:opacity-40">
            {busy ? 'Posting…' : 'Post question'}
          </button>
          <button type="button" onClick={onBack} className="btn-ghost text-ink-soft">Cancel</button>
        </div>
      </form>
    </div>
  )
}
