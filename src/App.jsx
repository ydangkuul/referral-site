import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Signal, Wifi, BatteryFull, Landmark, UserRound, Info, CalendarCheck,
  ChevronDown, ChevronLeft, Clock3, House, Search, UsersRound, Goal as GoalIcon,
  CircleCheck, X, Play, Pause,
} from 'lucide-react'
import PointsFlow from './PointsFlow.jsx'
import CheckInFlow from './CheckInFlow.jsx'
import IntroFlow from './IntroFlow.jsx'

// Brand bank icon (from design handoff) — recolored to currentColor so it
// tracks the theme token instead of the hardcoded #0D3C7D in the source file.
function BankIcon({ width = 28, height = 25, 'aria-label': ariaLabel }) {
  return (
    <svg width={width} height={height} viewBox="0 0 28 25" fill="none" xmlns="http://www.w3.org/2000/svg"
      role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel} aria-hidden={ariaLabel ? undefined : true}>
      <g clipPath="url(#bank-icon-clip)">
        <path d="M26.752 22.8496C27.249 22.8496 27.6523 23.2529 27.6523 23.75C27.6523 24.2471 27.249 24.6504 26.752 24.6504H1.25195C0.754897 24.6504 0.351562 24.2471 0.351562 23.75C0.351562 23.2529 0.754897 22.8496 1.25195 22.8496H26.752Z" fill="currentColor" />
        <path d="M4.60156 19.25V11.375C4.60156 10.8779 5.0049 10.4746 5.50195 10.4746C5.99901 10.4746 6.40234 10.8779 6.40234 11.375V19.25C6.40234 19.7471 5.99901 20.1504 5.50195 20.1504C5.0049 20.1504 4.60156 19.7471 4.60156 19.25Z" fill="currentColor" />
        <path d="M10.2656 19.25V11.375C10.2656 10.8779 10.669 10.4746 11.166 10.4746C11.6631 10.4746 12.0664 10.8779 12.0664 11.375V19.25C12.0664 19.7471 11.6631 20.1504 11.166 20.1504C10.669 20.1504 10.2656 19.7471 10.2656 19.25Z" fill="currentColor" />
        <path d="M15.9336 19.25V11.375C15.9336 10.8779 16.3369 10.4746 16.834 10.4746C17.331 10.4746 17.7344 10.8779 17.7344 11.375V19.25C17.7344 19.7471 17.331 20.1504 16.834 20.1504C16.3369 20.1504 15.9336 19.7471 15.9336 19.25Z" fill="currentColor" />
        <path d="M21.6016 19.25V11.375C21.6016 10.8779 22.0049 10.4746 22.502 10.4746C22.999 10.4746 23.4023 10.8779 23.4023 11.375V19.25C23.4023 19.7471 22.999 20.1504 22.502 20.1504C22.0049 20.1504 21.6016 19.7471 21.6016 19.25Z" fill="currentColor" />
        <path d="M13.6947 0.402394C13.9237 0.320256 14.1783 0.334018 14.3988 0.44341L25.7318 6.06841C26.106 6.25414 26.3036 6.6734 26.2084 7.08013C26.113 7.48688 25.7502 7.77529 25.3324 7.77544H2.66543C2.24753 7.77544 1.88486 7.48699 1.78945 7.08013C1.69422 6.67339 1.89083 6.25415 2.26504 6.06841L13.599 0.44341L13.6947 0.402394ZM6.50527 5.97466H21.4926L13.9984 2.25493L6.50527 5.97466Z" fill="currentColor" />
      </g>
      <defs>
        <clipPath id="bank-icon-clip">
          <rect width="28" height="25" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

// Not exported by the pinned lucide-react version — reproduced inline from
// the exact path captured in the reference site's rendered SVG.
function CircleStar({ size = 24, strokeWidth = 1.7 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M11.051 7.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.867l-1.156-1.152a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z" />
    </svg>
  )
}

const MIN_GOAL = 5
const MAX_GOAL = 100
const STEP_GOAL = 5

// Baseline daily-action mix at the reference goal (30M / 12 months).
// Scaled proportionally for other goal/timeline combinations — the
// exact original formula wasn't recoverable from the minified bundle,
// this is a reasonable stand-in documented here for whoever tunes it next.
const BASE_GOAL = 30
const BASE_MONTHS = 12
const BASE_ACTIONS = { invites: 5, remind: 3, ppp: 3, sharp: 2 }
const BASE_NETWORK = { merchants: 40, influencers: 60 }
const ACTION_MULTIPLIER = 2

const GUIDE_TOPICS = {
  estimate: {
    title: 'Estimated monthly reward guide',
    steps: [
      { label: 'STEP 1', heading: 'Add merchants you know', number: '12 merchants', detail: 'Use the stepper to estimate how many merchants you can refer.' },
      { label: 'STEP 2', heading: 'See your reward estimate', number: '18,000 pt', detail: 'Each merchant updates your estimated referral points instantly.' },
      { label: 'STEP 3', heading: 'Claim your first reward', number: '+1,000 pt', detail: 'Continue the setup flow to claim your first milestone reward.' },
    ],
  },
  points: {
    title: 'Available points guide',
    steps: [
      { label: 'STEP 1', heading: 'Earn points every day', number: '+50 pts', detail: 'Invites, reminders, PPP and SHARP actions all add up.' },
      { label: 'STEP 2', heading: 'Points convert to VND', number: '100 pts', detail: '= 10,000 VND, redeemable any time from your wallet.' },
      { label: 'STEP 3', heading: 'Track your lifetime total', number: '1,245 pts', detail: 'Lifetime points never expire, even after you redeem.' },
    ],
  },
  goal: {
    title: 'Monthly income goal guide',
    steps: [
      { label: 'STEP 1', heading: 'Set a target', number: '30M VND', detail: 'Pick an amount and a timeline that fits your pace.' },
      { label: 'STEP 2', heading: 'We estimate your daily actions', number: '13 actions', detail: 'Invites, reminders, PPP and SHARP needed per day.' },
      { label: 'STEP 3', heading: 'Adjust any time', number: '6–18 mo', detail: 'Move the timeline to see the plan recalculate live.' },
    ],
  },
  activities: {
    title: 'Activities / day guide',
    steps: [
      { label: 'STEP 1', heading: 'Four action types', number: '4 types', detail: 'Invites, Remind, PPP and SHARP each earn points differently.' },
      { label: 'STEP 2', heading: 'Scales with your goal', number: '13 actions', detail: 'A bigger goal or shorter timeline raises the daily target.' },
      { label: 'STEP 3', heading: 'Spread them through the day', number: 'Daily', detail: 'Consistent small actions beat one big push at the end.' },
    ],
  },
  contactSync: {
    title: 'Contact sync guide',
    steps: [
      { label: 'STEP 1', heading: 'Your contacts stay protected', number: 'Private', detail: 'Contacts are used only to find people you already know on VietPay.' },
      { label: 'STEP 2', heading: 'You stay in control', number: 'Your choice', detail: 'Nothing is sent automatically and syncing can be turned off any time.' },
      { label: 'STEP 3', heading: 'Sync and earn points', number: '+1,000 pts', detail: 'Continue the contact sync flow to update your network and claim the reward.' },
    ],
  },
}

function formatVnd(n) {
  return n.toLocaleString('en-US')
}

function InfoBubble({ variant, title, children, onClose, onOpenGuide }) {
  return (
    <>
      <button className="dismiss-tip" aria-label="Dismiss" onClick={onClose} />
      <div className={`bubble ${variant}`} role="dialog" aria-modal="false">
        <button className="tip-close" aria-label="Close" onClick={onClose}>
          <X size={16} />
        </button>
        <strong>{title}</strong>
        <p>{children}</p>
        <button className="video-link" onClick={onOpenGuide}>
          <Play size={14} /> Watch guide
        </button>
      </div>
    </>
  )
}

function GuideDialog({ topic, onClose }) {
  const data = GUIDE_TOPICS[topic]
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef(null)

  const step = data.steps[stepIndex]
  const totalSeconds = 8
  const elapsed = Math.round((progress / 100) * totalSeconds)

  function togglePlay() {
    if (playing) {
      clearInterval(timerRef.current)
      setPlaying(false)
      return
    }
    setPlaying(true)
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 100 / (totalSeconds * 4)
        if (next >= 100) {
          clearInterval(timerRef.current)
          setPlaying(false)
          setStepIndex((i) => (i + 1 < data.steps.length ? i + 1 : i))
          return 0
        }
        return next
      })
    }, 250)
  }

  return (
    <>
      <div data-slot="dialog-overlay" onClick={onClose} />
      <div className="video-dialog" role="dialog" aria-modal="true" aria-labelledby="guide-title">
        <h2 id="guide-title">{data.title}</h2>
        <div className="mock-stage">
          <span className="mock-label">{step.label}</span>
          <span className="mock-step">{stepIndex + 1} / {data.steps.length}</span>
          <h3>{step.heading}</h3>
          <div className="mock-number">{step.number}</div>
          <div className="mock-track">
            <div style={{ width: `${progress}%` }} />
          </div>
          <p>{step.detail}</p>
          <div className="mock-controls">
            <button className="mock-play" onClick={togglePlay}>
              {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Pause' : 'Play'}
            </button>
            <input
              type="range" min="0" max="100" value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              aria-label="Guide progress"
            />
            <span className="mock-time">{elapsed}s / {totalSeconds}s</span>
          </div>
          <p className="mock-detail sr-only">Simulated tutorial with playback and progress controls.</p>
        </div>
        <button className="close-video" onClick={onClose}>Close guide</button>
      </div>
    </>
  )
}

const NETWORK_CONTACTS = [
  { name: 'Tran Thi B', timing: 'Invited today', initial: 'T' },
  { name: 'Le Van C', timing: 'Invited 2 days ago', initial: 'L' },
  { name: 'Hoang Van E', timing: 'Invited 5 days ago', initial: 'H' },
]

const SYNCED_CONTACTS = [
  { name: 'Mai Anh', initial: 'M' },
  { name: 'Nguyễn Minh', initial: 'N' },
  { name: 'Lan Phương', initial: 'L' },
  { name: 'Duc Long', initial: 'D' },
  { name: 'Thu Ha', initial: 'T' },
  { name: 'Quang Huy', initial: 'Q' },
  { name: 'Bảo Ngọc', initial: 'B' },
  { name: 'Minh Khang', initial: 'M' },
  { name: 'Thanh Trúc', initial: 'T' },
  { name: 'Gia Hân', initial: 'G' },
]

const NETWORK_SYNC_METRICS = [
  { label: 'Contacts', icon: '/images/network-contacts.svg', tone: 'contacts' },
  { label: 'Invited', icon: '/images/network-invited.png', tone: 'invited' },
  { label: 'Registered', icon: '/images/network-registered.png', tone: 'registered' },
]

function NetworkSyncOfferScreen({ onBack, onContinue }) {
  return (
    <div className="network-sync-offer" aria-label="Sync contacts to get points">
      <header className="network-sync-offer-header">
        <button type="button" aria-label="Back to My Network" onClick={onBack}><ChevronLeft size={22} /></button>
        <Info size={18} aria-label="About contact syncing" />
      </header>

      <div className="network-sync-offer-hero" aria-hidden="true">
        <img className="network-sync-offer-guide" src="/images/intro-linh-guide-line.png" alt="" />
        <img className="network-sync-offer-mascot" src="/images/intro-linh-pointing.png" alt="" />
      </div>

      <section className="network-sync-offer-title">
        <strong>Sync contacts</strong>
        <span>to get points</span>
      </section>

      <section className="network-sync-offer-metrics" aria-label="Network totals">
        {NETWORK_SYNC_METRICS.map((item) => (
          <div className="network-sync-offer-metric" key={item.label}>
            <span className={`network-sync-offer-metric-icon ${item.tone}`} aria-hidden="true">
              <img src={item.icon} alt="" />
            </span>
            <span>{item.label}</span>
            <strong>00</strong>
          </div>
        ))}
      </section>

      <button type="button" className="network-sync-offer-terms">Terms and Conditions</button>
      <button type="button" className="network-sync-offer-primary" onClick={onContinue}>Sync contacts get 1,000 pts</button>
    </div>
  )
}

const NETWORK_PRIVACY_POINTS = [
  {
    icon: '/images/network-consent-forbid.svg',
    copy: 'No messages sent automatically without your confirmation',
  },
  {
    icon: '/images/network-consent-lock.svg',
    copy: 'Not stored for anything beyond finding friends',
  },
  {
    icon: '/images/network-consent-check.svg',
    copy: 'You can turn off syncing anytime',
  },
]

function NetworkPrivacyConsentScreen({ onBack, onContinue, onOpenGuide }) {
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <div className="network-privacy-consent" aria-label="Contact sync privacy">
      <header className="network-privacy-header">
        <button type="button" aria-label="Back to sync contacts" onClick={onBack}><ChevronLeft size={22} /></button>
        <button
          type="button"
          className="network-privacy-info"
          aria-label="About contact privacy"
          aria-expanded={infoOpen}
          onClick={() => setInfoOpen((open) => !open)}
        >
          <Info size={18} />
        </button>
      </header>

      {infoOpen && (
        <InfoBubble
          variant="network-privacy-tip"
          title="Contact syncing"
          onClose={() => setInfoOpen(false)}
          onOpenGuide={() => {
            setInfoOpen(false)
            onOpenGuide()
          }}
        >
          Your contacts are used only to find people you know. Nothing is sent without your confirmation.
        </InfoBubble>
      )}

      <main className="network-privacy-content">
        <span className="network-privacy-shield" aria-hidden="true">
          <img src="/images/network-consent-shield.svg" alt="" />
        </span>

        <section className="network-privacy-copy">
          <h1>Your contacts are protected</h1>
          <p>Only used to find friends who already have VietPay. We never share or contact anyone without your consent.</p>
        </section>

        <section className="network-privacy-card" aria-label="Contact privacy details">
          {NETWORK_PRIVACY_POINTS.map((item) => (
            <div className="network-privacy-point" key={item.copy}>
              <img src={item.icon} alt="" aria-hidden="true" />
              <span>{item.copy}</span>
            </div>
          ))}
        </section>

        <div className="network-privacy-actions">
          <button type="button" className="network-privacy-primary" onClick={onContinue}>Agree &amp; Continue</button>
        </div>
      </main>
    </div>
  )
}

function NetworkFlowHeader({ onBack, backLabel, onOpenGuide }) {
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <>
      <header className="network-flow-header">
        <button type="button" aria-label={backLabel} onClick={onBack}><ChevronLeft size={22} /></button>
        <button
          type="button"
          className="network-flow-info"
          aria-label="About contact syncing"
          aria-expanded={infoOpen}
          onClick={() => setInfoOpen((open) => !open)}
        >
          <Info size={18} />
        </button>
      </header>
      {infoOpen && (
        <InfoBubble
          variant="network-privacy-tip"
          title="Contact syncing"
          onClose={() => setInfoOpen(false)}
          onOpenGuide={() => {
            setInfoOpen(false)
            onOpenGuide()
          }}
        >
          Your contacts are used only to find people you know. Nothing is sent without your confirmation.
        </InfoBubble>
      )}
    </>
  )
}

function NetworkSyncingScreen({ onBack, onComplete, onOpenGuide }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 1000)
    return () => window.clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="network-syncing-screen" aria-label="Syncing contacts">
      <NetworkFlowHeader onBack={onBack} backLabel="Back to contact privacy" onOpenGuide={onOpenGuide} />
      <div className="network-syncing-content">
        <span className="network-syncing-hourglass" aria-hidden="true">
          <img src="/images/network-sync-hourglass.svg" alt="" />
        </span>
        <h1>Synching<br />contacts</h1>
        <div className="network-flow-spacer" />
        <button type="button" className="network-flow-primary" disabled>Claim 100,000 pts</button>
      </div>
    </div>
  )
}

function NetworkSyncSuccessScreen({ onBack, onContinue, onOpenGuide }) {
  return (
    <div className="network-sync-success" aria-label="Contacts synced successfully">
      <NetworkFlowHeader onBack={onBack} backLabel="Back to syncing contacts" onOpenGuide={onOpenGuide} />
      <div className="network-sync-success-content">
        <span className="network-sync-success-check" aria-hidden="true">
          <img src="/images/network-sync-success-check.svg" alt="" />
        </span>
        <section className="network-sync-success-copy">
          <h1>Congratulations!</h1>
          <p>Contacts synced successfully!<br />Your network is now up to date.</p>
        </section>
        <div className="network-flow-spacer" />
        <button type="button" className="network-flow-primary" onClick={onContinue}>Claim 100,000 pts</button>
      </div>
    </div>
  )
}

function NetworkSyncRewardScreen({ onBack, onNext, points = 1000 }) {
  return (
    <div className="network-sync-reward" aria-label={`${points.toLocaleString('en-US')} points earned`}>
      <button type="button" className="network-sync-reward-back" aria-label="Back to contacts synced" onClick={onBack}>
        <ChevronLeft size={22} />
      </button>
      <div className="network-sync-reward-points" aria-hidden="true">
        <img src={`/images/intro-reward-${points}.png`} alt="" />
      </div>
      <img className="network-sync-reward-confetti" src="/images/intro-sequence-confetti.png" alt="" />
      <img className="network-sync-reward-girl" src="/images/intro-linh-celebrate.png" alt="" />
      <div className="network-sync-reward-gradient" aria-hidden="true" />
      <button type="button" className="network-sync-reward-next" onClick={onNext}>Next</button>
      <div className="network-sync-reward-indicator" aria-hidden="true" />
    </div>
  )
}

function NetworkScreen({ contactsSynced, initialTab = 'Contacts', contacts = SYNCED_CONTACTS, invitedContacts = NETWORK_CONTACTS, onBack, onRemind, onSync, onSkip, onInviteContact }) {
  const [tab, setTab] = useState(initialTab)
  const [query, setQuery] = useState('')
  const [showScrollHint, setShowScrollHint] = useState(true)
  const showingSyncedContacts = tab === 'Contacts' && contactsSynced
  const people = tab === 'Invited'
    ? invitedContacts
    : showingSyncedContacts
      ? contacts
      : []
  const filteredPeople = people.filter(({ name }) => name.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div className="network-scroll" tabIndex={0} aria-label="My Network">
      <div className="network-screen">
        <header className="network-header network-contacts-header">
          <BankIcon width={27} height={24} aria-label="VietPay" />
        </header>

        <div className={`network-body${tab === 'Contacts' && !contactsSynced ? ' contacts-unsynced' : ''}${showingSyncedContacts ? ' contacts-synced' : ''}${tab === 'Invited' ? ' invited-tab' : ''}`}>
          <div className="network-tabs" role="tablist" aria-label="Network status">
            {['Contacts', 'Invited', 'Registered'].map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {tab === 'Invited' && invitedContacts.length > 0 && (
            <section className="network-invited-summary" aria-label="Invited summary">
              <div>
                <strong>{invitedContacts.length} people invited</strong>
                <p>They'll appear in Registered after signing up with your link.</p>
              </div>
              <span aria-hidden="true"><UsersRound size={28} /></span>
            </section>
          )}

          {tab === 'Contacts' && !contactsSynced ? (
            <section className="network-contact-sync-content">
              <div className="network-sync-offer-hero" aria-hidden="true">
                <img src="/images/intro-point-down.png" alt="" />
              </div>
              <img className="network-sync-offer-guide-line" src="/images/network-sync-guide-line.svg" alt="" aria-hidden="true" />
              <section className="network-sync-offer-title">
                <strong>Sync contacts</strong>
                <span>to get points</span>
              </section>
              <section className="network-sync-offer-metrics" aria-label="Network totals">
                {NETWORK_SYNC_METRICS.map((item) => (
                  <div className="network-sync-offer-metric" key={item.label}>
                    <span className={`network-sync-offer-metric-icon ${item.tone}`} aria-hidden="true">
                      <img src={item.icon} alt="" />
                    </span>
                    <span>{item.label}</span>
                    <strong>00</strong>
                  </div>
                ))}
              </section>
              <button type="button" className="network-sync-offer-skip" onClick={onSkip}>Skip</button>
              <button type="button" className="network-sync-offer-primary" onClick={onSync}>Sync contacts get 1,000 pts</button>
            </section>
          ) : (
            <>
              <label className="network-search-field">
                <Search size={20} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search people"
                  aria-label="Search people"
                />
              </label>

              <div className="network-list-heading">
                <h2>{showingSyncedContacts ? 'Contacts' : tab === 'Invited' ? 'Invited contacts' : tab}</h2>
                <span>{filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'}</span>
              </div>

              <div className="network-results-area">
                {filteredPeople.length > 0 ? (
                  <div className="network-invited-list" onScroll={(event) => {
                    if (event.currentTarget.scrollTop > 8) setShowScrollHint(false)
                  }}>
                    {filteredPeople.map((person) => (
                      <article className="network-invited-person" key={person.name}>
                        <span className="network-person-avatar" aria-hidden="true">{person.initial}</span>
                        <div className="network-person-copy">
                          <h3>{person.name}</h3>
                          <p>{showingSyncedContacts ? (person.invited ? 'Invited today' : 'Not invited yet') : person.timing}</p>
                          <span><i aria-hidden="true" />{showingSyncedContacts && !person.invited ? 'Earn after signup' : 'Waiting to register'}</span>
                        </div>
                        <button
                          type="button"
                          className={`network-remind-button${person.invited ? ' already-invited' : ''}`}
                          disabled={showingSyncedContacts && person.invited}
                          onClick={showingSyncedContacts ? () => !person.invited && onInviteContact(person) : () => onRemind(person)}
                        >
                          {showingSyncedContacts ? (person.invited ? 'Invited' : 'Invite') : 'Remind'}
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="network-empty-state">No people found.</p>
                )}
                {showingSyncedContacts && filteredPeople.length > 6 && showScrollHint && (
                  <div className="network-scroll-hint" aria-hidden="true">
                    <ChevronDown size={14} />
                    <span>Swipe up</span>
                  </div>
                )}
              </div>

              {!showingSyncedContacts && (
                <button
                  type="button"
                  className="network-invite-button"
                  onClick={() => setTab('Contacts')}
                >
                  Invite more people
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const INVITATION_LINK = 'vietpay.vn/invite/VIET2024XY'
const INVITATION_MESSAGE = 'Hi! I’d like to invite you to join VietPay. Sign up with my link and start earning rewards.'

function ContactInviteHeader({ title, onBack, info = false }) {
  return (
    <header className="contact-invite-header">
      <button type="button" aria-label="Back" onClick={onBack}><ChevronLeft size={22} /></button>
      {title && <h1>{title}</h1>}
      {info && <Info className="contact-invite-info" size={18} aria-label="Invitation information" />}
    </header>
  )
}

function ContactInvitationPreview({ names, onBack, onSent }) {
  function copyLink() {
    navigator.clipboard?.writeText(INVITATION_LINK)
  }

  return (
    <div className="contact-invite-screen contact-invite-preview">
      <ContactInviteHeader onBack={onBack} info />
      <div className="contact-invite-hero" aria-hidden="true"><img src="/images/intro-point-down.png" alt="" /></div>
      <div className="contact-invite-ready"><img src="/images/invite-sparkles.svg" alt="" /><strong>Ready to send to {names[0]}</strong></div>
      <section className="contact-invite-card" aria-label="Invitation preview">
        <h2>Your invitation</h2>
        <p>{INVITATION_MESSAGE}</p>
        <div><span>{INVITATION_LINK}</span><button type="button" onClick={copyLink}><img src="/images/invite-copy.svg" alt="" />Copy</button></div>
      </section>
      <section className="contact-share-options" aria-label="Share via">
        <h2>Share via</h2>
        <div>
          {[
            ['Zalo', '/images/invite-zalo.svg'],
            ['Messenger', '/images/invite-messenger.svg'],
            ['SMS', '/images/invite-sms.svg'],
            ['Email', '/images/invite-email.svg'],
          ].map(([label, image]) => (
            <button type="button" key={label} onClick={onSent}><img src={image} alt="" /><span>{label}</span></button>
          ))}
        </div>
      </section>
    </div>
  )
}

function ContactInvitationSent({ names, onBack, onInviteMore, onViewInvited }) {
  return (
    <div className="contact-invite-screen contact-invite-sent">
      <ContactInviteHeader title="Invitation status" onBack={onBack} />
      <main className="contact-invite-sent-body" style={{ '--invite-count': names.length }}>
        <img className="contact-invite-sent-icon" src="/images/reminder-sent.svg" alt="" />
        <h2>Invitation sent!</h2>
        <p>Your invitation was sent to {names.length} contact{names.length === 1 ? '' : 's'}.</p>
        <section className="contact-invite-sent-list">
          {names.map((name) => <div key={name}><span>{name}</span><strong>Invited</strong></div>)}
        </section>
        <div className="contact-invite-points-note">Points unlock after registration.</div>
        <button type="button" className="contact-invite-again" onClick={onInviteMore}>Invite more people</button>
        <button type="button" className="contact-invite-primary" onClick={onViewInvited}>View invited contacts</button>
      </main>
    </div>
  )
}

function PlanScreen({ actions, onOpenContacts, onOpenInvited }) {
  const completed = {
    invites: Math.min(2, actions.invites),
    remind: Math.min(1, actions.remind),
    ppp: Math.min(2, actions.ppp),
    sharp: 0,
  }
  const completedTotal = Object.values(completed).reduce((sum, value) => sum + value, 0)
  const progress = Math.round((completedTotal / actions.total) * 100)
  const planItems = [
    {
      key: 'invites',
      title: 'Invite contacts',
      detail: 'Get 4,000 pts',
      Icon: UsersRound,
      action: 'Invite now',
      onClick: onOpenContacts,
    },
    {
      key: 'remind',
      title: 'Follow up invites',
      detail: 'Get 1,000 pts',
      Icon: Clock3,
      action: 'Remind now',
      onClick: onOpenInvited,
    },
    {
      key: 'ppp',
      title: 'PPP',
      detail: 'Get 2,000 pts',
      Icon: UserRound,
      status: 'In progress',
    },
    {
      key: 'sharp',
      title: 'SHARP',
      detail: 'Get 4,000 pts',
      Icon: Landmark,
      status: 'Not started',
    },
  ]

  return (
    <div className="today-plan-scroll" tabIndex={0} aria-label="Today plan">
      <div className="today-plan-screen">
        <header className="network-header today-plan-header">
          <BankIcon width={27} height={24} aria-label="VietPay" />
        </header>

        <main className="today-plan-body">
          <section className="today-plan-summary">
            <div className="today-plan-summary-heading">
              <div>
                <span>YOUR DAILY PLAN</span>
                <h1>Today’s plan</h1>
              </div>
              <strong>{completedTotal}/{actions.total}</strong>
            </div>
            <p>Complete these activities to stay on track with your monthly goal.</p>
            <div className="today-plan-progress" aria-label={`${progress}% complete`}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="today-plan-progress-label"><span>{completedTotal} completed</span><strong>{actions.total - completedTotal} remaining</strong></div>
          </section>

          <div className="today-plan-section-heading">
            <h2>Daily activities</h2>
            <span>{actions.total} actions</span>
          </div>

          <section className="today-plan-list" aria-label="Daily target activities">
            {planItems.map(({ key, title, detail, Icon, action, onClick, status }) => {
              const target = actions[key]
              const done = completed[key]
              const itemProgress = Math.round((done / target) * 100)
              return (
                <article className={`today-plan-item ${key}`} key={key}>
                  <span className="today-plan-item-icon" aria-hidden="true"><Icon size={22} /></span>
                  <div className="today-plan-item-copy">
                    <div><h3>{title}</h3><strong>{done}/{target}</strong></div>
                    <p>{detail}</p>
                    <div className="today-plan-item-progress"><span style={{ width: `${itemProgress}%` }} /></div>
                  </div>
                  {action ? (
                    <button type="button" onClick={onClick}>{action}</button>
                  ) : (
                    <span className="today-plan-item-status">{status}</span>
                  )}
                </article>
              )
            })}
          </section>

          <section className="today-plan-next">
            <CircleCheck size={20} aria-hidden="true" />
            <div><strong>Next best action</strong><span>Invite {Math.max(0, actions.invites - completed.invites)} more contacts today.</span></div>
            <button type="button" onClick={onOpenContacts}>Continue</button>
          </section>
        </main>
      </div>
    </div>
  )
}

const REMINDER_MESSAGE = 'Hi! Just a quick reminder to join VietPay with my invitation link. You can earn rewards when you register.'

function ReminderHeader({ title, onBack }) {
  return (
    <header className="reminder-flow-header">
      <button type="button" aria-label="Back" onClick={onBack}><ChevronLeft size={22} /></button>
      <h1>{title}</h1>
    </header>
  )
}

function ReminderPreviewScreen({ names, onNext, onBack }) {
  return (
    <div className="reminder-flow-screen">
      <ReminderHeader title="Send reminder" onBack={onBack} />
      <div className="reminder-flow-body">
        <div className="reminder-flow-hero" aria-hidden="true">
          <div className="reminder-flow-hero-frame">
            <img src="/images/intro-point-down.png" alt="" />
          </div>
        </div>
        <div className="reminder-flow-banner"><Info size={18} /><strong>Reminder ready to send</strong></div>
        <section className="reminder-message-card" aria-label="Reminder message">
          <h2>Your reminder</h2>
          <p>{REMINDER_MESSAGE}</p>
          <div className="reminder-link-chip"><span>vietpay.vn/invite/VIET2024XY</span><button type="button">Copy</button></div>
        </section>
        <section className="reminder-recipient-card" aria-label="Recipients">
          <span>Recipients</span>
          <strong>{names.join(', ')}</strong>
        </section>
        <button type="button" className="reminder-primary-button" onClick={onNext}>Choose share channel</button>
      </div>
    </div>
  )
}

function ReminderShareScreen({ onNext, onBack }) {
  return (
    <div className="reminder-flow-screen reminder-share-screen">
      <div className="reminder-share-backdrop" aria-hidden="true" />
      <div className="reminder-share-sheet">
        <div className="reminder-sheet-handle" />
        <div className="reminder-sheet-heading"><h2>Share invitation</h2><button type="button" aria-label="Close" onClick={onBack}><X size={18} /></button></div>
        <div className="reminder-share-link">
          <span>vietpay.vn/invite/VIET2024XY</span>
          <button type="button"><img src="/images/invite-copy.svg" alt="" />Copy</button>
        </div>
        <h3>Share via</h3>
        <div className="reminder-share-options">
          {[
            ['Zalo', '/images/invite-zalo.svg'],
            ['Messenger', '/images/invite-messenger.svg'],
            ['SMS', '/images/invite-sms.svg'],
            ['Email', '/images/invite-email.svg'],
          ].map(([label, image]) => (
            <button key={label} type="button" onClick={onNext}>
              <img src={image} alt="" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReminderSentScreen({ names, onBack, onDone, onInvite }) {
  return (
    <div className="reminder-flow-screen reminder-sent-screen">
      <ReminderHeader title="Invitation status" onBack={onBack} />
      <div className="reminder-sent-body" style={{ '--reminder-contact-count': names.length }}>
        <img className="reminder-sent-icon" src="/images/reminder-sent.svg" alt="" />
        <h2>Reminder sent!</h2>
        <p>Your reminder was sent to {names.length} contact{names.length === 1 ? '' : 's'}.</p>
        <div className="reminder-sent-list">
          {names.map((name) => <div key={name}><span>{name}</span><strong>Reminded</strong></div>)}
        </div>
        <div className="reminder-points-note">Points unlock after registration.</div>
        <button type="button" className="reminder-primary-button" onClick={onDone}>View invited contacts</button>
      </div>
    </div>
  )
}

function ReminderRewardScreen({ onNext, onBack }) {
  return (
    <div className="reminder-flow-screen reminder-reward-screen">
      <button type="button" className="reminder-reward-back" aria-label="Back" onClick={onBack}><ChevronLeft size={22} /></button>
      <img className="reminder-reward-points" src="/images/points-1000.png" alt="1,000 points" />
      <img className="reminder-reward-confetti" src="/images/reward-confetti.png" alt="" />
      <img className="reminder-reward-girl" src="/images/reward-girl.png" alt="" />
      <button type="button" className="reminder-primary-button" onClick={onNext}>Next</button>
    </div>
  )
}

function ReminderFlow({ stage, names, onStageChange, onClose }) {
  if (stage === 'preview') return <ReminderPreviewScreen names={names} onNext={() => onStageChange('share')} onBack={onClose} />
  if (stage === 'share') return <><ReminderPreviewScreen names={names} onNext={() => {}} onBack={onClose} /><ReminderShareScreen onNext={() => onStageChange('reward')} onBack={() => onStageChange('preview')} /></>
  if (stage === 'reward') return <ReminderRewardScreen onNext={() => onStageChange('sent')} onBack={() => onStageChange('share')} />
  return <ReminderSentScreen names={names} onBack={() => onStageChange('reward')} onDone={onClose} onInvite={() => onStageChange('preview')} />
}

export default function App() {
  const fileInputRef = useRef(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [pointsInfoOpen, setPointsInfoOpen] = useState(false)
  const [activitiesInfoOpen, setActivitiesInfoOpen] = useState(false)
  const [goalInfoOpen, setGoalInfoOpen] = useState(false)
  const [guideTopic, setGuideTopic] = useState(null)
  const [goalAmount, setGoalAmount] = useState(30)
  const [months, setMonths] = useState(12)
  const [selectedNav, setSelectedNav] = useState('Home')
  const [launchMode, setLaunchMode] = useState('first')
  const [contactsSynced, setContactsSynced] = useState(false)
  const [redCommentMode, setRedCommentMode] = useState(false)
  const [redComments, setRedComments] = useState([])
  const [checkinFlowOpen, setCheckinFlowOpen] = useState(false)
  const [checkinStage, setCheckinStage] = useState('checkin')
  const [activitiesOpen, setActivitiesOpen] = useState(false)
  const [activityPreviewOpen, setActivityPreviewOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [introCompleted, setIntroCompleted] = useState(false)
  const [firstLaunchStage, setFirstLaunchStage] = useState(null)
  const [reminderStage, setReminderStage] = useState(null)
  const [reminderNames, setReminderNames] = useState([])
  const [networkStage, setNetworkStage] = useState('contacts')
  const [contactInviteStage, setContactInviteStage] = useState(null)
  const [selectedInviteNames, setSelectedInviteNames] = useState([])
  const [recentlyInvitedNames, setRecentlyInvitedNames] = useState([])
  const [networkInitialTab, setNetworkInitialTab] = useState('Contacts')

  const sliderPct = ((goalAmount - MIN_GOAL) / (MAX_GOAL - MIN_GOAL)) * 100

  // A bigger goal needs more daily actions; a shorter timeline compresses
  // the same goal into fewer months, so it also needs more per day.
  const LEVEL = 2 / 3
  const scale = (goalAmount / BASE_GOAL) * (BASE_MONTHS / months) * LEVEL

  const actions = useMemo(() => {
    const round = (n) => Math.max(1, Math.round(n * scale))
    const a = {
      invites: round(BASE_ACTIONS.invites) * ACTION_MULTIPLIER,
      remind: round(BASE_ACTIONS.remind) * ACTION_MULTIPLIER,
      ppp: round(BASE_ACTIONS.ppp) * ACTION_MULTIPLIER,
      sharp: round(BASE_ACTIONS.sharp) * ACTION_MULTIPLIER,
    }
    return { ...a, total: a.invites + a.remind + a.ppp + a.sharp }
  }, [scale])

  const networkReach = useMemo(() => {
    const round = (n) => Math.max(1, Math.round(n * scale))
    return { merchants: round(BASE_NETWORK.merchants), influencers: round(BASE_NETWORK.influencers) }
  }, [scale])

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (file) setAvatarUrl(URL.createObjectURL(file))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  function openReminder(person) {
    setReminderNames([person.name])
    setReminderStage('preview')
  }

  function openContactInvite(person) {
    setSelectedInviteNames([person.name])
    setContactInviteStage('preview')
  }

  function finishFirstLaunchInNetwork(contactsAreSynced) {
    setContactsSynced(contactsAreSynced)
    setFirstLaunchStage(null)
    setSelectedNav('Network')
    setNetworkStage('contacts')
    setNetworkInitialTab('Contacts')
    setContactInviteStage(null)
  }

  const availableSyncedContacts = SYNCED_CONTACTS.filter(({ name }) => !recentlyInvitedNames.includes(name))
  const visibleInvitedContacts = recentlyInvitedNames.length
    ? recentlyInvitedNames.map((name) => ({ name, timing: 'Invited today', initial: name.slice(0, 1).toUpperCase() }))
    : launchMode === 'first'
      ? []
      : NETWORK_CONTACTS

  function handlePhoneCommentClick(e) {
    if (!redCommentMode) return
    if (e.target.closest('.red-comment-note')) return

    e.preventDefault()
    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.min(Math.max(e.clientX - rect.left, 8), 208)
    const y = Math.min(Math.max(e.clientY - rect.top, 8), 780)
    setRedComments((items) => [...items, { id: Date.now(), x, y, text: '' }])
  }

  function moveRedComment(id, x, y) {
    const nextX = Math.min(Math.max(x, 8), 208)
    const nextY = Math.min(Math.max(y, 8), 780)
    setRedComments((items) => items.map((item) => (
      item.id === id ? { ...item, x: nextX, y: nextY } : item
    )))
  }

  function handleCommentDragStart(e, comment) {
    e.preventDefault()
    e.stopPropagation()

    const phone = e.currentTarget.closest('.phone')
    if (!phone) return

    const rect = phone.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - comment.x
    const offsetY = e.clientY - rect.top - comment.y
    const pointerId = e.pointerId

    e.currentTarget.setPointerCapture(pointerId)

    function handlePointerMove(moveEvent) {
      moveRedComment(comment.id, moveEvent.clientX - rect.left - offsetX, moveEvent.clientY - rect.top - offsetY)
    }

    function handlePointerUp() {
      e.currentTarget.releasePointerCapture(pointerId)
      e.currentTarget.removeEventListener('pointermove', handlePointerMove)
      e.currentTarget.removeEventListener('pointerup', handlePointerUp)
      e.currentTarget.removeEventListener('pointercancel', handlePointerUp)
    }

    e.currentTarget.addEventListener('pointermove', handlePointerMove)
    e.currentTarget.addEventListener('pointerup', handlePointerUp)
    e.currentTarget.addEventListener('pointercancel', handlePointerUp)
  }

  return (
    <main className="stage">
      <div className="viewport" style={{ width: 390, height: 844 }}>
        <section
          className="phone"
          data-launch-mode={launchMode}
          data-red-comment-mode={redCommentMode}
          style={{ transform: 'scale(1)', height: 844 }}
          aria-label="Referral dashboard prototype"
          onClickCapture={handlePhoneCommentClick}
        >
          <div className="status-bar">
            <span>9:41</span>
            <div>
              <Signal size={17} />
              <Wifi size={18} />
              <BatteryFull size={25} />
            </div>
          </div>

          {launchMode === 'first' && !introCompleted ? (
            <IntroFlow
              onComplete={() => {
                setIntroCompleted(true)
                setSelectedNav('Home')
                setFirstLaunchStage('checkin')
              }}
              onOpenEstimateGuide={() => setGuideTopic('estimate')}
            />
          ) : launchMode === 'first' && firstLaunchStage === 'checkin' ? (
            <CheckInFlow
              launchMode="first"
              rewardPoints={1000}
              onStageChange={setCheckinStage}
              onBack={() => setFirstLaunchStage(null)}
              onClose={() => {
                setCheckinStage('checkin')
                setFirstLaunchStage('network-offer')
              }}
            />
          ) : launchMode === 'first' && firstLaunchStage === 'network-offer' ? (
            <NetworkSyncOfferScreen
              onBack={() => setFirstLaunchStage('checkin')}
              onContinue={() => setFirstLaunchStage('privacy')}
            />
          ) : launchMode === 'first' && firstLaunchStage === 'privacy' ? (
            <NetworkPrivacyConsentScreen
              onBack={() => setFirstLaunchStage('network-offer')}
              onContinue={() => setFirstLaunchStage('syncing')}
              onOpenGuide={() => setGuideTopic('contactSync')}
            />
          ) : launchMode === 'first' && firstLaunchStage === 'syncing' ? (
            <NetworkSyncingScreen
              onBack={() => setFirstLaunchStage('privacy')}
              onComplete={() => setFirstLaunchStage('sync-success')}
              onOpenGuide={() => setGuideTopic('contactSync')}
            />
          ) : launchMode === 'first' && firstLaunchStage === 'sync-success' ? (
            <NetworkSyncSuccessScreen
              onBack={() => setFirstLaunchStage('privacy')}
              onContinue={() => setFirstLaunchStage('sync-reward')}
              onOpenGuide={() => setGuideTopic('contactSync')}
            />
          ) : launchMode === 'first' && firstLaunchStage === 'sync-reward' ? (
            <NetworkSyncRewardScreen
              points={2000}
              onBack={() => setFirstLaunchStage('sync-success')}
              onNext={() => finishFirstLaunchInNetwork(true)}
            />
          ) : checkinFlowOpen ? (
            <CheckInFlow
              launchMode={launchMode}
              onStageChange={setCheckinStage}
              onClose={() => {
                setCheckinFlowOpen(false)
                setCheckinStage('checkin')
              }}
            />
          ) : reminderStage ? (
            <ReminderFlow
              stage={reminderStage}
              names={reminderNames}
              onStageChange={setReminderStage}
              onClose={() => setReminderStage(null)}
            />
          ) : selectedNav === 'Network' ? (
            contactInviteStage === 'preview' ? (
              <ContactInvitationPreview
                names={selectedInviteNames}
                onBack={() => setContactInviteStage(null)}
                onSent={() => {
                  setRecentlyInvitedNames((names) => [...new Set([...names, ...selectedInviteNames])])
                  setContactInviteStage('sent')
                }}
              />
            ) : contactInviteStage === 'sent' ? (
              <ContactInvitationSent
                names={selectedInviteNames}
                onBack={() => setContactInviteStage('preview')}
                onInviteMore={() => setContactInviteStage(null)}
                onViewInvited={() => {
                  setNetworkInitialTab('Invited')
                  setContactInviteStage(null)
                }}
              />
            ) : networkStage === 'consent' ? (
              <NetworkPrivacyConsentScreen
                onBack={() => setNetworkStage('contacts')}
                onContinue={() => setNetworkStage('syncing')}
                onOpenGuide={() => setGuideTopic('contactSync')}
              />
            ) : networkStage === 'syncing' ? (
              <NetworkSyncingScreen
                onBack={() => setNetworkStage('consent')}
                onComplete={() => setNetworkStage('success')}
                onOpenGuide={() => setGuideTopic('contactSync')}
              />
            ) : networkStage === 'success' ? (
              <NetworkSyncSuccessScreen
                onBack={() => setNetworkStage('consent')}
                onContinue={() => setNetworkStage('reward')}
                onOpenGuide={() => setGuideTopic('contactSync')}
              />
            ) : networkStage === 'reward' ? (
              <NetworkSyncRewardScreen
                onBack={() => setNetworkStage('success')}
                onNext={() => setNetworkStage('contacts')}
              />
            ) : (
              <NetworkScreen
                key={`${contactsSynced ? 'contacts-synced' : 'contacts-not-synced'}-${networkInitialTab}-${recentlyInvitedNames.join('-')}`}
                contactsSynced={contactsSynced}
                initialTab={networkInitialTab}
                contacts={availableSyncedContacts}
                invitedContacts={visibleInvitedContacts}
                onBack={() => setSelectedNav('Home')}
                onRemind={openReminder}
                onSync={() => setNetworkStage('consent')}
                onSkip={() => setSelectedNav('Home')}
                onInviteContact={openContactInvite}
              />
            )
          ) : selectedNav === 'Plan' ? (
            <PlanScreen
              actions={actions}
              onOpenContacts={() => {
                setSelectedNav('Network')
                setNetworkStage('contacts')
                setNetworkInitialTab('Contacts')
                setContactInviteStage(null)
              }}
              onOpenInvited={() => {
                setSelectedNav('Network')
                setNetworkStage('contacts')
                setNetworkInitialTab('Invited')
                setContactInviteStage(null)
              }}
            />
          ) : selectedNav === 'Points' ? (
            <PointsFlow BankIcon={BankIcon} onOpenPointsGuide={() => setGuideTopic('points')} />
          ) : (
          <div className="dashboard-scroll" tabIndex={0} aria-label="Dashboard content">
            <div className="dashboard-content">
              <div className="app-header">
                <BankIcon width={27} height={24} aria-label="VietPay" />
              </div>

              <section className="profile-card card">
                <div className="profile-row">
                  <button
                    className="avatar profile-avatar"
                    aria-label="Change profile photo"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" />
                    ) : (
                      <UserRound size={30} className="default-profile-icon" aria-hidden="true" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label="Choose profile photo"
                    tabIndex={-1}
                    onChange={handleAvatarChange}
                  />
                  <strong>Hi, Y Dang</strong>
                  <span className="tier">Silver</span>
                </div>

                <div className="points-row">
                  <div className="points-total">
                    <span className="points-label">
                      Available points
                      <button
                        id="points-help"
                        className="info-button"
                        aria-label="About available points"
                        aria-expanded={pointsInfoOpen}
                        onClick={() => setPointsInfoOpen((v) => !v)}
                      >
                        <Info size={16} />
                      </button>
                    </span>
                    <div><strong>1,245</strong><b>pts</b></div>
                  </div>
                  <div className="points-total lifetime-points">
                    <span>Lifetime points</span>
                    <div><strong>1,245</strong><b>pts</b></div>
                  </div>
                </div>
              </section>

              {pointsInfoOpen && (
                <InfoBubble
                  variant="points"
                  title="Available points"
                  onClose={() => setPointsInfoOpen(false)}
                  onOpenGuide={() => { setPointsInfoOpen(false); setGuideTopic('points') }}
                >
                  Points you can redeem right now for cash or rewards.
                </InfoBubble>
              )}

              <section className="dashboard-goal-editor card" aria-label="Edit income goal">
                <div className="sheet-label sheet-label-with-info">
                  <label htmlFor="income-goal">Monthly income goal</label>
                  <button
                    id="goal-help"
                    className="info-button"
                    aria-label="About monthly income goal"
                    aria-expanded={goalInfoOpen}
                    onClick={() => setGoalInfoOpen((v) => !v)}
                  >
                    <Info size={16} />
                  </button>
                  {goalInfoOpen && (
                    <>
                      <button className="dismiss-tip" aria-label="Dismiss" onClick={() => setGoalInfoOpen(false)} />
                      <div className="sheet-help-bubble" role="dialog">
                        <button className="tip-close" aria-label="Close" onClick={() => setGoalInfoOpen(false)}>
                          <X size={16} />
                        </button>
                        <strong>Monthly income goal</strong>
                        <p>Set a target and timeline — we estimate the daily actions needed to hit it.</p>
                        <button
                          className="video-link"
                          onClick={() => { setGoalInfoOpen(false); setGuideTopic('goal') }}
                        >
                          <Play size={14} /> Watch guide
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="sheet-amount">
                  <output htmlFor="income-goal">{formatVnd(goalAmount * 1_000_000)}</output>
                  <span>VND</span>
                </div>

                <div className="sheet-slider">
                  <div className="slider-track">
                    <div style={{ width: `${sliderPct}%` }} />
                  </div>
                  <input
                    id="income-goal"
                    aria-valuetext={`${goalAmount} million VND per month`}
                    type="range"
                    min={MIN_GOAL}
                    max={MAX_GOAL}
                    step={STEP_GOAL}
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(Number(e.target.value))}
                  />
                </div>
                <div className="sheet-bounds"><span>5M</span><span>100M</span></div>

                <div className="sheet-months" role="group" aria-label="Time to reach your goal">
                  {[6, 12, 18].map((m) => (
                    <button key={m} aria-pressed={months === m} onClick={() => setMonths(m)}>
                      {months === m && <CircleCheck size={16} fill="var(--color-primary)" stroke="white" />}
                      {m} months
                    </button>
                  ))}
                </div>

                <section className="goal-network-stats card" aria-label="Network Reach">
                  <span className="goal-network-stats-values">
                    <span className="stat"><strong>{networkReach.merchants}</strong><span>Merchants</span></span>
                    <span className="divider" aria-hidden="true" />
                    <span className="stat"><strong>{networkReach.influencers}</strong><span>Influencers</span></span>
                  </span>
                </section>

                <section
                  className={`sheet-preview ${activityPreviewOpen ? '' : 'collapsed'}`}
                  aria-live="polite"
                  aria-atomic="true"
                  style={{ position: 'relative' }}
                >
                  <div className="preview-heading">
                    <span className="activities-day-label">
                      Activities / day
                      <button
                        id="activities-help"
                        className="info-button"
                        aria-label="About activities per day"
                        aria-expanded={activitiesInfoOpen}
                        onClick={() => setActivitiesInfoOpen((v) => !v)}
                      >
                        <Info size={16} />
                      </button>
                    </span>
                    <span className="preview-actions">
                      <span className="preview-total-pill">{actions.total} actions</span>
                    </span>
                    <button
                      className="preview-toggle"
                      aria-label={activityPreviewOpen ? 'Hide activities per day' : 'Show activities per day'}
                      aria-expanded={activityPreviewOpen}
                      onClick={() => setActivityPreviewOpen((v) => !v)}
                    >
                      <ChevronDown size={20} style={{ transform: activityPreviewOpen ? 'rotate(180deg)' : 'none' }} />
                    </button>
                  </div>
                  {activitiesInfoOpen && (
                    <>
                      <button className="dismiss-tip" aria-label="Dismiss" onClick={() => setActivitiesInfoOpen(false)} />
                      <div className="sheet-help-bubble" role="dialog">
                        <button className="tip-close" aria-label="Close" onClick={() => setActivitiesInfoOpen(false)}>
                          <X size={16} />
                        </button>
                        <strong>Activities / day</strong>
                        <p>The daily actions needed to hit your goal — scales with the amount and timeline above.</p>
                        <button
                          className="video-link"
                          onClick={() => { setActivitiesInfoOpen(false); setGuideTopic('activities') }}
                        >
                          <Play size={14} /> Watch guide
                        </button>
                      </div>
                    </>
                  )}
                  {activityPreviewOpen && (
                    <div className="preview-counts">
                      <div><strong>{actions.invites}</strong><span>Invites</span></div>
                      <div><strong>{actions.remind}</strong><span>Remind</span></div>
                      <div><strong>{actions.ppp}</strong><span>PPP</span></div>
                      <div><strong>{actions.sharp}</strong><span>SHARP</span></div>
                    </div>
                  )}
                </section>

                <button className="sheet-save" onClick={handleSave}>
                  {saved ? 'Saved' : 'Save changes'}
                </button>
              </section>

              <button
                className="checkin-card card"
                onClick={() => {
                  setCheckinStage('checkin')
                  setCheckinFlowOpen(true)
                }}
              >
                <CalendarCheck size={25} />
                <span><strong>Check in</strong><small>Keep your daily streak going</small></span>
              </button>

              <button className="activities card" onClick={() => setActivitiesOpen((v) => !v)} aria-expanded={activitiesOpen}>
                <Clock3 size={26} strokeWidth={1.5} />
                <span>Recent Activities</span>
                <ChevronDown size={25} style={{ transform: activitiesOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              {activitiesOpen && (
                <div className="card" style={{ margin: '0 11px 10px', padding: '14px 16px', fontSize: 14, color: 'var(--color-text)' }}>
                  No recent activity yet — invite a merchant to get started.
                </div>
              )}
            </div>
          </div>
          )}

          {!(checkinFlowOpen && checkinStage === 'success') && !(launchMode === 'first' && !introCompleted) && !(launchMode === 'first' && firstLaunchStage) && !reminderStage && !contactInviteStage && !(selectedNav === 'Network' && networkStage !== 'contacts') && (
          <nav className="bottom-bar" aria-label="Main navigation">
            {[
              { key: 'Home', icon: House },
              { key: 'Network', icon: UsersRound },
              { key: 'Plan', icon: GoalIcon },
              { key: 'Points', icon: CircleStar },
            ].map(({ key, icon: Icon }) => (
              <button
                key={key}
                className={`nav-item ${selectedNav === key ? 'selected' : ''}`}
                aria-pressed={selectedNav === key}
                onClick={() => {
                  setSelectedNav(key)
                }}
              >
                <Icon size={25} strokeWidth={1.7} />
                <span>{key}</span>
              </button>
            ))}
          </nav>
          )}

          <div className="red-comment-layer" aria-label="Red ink comments">
            {redComments.map((comment) => (
              <label
                key={comment.id}
                className="red-comment-note"
                style={{ left: comment.x, top: comment.y }}
              >
                <span className="sr-only">Comment</span>
                <span
                  className="red-comment-drag"
                  role="button"
                  tabIndex={0}
                  aria-label="Move comment"
                  onPointerDown={(e) => handleCommentDragStart(e, comment)}
                />
                <textarea
                  value={comment.text}
                  autoFocus
                  placeholder="Comment"
                  onChange={(e) => {
                    const text = e.target.value
                    setRedComments((items) => items.map((item) => (
                      item.id === comment.id ? { ...item, text } : item
                    )))
                  }}
                />
                <button
                  type="button"
                  aria-label="Remove comment"
                  onClick={() => setRedComments((items) => items.filter((item) => item.id !== comment.id))}
                >
                  x
                </button>
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="launch-mode-controls" aria-label="Preview controls">
        <button
          type="button"
          className="contacts-case-toggle"
          aria-pressed={contactsSynced}
          aria-label={contactsSynced ? 'Switch to contacts not synced' : 'Switch to contacts synced'}
          onClick={() => {
            setContactsSynced((value) => !value)
            setIntroCompleted(true)
            setFirstLaunchStage(null)
            setSelectedNav('Network')
            setNetworkStage('contacts')
            setContactInviteStage(null)
            setNetworkInitialTab('Contacts')
          }}
        >
          {contactsSynced ? 'contacts: synced' : 'contacts: not synced'}
        </button>
        {[
          { key: 'first', label: 'first launch' },
          { key: 'returning', label: '>= second times launch' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={launchMode === key}
            onClick={() => {
              setLaunchMode(key)
              setIntroCompleted(false)
              setFirstLaunchStage(null)
            }}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="red-comment-mode-button"
          aria-pressed={redCommentMode}
          onClick={() => setRedCommentMode((v) => !v)}
        >
          red comment ink
        </button>
      </div>

      {guideTopic && <GuideDialog topic={guideTopic} onClose={() => setGuideTopic(null)} />}
    </main>
  )
}
