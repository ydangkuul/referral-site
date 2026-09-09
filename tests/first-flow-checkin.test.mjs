import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
const checkInSource = await readFile(new URL('../src/CheckInFlow.jsx', import.meta.url), 'utf8')
const checkInCss = await readFile(new URL('../src/checkin.css', import.meta.url), 'utf8')
const appCss = await readFile(new URL('../src/figma-overrides.css', import.meta.url), 'utf8')

test('first-flow check-in follows the selected Figma contact-sync sequence', () => {
  assert.match(appSource, /firstLaunchStage === 'network-offer'[\s\S]*?points=\{1000\}/)
  assert.match(appSource, /firstLaunchStage === 'privacy'[\s\S]*?selective[\s\S]*?showInfo=\{false\}[\s\S]*?setFirstLaunchStage\('sync-select'\)/)
  assert.match(appSource, /firstLaunchStage === 'sync-select'[\s\S]*?<ContactSyncSelectScreen/)
  assert.match(appSource, /firstLaunchStage === 'syncing'[\s\S]*?showPendingAction=\{false\}[\s\S]*?setFirstLaunchStage\('sync-select'\)/)
  assert.match(appSource, /firstLaunchStage === 'sync-reward'[\s\S]*?points=\{2000\}[\s\S]*?contactSync/)
})

test('daily check-in keeps the Figma back action and motion values', () => {
  assert.match(checkInSource, /aria-label="Back from daily check-in"/)
  assert.match(checkInSource, /animateStreak=\{launchMode === 'first'\}/)
  assert.match(checkInCss, /@keyframes checkin-streak-card\s*\{[\s\S]*?translateY\(-544px\)[\s\S]*?10\.15%, 100%[\s\S]*?translateY\(0\)/)
  assert.match(checkInCss, /animation:\s*checkin-streak-card 2s linear infinite/)
  assert.match(checkInCss, /prefers-reduced-motion:\s*reduce[\s\S]*?animation:\s*none/)
})

test('contact selection reuses the Figma avatar and checkbox geometry', () => {
  assert.match(appSource, /className="contact-sync-select-avatar"/)
  assert.match(appSource, /className=\{`contact-sync-select-checkbox/)
  assert.match(appCss, /\.contact-sync-select-avatar\s*\{[^}]*width:\s*40px;[^}]*height:\s*40px;/s)
  assert.match(appCss, /\.contact-sync-select-checkbox\s*\{[^}]*width:\s*20px;[^}]*height:\s*20px;/s)
})
