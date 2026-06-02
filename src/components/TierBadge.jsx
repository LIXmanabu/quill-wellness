import { usePro } from '../context/ProContext.jsx'

/**
 * Shows "Pro" or "Max" depending on the user's tier. Both Pro and Max
 * subscribers see this badge on premium sections — but Max sees the
 * richer label so it never reads as if they're on a lesser plan.
 */
export default function TierBadge({ className = '' }) {
  const { isMax } = usePro()
  return <span className={`pro-badge ${className}`}>{isMax ? 'Max' : 'Pro'}</span>
}
