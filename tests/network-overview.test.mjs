import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/figma-overrides.css', import.meta.url), 'utf8')

test('Network opens on the Figma My network overview scene', () => {
  assert.match(app, /useState\('Network'\)/)
  assert.match(app, /useState\('returning'\)/)
  assert.match(app, /useState\('overview'\)/)
  assert.match(app, /function NetworkOverviewScreen/)
  assert.match(app, /<h1>My network<\/h1>/)
  assert.match(app, /Earn points when you invite/)
  assert.match(app, /Contacts.*Invite.*Invited.*Nudge.*Registered.*Connect.*Influencer.*Connect.*Merchant.*Connect/s)
})

test('first-launch network flow starts with synced contacts ready to invite', () => {
  assert.match(app, /const \[contactsSynced, setContactsSynced\] = useState\(true\)/)
  assert.doesNotMatch(app, /contacts-case-toggle|contacts: synced|contacts: not synced/)
  assert.match(app, /\.slice\(0, 5\)/)
  assert.match(app, /setContactInviteStage\(person \? 'preview' : 'select'\)/)
  assert.match(app, /setContactInviteStage\(contactInviteDirect \? null : 'select'\)/)
})

test('first launch keeps Invited empty until an invitation is sent', () => {
  assert.match(app, /tab === 'Invited' && invitedContacts\.length > 0/)
  assert.match(app, /const visibleInvitedContacts = recentlyInvitedNames\.map/)
  assert.doesNotMatch(app, /launchMode === 'first'\s*\? \[\]\s*:\s*NETWORK_CONTACTS/)
  assert.match(app, /setRecentlyInvitedNames\(\(names\) => \[\.\.\.new Set\(\[\.\.\.names, \.\.\.selectedInviteNames\]\)\]\)/)
})

test('keeps Nudge visible but disabled until at least one contact has been invited', () => {
  assert.match(app, /function NetworkOverviewScreen\(\{ invitedCount, onBack, onInvite, onNudge \}\)/)
  assert.match(app, /const enabled = item\.key === 'contacts' \|\| \(item\.key === 'invited' && invitedCount > 0\)/)
  assert.match(app, /disabled=\{!enabled\}/)
  assert.doesNotMatch(app, /const hasAction/)
  assert.match(app, /invitedCount=\{recentlyInvitedNames\.length\}/)
})

test('individual invite follows preview, 1,000-point reward, then sent status', () => {
  assert.match(app, /contactInviteStage === 'preview'[\s\S]*setContactInviteStage\('reward'\)/)
  assert.match(app, /contactInviteStage === 'reward'[\s\S]*<ContactInvitationReward/)
  assert.match(app, /onNext=\{\(\) => setContactInviteStage\('sent'\)\}/)
  assert.match(app, /images\/network-invitation-points-1000\.png/)
  assert.match(app, /images\/network-invitation-celebration\.png/)
})

test('bottom navigation stays on the overview and leaves the invitation scenes clear', () => {
  assert.match(app, /selectedNav === 'Network' && networkStage !== 'overview'/)
  assert.match(css, /\.network-body\.contacts-synced \.network-invite-button \{\s*display: none;/)
})

test('Network overview actions continue into the existing contact flows', () => {
  assert.match(app, /onInvite=\{\(\) => \{\s*setNetworkInitialTab\('Contacts'\)\s*setNetworkStage\('contacts'\)/s)
  assert.match(app, /onNudge=\{\(\) => \{\s*setNetworkInitialTab\('Invited'\)\s*setNetworkStage\('contacts'\)/s)
  assert.match(app, /onBack=\{\(\) => setNetworkStage\('overview'\)\}/)
})

test('Network overview preserves the 390px Figma geometry and VietPay tokens', () => {
  assert.match(css, /Network overview — Figma node 1070:7668/)
  assert.match(css, /\.network-overview-banner[\s\S]*width: 342px;[\s\S]*height: 68px;/)
  assert.match(css, /\.network-overview-row[\s\S]*height: 90px;/)
  assert.match(css, /\.network-overview-title h1[\s\S]*color: #0d3c7d;[\s\S]*font-size: 24px;/)
})
