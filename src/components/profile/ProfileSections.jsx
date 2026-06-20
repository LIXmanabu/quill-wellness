import { useState } from 'react'
import { CategoryBadge, VisibilityIcon } from '../community/ui.jsx'
import BadgeCase from '../community/BadgeCase.jsx'
import { LIKE_BADGES, badgeForLikes } from '../../lib/badges.js'

// ─── Profile-modal building blocks ────────────────────────────────────────
// Pure presentational pieces for the Profile Overview modal. They take plain
// props (real Supabase data or demo data — identical shape) so the modal shell
// stays small. Brand-consistent: cream/bone cards, clay/gold/sage accents.

const nf = (n) => (n || 0).toLocaleString('en-GB')

// "Quill Glow" — Quill's reputation card. Glow IS the total community love a
// member's routines have earned; the bar tracks progress to the next medal.
export function GlowScoreCard({ score, toNext, nextLabel, helper }) {
  // How far along the current tier the score sits, for the bar fill.
  const pct = toNext > 0
    ? Math.max(6, Math.min(94, Math.round((score / (score + toNext)) * 100)))
    : 100
  return (
    <div className="card-paper p-5 sm:p-6 relative overflow-hidden">
      <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-gold/10 blur-2xl" aria-hidden="true" />
      <div className="relative">
        <span className="editorial-label text-clay">Quill Glow</span>
        <p className="text-sm text-ink-soft mt-0.5">Your community reputation</p>
        <p className="num-display text-5xl text-ink mt-3 leading-none">{nf(score)}</p>
        <p className="text-xs text-ink-softer mt-2">
          {toNext > 0
            ? `${nf(toNext)} glow points until your ${nextLabel}`
            : 'You’ve reached the top tier — Ultra Rare.'}
        </p>
        <div className="mt-3 h-2 rounded-full bg-ink/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-clay to-gold transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-ink-softer mt-2.5">{helper}</p>
      </div>
    </div>
  )
}

export function StatsGrid({ stats, onStat }) {
  const items = [
    { id: 'glow', label: 'Quill Glow', value: stats.glow },
    { id: 'likes', label: 'Total likes', value: stats.likes },
    { id: 'shared', label: 'Shared plans', value: stats.sharedPlans },
    { id: 'saved', label: 'Saved plans', value: stats.savedPlans },
    { id: 'friends', label: 'Friends', value: stats.friends },
    { id: 'badges', label: 'Badges', value: stats.badges },
  ]
  // Only the cells that lead somewhere are tappable.
  const clickable = new Set(['shared', 'saved', 'friends', 'badges'])
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {items.map((it) => {
        const Tag = onStat && clickable.has(it.id) ? 'button' : 'div'
        return (
          <Tag
            key={it.id}
            onClick={Tag === 'button' ? () => onStat(it.id) : undefined}
            className={`card-bone p-3 text-center w-full ${Tag === 'button' ? 'hover:border-clay/40 border border-transparent transition-colors' : ''}`}
          >
            <p className="num-display text-2xl text-ink leading-none">{nf(it.value)}</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-softer mt-1.5 leading-tight">{it.label}</p>
          </Tag>
        )
      })}
    </div>
  )
}

const STATUS_STYLES = {
  Trending:        'bg-clay/15 text-clay-dark',
  'Saved by many': 'bg-gold/20 text-gold-dark',
  New:             'bg-sage/20 text-sage-dark',
  Draft:           'bg-ink/10 text-ink-soft',
  Saved:           'bg-gold/20 text-gold-dark',
}

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function PlanCard({ plan, onOpen }) {
  const cover = Array.isArray(plan.media) && plan.media[0]
  return (
    <button
      onClick={onOpen}
      className="card-bone text-left p-0 overflow-hidden hover:border-clay/40 border border-transparent transition-colors w-full group"
    >
      <div className="h-24 bg-clay/10 relative flex items-center justify-center overflow-hidden">
        {cover
          ? <img src={cover.url} alt="" className="w-full h-full object-cover" loading="lazy" />
          : <span className="display-italic text-3xl text-clay/30">❀</span>}
        {plan.status && (
          <span className={`absolute top-2 left-2 chip text-[10px] py-0.5 border-transparent ${STATUS_STYLES[plan.status] || 'bg-ink/10 text-ink-soft'}`}>
            {plan.status}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={plan.category} />
          <VisibilityIcon visibility={plan.visibility} />
        </div>
        <h4 className="font-display text-lg text-ink leading-snug mt-2 group-hover:text-clay transition-colors">{plan.title}</h4>
        {plan.description && <p className="text-xs text-ink-soft mt-1 line-clamp-2 leading-relaxed">{plan.description}</p>}
        <div className="flex items-center gap-3.5 mt-3 text-[11px] text-ink-softer">
          <span>♥ {nf(plan.likesCount)}</span>
          <span>⤓ {nf(plan.savesCount)}</span>
          <span>💬 {nf(plan.commentsCount)}</span>
          <span className="ml-auto">{fmtDate(plan.createdAt)}</span>
        </div>
      </div>
    </button>
  )
}

export function SavedPlanCard({ plan, onOpen }) {
  return (
    <div className="card-bone p-3.5 flex items-start gap-3">
      <span className="display-italic text-2xl text-clay/30 shrink-0 mt-0.5">❀</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={plan.category} />
          <span className="text-[11px] text-ink-softer">saved {fmtDate(plan.savedAt)}</span>
        </div>
        <h4 className="font-display text-lg text-ink leading-snug mt-1.5 truncate">{plan.title}</h4>
        <p className="text-[11px] text-ink-softer">by @{plan.author?.username || 'someone'}</p>
        {plan.description && <p className="text-xs text-ink-soft mt-1 line-clamp-2 leading-relaxed">{plan.description}</p>}
      </div>
      <button onClick={onOpen} className="btn-ghost text-xs shrink-0 self-center">Open</button>
    </div>
  )
}

const ACTIVITY_ICON = {
  likes: '♥', save: '⤓', comment: '💬', badge: '✦', trending: '↗', friend: '+',
}

export function ActivityTimeline({ items }) {
  if (!items.length) return <Empty>Your community activity will appear here as your plans get love.</Empty>
  return (
    <ol className="relative pl-5">
      <span className="absolute left-[7px] top-1 bottom-1 w-px bg-ink/12" aria-hidden="true" />
      {items.map((a) => (
        <li key={a.id} className="relative pb-4 last:pb-0">
          <span className="absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full bg-clay/15 text-clay flex items-center justify-center text-[8px] leading-none">
            {ACTIVITY_ICON[a.kind] || '•'}
          </span>
          <p className="text-sm text-ink leading-snug">{a.text}</p>
          <p className="text-[11px] text-ink-softer mt-0.5">{a.at}</p>
        </li>
      ))}
    </ol>
  )
}

export function BadgesSection({ totalLikes, isSelf, isAdmin, override, onSetOverride, onCreatePlan }) {
  const earned = badgeForLikes(totalLikes)
  return (
    <div className="space-y-4">
      <div>
        <span className="editorial-label text-clay">Badge collection</span>
        <p className="text-sm text-ink-soft mt-0.5">Celebrate the milestones your shared plans have reached.</p>
      </div>
      <BadgeCase totalLikes={totalLikes} isSelf={isSelf} isAdmin={isAdmin} override={override} onSetOverride={onSetOverride} />
      {!earned && (
        <Empty action={onCreatePlan ? { label: 'Share a plan', onClick: onCreatePlan } : null}>
          Your first badge is waiting. Share a plan to begin your Quill journey.
        </Empty>
      )}
      <div className="space-y-2">
        {LIKE_BADGES.map((b) => {
          const got = (totalLikes || 0) >= b.min
          return (
            <div key={b.key} className={`card-bone p-3 flex items-center gap-3 ${got ? '' : 'opacity-70'}`}>
              <img
                src={`${import.meta.env.BASE_URL}badges/${b.img}`}
                alt=""
                className={`h-10 w-auto rounded ${got ? 'shadow-soft' : 'grayscale opacity-50'}`}
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold uppercase tracking-[0.12em] text-xs" style={got ? { color: b.accent } : undefined}>{b.label}</p>
                <p className="text-xs text-ink-soft">Earned at {nf(b.min)} likes</p>
              </div>
              <span className={`chip text-[10px] py-0.5 border-transparent ${got ? 'bg-sage/20 text-sage-dark' : 'bg-ink/10 text-ink-soft'}`}>
                {got ? 'Earned' : 'Locked'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Settings / privacy ─────────────────────────────────────────────────────
// Edit Profile (name + bio) writes through to Supabase via onSave when signed
// in. The privacy toggles persist locally for now (clean integration point —
// they'd map onto a future `profiles` visibility/preference columns).

const PREFS_KEY = 'quill.profilePrefs'
export function loadPrefs() {
  try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') } }
  catch { return { ...DEFAULT_PREFS } }
}
const DEFAULT_PREFS = {
  visibility: 'public',
  showBadges: true,
  showSaved: false,
  allowRequests: true,
  allowComments: true,
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-3 py-2.5 text-left"
    >
      <span className="min-w-0">
        <span className="text-sm text-ink block">{label}</span>
        {hint && <span className="text-[11px] text-ink-softer block leading-snug">{hint}</span>}
      </span>
      <span className={`shrink-0 w-10 h-6 rounded-full transition-colors relative ${checked ? 'bg-clay' : 'bg-ink/20'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-cream shadow-soft transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

const PATCH_KEY = {
  visibility: 'profileVisibility', showBadges: 'showBadges', showSaved: 'showSaved',
  allowRequests: 'allowRequests', allowComments: 'allowComments',
}

export function SettingsPanel({ profile, prefs: prefsProp, email, isDemo, onSaveProfile, onSavePrefs, onLogout }) {
  // Real prefs from the DB when available; localStorage only as a demo/offline
  // fallback (or before profile_privacy.sql has been run).
  const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_PREFS, ...loadPrefs(), ...(prefsProp || {}) }))
  const [name, setName] = useState(profile.displayName || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function setPref(key, val) {
    const next = { ...prefs, [key]: val }
    setPrefs(next)
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)) } catch {}
    if (!isDemo && onSavePrefs && PATCH_KEY[key]) onSavePrefs({ [PATCH_KEY[key]]: val })
  }

  async function saveProfile() {
    if (isDemo || !onSaveProfile) return
    setSaving(true)
    await onSaveProfile({ display_name: name.trim(), bio: bio.trim() })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const VIS = [['public', 'Public'], ['friends', 'Friends only'], ['private', 'Private']]

  return (
    <div className="space-y-5">
      {/* Edit profile */}
      <div className="card-bone p-4">
        <span className="editorial-label text-clay">Edit profile</span>
        <label className="block mt-3">
          <span className="text-[11px] uppercase tracking-[0.12em] text-ink-softer">Display name</span>
          <input className="input-line mt-1 w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>
        <label className="block mt-3">
          <span className="text-[11px] uppercase tracking-[0.12em] text-ink-softer">Bio</span>
          <textarea className="input-line mt-1 w-full resize-none" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A line about your glow…" />
        </label>
        <button onClick={saveProfile} disabled={saving || isDemo} className="btn-clay mt-3 disabled:opacity-50">
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
        </button>
        {isDemo && <p className="text-[11px] text-ink-softer mt-2">Sign in to edit your real profile.</p>}
      </div>

      {/* Privacy */}
      <div className="card-bone p-4">
        <span className="editorial-label text-clay">Privacy</span>
        <p className="text-[11px] text-ink-softer mt-0.5 mb-2">
          {isDemo ? 'Saved on this device for the demo.' : 'Synced to your account and enforced across devices.'}
        </p>
        <div className="mb-2">
          <span className="text-sm text-ink block mb-1.5">Profile visibility</span>
          <div className="flex gap-1.5">
            {VIS.map(([key, lbl]) => (
              <button
                key={key}
                onClick={() => setPref('visibility', key)}
                aria-pressed={prefs.visibility === key}
                className={`chip text-xs flex-1 justify-center ${prefs.visibility === key ? 'bg-ink text-cream border-ink' : 'chip-cream'}`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-ink/8">
          <Toggle label="Show badges publicly" checked={prefs.showBadges} onChange={(v) => setPref('showBadges', v)} />
          <Toggle label="Show saved plans publicly" checked={prefs.showSaved} onChange={(v) => setPref('showSaved', v)} />
          <Toggle label="Allow friend requests" checked={prefs.allowRequests} onChange={(v) => setPref('allowRequests', v)} />
          <Toggle label="Allow comments on my plans" checked={prefs.allowComments} onChange={(v) => setPref('allowComments', v)} />
        </div>
      </div>

      {/* Account */}
      <div className="card-bone p-4">
        <span className="editorial-label text-clay">Account</span>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-sm text-ink-soft">Connected email</span>
          <span className="text-sm text-ink truncate">{email || '—'}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onLogout} disabled={isDemo || !onLogout} className="btn-ghost disabled:opacity-50">Log out</button>
          <button
            onClick={() => alert('Account deletion isn’t wired up yet — reach out to support to deactivate.')}
            className="btn-ghost text-clay hover:text-clay-dark"
          >
            Deactivate / delete account
          </button>
        </div>
      </div>
    </div>
  )
}

export function Empty({ children, action }) {
  return (
    <div className="card-bone p-6 text-center">
      <p className="text-sm text-ink-soft leading-relaxed max-w-sm mx-auto">{children}</p>
      {action && (
        <button onClick={action.onClick} className="btn-clay mt-4">{action.label}</button>
      )}
    </div>
  )
}
