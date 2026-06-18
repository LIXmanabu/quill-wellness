import { useState } from 'react'
import { usePro, validateTesterCode } from '../context/ProContext.jsx'

/* ─────────────────────────────────────────────────────────────────────────
   TesterCodeEntry — a small "Have a tester code?" box that lives next to the
   Free plan. Beta testers stay on the free version, so this is where they put
   the code you give them (the same code as the ?tester=… invite link). It
   validates against Supabase via validateTesterCode and, on success, flags
   this device as a tester — no purchase, no card. Already a tester? It just
   shows a confirmation instead of the form.
   ──────────────────────────────────────────────────────────────────────── */
export default function TesterCodeEntry() {
  const { isTester, setTester, betaActive } = usePro()
  const [open, setOpen]   = useState(false)
  const [code, setCode]   = useState('')
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState(false)
  const [done, setDone]   = useState(false)

  async function submit(e) {
    e.preventDefault()
    const entered = code.trim()
    if (!entered) return
    setBusy(true); setError(false)
    const ok = await validateTesterCode(entered)
    setBusy(false)
    if (ok) {
      setTester(true)
      setDone(true)
      setCode('')
    } else {
      setError(true)
    }
  }

  // Beta period is over → no code entry at all.
  if (!betaActive) return null

  // Already redeemed (this session or a previous one) → quiet confirmation.
  if (isTester || done) {
    return (
      <p className="mt-3 text-center text-xs text-sage-dark">
        ✓ Beta tester access is on. Thanks for testing Quill.
      </p>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full text-center text-xs text-ink-softer hover:text-ink transition-colors underline underline-offset-4 decoration-ink/20"
      >
        Have a tester code?
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="mt-3">
      <label className="editorial-label text-clay block mb-1.5">Tester code</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(false) }}
          placeholder="e.g. sarah-2026"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-invalid={error}
          className={`flex-1 min-w-0 border bg-cream px-3 py-2 text-sm font-sans text-ink placeholder:text-ink-softer outline-none transition-colors ${
            error ? 'border-clay focus:border-clay' : 'border-ink/20 focus:border-ink'
          }`}
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="px-4 py-2 bg-ink text-cream text-sm font-medium hover:bg-clay transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? '…' : 'Unlock'}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-clay-dark">
          That code didn't work. Check it with whoever invited you.
        </p>
      )}
    </form>
  )
}
