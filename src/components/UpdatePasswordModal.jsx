import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

// ─── Set a new password ───────────────────────────────────────────────────
// Shown after the user clicks a "reset password" email link (the auth context
// flips `recovery` to true). They're temporarily signed in, so updateUser can
// set the new password.
export default function UpdatePasswordModal() {
  const { updatePassword, clearRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const checks = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const strong = checks.length && checks.letter && checks.number

  async function submit(e) {
    e.preventDefault()
    if (!strong) { setError('Please pick a stronger password (see below).'); return }
    setBusy(true); setError('')
    const { error } = await updatePassword(password)
    setBusy(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => clearRecovery(), 1800)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-cream/95 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-cream-light border border-ink/15 p-8 sm:p-10">
        {done ? (
          <div className="text-center py-4">
            <p className="editorial-label text-clay mb-2">All set</p>
            <h2 className="font-display text-3xl text-ink leading-tight">Password updated</h2>
            <p className="text-sm text-ink-soft mt-2">You’re signed in — enjoy Quill.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="editorial-label text-clay mb-2">Reset password</p>
            <h2 className="font-display text-3xl text-ink leading-tight mb-3">Choose a new password</h2>
            <p className="text-sm text-ink-soft mb-5 leading-relaxed">Pick something you’ll remember — at least 8 characters, with a letter and a number.</p>

            {error && <p className="text-xs text-clay-dark mb-4 bg-clay/10 px-3 py-2 border border-clay/20">{error}</p>}

            <input type="password" placeholder="New password" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password"
              className="w-full border border-ink/20 bg-cream px-4 py-2.5 text-sm font-sans text-ink placeholder:text-ink-softer outline-none focus:border-ink transition-colors" />

            {password.length > 0 && (
              <ul className="text-[11px] space-y-1 pt-2">
                {[['At least 8 characters', checks.length], ['A letter', checks.letter], ['A number', checks.number]].map(([label, ok]) => (
                  <li key={label} className={`flex items-center gap-1.5 ${ok ? 'text-sage-dark' : 'text-ink-softer'}`}>
                    <span>{ok ? '✓' : '○'}</span> {label}
                  </li>
                ))}
              </ul>
            )}

            <button type="submit" disabled={busy || !strong} className="btn-ink w-full mt-5 disabled:opacity-50 disabled:cursor-not-allowed">
              {busy ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
