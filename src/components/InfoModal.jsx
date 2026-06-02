import { useEffect } from 'react'

export default function InfoModal({ data, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-ink/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-xl bg-cream-light border border-ink/15 animate-fade-up max-h-[90vh] overflow-y-auto panel-scroll shadow-soft-lg">
        {/* Header */}
        <div className="sticky top-0 bg-bone px-6 py-5 flex items-center justify-between border-b border-ink/15 z-10">
          <div>
            <p className="editorial-label">{data.difficulty} · {data.duration}</p>
            <h2 className="font-display text-3xl text-ink mt-1 leading-tight">{data.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center border border-ink/20 hover:border-ink hover:bg-ink hover:text-cream transition-all text-lg display-italic"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          <p className="text-sm text-ink-soft leading-relaxed">{data.description}</p>

          {data.warmup && (
            <div className="border border-sage/30 bg-sage-paler p-4">
              <p className="editorial-label text-sage-dark mb-1">Warm-up</p>
              <p className="text-sm text-ink-soft">{data.warmup}</p>
            </div>
          )}

          <div>
            <p className="editorial-label mb-4">Exercises</p>
            <ol className="space-y-3">
              {data.exercises.map((ex, i) => (
                <li key={i} className="flex items-start gap-4 p-4 bg-cream border border-ink/10">
                  <span className="num-display text-2xl text-clay leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg text-ink leading-tight">{ex.name}</p>
                    <p className="display-italic text-sm text-clay mt-1">{ex.reps}</p>
                    <p className="text-xs text-ink-soft mt-2 leading-relaxed">{ex.tip}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {data.cooldown && (
            <div className="border border-blush/40 bg-blush-paler p-4">
              <p className="editorial-label text-rust mb-1">Cool-down</p>
              <p className="text-sm text-ink-soft">{data.cooldown}</p>
            </div>
          )}

          {data.safetyNote && (
            <div className="border border-clay/30 bg-clay-paler p-4">
              <p className="editorial-label text-clay-dark mb-1">Safety</p>
              <p className="text-xs text-ink-soft leading-relaxed">{data.safetyNote}</p>
            </div>
          )}

          <button onClick={onClose} className="btn-ink w-full justify-center">
            Done <span className="display-italic">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
