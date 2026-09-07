import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('shows Saved after saving the income goal', () => {
  assert.match(appSource, /const handleGoalSave = \(\) => setGoalSaved\(true\)/)
  assert.match(appSource, /onClick=\{handleGoalSave\}/)
  assert.match(appSource, /\{goalSaved \? 'Saved' : 'Save changes'\}/)
})

test('returns to Save changes when the amount slider or timeline changes', () => {
  assert.match(appSource, /const handleGoalAmountChange = \(event\) => \{[\s\S]*?setGoalSaved\(false\)[\s\S]*?\}/)
  assert.match(appSource, /onChange=\{handleGoalAmountChange\}/)
  assert.match(appSource, /const handleGoalMonthsChange = \(nextMonths\) => \{[\s\S]*?setGoalSaved\(false\)[\s\S]*?\}/)
  assert.match(appSource, /onClick=\{\(\) => handleGoalMonthsChange\(m\)\}/)
})

test('offers 12, 18, and 24 month goal timelines', () => {
  assert.match(appSource, /\{\[12, 18, 24\]\.map\(\(m\) => \(/)
})
