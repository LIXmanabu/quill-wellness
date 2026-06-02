import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// ─── Auth modal ───────────────────────────────────────────────────────
// Local-only accounts. Three views: welcome → sign-up or sign-in.
// "Continue as guest" is always available. Nothing leaves the device.
export default function AuthModal({ onGuest }) {
  const { signIn, signUp } = useAuth()

  const [view,     setView]     = useState('welcome')   // 'welcome' | 'signin' | 'signup'
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [busy,     setBusy]     = useState(false)
  const [error,    setError]    = useState('')

  function go(next) { setError(''); setView(next) }

  async function handleSignIn(e) {
    e.preventDefault(); setBusy(true); setError('')
    const { error } = await signIn(email, password)
    if (error) setError(error.message)   // success → App closes the modal
    setBusy(false)
  }

  async function handleSignUp(e) {
    e.preventDefault(); setBusy(true); setError('')
    const { error } = await signUp(email, password, name)
    if (error) setError(error.message)   // success → App closes the modal
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cream/95 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-cream-light border border-ink/15 p-8 sm:p-10">

        {/* ── Welcome ───────────────────────────────────────── */}
        {view === 'welcome' && (
          <>
            <p className="editorial-label text-clay mb-2">Quill</p>
            <h2 className="font-display text-4xl text-ink leading-tight mb-3">
              Your wellness,<br />
              <span className="display-italic text-clay">remembered.</span>
            </h2>
            <p className="text-sm text-ink-soft mb-8 leading-relaxed max-w-xs">
              Make a free account and Quill will remember you — your routine, favorites, and progress are here every time you return.
            </p>

            <div className="space-y-3">
              <button onClick={() => go('signup')} className="btn-ink w-full">
                Create free account
              </button>
              <button
                onClick={() => go('signin')}
                className="w-full border border-ink/20 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-ink hover:bg-cream-dark transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={onGuest}
                className="w-full text-sm text-ink-softer hover:text-ink-soft transition-colors py-2 underline underline-offset-4 decoration-ink/20"
              >
                Continue as guest
              </button>
            </div>
          </>
        )}

        {/* ── Sign in ───────────────────────────────────────── */}
        {view === 'signin' && (
          <form onSubmit={handleSignIn}>
            <button type="button" onClick={() => go('welcome')}
              className="text-xs text-ink-soft mb-6 flex items-center gap-1 hover:text-ink transition-colors">
              ← Back
            </button>

            <h2 className="font-display text-3xl text-ink mb-6">Sign in</h2>

            {error && (
              <p className="text-xs text-clay-dark mb-4 bg-clay/10 px-3 py-2 border border-clay/20">{error}</p>
            )}

            <div className="space-y-3 mb-6">
              <input type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-ink/20 bg-cream px-4 py-2.5 text-sm font-sans text-ink placeholder:text-ink-softer outline-none focus:border-ink transition-colors" />
              <input type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="w-full border border-ink/20 bg-cream px-4 py-2.5 text-sm font-sans text-ink placeholder:text-ink-softer outline-none focus:border-ink transition-colors" />
            </div>

            <button type="submit" disabled={busy}
              className="btn-ink w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {busy ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="text-xs text-ink-softer mt-4 text-center">
              No account?{' '}
              <button type="button" onClick={() => go('signup')}
                className="underline underline-offset-2 hover:text-ink transition-colors">Create one</button>
            </p>
          </form>
        )}

        {/* ── Sign up ───────────────────────────────────────── */}
        {view === 'signup' && (
          <form onSubmit={handleSignUp}>
            <button type="button" onClick={() => go('welcome')}
              className="text-xs text-ink-soft mb-6 flex items-center gap-1 hover:text-ink transition-colors">
              ← Back
            </button>

            <h2 className="font-display text-3xl text-ink mb-6">Create account</h2>

            {error && (
              <p className="text-xs text-clay-dark mb-4 bg-clay/10 px-3 py-2 border border-clay/20">{error}</p>
            )}

            <div className="space-y-3 mb-6">
              <input type="text" placeholder="Your name (optional)" value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-ink/20 bg-cream px-4 py-2.5 text-sm font-sans text-ink placeholder:text-ink-softer outline-none focus:border-ink transition-colors" />
              <input type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-ink/20 bg-cream px-4 py-2.5 text-sm font-sans text-ink placeholder:text-ink-softer outline-none focus:border-ink transition-colors" />
              <input type="password" placeholder="Password — at least 6 characters" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full border border-ink/20 bg-cream px-4 py-2.5 text-sm font-sans text-ink placeholder:text-ink-softer outline-none focus:border-ink transition-colors" />
            </div>

            <button type="submit" disabled={busy}
              className="btn-ink w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {busy ? 'Creating account…' : 'Create free account'}
            </button>

            <p className="text-xs text-ink-softer mt-4 text-center">
              Already have one?{' '}
              <button type="button" onClick={() => go('signin')}
                className="underline underline-offset-2 hover:text-ink transition-colors">Sign in</button>
            </p>
          </form>
        )}

        {/* ── Local-only data notice (always visible) ─────────── */}
        <div className="mt-8 pt-5 border-t border-ink/10">
          <p className="text-[10px] leading-relaxed text-ink-softer">
            <span className="font-semibold text-ink-soft">This stays on your device.</span>{' '}
            Quill saves your account and progress only in this browser — nothing is sent to a
            server, nothing is collected, and no one else can see it. Clearing your browser
            data will erase your account.
          </p>
        </div>

      </div>
    </div>
  )
}
