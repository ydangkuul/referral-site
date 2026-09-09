import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const introSource = await readFile(new URL('../src/IntroFlow.jsx', import.meta.url), 'utf8')

test('first-launch welcome scene counts down from three seconds', () => {
  assert.match(introSource, /function WelcomeScreen[\s\S]*?useState\(3\)/)
  assert.doesNotMatch(introSource, /function WelcomeScreen[\s\S]*?useState\(5\)/)
})
