import { createContext, useContext, useEffect, useState, useCallback } from 'react'

// ─── Theme (light / optional dark) ────────────────────────────────────
// Default is LIGHT — the app only goes dark if the visitor chooses it, and
// that choice is remembered per browser. Dark mode works app-wide via the
// `dark` class on <html>, which flips the CSS colour variables (index.css).

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {}, setTheme: () => {} })
const KEY = 'quill.theme'

function getInitial() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {}
  return 'light'   // never auto-dark; light is the preset
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try { localStorage.setItem(KEY, theme) } catch {}
    // Keep the mobile browser chrome (status bar) matching the theme.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#1A1510' : '#F7F2EA')
  }, [theme])

  const setTheme = useCallback((t) => setThemeState(t === 'dark' ? 'dark' : 'light'), [])
  const toggleTheme = useCallback(() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
