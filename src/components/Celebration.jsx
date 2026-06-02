import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const brandColors = ['#C8654A', '#D4A744', '#5A6B5D', '#6BAEEF', '#C9B3E8', '#E8B4B8', '#9B4423', '#3D4A40']

/**
 * Full-screen celebration overlay shown on successful tier upgrade.
 * Big confetti burst for Max, smaller for Pro. Fades itself out via onDone.
 */
export default function Celebration({ tier, onDone }) {
  const isMax = tier === 'max'

  useEffect(() => {
    if (!isMax) {
      // Quieter celebration for Pro
      confetti({
        particleCount: 80,
        spread: 60,
        startVelocity: 35,
        origin: { y: 0.6 },
        colors: brandColors,
      })
      const t = setTimeout(() => onDone?.(), 1800)
      return () => clearTimeout(t)
    }

    // Big Max blast — sustained over ~3s with multiple bursts
    const duration = 3000
    const end = Date.now() + duration

    function fireBurst() {
      // Left cannon
      confetti({
        particleCount: 70,
        spread: 70,
        startVelocity: 55,
        angle: 60,
        origin: { x: 0, y: 0.7 },
        colors: brandColors,
        scalar: 1.1,
      })
      // Right cannon
      confetti({
        particleCount: 70,
        spread: 70,
        startVelocity: 55,
        angle: 120,
        origin: { x: 1, y: 0.7 },
        colors: brandColors,
        scalar: 1.1,
      })
    }

    // Center burst — big single shot
    confetti({
      particleCount: 180,
      spread: 100,
      startVelocity: 50,
      origin: { y: 0.5 },
      colors: brandColors,
      scalar: 1.3,
    })

    // Repeated side cannons
    const cannonInterval = setInterval(fireBurst, 450)

    // Gentle drift from the top
    const driftInterval = setInterval(() => {
      if (Date.now() > end) return
      confetti({
        particleCount: 20,
        startVelocity: 15,
        spread: 360,
        gravity: 0.6,
        ticks: 200,
        origin: { x: Math.random(), y: 0 },
        colors: brandColors,
        scalar: 0.8,
        shapes: ['circle', 'square'],
      })
    }, 200)

    const stopAll = setTimeout(() => {
      clearInterval(cannonInterval)
      clearInterval(driftInterval)
    }, duration)

    const done = setTimeout(() => onDone?.(), 4000)

    return () => {
      clearInterval(cannonInterval)
      clearInterval(driftInterval)
      clearTimeout(stopAll)
      clearTimeout(done)
    }
  }, [isMax, onDone])

  return (
    <div className="fixed inset-0 z-[110] pointer-events-none flex items-center justify-center p-6">
      <div className={`text-center ${isMax ? 'animate-pop-in' : 'animate-fade-up'}`}>
        <div className="inline-block">
          <p className="editorial-label" style={{ color: isMax ? '#9B4423' : '#1A1410' }}>
            Welcome to
          </p>
          <h2
            className="font-display text-[16vw] sm:text-[12vw] lg:text-[10vw] leading-[0.9] mt-2"
            style={isMax ? {
              background: 'linear-gradient(120deg, #C8654A, #D4A744, #5A6B5D, #6BAEEF, #C9B3E8, #E8B4B8, #C8654A)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient-shift 3s ease infinite',
            } : { color: '#1A1410' }}
          >
            Quill {isMax ? 'Max' : 'Pro'}
          </h2>
          <p className="display-italic text-xl sm:text-2xl text-ink-soft mt-4">
            {isMax ? 'Everything is unlocked. Enjoy the practice.' : 'The depth, ready when you are.'}
          </p>
        </div>
      </div>
    </div>
  )
}
