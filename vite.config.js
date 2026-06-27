import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import crypto from 'node:crypto'

// ─── Content-Security-Policy ──────────────────────────────────────────────
// Locks down what the page is allowed to load and run, the main defence
// against cross-site-scripting (XSS): even if a string of attacker HTML ever
// reached the DOM, the browser refuses to execute scripts that aren't on this
// allow-list. Only the app's own bundle, the hashed boot script, and Umami
// analytics can run; everything else (eval, injected <script>, foreign hosts)
// is blocked.
//
// Injected at BUILD ONLY (apply: 'build'). The Vite dev server injects inline
// HMR scripts and uses eval, which a strict policy would break, so dev runs
// without it and production ships with it.
//
// `frame-ancestors` / X-Frame-Options can only be set as real HTTP headers,
// which GitHub Pages does not allow, so clickjacking is handled by the
// frame-buster in index.html instead.

const SUPABASE = 'https://eqmucfqyznbnvuyvrgpy.supabase.co'
const SUPABASE_WS = 'wss://eqmucfqyznbnvuyvrgpy.supabase.co'
const UMAMI = 'https://cloud.umami.is'
const UMAMI_API = 'https://gateway.umami.is'   // Umami posts events here (script is on cloud.umami.is)
// Ambient-sound CDNs used by the Audio Library (white noise, rain, ocean, …).
const MEDIA_MIXKIT = 'https://assets.mixkit.co'
const MEDIA_WIKIMEDIA = 'https://upload.wikimedia.org'

// The CSP is assembled per-build so the inline-script hashes always match the
// exact bytes Vite ships (it minifies inline scripts, so a hash precomputed
// from source can drift). The plugin below hashes the page's own inline scripts
// from the final HTML and splices them into script-src, so the policy can never
// block the site's own boot script and there is no hash to maintain by hand.
function buildCsp(scriptHashes) {
  const hashes = scriptHashes.map((h) => `'${h}'`).join(' ')
  return [
    "default-src 'self'",
    // Scripts: own bundle + the page's own inline scripts (by hash) + Umami.
    // No 'unsafe-inline', no 'unsafe-eval', so injected/foreign scripts can't run.
    `script-src 'self' ${hashes} ${UMAMI}`.replace(/ {2,}/g, ' '),
    // Styles: the app uses inline style="" attributes throughout and Google Fonts
    // CSS, so 'unsafe-inline' is required here. Style injection cannot run code,
    // so this is low risk while script-src stays strict.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    'font-src \'self\' https://fonts.gstatic.com data:',
    // Images can't execute, so allow any https source (user avatars, Unsplash, the
    // Supabase media bucket) plus data:/blob: for generated/3D textures.
    "img-src 'self' data: blob: https:",
    // Network: own origin, Supabase (REST + Auth + Storage over https, Realtime
    // over wss) and the analytics endpoints. Nothing else can be contacted.
    `connect-src 'self' ${SUPABASE} ${SUPABASE_WS} ${UMAMI} ${UMAMI_API}`,
    // Ambient audio streamed by the Audio Library. Without this, media falls back
    // to default-src 'self' and every sound button (white noise, rain, …) is
    // silently blocked in the production build.
    `media-src 'self' data: blob: ${MEDIA_MIXKIT} ${MEDIA_WIKIMEDIA}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ')
}

function securityHeadersPlugin() {
  return {
    name: 'quill-security-headers',
    apply: 'build',
    transformIndexHtml: {
      // `order: 'post'` so this runs AFTER Vite's core HTML processing/minifier:
      // we hash the exact inline-script bytes the browser will receive, not the
      // pre-minified source, so the CSP can never block the site's own script.
      order: 'post',
      handler(html) {
        const scriptHashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
          .map((m) => m[1])
          .filter((s) => s.trim().length)
          .map((body) => 'sha256-' + crypto.createHash('sha256').update(body, 'utf8').digest('base64'))
        return {
          html,
          tags: [
            { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: buildCsp(scriptHashes) }, injectTo: 'head-prepend' },
            { tag: 'meta', attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' }, injectTo: 'head-prepend' },
          ],
        }
      },
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [react(), securityHeadersPlugin()],
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
