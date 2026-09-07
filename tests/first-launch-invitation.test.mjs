import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const sequenceSource = await readFile(new URL('../src/introSequence.js', import.meta.url), 'utf8')
const introSource = await readFile(new URL('../src/IntroFlow.jsx', import.meta.url), 'utf8')
const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
const appCss = await readFile(new URL('../src/figma-overrides.css', import.meta.url), 'utf8')

test('first launch continues from invitation video through share and 4,000-point reward', () => {
  assert.match(sequenceSource, /'invite',\s*'invitation-share',\s*'reward-4000'/s)
  assert.match(introSource, /stage === 'invitation-share'/)
})

test('invitation share supports editing, copying, and all four share channels', () => {
  assert.match(introSource, /Edit message/)
  assert.match(introSource, /navigator\.clipboard\.writeText/)
  for (const channel of ['Zalo', 'Messenger', 'SMS', 'Email']) {
    assert.match(introSource, new RegExp(`>${channel}<`))
  }
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

test('second flow finishes in the Network contacts screen', () => {
  assert.match(appSource, /function finishFirstLaunchInNetwork\(contactsAreSynced\)/)
  assert.match(appSource, /setSelectedNav\('Network'\)/)
  assert.match(appSource, /setNetworkStage\('contacts'\)/)
  assert.match(appSource, /setNetworkInitialTab\('Contacts'\)/)
  assert.match(appSource, /onNext=\{\(\) => finishFirstLaunchInNetwork\(true\)\}/)
  assert.doesNotMatch(appSource, /setFirstLaunchStage\('dashboard'\)/)
})

test('first launch invited tab starts empty until the user sends an invite', () => {
  assert.match(
    appSource,
    /const visibleInvitedContacts = recentlyInvitedNames\.length[\s\S]*?: launchMode === 'first'[\s\S]*?\? \[\][\s\S]*?: NETWORK_CONTACTS/,
  )
  assert.match(appSource, /tab === 'Invited' && invitedContacts\.length > 0 && \(/)
})

test('replaying a launch mode resets invited contacts', () => {
  assert.match(appSource, /function restartLaunchMode\(mode\)[\s\S]*?setRecentlyInvitedNames\(\[\]\)[\s\S]*?setNetworkInitialTab\('Contacts'\)/)
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

test('invitation sent actions use the same label size', () => {
  assert.match(appCss, /\.contact-invite-again\s*\{[^}]*font-size:\s*16px;[^}]*line-height:\s*20px;/s)
  assert.match(appCss, /\.contact-invite-primary\s*\{[^}]*font-size:\s*16px;/s)
})

test('synced contacts list shows six complete rows before scrolling', () => {
  assert.match(appCss, /\.network-body\.contacts-synced \.network-results-area\s*\{[^}]*height:\s*504px;/s)
  assert.match(appCss, /\.network-invited-person\s*\{[^}]*min-height:\s*84px;/s)
  assert.doesNotMatch(appCss, /\.network-body\.contacts-synced \.network-invited-person/)
  assert.match(appSource, /showingSyncedContacts && filteredPeople\.length > 6 && showScrollHint/)
})

test('second flow uses correctly framed reward and pointing assets', () => {
  assert.match(appSource, /network-sync-offer-guide[^>]+intro-linh-guide-line\.png/)
  assert.match(appSource, /network-sync-offer-mascot[^>]+intro-linh-pointing\.png/)
})
