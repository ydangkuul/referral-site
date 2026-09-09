import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const pointsSource = await readFile(new URL('../src/PointsFlow.jsx', import.meta.url), 'utf8')

test('points header reuses the three network shortcut icons', () => {
  assert.match(pointsSource, /aria-label="Points shortcuts"[\s\S]*?<CreditCard[\s\S]*?<QrCode[\s\S]*?<BankIcon/)
})
