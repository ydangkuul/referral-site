import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const introSource = await readFile(new URL('../src/IntroFlow.jsx', import.meta.url), 'utf8')
const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
const introCss = await readFile(new URL('../src/intro.css', import.meta.url), 'utf8')
const checkInSource = await readFile(new URL('../src/CheckInFlow.jsx', import.meta.url), 'utf8')

test('moves only the primary plus glyph down by one pixel', () => {
  assert.match(introCss, /\.intro-stepper button\.primary\s*\{[^}]*padding-bottom:\s*0;/s)
})

test('layers the pointing Linh artwork above the estimate card', () => {
  assert.match(introCss, /\.intro-pointing-hero\s*\{[^}]*z-index:\s*5;/s)
  assert.match(introCss, /\.intro-estimate-card\s*\{[^}]*z-index:\s*4;/s)
})

test('wires the Estimate information bubble to the shared guide dialog', () => {
  assert.match(introSource, /const \[infoOpen, setInfoOpen\] = useState\(false\)/)
  assert.match(introSource, /className="bubble intro-estimate-bubble"/)
  assert.match(introSource, /onOpenEstimateGuide/)
  assert.match(appSource, /estimate:\s*\{/)
  assert.match(appSource, /setGuideTopic\('estimate'\)/)
})

test('daily check-in 1,000-point success uses the horizontal points artwork', () => {
  assert.match(checkInSource, /rewardPoints === 1000 \? '\/images\/points-1000\.png'/)
  assert.match(checkInSource, /\/images\/intro-linh-celebrate\.png/)
  assert.match(checkInSource, /\/images\/intro-sequence-confetti\.png/)
})
