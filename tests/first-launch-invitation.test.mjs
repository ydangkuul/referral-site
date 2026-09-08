import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const sequenceSource = await readFile(new URL('../src/introSequence.js', import.meta.url), 'utf8')
const introSource = await readFile(new URL('../src/IntroFlow.jsx', import.meta.url), 'utf8')
const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
const appCss = await readFile(new URL('../src/figma-overrides.css', import.meta.url), 'utf8')

test('first launch continues from invitation video directly to the 4,000-point reward', () => {
  assert.match(sequenceSource, /'invite',\s*'reward-4000'/s)
  assert.doesNotMatch(sequenceSource, /invitation-share/)
  assert.doesNotMatch(introSource, /InvitationShareScreen|invitation-share/)
})

test('intro flow remains isolated to first launch mode', () => {
  assert.match(appSource, /launchMode === 'first' && !introCompleted/)
  assert.doesNotMatch(appSource, /launchMode === 'returning'[\s\S]{0,160}<IntroFlow/)
})

test('first flow continues directly into daily check-in without the dashboard preview', () => {
  assert.match(appSource, /setFirstLaunchStage\('checkin'\)/)
  assert.doesNotMatch(appSource, /firstLaunchStage === 'preview'/)
  assert.doesNotMatch(appSource, /<FirstLaunchDashboard preview/)
})

test('second flow continues from the 2,000-point reward into My network', () => {
  assert.match(appSource, /function finishFirstLaunchInNetwork\(contactsAreSynced\)/)
  assert.match(appSource, /setSelectedNav\('Network'\)/)
  assert.match(appSource, /function finishFirstLaunchInNetwork[\s\S]*setNetworkStage\('overview'\)/)
  assert.match(appSource, /setNetworkInitialTab\('Contacts'\)/)
  assert.match(appSource, /onNext=\{\(\) => finishFirstLaunchInNetwork\(true\)\}/)
  assert.doesNotMatch(appSource, /setFirstLaunchStage\('dashboard'\)/)
})

test('My network overview starts the Figma contact invitation flow', () => {
  assert.match(appSource, /function NetworkOverviewScreen/)
  assert.match(appSource, /<h1>My network<\/h1>/)
  assert.match(appSource, /Earn points when you invite/)
  assert.match(appSource, /Contacts.*Invite.*Invited.*Nudge.*Registered.*Nudge.*Influencer.*Connect.*Merchant.*Connect/s)
  assert.match(appSource, /onInvite=\{\(\) => \{\s*setNetworkInitialTab\('Contacts'\)\s*setNetworkStage\('contacts'\)/s)
  assert.match(appSource, /onNudge=\{\(\) => \{\s*setNetworkInitialTab\('Invited'\)\s*setNetworkStage\('contacts'\)/s)
  assert.match(appSource, /onBack=\{\(\) => setNetworkStage\('overview'\)\}/)
})

test('Nudge is enabled by the populated Figma Invited list', () => {
  assert.match(appSource, /const enabled = item\.key === 'contacts' \|\| \(item\.key === 'invited' && invitedCount > 0\)/)
  assert.match(appSource, /disabled=\{!enabled\}/)
  assert.doesNotMatch(appSource, /const hasAction/)
  assert.match(appSource, /item\.key === 'invited'[\s\S]*?String\(invitedCount\)\.padStart\(2, '0'\)/)
  assert.match(appSource, /invitedCount=\{visibleInvitedContacts\.length\}/)
})

test('first launch invited tab follows the Figma ten-person reminder scene', () => {
  assert.match(appSource, /const visibleInvitedContacts = NETWORK_CONTACTS/)
  assert.match(appSource, /invited-mai-anh[\s\S]*invited-minh-khang/)
  assert.doesNotMatch(appSource, /network-invited-summary/)
  assert.match(appSource, /person\.reward \?\? 'Waiting to register'/)
})

test('replaying first launch keeps already invited contacts in the current session', () => {
  const restartLaunchMode = appSource.match(/function restartLaunchMode\(mode\) \{([\s\S]*?)\n  \}/)?.[1] ?? ''
  assert.doesNotMatch(restartLaunchMode, /setRecentlyInvitedNames/)
  assert.match(appSource, /onClick=\{\(\) => restartLaunchMode\(key\)\}/)
})

test('preview hides the temporary contacts sync toggle', () => {
  assert.doesNotMatch(appSource, /className="contacts-case-toggle"/)
})

test('contact invitations send one person at a time without a selection scene', () => {
  assert.doesNotMatch(appSource, /function ContactSelectScreen/)
  assert.doesNotMatch(appSource, /contactInviteStage === 'select'/)
  assert.match(appSource, /function openContactInvite\(person\)[\s\S]*?setSelectedInviteNames\(\[person\.name\]\)[\s\S]*?setContactInviteStage\('preview'\)/)
  assert.match(appSource, /Ready to send invitation to \{names\[0\]\}/)
})

test('contact invitation moves through preview, 1,000-point reward, then sent status', () => {
  assert.match(appSource, /contactInviteStage === 'preview'[\s\S]*setContactInviteStage\('reward'\)/)
  assert.match(appSource, /contactInviteStage === 'reward'[\s\S]*<ContactInvitationReward/)
  assert.match(appSource, /onNext=\{\(\) => setContactInviteStage\('sent'\)\}/)
  assert.match(appSource, /images\/network-invitation-points-1000\.png/)
  assert.match(appSource, /images\/network-invitation-celebration\.png/)
})

test('bottom navigation stays on overview but hides on the Figma Invited scene', () => {
  assert.match(appSource, /selectedNav === 'Network' && \['consent', 'syncing', 'success', 'reward'\]\.includes\(networkStage\)/)
  assert.match(appSource, /networkStage === 'contacts' && networkInitialTab === 'Invited'/)
})

test('invitation sent actions use the same label size', () => {
  assert.match(appCss, /\.contact-invite-again\s*\{[^}]*font-size:\s*16px;[^}]*line-height:\s*20px;/s)
  assert.match(appCss, /\.contact-invite-primary\s*\{[^}]*font-size:\s*16px;/s)
})

test('synced contacts list shows six complete rows before scrolling', () => {
  assert.match(appCss, /\.network-body\.contacts-synced \.network-results-area\s*\{[^}]*height:\s*auto;/s)
  assert.match(appCss, /\.network-body\.contacts-synced \.network-invited-person\s*\{[^}]*min-height:\s*76px;/s)
  assert.match(appCss, /\.network-invited-person\s*\{[^}]*min-height:\s*84px;/s)
  assert.match(appSource, /showingSyncedContacts && filteredPeople\.length > 6 && showScrollHint/)
})

test('second flow uses correctly framed reward and pointing assets', () => {
  assert.match(appSource, /network-sync-offer-guide[^>]+intro-linh-guide-line\.png/)
  assert.match(appSource, /network-sync-offer-mascot[^>]+intro-linh-pointing\.png/)
  assert.match(appSource, /Claim 2,000 pts/)
  assert.doesNotMatch(appSource, /Claim 100,000 pts/)
})
