import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = 'http://localhost:5174/'
const results = []
const ok = (n, c) => results.push([c ? 'PASS' : 'FAIL', n])

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
})

async function clickByText(page, text) {
  // Click via the DOM (element.click()) to avoid puppeteer's clickable-point
  // geometry check, which trips on animated/overlay modal buttons.
  return page.evaluate((t) => {
    const els = [...document.querySelectorAll('button, a')]
    const el = els.find((e) => e.textContent.trim().toLowerCase().includes(t.toLowerCase()))
    if (el) { el.scrollIntoView(); el.click(); return true }
    return false
  }, text)
}

// ── iPhone 13 viewport ──
const page = await browser.newPage()
await page.emulate({
  viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
})
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })

// Dismiss the auth gate (guest) and onboarding (skip) if present.
await new Promise((r) => setTimeout(r, 800))
await clickByText(page, 'Continue as guest')
await new Promise((r) => setTimeout(r, 700))
await clickByText(page, 'Skip')
await new Promise((r) => setTimeout(r, 1000))

// ── Assertions ──
const m = await page.evaluate(() => {
  const bar = document.querySelector('nav[aria-label="Primary"].bottom-tabs')
  const barVisible = bar && getComputedStyle(bar).display !== 'none' && bar.getBoundingClientRect().height > 0
  const tabButtons = bar ? bar.querySelectorAll('button').length : 0
  const tabLabels = bar ? [...bar.querySelectorAll('button')].map((b) => b.textContent.trim()) : []
  // desktop top-nav tab row should be hidden on mobile
  const desktopNav = document.querySelector('header nav.hidden')
  const desktopNavHidden = desktopNav ? getComputedStyle(desktopNav).display === 'none' : true
  // bar sits at the bottom of the viewport
  const atBottom = bar ? Math.abs(bar.getBoundingClientRect().bottom - window.innerHeight) < 2 : false
  // manifest + theme-color present
  const manifest = !!document.querySelector('link[rel="manifest"]')
  const themeColor = document.querySelector('meta[name="theme-color"]')?.content || null
  const appleCapable = !!document.querySelector('meta[name="apple-mobile-web-app-capable"]')
  return { barVisible, tabButtons, tabLabels, desktopNavHidden, atBottom, manifest, themeColor, appleCapable }
})

ok('Bottom tab bar is visible on mobile', m.barVisible)
ok('Bottom bar has 5 tabs (Home/Today/Body/My Quill/More)', m.tabButtons === 5)
ok('Bottom bar is pinned to the bottom of the screen', m.atBottom)
ok('Desktop top-nav tab row is hidden on mobile', m.desktopNavHidden)
ok('PWA manifest linked', m.manifest)
ok('theme-color meta present (#F7F2EA)', m.themeColor === '#F7F2EA')
ok('apple-mobile-web-app-capable meta present', m.appleCapable)

await page.screenshot({ path: 'mobile-home.png' })

// Tap "Body" tab → page should switch
await clickByText(page, 'Body')
await new Promise((r) => setTimeout(r, 1200))
const onBody = await page.evaluate(() => {
  const bar = document.querySelector('nav[aria-label="Primary"].bottom-tabs')
  const bodyBtn = bar ? [...bar.querySelectorAll('button')].find((b) => b.textContent.includes('Body')) : null
  return bodyBtn ? bodyBtn.getAttribute('aria-current') === 'page' : false
})
ok('Tapping "Body" activates the Body tab', onBody)
await page.screenshot({ path: 'mobile-body.png' })

// Open the "More" sheet
await clickByText(page, 'More')
await new Promise((r) => setTimeout(r, 800))
const sheet = await page.evaluate(() => {
  const dlg = document.querySelector('[role="dialog"][aria-label="More sections"]')
  return !!dlg && dlg.getBoundingClientRect().height > 0
})
ok('"More" opens the full-screen sections sheet', sheet)
await page.screenshot({ path: 'mobile-more.png' })

ok('No JS runtime errors during mobile session', errors.length === 0)

// ── Desktop check: top nav shows, bottom bar hidden ──
const page2 = await browser.newPage()
await page2.setViewport({ width: 1280, height: 900 })
await page2.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })
await new Promise((r) => setTimeout(r, 600))
await clickByText(page2, 'Continue as guest')
await new Promise((r) => setTimeout(r, 600))
await clickByText(page2, 'Skip')
await new Promise((r) => setTimeout(r, 800))
const desk = await page2.evaluate(() => {
  const bar = document.querySelector('nav[aria-label="Primary"].bottom-tabs')
  const barHidden = !bar || getComputedStyle(bar).display === 'none'
  const topNav = document.querySelector('header nav')
  const topNavVisible = topNav && getComputedStyle(topNav).display !== 'none'
  return { barHidden, topNavVisible }
})
ok('Desktop: bottom bar is hidden', desk.barHidden)
ok('Desktop: editorial top nav is visible', desk.topNavVisible)
await page2.screenshot({ path: 'desktop-home.png' })

await browser.close()

console.log('\n================ MOBILE TEST RESULTS ================')
for (const [s, n] of results) console.log(`  [${s}] ${n}`)
const fails = results.filter((r) => r[0] === 'FAIL').length
console.log('====================================================')
console.log(fails === 0 ? '✅ ALL PASSED' : `❌ ${fails} FAILED`)
if (errors.length) { console.log('\nConsole/page errors:'); errors.slice(0, 5).forEach((e) => console.log('  -', e)) }
process.exit(fails === 0 ? 0 : 1)
