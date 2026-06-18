import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = 'http://localhost:4173/'
const results = []
const ok = (n, c) => results.push([c ? 'PASS' : 'FAIL', n])

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
})

async function clickByText(page, text) {
  return page.evaluate((t) => {
    const els = [...document.querySelectorAll('button, a')]
    const el = els.find((e) => e.textContent.trim().toLowerCase().includes(t.toLowerCase()))
    if (el) { el.scrollIntoView(); el.click(); return true }
    return false
  }, text)
}

async function passGates(page) {
  await new Promise((r) => setTimeout(r, 800))
  await clickByText(page, 'Continue as guest')
  await new Promise((r) => setTimeout(r, 700))
  await clickByText(page, 'Skip')
  await new Promise((r) => setTimeout(r, 800))
}

// ─────────────────────────────────────────────────────────────────────────
// Scenario A — Chrome / Android: the browser fires `beforeinstallprompt`.
// We simulate that event (headless Chrome won't fire it on its own) with a
// mock prompt()/userChoice, then verify the Install bar appears and the
// button actually invokes the browser install dialog.
// ─────────────────────────────────────────────────────────────────────────
{
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })
  await passGates(page)

  // No prompt should be showing before the browser offers to install.
  const beforeEvent = await page.evaluate(() =>
    !!document.querySelector('[role="dialog"][aria-label="Install Quill"]'))
  ok('Install bar hidden until browser offers install', !beforeEvent)

  // Fire a synthetic beforeinstallprompt the component can capture.
  await page.evaluate(() => {
    const e = new Event('beforeinstallprompt')
    window.__promptCalled = false
    e.prompt = () => { window.__promptCalled = true }
    e.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })
    window.dispatchEvent(e)
  })
  await new Promise((r) => setTimeout(r, 300))

  const barShown = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="Install Quill"]')
    if (!dlg) return null
    const btn = [...dlg.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Install')
    return { visible: dlg.getBoundingClientRect().height > 0, hasInstallBtn: !!btn, text: dlg.textContent.trim() }
  })
  ok('Install bar appears after beforeinstallprompt', !!barShown && barShown.visible)
  ok('Install bar shows an "Install" button', !!barShown && barShown.hasInstallBtn)

  // Tap Install → should call the stashed event's prompt().
  await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="Install Quill"]')
    const btn = [...dlg.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Install')
    btn.click()
  })
  await new Promise((r) => setTimeout(r, 300))
  const promptCalled = await page.evaluate(() => window.__promptCalled === true)
  ok('Tapping Install triggers the browser install dialog', promptCalled)

  // After accepting, the bar should disappear and not return on reload.
  const goneAfterAccept = await page.evaluate(() =>
    !document.querySelector('[role="dialog"][aria-label="Install Quill"]'))
  ok('Install bar dismisses after the user accepts', goneAfterAccept)

  await ctx.close()
}

// ─────────────────────────────────────────────────────────────────────────
// Scenario B — iOS Safari: no beforeinstallprompt event exists, so the
// component should show the manual "Share → Add to Home Screen" hint.
// Fresh context so the dismissal from Scenario A doesn't leak in.
// ─────────────────────────────────────────────────────────────────────────
{
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  await page.emulate({
    viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  })
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })
  await passGates(page)

  const iosHint = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="Install Quill"]')
    if (!dlg) return null
    return { visible: dlg.getBoundingClientRect().height > 0, text: dlg.textContent.replace(/\s+/g, ' ').trim() }
  })
  ok('iOS Safari shows the install hint', !!iosHint && iosHint.visible)
  ok('iOS hint mentions "Add to Home Screen"',
    !!iosHint && /add to home screen/i.test(iosHint.text))
  await page.screenshot({ path: 'install-prompt-ios.png' })

  // Dismiss (×) and confirm it stays gone after a reload.
  await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="Install Quill"]')
    const x = [...dlg.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Dismiss')
    x.click()
  })
  await new Promise((r) => setTimeout(r, 200))
  await page.reload({ waitUntil: 'networkidle2' })
  await passGates(page)
  const goneAfterDismiss = await page.evaluate(() =>
    !document.querySelector('[role="dialog"][aria-label="Install Quill"]'))
  ok('Dismissed install hint stays gone after reload', goneAfterDismiss)

  await ctx.close()
}

await browser.close()

console.log('\n============== INSTALL / PWA TEST RESULTS ==============')
for (const [s, n] of results) console.log(`  [${s}] ${n}`)
const fails = results.filter((r) => r[0] === 'FAIL').length
console.log('=======================================================')
console.log(fails === 0 ? '✅ ALL PASSED' : `❌ ${fails} FAILED`)
process.exit(fails === 0 ? 0 : 1)
