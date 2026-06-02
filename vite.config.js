import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Build with relative asset paths so the app works at ANY URL path —
  // GitHub Pages serves from a sub-path (/<repo>/), and relative paths also
  // keep it portable to a root host later. Dev server stays at '/'.
  base: command === 'build' ? './' : '/',
  server: {
    host: true,
    // Allow access through a Cloudflare quick tunnel (public HTTPS URL).
    // LAN IPs and localhost are always permitted regardless of this list.
    allowedHosts: ['.trycloudflare.com'],
  },
}))
