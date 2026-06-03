import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = process.argv[2] || 'https://lixmanabu.github.io/quill-wellness/'
const TAG = process.argv[3] || 'live'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
})

async function dismiss(page) {
  await new Promise((r) => setTimeout(r, 900))
  await page.evaluate(() => {
    const click = (t) => {
      const el = [...document.querySelectorAll('button, a')]
        .find((e) => e.textContent.trim().toLowerCase().includes(t))
      if (el) el.click()
    }
    click('continue as guest')
  })
  await new Promise((r) => setTimeout(r, 600))
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('button, a')]
      .find((e) => /skip|maybe later|done/i.test(e.textContent))
    if (el) el.click()
  })
  await new Promise((r) => setTimeout(r, 600))
}

// ── Phone (iPhone 13) ──
const phone = await browser.newPage()
await phone.emulate({
  viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
})
await phone.goto(URL, { waitUntil: 'networkidle2', timeout: 45000 })
await dismiss(phone)
await phone.screenshot({ path: `check-${TAG}-phone.png` })
const phoneNav = await phone.evaluate(() => {
  const bottom = document.querySelector('nav, [class*="fixed"][class*="bottom"]')
  const hasBottomBar = !![...document.querySelectorAll('*')].find(e =>
    getComputedStyle(e).position === 'fixed' && parseInt(getComputedStyle(e).bottom) === 0 && e.querySelectorAll('button,a').length >= 3)
  const topMast = [...document.querySelectorAll('header *')].some(e => /journal|skin|body|wellness/i.test(e.textContent) && getComputedStyle(e.closest('header')||e).display !== 'none')
  return { hasBottomBar, width: window.innerWidth }
})

// ── Laptop ──
const laptop = await browser.newPage()
await laptop.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
await laptop.goto(URL, { waitUntil: 'networkidle2', timeout: 45000 })
await dismiss(laptop)
await laptop.screenshot({ path: `check-${TAG}-laptop.png` })
const laptopNav = await laptop.evaluate(() => {
  const header = document.querySelector('header')
  const headerVisible = header && getComputedStyle(header).display !== 'none'
  const hasBottomBar = !![...document.querySelectorAll('*')].find(e =>
    getComputedStyle(e).position === 'fixed' && parseInt(getComputedStyle(e).bottom) === 0 && e.querySelectorAll('button,a').length >= 3)
  return { headerVisible, hasBottomBar, width: window.innerWidth }
})

console.log(`URL: ${URL}`)
console.log('PHONE  (390px):', JSON.stringify(phoneNav))
console.log('LAPTOP (1280px):', JSON.stringify(laptopNav))
console.log(`Saved: check-${TAG}-phone.png, check-${TAG}-laptop.png`)

await browser.close()
