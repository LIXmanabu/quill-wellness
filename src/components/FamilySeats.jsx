import { useState, useEffect } from 'react'
import Reveal from './interactive/Reveal.jsx'
import SpotlightCard from './interactive/SpotlightCard.jsx'
import TierBadge from './TierBadge.jsx'
import ConfirmButton from './ConfirmButton.jsx'

const STORAGE_KEY = 'quill.family'
const MAX_SEATS = 4

const goalLabels = {
  glow: 'Glow & confidence',
  fitness: 'Move & feel strong',
  calm: 'Stress less, sleep better',
  body: 'Understand my body',
  eat: 'Eat smarter',
}

const relationships = ['Partner', 'Parent', 'Sibling', 'Child', 'Housemate', 'Friend']

// Seat colour palette — each member gets a distinct brand colour
const seatColors = ['#C8654A', '#5A6B5D', '#D4A744', '#9B4423']

function initials(name) {
  if (!name) return '·'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function daysAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime()
  const d = Math.floor(ms / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 7) return `${d} days ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  return `${Math.floor(d / 30)}mo ago`
}

export default function FamilySeats() {
  const [members, setMembers] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return []
  })
  const [addingIndex, setAddingIndex] = useState(null)
  const [form, setForm] = useState({ name: '', relationship: 'Partner', email: '', goal: 'glow' })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(members)) } catch {}
  }, [members])

  function openAdd(idx) {
    setAddingIndex(idx)
    setForm({ name: '', relationship: 'Partner', email: '', goal: 'glow' })
  }

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    const newMember = {
      id: `m-${Date.now()}`,
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    }
    setMembers((m) => [...m, newMember])
    setAddingIndex(null)
  }

  function remove(id) {
    setMembers((m) => m.filter((x) => x.id !== id))
  }

  const seats = Array.from({ length: MAX_SEATS }, (_, i) => members[i] || null)
  const used = members.length

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="family-seats">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15 flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="editorial-label flex items-center gap-2">
              Family seats <TierBadge />
            </span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              Practice <span className="display-italic text-clay">together.</span>
            </h2>
            <p className="text-sm text-ink-soft mt-3 max-w-xl">
              Quill Max includes four seats — one per household member, each with their own goal and routine. They get the full Pro experience under your plan.
            </p>
          </div>
          <div className="text-right">
            <p className="editorial-label">Seats used</p>
            <p className="num-display text-4xl text-clay mt-1 leading-none">{used}<span className="text-ink-softer text-lg"> / {MAX_SEATS}</span></p>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {seats.map((member, i) => (
          <Reveal key={i} delay={i * 60}>
            {member ? (
              <SpotlightCard className="bg-cream-light border border-ink/15 p-6 h-full flex flex-col group relative">
                <ConfirmButton
                  onConfirm={() => remove(member.id)}
                  question="Remove?"
                  confirm="Remove"
                  className="absolute top-3 right-3 text-[10px] text-ink-softer hover:text-clay opacity-0 group-hover:opacity-100 transition-all display-italic"
                  armedClassName="absolute top-3 right-3 bg-cream-light/95 px-1"
                  aria-label="Remove member"
                >
                  remove
                </ConfirmButton>
                {/* Initial avatar */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-display text-2xl text-cream mb-4"
                  style={{ background: seatColors[i % seatColors.length] }}
                >
                  {initials(member.name)}
                </div>
                <p className="font-display text-2xl text-ink leading-tight">{member.name}</p>
                <p className="editorial-label mt-1">{member.relationship}</p>
                <p className="display-italic text-sm text-clay mt-4">{goalLabels[member.goal] || 'No goal set'}</p>
                {member.email && (
                  <p className="text-xs text-ink-soft mt-2 truncate" title={member.email}>{member.email}</p>
                )}
                <div className="mt-auto pt-4 border-t border-ink/10 flex items-center justify-between text-[11px] text-ink-softer">
                  <span>Joined {daysAgo(member.joinedAt)}</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage" /> active
                  </span>
                </div>
              </SpotlightCard>
            ) : (
              <button
                onClick={() => openAdd(i)}
                className="w-full h-full min-h-[240px] border-2 border-dashed border-ink/20 hover:border-ink hover:bg-cream-light p-6 flex flex-col items-center justify-center text-center transition-all group"
                data-cursor-label="invite"
              >
                <span className="w-16 h-16 rounded-full border-2 border-dashed border-ink/30 group-hover:border-ink flex items-center justify-center text-2xl text-ink-softer group-hover:text-clay display-italic transition-colors mb-4">
                  +
                </span>
                <p className="font-display text-xl text-ink-softer group-hover:text-ink transition-colors">Empty seat</p>
                <p className="text-xs text-ink-soft mt-2">Invite a family member</p>
              </button>
            )}
          </Reveal>
        ))}
      </div>

      {/* Add member modal */}
      {addingIndex !== null && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setAddingIndex(null)}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
          <form
            onSubmit={submit}
            className="relative w-full max-w-md bg-cream-light border border-ink/15 p-6 sm:p-8 animate-fade-up shadow-soft-lg space-y-4"
          >
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="editorial-label">Seat {addingIndex + 1} of 4</span>
                <h3 className="font-display text-3xl text-ink mt-1 leading-tight">Invite to Quill Max</h3>
              </div>
              <button
                type="button"
                onClick={() => setAddingIndex(null)}
                className="w-8 h-8 flex items-center justify-center border border-ink/20 hover:border-ink hover:bg-ink hover:text-cream transition-all display-italic"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <label className="block">
              <span className="editorial-label block mb-1.5">Name</span>
              <input
                type="text" required autoFocus maxLength={40}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-cream border border-ink/20 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
              />
            </label>
            <label className="block">
              <span className="editorial-label block mb-1.5">Relationship</span>
              <select
                value={form.relationship}
                onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
                className="w-full bg-cream border border-ink/20 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
              >
                {relationships.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="editorial-label block mb-1.5">Their goal</span>
              <select
                value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                className="w-full bg-cream border border-ink/20 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
              >
                {Object.entries(goalLabels).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="editorial-label block mb-1.5">Email <span className="text-ink-softer normal-case">(invite link goes here)</span></span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="alex@example.com"
                className="w-full bg-cream border border-ink/20 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
              />
            </label>

            <button
              type="submit"
              disabled={!form.name.trim()}
              className="btn-ink w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              Send invite <span className="display-italic">→</span>
            </button>
            <p className="text-[10px] text-ink-softer text-center italic leading-relaxed">
              Prototype mockup — no email is actually sent. Member is added immediately.
            </p>
          </form>
        </div>
      )}
    </section>
  )
}
