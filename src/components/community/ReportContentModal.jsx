import { useState, useEffect } from 'react'

// ─── Report a post or a profile ───────────────────────────────────────────
const REASONS = [
  'Sexual or explicit content',
  'Violence or self-harm',
  'Hate or harassment',
  'Spam or scam',
  'Misleading health claim',
  'Not related to wellness/beauty',
  'Something else',
]

export default function ReportContentModal({ target, onClose, onSubmit }) {
  // target: { kind: 'post'|'user', label: string }
  const [reason, setReason] = useState(REASONS[0])
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true); setError('')
    const res = await onSubmit({ reason, details })
    setSubmitting(false)
    if (res?.error) { setError(res.error.message || 'Could not send your report.'); return }
    setDone(true)
    setTimeout(onClose, 1600)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      role="dialog" aria-modal="true" aria-label="Report content"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-cream-light border border-ink/15 shadow-soft-lg rounded-t-2xl sm:rounded-lg p-6 sm:p-7 animate-sheet-up">
        {done ? (
          <div className="text-center py-6">
            <p className="font-display text-2xl text-ink">Thank you.</p>
            <p className="text-ink-soft mt-2 text-sm">Our team will review this {target.kind}.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="editorial-label text-clay">Report {target.kind}</p>
            <h2 className="font-display text-2xl text-ink mt-1 leading-tight">{target.label}</h2>
            <p className="text-sm text-ink-soft mt-2 leading-relaxed">
              Reports are confidential. Content with several reports is hidden automatically while we review it.
            </p>

            <fieldset className="mt-5 space-y-2">
              <legend className="editorial-label mb-2">Why are you reporting this?</legend>
              {REASONS.map((r) => (
                <label key={r} className={`flex items-center gap-3 px-3 py-2.5 border cursor-pointer transition-colors ${
                  reason === r ? 'border-ink bg-bone' : 'border-ink/15 hover:border-ink/30'
                }`}>
                  <input type="radio" name="reason" value={r} checked={reason === r}
                    onChange={() => setReason(r)} className="accent-clay" />
                  <span className="text-sm text-ink">{r}</span>
                </label>
              ))}
            </fieldset>

            <label className="block mt-4">
              <span className="editorial-label">Details (optional)</span>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3}
                placeholder="Anything that helps us understand…"
                className="mt-2 w-full border border-ink/20 bg-cream px-3 py-2 text-sm text-ink placeholder:text-ink-softer outline-none focus:border-ink transition-colors resize-none" />
            </label>

            {error && <p className="text-sm text-clay mt-3">{error}</p>}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-clay disabled:opacity-50">
                {submitting ? 'Sending…' : 'Submit report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
