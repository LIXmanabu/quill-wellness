import puppeteer from 'puppeteer-core'
import fs from 'fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = 'http://localhost:5174/'
const OUT = '.impeccable/critique/shots'
fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
})

const page = await browser.newPage()
await page.emulate({
  viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
})
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function clickByText(text) {
  return page.evaluate((t) => {
    const els = [...document.querySelectorAll('button, a')]
    const el = els.find((e) => e.textContent.trim().toLowerCase().includes(t.toLowerCase()))
    if (el) { el.scrollIntoView(); el.click(); return true }
    return false
  }, text)
}

// Scan the current page for clipped / overflowing / offscreen text.
async function scanOverflow(name) {
  return page.evaluate((pageName) => {
    const issues = []
    const vw = window.innerWidth
    const doc = document.documentElement
    if (doc.scrollWidth > vw + 1) {
      issues.push({ page: pageName, kind: 'horizontal-page-scroll', detail: `document.scrollWidth ${doc.scrollWidth} > viewport ${vw}` })
    }
    const els = [...document.querySelectorAll('body *')]
    for (const el of els) {
      if (!el.textContent || !el.textContent.trim()) continue
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      // element sticking out of the viewport horizontally
      if ((r.right > vw + 2 || r.left < -2) && cs.position !== 'fixed') {
        const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
        if (ownText) {
          issues.push({ page: pageName, kind: 'offscreen-text', tag: el.tagName, cls: String(el.className).slice(0, 80), text: el.textContent.trim().slice(0, 60), rect: { left: Math.round(r.left), right: Math.round(r.right) } })
        }
      }
      // text clipped by overflow hidden (not deliberate line-clamp/truncate)
      const clamped = cs.webkitLineClamp && cs.webkitLineClamp !== 'none'
      const truncate = cs.textOverflow === 'ellipsis'
      if (!clamped && !truncate && (cs.overflowX === 'hidden' || cs.overflow === 'hidden')) {
        if (el.scrollWidth > el.clientWidth + 3) {
          const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
          if (ownText) {
            issues.push({ page: pageName, kind: 'clipped-text', tag: el.tagName, cls: String(el.className).slice(0, 80), text: el.textContent.trim().slice(0, 60), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth })
          }
        }
      }
    }
    return issues
  }, name)
}

async function shoot(name, { fullPage = true } = {}) {
  await sleep(400)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage })
  const issues = await scanOverflow(name)
  return issues
}

await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })
await sleep(900)

const allIssues = []

// Auth gate
allIssues.push(...await shoot('00-auth-gate', { fullPage: false }))
await clickByText('Continue as guest')
await sleep(700)
// Onboarding
allIssues.push(...await shoot('01-onboarding', { fullPage: false }))
await clickByText('Skip')
await sleep(1100)

// Landing page (Today)
allIssues.push(...await shoot('02-today'))

// Fill the check-in to see the result state
await page.evaluate(() => {
  const labels = [...document.querySelectorAll('button')]
  const first = labels.find((b) => b.textContent.includes('Running on fumes') || b.closest('section')?.textContent.includes('Your energy'))
})
// click first energy + first feeling option
await page.evaluate(() => {
  const sections = [...document.querySelectorAll('section')]
  const sec = sections.find((s) => s.textContent.includes('Your energy right now'))
  if (sec) {
    const grids = sec.querySelectorAll('.grid')
    if (grids[0]) grids[0].querySelector('button')?.click()
  }
})
await sleep(300)
await page.evaluate(() => {
  const sections = [...document.querySelectorAll('section')]
  const sec = sections.find((s) => s.textContent.includes('And how today feels'))
  if (sec) {
    const grids = [...sec.querySelectorAll('.grid')]
    const g = grids.find((x) => x.previousElementSibling?.textContent?.includes('how today feels')) || grids[1] || grids[0]
    g?.querySelector('button')?.click()
  }
})
await sleep(600)
allIssues.push(...await shoot('03-today-checked-in'))

// Home
await clickByText('Home')
await sleep(1200)
allIssues.push(...await shoot('04-home'))

// Body
await clickByText('Body')
await sleep(1400)
allIssues.push(...await shoot('05-body'))

// My Quill
await clickByText('My Quill')
await sleep(1200)
allIssues.push(...await shoot('06-myquill'))

// More sheet
await clickByText('More')
await sleep(700)
allIssues.push(...await shoot('07-more-sheet', { fullPage: false }))

// Pro (via More sheet button)
await clickByText('Try Pro')
await sleep(1400)
allIssues.push(...await shoot('08-pro'))

// Tips
await clickByText('More')
await sleep(600)
await clickByText('Daily tips')
await sleep(1200)
allIssues.push(...await shoot('09-tips'))

// Community
await clickByText('More')
await sleep(600)
await clickByText('Community')
await sleep(1400)
allIssues.push(...await shoot('10-community'))

// Wellness
await clickByText('More')
await sleep(600)
await clickByText('Wellness')
await sleep(1200)
allIssues.push(...await shoot('11-wellness'))

// Tester badge — arrive via the invite link, dismiss gates, capture closed + open
await page.goto(URL + '?tester=quill-beta', { waitUntil: 'networkidle2', timeout: 30000 })
await sleep(900)
await clickByText('Continue as guest')
await sleep(700)
await clickByText('Skip')
await sleep(1000)
allIssues.push(...await shoot('12-tester-badge-closed', { fullPage: false }))
const badgeState = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === 'Beta tester menu')
  if (b) b.click()
  return { present: !!b, expanded: b?.getAttribute('aria-expanded') ?? null }
})
await sleep(500)
allIssues.push(...await shoot('13-tester-badge-open', { fullPage: false }))

// dedupe issues
const seen = new Set()
const unique = allIssues.filter((i) => {
  const k = JSON.stringify([i.page, i.kind, i.text || i.detail, i.cls])
  if (seen.has(k)) return false
  seen.add(k)
  return true
})

console.log(JSON.stringify({ issues: unique, badgeState, consoleErrors: errors.slice(0, 10) }, null, 2))
await browser.close()
