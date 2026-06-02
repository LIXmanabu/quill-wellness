import { useState, useEffect } from 'react'

/**
 * Inline two-step confirm. Replaces window.confirm() so destructive actions
 * stay in the editorial tone instead of a system dialog. Each instance owns
 * its armed state and auto-disarms after a few seconds.
 *
 * Usage:
 *   <ConfirmButton onConfirm={doIt} question="Delete all?" confirm="Delete"
 *     className="...">clear all data</ConfirmButton>
 */
export default function ConfirmButton({
  onConfirm,
  question = 'Sure?',
  confirm: confirmLabel = 'Yes',
  className = '',
  armedClassName = '',
  children,
  ...rest
}) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 4000)
    return () => clearTimeout(t)
  }, [armed])

  if (!armed) {
    return (
      <button type="button" className={className} onClick={() => setArmed(true)} {...rest}>
        {children}
      </button>
    )
  }

  return (
    <span className={`inline-flex items-center gap-2 ${armedClassName}`}>
      <span className="text-xs text-ink-soft">{question}</span>
      <button
        type="button"
        onClick={() => { setArmed(false); onConfirm?.() }}
        className="text-xs font-semibold text-rust hover:text-clay-dark transition-colors link-underline"
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="text-xs text-ink-softer hover:text-ink transition-colors"
      >
        Cancel
      </button>
    </span>
  )
}
