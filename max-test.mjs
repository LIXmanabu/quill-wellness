import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = 'http://localhost:5174/'
const results = []
const ok = (n, c) => results.push([c ? 'PASS' : 'FAIL', n])
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const clickText = (page, t) => page.evaluate((t) => {
  const el = [...document.querySelectorAll('button,a')]
    .find((e) => e.textContent.trim().toLowerCase().includes(t.toLowerCase()))
  if (el) { el.scrollIntoView({ block: 'center' }); el.click(); return true }
  return false
}, t)

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.emulate({
  viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
})
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })
await wait(800); await clickText(page, 'Continue as guest')
await wait(700); await clickText(page, 'Skip')
await wait(900)

// Go to Pro page via the bottom-bar "More" sheet → "Try Pro".
// Click the More button by aria-label (text matching would hit "Less is more" copy).
await page.click('nav[aria-label="Primary"] button[aria-label="More sections"]'); await wait(800)
await clickText(page, 'Try Pro'); await wait(1300)
const onPro = await page.evaluate(() => {
  const t = document.body.innerText.toLowerCase()
  return t.includes('go max') || t.includes('upgrade to max') || t.includes('max is active')
})
ok('Reached the Pro page on mobile', onPro)

// Open Max checkout — Free tier labels it "Or go Max", Pro tier "Upgrade to Max"
let opened = await clickText(page, 'go Max')
if (!opened) opened = await clickText(page, 'Upgrade to Max')
await wait(1000)
const checkoutOpen = await page.evaluate(() => !!document.querySelector('input[autocomplete="cc-number"]'))
ok('Max checkout modal opens on mobile', checkoutOpen)
await page.screenshot({ path: 'max-checkout.png' })

if (!checkoutOpen) {
  const diag = await page.evaluate(() => ({
    buttons: [...document.querySelectorAll('button,a')].map((b) => b.textContent.trim()).filter(Boolean).slice(0, 40),
    bodySnippet: document.body.innerText.slice(0, 400),
  }))
  console.log('DIagnostics — buttons on page:\n', diag.buttons)
  console.log('\nBody snippet:\n', diag.bodySnippet)
  await browser.close()
  process.exit(2)
}

// Fill the prototype payment form and submit
await page.type('input[autocomplete="email"]', 'felix@quill.app', { delay: 8 })
await page.type('input[autocomplete="cc-number"]', '4242424242424242', { delay: 8 })
await page.type('input[autocomplete="cc-exp"]', '12/30', { delay: 8 })
await page.type('input[autocomplete="cc-csc"]', '123', { delay: 8 })
await page.evaluate(() => {
  const email = document.querySelector('input[autocomplete="email"]')
  const form = email.closest('form')
  if (form.requestSubmit) form.requestSubmit(); else form.submit()
})
await wait(2600) // 1100ms tier flip + celebration

// Verify Max rainbow theme is active
const max = await page.evaluate(() => {
  const root = document.querySelector('.max-mode')
  const bars = [...document.querySelectorAll('.max-rainbow-bar')]
  const barVisible = bars.some((b) => b.getBoundingClientRect().width > 0 && getComputedStyle(b).backgroundImage.includes('gradient'))
  // a gradient-clipped accent word
  const grad = [...document.querySelectorAll('.max-mode .display-italic.text-clay')]
    .some((e) => getComputedStyle(e).backgroundImage.includes('gradient'))
  return { hasMaxMode: !!root, barCount: bars.length, barVisible, grad }
})
ok('Max mode is active (.max-mode on root)', max.hasMaxMode)
ok('Rainbow accent bars render (top + bottom)', max.barCount >= 2 && max.barVisible)
ok('Italic accent words use the flowing rainbow gradient', max.grad)
ok('No JS errors during the Max flow', errors.length === 0)

// Screenshot the Max edition on the Pro page, then go Home for the full look
await page.screenshot({ path: 'max-pro.png' })
await clickText(page, 'Home'); await wait(1400)
await page.screenshot({ path: 'max-home.png' })

await browser.close()

console.log('\n============ PRO / MAX RAINBOW (MOBILE) ============')
for (const [s, n] of results) console.log(`  [${s}] ${n}`)
const fails = results.filter((r) => r[0] === 'FAIL').length
console.log('===================================================')
console.log(fails === 0 ? '✅ ALL PASSED' : `❌ ${fails} FAILED`)
if (errors.length) { console.log('\nErrors:'); errors.slice(0, 5).forEach((e) => console.log('  -', e)) }
process.exit(fails === 0 ? 0 : 1)
