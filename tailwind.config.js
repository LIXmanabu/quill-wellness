import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F7F2EA',
          light: '#FBF7F0',
          dark: '#EDE4D3',
          deeper: '#E0D4BD',
        },
        ink: {
          DEFAULT: '#1A1410',
          light: '#3D332B',
          soft: '#6B5D52',
          softer: '#9B8E82',
        },
        sage: {
          DEFAULT: '#5A6B5D',
          light: '#8FA694',
          dark: '#3D4A40',
          pale: '#D5DDD6',
          paler: '#EAEFEA',
        },
        clay: {
          DEFAULT: '#C8654A',
          light: '#E08570',
          dark: '#A04E37',
          pale: '#F5E1D8',
          paler: '#FBEFE9',
        },
        blush: {
          DEFAULT: '#E8B4B8',
          light: '#F4D4D6',
          dark: '#D89BA0',
          pale: '#F9E8E9',
          paler: '#FCF3F3',
        },
        gold: {
          DEFAULT: '#D4A744',
          light: '#E2BD6A',
          dark: '#B08A2E',
          pale: '#F5EBD0',
          paler: '#FAF4E2',
        },
        bone: '#E8DFD0',
        rust: '#9B4423',
      },
      fontFamily: {
        sans: ['"Libre Franklin"', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        display: ['"Instrument Serif"', 'Fraunces', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '7xl': ['5rem', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        '8xl': ['6.5rem', { lineHeight: '0.92', letterSpacing: '-0.035em' }],
        '9xl': ['8.5rem', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        '10xl': ['11rem', { lineHeight: '0.88', letterSpacing: '-0.045em' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 4px 24px 0 rgba(26,20,16,0.06)',
        'soft-lg': '0 8px 40px 0 rgba(26,20,16,0.08)',
        'soft-hover': '0 12px 36px 0 rgba(26,20,16,0.12)',
        editorial: '0 2px 0 0 rgba(26,20,16,0.08)',
        'ink-sm': '0 1px 0 0 rgba(26,20,16,0.12)',
        ink: '0 1px 3px rgba(26,20,16,0.10), 0 1px 2px rgba(26,20,16,0.06)',
        'pro-glow': '0 0 0 1px rgba(212,167,68,0.4), 0 8px 32px 0 rgba(212,167,68,0.18)',
      },
      backgroundSize: {
        '300%': '300% 300%',
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.04)', opacity: '0.9' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, -16px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-18px, 14px)' },
        },
        sparkle: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.6' },
          '50%': { transform: 'scale(1.3) rotate(180deg)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '60%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'ping-soft': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'text-reveal': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'underline-grow': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'fade-grow-y': {
          '0%': { opacity: '0', transform: 'scaleY(0)' },
          '100%': { opacity: '1', transform: 'scaleY(1)' },
        },
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'curtain-sweep': {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '45%': { transform: 'scaleX(1)', transformOrigin: 'left' },
          '55%': { transform: 'scaleX(1)', transformOrigin: 'right' },
          '100%': { transform: 'scaleX(0)', transformOrigin: 'right' },
        },
        'eq-bar': {
          '0%':   { transform: 'scaleY(0.3)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'sheet-up': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease-out',
        'sheet-up': 'sheet-up 0.34s cubic-bezier(0.22, 1, 0.36, 1) both',
        'gradient-shift': 'gradient-shift 12s ease infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 11s ease-in-out infinite',
        'float-reverse': 'float-reverse 9s ease-in-out infinite',
        sparkle: 'sparkle 2.6s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'pop-in': 'pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'ping-soft': 'ping-soft 1.4s ease-out infinite',
        marquee: 'marquee 40s linear infinite',
        'marquee-slow': 'marquee 70s linear infinite',
        'marquee-reverse': 'marquee-reverse 50s linear infinite',
        'text-reveal': 'text-reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'underline-grow': 'underline-grow 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'rotate-slow': 'rotate-slow 24s linear infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'fade-grow-y': 'fade-grow-y 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'page-in': 'page-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'curtain-sweep': 'curtain-sweep 0.9s cubic-bezier(0.76, 0, 0.24, 1) both',
      },
    },
  },
  plugins: [typography],
}
