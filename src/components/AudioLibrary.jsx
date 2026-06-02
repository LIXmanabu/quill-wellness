import { useState, useEffect, useRef, useCallback } from 'react'
import { usePro } from '../context/ProContext.jsx'
import Reveal from './interactive/Reveal.jsx'
import TierBadge from './TierBadge.jsx'

/**
 * Real ambient audio streamed from public CDNs.
 *
 * - Environmental loops (rain, ocean, fire, etc.): Mixkit free-sound-effects
 *   CDN. Royalty-free under the Mixkit Licence.
 * - White noise: Wikimedia Commons CC0 file (works in modern browsers
 *   including Safari 17+).
 *
 * Plain HTMLAudioElement playback — no CORS preflight, no Web Audio
 * autoplay quirks.
 */

const M = (id) => `https://assets.mixkit.co/active_storage/sfx/${id}/${id}-preview.mp3`
const W = (path) => `https://upload.wikimedia.org/wikipedia/commons/${path}`

// tier ranking — used to compare what the user has access to
const tierRank = { free: 0, pro: 1, max: 2 }

const sounds = [
  // ─── Free (4) ────────────────────────────────────────────────
  { id: 'white',   tier: 'free', label: 'White noise',     cat: 'Sleep', desc: 'Pure broadband white noise — masks distractions',  url: W('9/98/White-noise-sound-20sec-mono-44100Hz.ogg'), accent: '#9B8E82' },
  { id: 'crickets',tier: 'free', label: 'Night crickets',  cat: 'Sleep', desc: 'Summer crickets at night — countryside calm',       url: M(1789), accent: '#3D4A40' },
  { id: 'rain',    tier: 'free', label: 'Rain on roof',    cat: 'Sleep', desc: 'Light steady rain on a quiet street',               url: M(1253), accent: '#5A6B5D' },
  { id: 'wind',    tier: 'free', label: 'Wind in trees',   cat: 'Sleep', desc: 'Steady breeze through leaves',                      url: M(2658), accent: '#6BAEEF' },
  // ─── Pro adds (+2 → 6 total) ─────────────────────────────────
  { id: 'ocean',   tier: 'pro',  label: 'Ocean waves',     cat: 'Sleep', desc: 'Sea waves rolling in to shore',                     url: M(1196), accent: '#6BAEEF' },
  { id: 'fire',    tier: 'pro',  label: 'Fireplace',       cat: 'Focus', desc: 'Wood crackling in a hearth',                        url: M(1330), accent: '#C8654A' },
  // ─── Max adds (+2 → 8 total) ─────────────────────────────────
  { id: 'forest',  tier: 'max',  label: 'Forest birds',    cat: 'Focus', desc: 'Soft birdsong in an open forest',                   url: M(1210), accent: '#3D4A40' },
  { id: 'stream',  tier: 'max',  label: 'Mountain stream', cat: 'Focus', desc: 'Flowing water in a quiet creek',                    url: M(3126), accent: '#D4A744' },
]

const breathPatterns = [
  { id: 'box',      label: 'Box breathing', phases: [['Inhale', 4], ['Hold', 4], ['Exhale', 4], ['Hold', 4]], desc: 'Used by Navy SEALs to calm the nervous system fast.' },
  { id: '478',      label: '4-7-8',         phases: [['Inhale', 4], ['Hold', 7], ['Exhale', 8], ['Pause', 0]], desc: 'Dr. Andrew Weil\'s sleep-onset technique.' },
  { id: 'coherent', label: 'Coherent',      phases: [['Inhale', 6], ['Exhale', 6], ['', 0], ['', 0]], desc: '6-second breaths — peak heart-rate variability.' },
]

// Smoothly ramp an audio element's volume over `durationMs`
function fade(audio, target, durationMs, onDone) {
  if (!audio) return
  const start = audio.volume
  const steps = Math.max(8, Math.floor(durationMs / 30))
  const stepTime = durationMs / steps
  let i = 0
  const id = setInterval(() => {
    i++
    const t = i / steps
    const v = start + (target - start) * t
    try { audio.volume = Math.max(0, Math.min(1, v)) } catch {}
    if (i >= steps) {
      clearInterval(id)
      if (onDone) onDone()
    }
  }, stepTime)
  return id
}

export default function AudioLibrary() {
  const { tier } = usePro()
  const userRank = tierRank[tier] ?? 0

  const [playingId, setPlayingId] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [volume, setVolume] = useState(0.6)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)
  const fadeIdRef = useRef(null)

  const stop = useCallback((cb) => {
    const audio = audioRef.current
    if (!audio) { if (cb) cb(); return }
    if (fadeIdRef.current) clearInterval(fadeIdRef.current)
    audioRef.current = null
    setPlayingId(null)
    fadeIdRef.current = fade(audio, 0, 400, () => {
      try { audio.pause(); audio.src = '' } catch {}
      if (cb) cb()
    })
  }, [])

  async function play(sound) {
    setError(null)
    const unlocked = userRank >= (tierRank[sound.tier] ?? 0)
    if (!unlocked) return // gated — handled in UI

    if (playingId === sound.id) {
      stop()
      return
    }

    const old = audioRef.current
    if (old) {
      if (fadeIdRef.current) clearInterval(fadeIdRef.current)
      audioRef.current = null
      fade(old, 0, 350, () => {
        try { old.pause(); old.src = '' } catch {}
      })
    }

    setLoadingId(sound.id)
    setPlayingId(null)

    const audio = new Audio(sound.url)
    audio.crossOrigin = 'anonymous'
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0

    try {
      await audio.play()
      audioRef.current = audio
      setPlayingId(sound.id)
      setLoadingId(null)
      fadeIdRef.current = fade(audio, volume, 700)
    } catch (err) {
      setLoadingId(null)
      setError(`Couldn't start "${sound.label}". ${err.message || ''}`)
      console.error('AudioLibrary:', err)
    }
  }

  useEffect(() => {
    if (audioRef.current && !fadeIdRef.current) {
      try { audioRef.current.volume = volume } catch {}
    }
  }, [volume])

  useEffect(() => () => {
    const a = audioRef.current
    if (a) try { a.pause(); a.src = '' } catch {}
  }, [])

  const unlockedCount = sounds.filter((s) => userRank >= tierRank[s.tier]).length

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="audio-library">
      <Reveal>
        <div className="mb-10 pb-4 border-b border-ink/15 flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="editorial-label">Sounds &amp; breathwork</span>
            <h2 className="font-display text-5xl sm:text-6xl text-ink mt-2 leading-none">
              Sounds for the <span className="display-italic text-clay">moment.</span>
            </h2>
            <p className="text-sm text-ink-soft mt-3 max-w-xl">
              Real ambient loops you can leave running while you sleep, work, or unwind. Plus three breathwork patterns with a visual timer.
            </p>
          </div>
          <div className="text-right">
            <p className="editorial-label">Your library</p>
            <p className="num-display text-3xl text-clay mt-1 leading-none">
              {unlockedCount}<span className="text-ink-softer text-lg"> / {sounds.length}</span>
            </p>
          </div>
        </div>
      </Reveal>

      {error && (
        <Reveal>
          <div className="mb-6 p-4 border border-clay/30 bg-clay-paler text-sm text-clay-dark">
            {error}
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-ink/15 border border-ink/15 mb-6">
          {sounds.map((s) => {
            const unlocked = userRank >= tierRank[s.tier]
            const active = playingId === s.id
            const loading = loadingId === s.id
            return (
              <button
                key={s.id}
                onClick={() => play(s)}
                disabled={loading}
                aria-disabled={!unlocked}
                className={`text-left p-5 transition-all relative ${
                  active
                    ? 'bg-ink text-cream'
                    : unlocked
                      ? 'bg-cream-light hover:bg-bone'
                      : 'bg-bone/50 cursor-not-allowed'
                } ${loading ? 'opacity-70' : ''}`}
                data-cursor-label={!unlocked ? `${s.tier} only` : active ? 'stop' : loading ? 'loading' : 'play'}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`editorial-label ${active ? 'text-gold' : ''}`}>{s.cat}</span>
                  {!unlocked ? (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border bg-gold-paler text-gold-dark border-gold/30">
                      {s.tier}
                    </span>
                  ) : (
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-base display-italic ${active ? 'bg-gold text-ink' : loading ? 'border border-clay text-clay animate-pulse-soft' : 'border border-ink/20'}`}
                      style={active ? {} : !loading ? { color: s.accent } : {}}
                    >
                      {active ? '❚❚' : loading ? '◐' : '▶'}
                    </span>
                  )}
                </div>
                <p className={`font-display text-2xl leading-tight ${unlocked ? '' : 'text-ink-softer'}`}>{s.label}</p>
                <p className={`text-xs mt-2 leading-snug ${active ? 'text-cream/70' : unlocked ? 'text-ink-soft' : 'text-ink-softer'}`}>{s.desc}</p>
                {active && <ActiveEqualizer />}
              </button>
            )
          })}
        </div>
      </Reveal>

      {/* Upgrade hint for free/pro */}
      {userRank < 2 && (
        <Reveal>
          <p className="text-xs text-ink-soft italic mb-4">
            {userRank === 0
              ? `${sounds.filter((s) => s.tier !== 'free').length} more sounds unlock with Pro and Max.`
              : `${sounds.filter((s) => s.tier === 'max').length} more sounds unlock with Max.`}
          </p>
        </Reveal>
      )}

      {playingId && (
        <Reveal>
          <div className="border border-ink/15 bg-bone p-4 mb-6 flex items-center gap-4 flex-wrap">
            <span className="editorial-label">Now playing</span>
            <span className="font-display text-lg text-ink">{sounds.find((s) => s.id === playingId).label}</span>
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <span className="text-xs text-ink-soft">Volume</span>
              <input
                type="range" min="0" max="1" step="0.05"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 accent-ink"
              />
              <span className="num-display text-xs text-ink-soft w-8 text-right">{Math.round(volume * 100)}</span>
            </div>
            <button onClick={() => stop()} className="text-xs text-ink-soft hover:text-clay display-italic">stop</button>
          </div>
        </Reveal>
      )}

      <p className="text-[10px] text-ink-softer italic mt-2 mb-12">
        Loops via <a href="https://mixkit.co/free-sound-effects/" target="_blank" rel="noopener noreferrer" className="underline hover:text-clay">Mixkit free sound library</a> and <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-clay">Wikimedia Commons</a>.
      </p>

      <Reveal>
        <h3 className="font-display text-3xl text-ink mt-12 mb-5 leading-tight">Breathwork timer</h3>
      </Reveal>
      <Breathwork />
    </section>
  )
}

function ActiveEqualizer() {
  return (
    <div className="mt-3 flex gap-0.5 items-end h-4">
      {[...Array(16)].map((_, i) => (
        <span
          key={i}
          className="flex-1 bg-gold rounded-sm"
          style={{
            animation: `eq-bar 0.${4 + (i % 5)}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.05}s`,
            height: '60%',
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  )
}

function Breathwork() {
  const [patternId, setPatternId] = useState('box')
  const [running, setRunning] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [cycles, setCycles] = useState(0)
  const intervalRef = useRef(null)

  const pattern = breathPatterns.find((p) => p.id === patternId)
  const activePhases = pattern.phases.filter(([, dur]) => dur > 0)
  const currentPhase = activePhases[phaseIdx]

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current)
      return
    }
    setSecondsLeft(currentPhase[1])
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setPhaseIdx((idx) => {
            const next = (idx + 1) % activePhases.length
            if (next === 0) setCycles((c) => c + 1)
            return next
          })
          return activePhases[(phaseIdx + 1) % activePhases.length][1]
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, phaseIdx, patternId])

  function start() {
    setPhaseIdx(0)
    setSecondsLeft(activePhases[0][1])
    setCycles(0)
    setRunning(true)
  }
  function stop() {
    setRunning(false)
    setPhaseIdx(0)
    setCycles(0)
  }

  const phaseLabel = currentPhase[0]
  const targetScale = phaseLabel === 'Inhale' ? 1
    : phaseLabel === 'Exhale' ? 0.45
    : phaseLabel === 'Hold' && phaseIdx === 1 ? 1
    : phaseLabel === 'Hold' ? 0.45
    : 0.7

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Reveal className="lg:col-span-5">
        <div className="border border-ink/15 bg-cream-light p-5 space-y-2">
          {breathPatterns.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPatternId(p.id); stop() }}
              className={`w-full text-left p-4 border transition-all ${
                patternId === p.id
                  ? 'bg-ink text-cream border-ink'
                  : 'bg-cream border-ink/15 hover:border-ink'
              }`}
            >
              <p className="font-display text-xl">{p.label}</p>
              <p className={`text-xs mt-1 ${patternId === p.id ? 'text-cream/70' : 'text-ink-soft'}`}>{p.desc}</p>
              <p className={`num-display text-xs mt-2 ${patternId === p.id ? 'text-gold' : 'text-clay'}`}>
                {p.phases.filter(([, d]) => d > 0).map(([label, dur]) => `${label} ${dur}s`).join(' · ')}
              </p>
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal className="lg:col-span-7" delay={80}>
        <div className="border border-ink/15 bg-ink text-cream p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <span className="absolute inset-0 border border-cream/15 rounded-full" />
            <span
              className="absolute rounded-full border-2 border-gold transition-transform"
              style={{
                width: '100%',
                height: '100%',
                transform: `scale(${running ? targetScale : 0.7})`,
                transitionDuration: running ? `${currentPhase[1]}s` : '0.4s',
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                background: 'radial-gradient(circle, rgba(212,167,68,0.15), transparent 70%)',
              }}
            />
            <div className="relative z-10 text-center">
              {running ? (
                <>
                  <p className="display-italic text-base text-gold">{phaseLabel}</p>
                  <p className="num-display text-7xl text-cream leading-none mt-1">{secondsLeft}</p>
                </>
              ) : (
                <p className="font-display text-2xl text-cream">Press start</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-6">
            {running ? (
              <button onClick={stop} className="inline-flex items-center gap-2 px-6 py-3 bg-cream text-ink text-sm font-medium hover:bg-cream-light transition-colors">
                Stop
              </button>
            ) : (
              <button onClick={start} className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-ink text-sm font-medium hover:bg-gold-light transition-colors">
                Start <span className="display-italic">→</span>
              </button>
            )}
            <p className="text-xs text-cream/60">
              <span className="num-display text-cream text-base">{cycles}</span> cycles complete
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
