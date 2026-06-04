import { useState, useEffect } from 'react'
import { usePro } from '../context/ProContext.jsx'
import { useUser } from '../context/UserContext.jsx'

/*
  App-style bottom navigation, shown on phones/tablets only (lg:hidden).
  Five thumb-reachable destinations; everything else lives behind "More",
  which opens a full-screen sheet. Replaces the web hamburger menu.
  Honors the safe-area inset so it clears the home indicator on notched phones.
*/

// Thin editorial line-icons (stroke = currentColor) to match Quill's register.
const Icon = ({ d, fill = 'none' }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill={fill} stroke="currentColor"
       strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
)
const icons = {
  home:    <Icon d={<><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /></>} />,
  today:   <Icon d={<><rect x="4" y="5" width="16" height="15" rx="1.5" /><path d="M4 9h16M8 3v4M16 3v4" /><circle cx="12" cy="14" r="2.2" /></>} />,
  body:    <Icon d={<><circle cx="12" cy="5" r="2.4" /><path d="M12 7.4v7M12 14.4 8 21M12 14.4 16 21M7 10l10 0" /></>} />,
  myquill: <Icon d={<path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />} />,
  more:    <Icon d={<><circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" /></>} />,
}

const PRIMARY = [
  { key: 'home',    label: 'Home' },
  { key: 'today',   label: 'Today' },
  { key: 'body',    label: 'Body' },
  { key: 'myquill', label: 'My Quill' },
]

// Sections that live in the "More" sheet, in reading order. Each carries a
// one-line description so first-timers can tell what's behind it (discovery).
const MORE_SECTIONS = [
  { key: 'sport',    label: 'Movement',     no: '01', desc: 'Beginner-safe exercise & stretching' },
  { key: 'skincare', label: 'Skin ritual',  no: '02', desc: 'Simple routines for every skin type' },
  { key: 'wellness', label: 'Wellness',     no: '03', desc: 'Sleep, stress, mood & breathing' },
  { key: 'diet',     label: 'Nourishment',  no: '04', desc: 'Food, macros & meal templates' },
  { key: 'tips',     label: 'Daily tips',   no: '05', desc: '60 evidence-informed wellness tips' },
  { key: 'about',    label: 'About Quill',  no: '06', desc: 'Our approach & privacy' },
]

// A light haptic tick on tab change where supported (Android; iOS ignores it).
function haptic() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(8)
}

export default function BottomTabBar({ activePage, onNavigate, onOpenSearch }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { profile } = useUser()
  const { tier, isMax } = usePro()
  const favCount = profile.favorites.length

  // A "More" section being active should light up the More tab.
  const moreActive = MORE_SECTIONS.some((s) => s.key === activePage) || activePage === 'pro'

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!sheetOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [sheetOpen])

  function go(key) {
    haptic()
    setSheetOpen(false)
    onNavigate(key)
  }

  function openSearch() {
    setSheetOpen(false)
    onOpenSearch?.()
  }

  const tierLabel = tier === 'max' ? 'Max Edition' : tier === 'pro' ? 'Pro Edition' : 'Free Edition'

  return (
    <>
      {/* ── The More sheet ── */}
      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="More sections">
          <div className="absolute inset-0 bg-ink/40 animate-fade-in" onClick={() => setSheetOpen(false)} />
          <div className="absolute left-0 right-0 bottom-0 bg-cream-light border-t border-ink/15 shadow-soft-lg rounded-t-2xl animate-sheet-up max-h-[82vh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div className="flex justify-center pt-3 pb-1">
              <span className="block w-10 h-1 rounded-full bg-ink/15" />
            </div>
            <div className="px-5 pt-2 pb-1 flex items-baseline justify-between">
              <span className="editorial-label text-ink-softer">More from Quill</span>
              <span className="editorial-label text-ink-softer">{tierLabel}</span>
            </div>

            {/* Search, jump to any section or tip */}
            <div className="px-3 pt-1 pb-2">
              <button
                onClick={openSearch}
                className="w-full flex items-center gap-3 px-3 min-h-[48px] bg-bone text-ink-soft active:bg-bone/70 transition-colors rounded-sm"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" strokeLinecap="round" />
                </svg>
                <span className="text-sm">Search sections and tips…</span>
              </button>
            </div>

            <nav className="px-3 pb-2 flex flex-col">
              {MORE_SECTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => go(s.key)}
                  aria-current={activePage === s.key ? 'page' : undefined}
                  className={`flex items-baseline gap-3 px-3 min-h-[60px] py-2 border-b border-ink/5 text-left transition-colors ${
                    activePage === s.key ? 'bg-bone' : 'active:bg-cream'
                  }`}
                >
                  <span className="text-[10px] num-display text-clay w-6 shrink-0">{s.no}</span>
                  <span className="min-w-0">
                    <span className="block font-display text-xl text-ink">{s.label}</span>
                    <span className="block text-sm text-ink-soft leading-snug">{s.desc}</span>
                  </span>
                </button>
              ))}
            </nav>
            <div className="px-3 pt-2">
              <button
                onClick={() => go('pro')}
                className={`w-full flex items-center justify-between px-4 min-h-[56px] text-sm font-medium border-2 ${
                  isMax ? 'bg-cream text-ink border-gold' : 'bg-ink text-cream border-ink'
                }`}
              >
                <span className="display-italic text-base">{tier === 'free' ? 'Try' : 'Manage'} Pro</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── The bar ── */}
      <nav
        className="bottom-tabs lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-sm border-t border-ink/12"
        aria-label="Primary"
      >
        <ul className="flex items-stretch justify-around px-1 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.35rem)]">
          {PRIMARY.map((t) => {
            const active = activePage === t.key
            return (
              <li key={t.key} className="flex-1">
                <button
                  onClick={() => go(t.key)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative w-full min-h-[52px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    active ? 'text-clay' : 'text-ink-soft active:text-ink'
                  }`}
                >
                  <span className="relative">
                    {icons[t.key]}
                    {t.key === 'myquill' && favCount > 0 && (
                      <span className="absolute -top-1 -right-2 inline-flex items-center justify-center min-w-[15px] h-[15px] px-1 text-[9px] num-display bg-clay text-cream rounded-full">
                        {favCount}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] tracking-wide font-medium">{t.label}</span>
                  {active && <span className="absolute top-0 w-7 h-px bg-clay" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
          <li className="flex-1">
            <button
              onClick={() => setSheetOpen((v) => !v)}
              aria-expanded={sheetOpen}
              aria-label="More sections"
              className={`relative w-full min-h-[52px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                moreActive || sheetOpen ? 'text-clay' : 'text-ink-soft active:text-ink'
              }`}
            >
              {icons.more}
              <span className="text-[10px] tracking-wide font-medium">More</span>
              {(moreActive || sheetOpen) && <span className="absolute top-0 w-7 h-px bg-clay" aria-hidden="true" />}
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
