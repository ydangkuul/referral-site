import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/dashboard-home.css', import.meta.url), 'utf8')

test('Home displays the Card and QR shortcuts used by Network', () => {
  assert.match(app, /aria-label="Open VietPay card"/)
  assert.match(app, /images\/dashboard-card\.svg/)
  assert.match(app, /aria-label="Open QR code"/)
  assert.match(app, /images\/dashboard-qr\.svg/)
})

test('Home shortcut group matches the Network header position', () => {
  assert.match(css, /\.dashboard-content \.app-header\s*\{[^}]*padding:\s*0 25px;/s)
  assert.match(css, /\.dashboard-header-actions\s*\{[^}]*width:\s*114px;[^}]*height:\s*34px;[^}]*gap:\s*9px;/s)
  assert.match(css, /\.dashboard-header-actions button\s*\{[^}]*width:\s*32px;[^}]*height:\s*32px;/s)
})
