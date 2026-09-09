import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Landmark, UserRound, Info,
  ChevronDown, ChevronLeft, Clock3, UsersRound,
  CircleCheck, Check, X, Play, Pause, ArrowLeft, CreditCard, QrCode,
} from 'lucide-react'
import PointsFlow from './PointsFlow.jsx'
import CheckInFlow from './CheckInFlow.jsx'
import IntroFlow from './IntroFlow.jsx'

const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

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
  network: {
    title: 'My network guide',
    steps: [
      { label: 'STEP 1', heading: 'See your network', number: 'Contacts', detail: 'Track contacts, invited people and registered referrals in one place.' },
      { label: 'STEP 2', heading: 'Invite and remind', number: 'Invite', detail: 'Choose the next action for each person in your network.' },
      { label: 'STEP 3', heading: 'Earn referral points', number: 'Rewards', detail: 'Points unlock as your invited contacts register.' },
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

const SYNCED_CONTACTS = [
  { name: 'Mai Anh', phone: '0901 234 567', initial: 'M' },
  { name: 'Nguyễn Minh', phone: '0903 456 789', initial: 'N' },
  { name: 'Lan Phương', phone: '0905 678 901', initial: 'L' },
  { name: 'Duc Long', phone: '0907 890 123', initial: 'D' },
  { name: 'Thu Ha', phone: '0908 123 456', initial: 'T' },
  { name: 'Mai Anh', phone: '0904 567 890', initial: 'M' },
  { name: 'Bảo Ngọc', initial: 'B' },
  { name: 'Minh Khang', initial: 'M' },
  { name: 'Thanh Trúc', initial: 'T' },
  { name: 'Gia Hân', initial: 'G' },
]

const NETWORK_CONTACTS = [
  { name: 'Tran Thi B', timing: 'Invited today', initial: 'T' },
  { name: 'Le Van C', timing: 'Invited 2 days ago', initial: 'L' },
  { name: 'Hoang Van E', timing: 'Invited 5 days ago', initial: 'H' },
]

const CONTACT_SYNCED_RESULT_CONTACTS = [
  { name: 'Mai Anh', phone: '091 234 567', initial: 'M', reward: 'Get 1,000 points' },
  { name: 'Nguyễn Minh', phone: '093 456 789', initial: 'N', reward: 'Get 1,000 points' },
  { name: 'Lan Phương', phone: '095 678 901', initial: 'L', reward: 'Get 1,000 points' },
  { name: 'Duc Long', phone: '097 890 123', initial: 'D', reward: 'Get 1,000 points' },
  { name: 'Thu Ha', phone: '098 123 456', initial: 'T', reward: 'Get 1,000 points' },
  { name: 'Thu Ha', phone: '094 567 890', initial: 'T', reward: 'Get 1,000 points' },
  { name: 'Thu Ha', phone: '096 789 012', initial: 'T', reward: 'Get 1,000 points' },
]

const NETWORK_SYNC_METRICS = [
  { label: 'Contacts', icon: assetUrl('images/network-contacts.svg'), tone: 'contacts' },
  { label: 'Invited', icon: assetUrl('images/network-invited.png'), tone: 'invited' },
  { label: 'Registered', icon: assetUrl('images/network-registered.png'), tone: 'registered' },
]

function NetworkSyncOfferScreen({ onBack, onContinue, points = 2000 }) {
  return (
    <div className="network-sync-offer" aria-label="Sync contacts to get points">
      <header className="network-sync-offer-header">
        <button type="button" aria-label="Back to My Network" onClick={onBack}><ChevronLeft size={22} /></button>
      </header>

      <div className="network-sync-offer-hero" aria-hidden="true">
        <img className="network-sync-offer-guide" src={assetUrl('images/intro-linh-guide-line.png')} alt="" />
        <img className="network-sync-offer-mascot" src={assetUrl('images/intro-linh-pointing.png')} alt="" />
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
      <button type="button" className="network-sync-offer-primary" onClick={onContinue}>Sync contacts get {points.toLocaleString('en-US')} pts</button>
    </div>
  )
}

function ContactNotSyncOfferScreen({ onBack, onContinue }) {
  return (
    <main className="contact-not-sync-offer-screen" aria-label="Sync contacts to get points">
      <header className="network-overview-toolbar">
        <button type="button" className="network-overview-back" aria-label="Back to My network" onClick={onBack}>
          <ArrowLeft size={23} strokeWidth={2} />
        </button>
        <div className="network-overview-tools" aria-label="Network shortcuts">
          <span className="selected" aria-hidden="true"><CreditCard size={21} strokeWidth={1.8} /></span>
          <span aria-hidden="true"><QrCode size={20} strokeWidth={2} /></span>
          <span aria-hidden="true"><BankIcon width={23} height={21} /></span>
        </div>
      </header>

      <section className="contact-not-sync-offer-content">
        <div className="contact-not-sync-hero" aria-hidden="true">
          <img className="contact-not-sync-line-a" src={assetUrl('images/contact-not-sync-line-2.svg')} alt="" />
          <img className="contact-not-sync-person" src={assetUrl('images/contact-not-sync-hero.png')} alt="" />
        </div>

        <section className="contact-not-sync-title">
          <strong>Sync contacts</strong>
          <span>to get points</span>
        </section>

        <section className="contact-not-sync-metrics" aria-label="Network totals">
          {NETWORK_SYNC_METRICS.map((item) => (
            <div className="contact-not-sync-metric" key={item.label}>
              <span className={`network-sync-offer-metric-icon ${item.tone}`} aria-hidden="true">
                <img src={item.icon} alt="" />
              </span>
              <span>{item.label}</span>
              <strong>00</strong>
            </div>
          ))}
        </section>

        <button type="button" className="contact-not-sync-terms">Terms and Conditions</button>
        <button type="button" className="contact-not-sync-primary" onClick={onContinue}>Sync contacts get 5,000 pts</button>
      </section>
    </main>
  )
}

const NETWORK_PRIVACY_POINTS = [
  {
    icon: assetUrl('images/network-consent-forbid.svg'),
    copy: 'No messages sent automatically without your confirmation',
  },
  {
    icon: assetUrl('images/network-consent-lock.svg'),
    copy: 'Not stored for anything beyond finding friends',
  },
  {
    icon: assetUrl('images/network-consent-check.svg'),
    copy: 'You can turn off syncing anytime',
  },
]

function NetworkPrivacyConsentScreen({ onBack, onSkip, onContinue, onOpenGuide, selective = false, showInfo = true }) {
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <div className={`network-privacy-consent${selective ? ' selective' : ''}`} aria-label="Contact sync privacy">
      <header className="network-privacy-header">
        <button type="button" aria-label="Back to sync contacts" onClick={onBack}><ChevronLeft size={22} /></button>
        {showInfo && (
          <button
            type="button"
            className="network-privacy-info"
            aria-label="About contact privacy"
            aria-expanded={infoOpen}
            onClick={() => setInfoOpen((open) => !open)}
          >
            <Info size={18} />
          </button>
        )}
      </header>

      {showInfo && infoOpen && (
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
          <img src={assetUrl('images/network-consent-shield.svg')} alt="" />
        </span>

        <section className="network-privacy-copy">
          <h1>Your contacts are protected</h1>
          <p>{selective
            ? 'You can choose which contacts to sync — if you wish not to sync your entire contact list.'
            : 'Only used to find friends who already have VietPay. We never share or contact anyone without your consent.'}</p>
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
          {!selective && <button type="button" className="network-privacy-skip" onClick={onSkip}>Skip</button>}
          <button type="button" className="network-privacy-primary" onClick={onContinue}>Agree &amp; Continue</button>
        </div>
      </main>
    </div>
  )
}

function NetworkFlowHeader({ onBack, backLabel, onOpenGuide, showInfo = true }) {
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <>
      <header className="network-flow-header">
        <button type="button" aria-label={backLabel} onClick={onBack}><ChevronLeft size={22} /></button>
        {showInfo && (
          <button
            type="button"
            className="network-flow-info"
            aria-label="About contact syncing"
            aria-expanded={infoOpen}
            onClick={() => setInfoOpen((open) => !open)}
          >
            <Info size={18} />
          </button>
        )}
      </header>
      {showInfo && infoOpen && (
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

function ContactSyncSelectScreen({ onBack, onSync }) {
  const contacts = SYNCED_CONTACTS.slice(0, 6)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set([contacts[0].phone, contacts[2].phone]))
  const visibleContacts = contacts.filter(({ name, phone }) => `${name} ${phone}`.toLowerCase().includes(query.trim().toLowerCase()))
  const allSelected = selected.size === contacts.length

  function toggleContact(phone) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(phone)) next.delete(phone)
      else next.add(phone)
      return next
    })
  }

  function toggleAll() {
    setSelected((current) => current.size === contacts.length
      ? new Set()
      : new Set(contacts.map(({ phone }) => phone)))
  }

  return (
    <div className="contact-sync-select-screen" aria-label="Select contacts to sync">
      <header className="contact-sync-select-header">
        <button type="button" aria-label="Back to contact privacy" onClick={onBack}><ChevronLeft size={22} /></button>
        <h1>Select contacts to sync</h1>
        <span aria-hidden="true" />
      </header>

      <label className="contact-sync-select-search">
        <img src={assetUrl('images/network-invited-search.svg')} alt="" aria-hidden="true" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people" />
      </label>

      <div className="contact-sync-select-toolbar">
        <button type="button" aria-pressed={allSelected} onClick={toggleAll}>
          <span className={`contact-sync-select-checkbox${allSelected ? ' selected' : ''}`} aria-hidden="true">
            {allSelected && <Check size={13} strokeWidth={3} />}
          </span>
          <span>Select all</span>
        </button>
        <span>{selected.size} of 70 selected</span>
      </div>

      <section className="contact-sync-select-list" aria-label="6 people">
        {visibleContacts.map((person) => {
          const isSelected = selected.has(person.phone)
          return (
            <article key={person.phone}>
              <span className="contact-sync-select-avatar" aria-hidden="true">{person.initial}</span>
              <div className="contact-sync-select-person"><strong>{person.name}</strong><span>{person.phone}</span></div>
              <button type="button" className={isSelected ? 'selected' : ''} aria-pressed={isSelected} onClick={() => toggleContact(person.phone)}>Select</button>
            </article>
          )
        })}
      </section>

      <button type="button" className="contact-sync-select-primary" disabled={selected.size === 0} onClick={onSync}>Sync</button>
    </div>
  )
}

function NetworkSyncingScreen({ onBack, onComplete, onOpenGuide, showPendingAction = true, showInfo = true }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 1000)
    return () => window.clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="network-syncing-screen" aria-label="Syncing contacts">
      <NetworkFlowHeader onBack={onBack} backLabel="Back to contact privacy" onOpenGuide={onOpenGuide} showInfo={showInfo} />
      <div className="network-syncing-content">
        <span className="network-syncing-hourglass" aria-hidden="true">
          <img src={assetUrl('images/network-sync-hourglass.svg')} alt="" />
        </span>
        <h1>Synching<br />contacts</h1>
        <div className="network-flow-spacer" />
        {showPendingAction && <button type="button" className="network-flow-primary" disabled>Claim 2,000 pts</button>}
      </div>
    </div>
  )
}

function NetworkSyncSuccessScreen({ onBack, onContinue, onOpenGuide, points = 2000, showInfo = true }) {
  return (
    <div className="network-sync-success" aria-label="Contacts synced successfully">
      <NetworkFlowHeader onBack={onBack} backLabel="Back to syncing contacts" onOpenGuide={onOpenGuide} showInfo={showInfo} />
      <div className="network-sync-success-content">
        <span className="network-sync-success-check" aria-hidden="true">
          <img src={assetUrl('images/network-sync-success-check.svg')} alt="" />
        </span>
        <section className="network-sync-success-copy">
          <h1>Congratulations!</h1>
          <p>Contacts synced successfully!<br />Your network is now up to date.</p>
        </section>
        <div className="network-flow-spacer" />
        <button type="button" className="network-flow-primary" onClick={onContinue}>Claim {points.toLocaleString('en-US')} pts</button>
      </div>
    </div>
  )
}

function NetworkSyncRewardScreen({ onBack, onNext, points = 1000, contactSync = false }) {
  return (
    <div className={`network-sync-reward${contactSync ? ' contact-sync-reward' : ''}`} aria-label={`${points.toLocaleString('en-US')} points earned`}>
      <button type="button" className="network-sync-reward-back" aria-label="Back to contacts synced" onClick={onBack}>
        <ChevronLeft size={22} />
      </button>
      <div className="network-sync-reward-points" aria-hidden="true">
        <img src={assetUrl(contactSync ? 'images/contact-sync-reward-2000.png' : `images/intro-reward-${points}.png`)} alt="" />
      </div>
      <img className="network-sync-reward-confetti" src={assetUrl(contactSync ? 'images/contact-sync-confetti.png' : 'images/intro-sequence-confetti.png')} alt="" />
      <img className="network-sync-reward-girl" src={assetUrl(contactSync ? 'images/contact-sync-celebration.png' : 'images/intro-linh-celebrate.png')} alt="" />
      <div className="network-sync-reward-gradient" aria-hidden="true" />
      <button type="button" className="network-sync-reward-next" onClick={onNext}>Next</button>
      <div className="network-sync-reward-indicator" aria-hidden="true" />
    </div>
  )
}

const NETWORK_OVERVIEW_ROWS = [
  { key: 'contacts', value: '70', label: 'Contacts', action: 'Invite', icon: assetUrl('images/network-overview-contacts.png') },
  { key: 'invited', value: '00', label: 'Invited', action: 'Nudge', icon: assetUrl('images/network-overview-invited.png') },
  { key: 'registered', value: '00', label: 'Registered', action: 'Nudge', icon: assetUrl('images/network-overview-registered.png') },
  { key: 'influencer', value: '00', label: 'Influencer', action: 'Connect', icon: assetUrl('images/network-overview-influencer.png') },
  { key: 'merchant', value: '00', label: 'Merchant', action: 'Connect', icon: assetUrl('images/network-overview-merchant.png') },
]

function NetworkOverviewScreen({ invitedCount = 0, onBack, onInvite, onNudge, onOpenGuide }) {
  const overviewRows = NETWORK_OVERVIEW_ROWS.map((item) => (
    item.key === 'invited'
      ? { ...item, value: String(invitedCount).padStart(2, '0') }
      : item
  ))

  function handleAction(key) {
    if (key === 'contacts') onInvite()
    if (key === 'invited') onNudge()
  }

  return (
    <main className="network-overview-screen" aria-label="My network overview">
      <header className="network-overview-toolbar">
        <button type="button" className="network-overview-back" aria-label="Back to Home" onClick={onBack}>
          <ArrowLeft size={23} strokeWidth={2} />
        </button>
        <div className="network-overview-tools" aria-label="Network shortcuts">
          <span className="selected" aria-hidden="true"><CreditCard size={21} strokeWidth={1.8} /></span>
          <span aria-hidden="true"><QrCode size={20} strokeWidth={2} /></span>
          <span aria-hidden="true"><BankIcon width={23} height={21} /></span>
        </div>
      </header>

      <section className="network-overview-body">
        <div className="network-overview-title">
          <h1>My network</h1>
          <button
            type="button"
            aria-label="About My network"
            onClick={onOpenGuide}
          >
            <Info size={17} strokeWidth={1.8} />
          </button>
        </div>

        <button type="button" className="network-overview-banner" onClick={onInvite}>
          <img src={assetUrl('images/network-overview-gift.png')} alt="" />
          <strong>Earn points when you invite<br />friends</strong>
          <span className="network-overview-banner-arrow first" aria-hidden="true">›</span>
          <span className="network-overview-banner-arrow second" aria-hidden="true">›</span>
        </button>

        <div className="network-overview-list">
          {overviewRows.map((item) => {
            const enabled = item.key === 'contacts' || (item.key === 'invited' && invitedCount > 0)
            return (
              <article className={`network-overview-row${item.key === 'contacts' ? ' primary' : ''}`} key={item.key}>
                <div className="network-overview-row-main">
                  <img src={item.icon} alt="" />
                  <div className="network-overview-metric">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={enabled ? 'enabled' : ''}
                  disabled={!enabled}
                  onClick={() => handleAction(item.key)}
                >
                  {item.action}
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function NetworkContactsScreen({ contactsSynced, contactNotSyncCase = false, syncedResult = false, initialTab = 'Contacts', contacts = SYNCED_CONTACTS, invitedContacts = NETWORK_CONTACTS, onBack, onRemind, onSync, onSkip, onInviteContact, onTabChange }) {
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
          <button type="button" aria-label="Back to My network" onClick={onBack}>
            <span className="network-invited-back-icon" aria-hidden="true">
              <img src={assetUrl('images/network-invited-back.svg')} alt="" />
            </span>
          </button>
          <span className="network-invited-info-icon" aria-hidden="true">
            <img src={assetUrl('images/network-invited-info.svg')} alt="" />
          </span>
        </header>

        <div className={`network-body${tab === 'Contacts' && !contactsSynced ? ' contacts-unsynced' : ''}${contactNotSyncCase ? ' contact-not-sync-case' : ''}${showingSyncedContacts ? ' contacts-synced' : ''}${tab === 'Invited' ? ' invited-tab' : ''}`}>
          <div className="network-tabs" role="tablist" aria-label="Network status">
            {['Contacts', 'Invited', 'Registered'].map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                onClick={() => {
                  setTab(item)
                  onTabChange?.(item)
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {tab === 'Contacts' && !contactsSynced ? (
            <section className="network-contact-sync-content">
              <div className="network-sync-offer-hero" aria-hidden="true">
                <img src={assetUrl(contactNotSyncCase ? 'images/contact-not-sync-hero.png' : 'images/intro-point-down.png')} alt="" />
              </div>
              <img className="network-sync-offer-guide-line" src={assetUrl(contactNotSyncCase ? 'images/contact-not-sync-line.png' : 'images/network-sync-guide-line.svg')} alt="" aria-hidden="true" />
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
              {contactNotSyncCase && <button type="button" className="network-sync-offer-terms">Terms and Conditions</button>}
              <button type="button" className="network-sync-offer-skip" onClick={onSkip}>Skip</button>
              <button type="button" className="network-sync-offer-primary" onClick={onSync}>Sync contacts get {contactNotSyncCase ? '5,000' : '2,000'} pts</button>
            </section>
          ) : (
            <>
              <label className="network-search-field">
                <img src={assetUrl('images/network-invited-search.svg')} alt="" aria-hidden="true" />
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
                <span>{syncedResult && showingSyncedContacts && !query ? '5 people' : `${filteredPeople.length} ${filteredPeople.length === 1 ? 'person' : 'people'}`}</span>
              </div>

              <div className="network-results-area">
                {filteredPeople.length > 0 ? (
                  <div className="network-invited-list" onScroll={(event) => {
                    if (event.currentTarget.scrollTop > 8) setShowScrollHint(false)
                  }}>
                    {filteredPeople.map((person, index) => (
                      <article className="network-invited-person" key={person.id ?? `${person.name}-${index}`}>
                        <span className="network-person-avatar" aria-hidden="true">{person.initial}</span>
                        <div className="network-person-copy">
                          <h3>{person.name}</h3>
                          <p>{showingSyncedContacts ? (person.phone ?? (person.invited ? 'Invited today' : 'Not invited yet')) : person.timing}</p>
                          <span><i aria-hidden="true" />{showingSyncedContacts && !person.invited ? (person.reward ?? 'Earn after signup') : person.reward ?? 'Waiting to register'}</span>
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
                  onClick={() => {
                    setTab('Contacts')
                    onTabChange?.('Contacts')
                  }}
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
const INVITATION_MESSAGE = 'Hi! I’d like to invite you to join VietPay — a simple way to make payments and earn rewards. Use my invitation link below.'

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
      <div className="contact-invite-hero" aria-hidden="true"><img src={assetUrl('images/network-invitation-hero.png')} alt="" /></div>
      <div className="contact-invite-ready"><img src={assetUrl('images/network-invitation-sparkles.svg')} alt="" /><strong>Ready to send invitation to {names[0]}</strong></div>
      <section className="contact-invite-card" aria-label="Invitation preview">
        <h2>Your invitation</h2>
        <p>{INVITATION_MESSAGE}</p>
        <span className="contact-invite-link-label">Invitation link</span>
        <div><span>{INVITATION_LINK}</span><button type="button" onClick={copyLink}><img src={assetUrl('images/network-invitation-copy.svg')} alt="" />Copy</button></div>
      </section>
      <section className="contact-share-options" aria-label="Send invitation via">
        <h2>Send invitation via</h2>
        <div>
          {[
            ['Zalo', assetUrl('images/network-invitation-zalo.svg')],
            ['Messenger', assetUrl('images/network-invitation-messenger.svg')],
            ['SMS', assetUrl('images/network-invitation-sms.svg')],
            ['Email', assetUrl('images/network-invitation-email.svg')],
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
        <img className="contact-invite-sent-icon" src={assetUrl('images/network-invitation-sent.svg')} alt="" />
        <h2>Invitation sent!</h2>
        <p>Your invitation was sent to {names.join(', ')}</p>
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

function ContactInvitationReward({ onBack, onNext }) {
  return (
    <div className="reminder-flow-screen reminder-reward-screen contact-invite-reward">
      <button type="button" className="reminder-reward-back" aria-label="Back" onClick={onBack}><ChevronLeft size={22} /></button>
      <div className="contact-invite-reward-points" aria-label="1,000 points">
        <img src={assetUrl('images/network-invitation-points-1000.png')} alt="" />
      </div>
      <img className="reminder-reward-confetti" src={assetUrl('images/network-invitation-confetti.png')} alt="" />
      <img className="reminder-reward-girl" src={assetUrl('images/network-invitation-celebration.png')} alt="" />
      <div className="contact-invite-reward-gradient" aria-hidden="true" />
      <button type="button" className="reminder-primary-button" onClick={onNext}>Next</button>
      <div className="contact-invite-reward-indicator" aria-hidden="true" />
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
          <div className="network-overview-tools" aria-label="Plan shortcuts">
            <span className="selected" aria-hidden="true"><CreditCard size={21} strokeWidth={1.8} /></span>
            <span aria-hidden="true"><QrCode size={20} strokeWidth={2} /></span>
            <span aria-hidden="true"><BankIcon width={23} height={21} /></span>
          </div>
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
            <img src={assetUrl('images/intro-point-down.png')} alt="" />
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
          <button type="button"><img src={assetUrl('images/invite-copy.svg')} alt="" />Copy</button>
        </div>
        <h3>Share via</h3>
        <div className="reminder-share-options">
          {[
            ['Zalo', assetUrl('images/invite-zalo.svg')],
            ['Messenger', assetUrl('images/invite-messenger.svg')],
            ['SMS', assetUrl('images/invite-sms.svg')],
            ['Email', assetUrl('images/invite-email.svg')],
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
        <img className="reminder-sent-icon" src={assetUrl('images/reminder-sent.svg')} alt="" />
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
      <img className="reminder-reward-points" src={assetUrl('images/points-1000.png')} alt="1,000 points" />
      <img className="reminder-reward-confetti" src={assetUrl('images/reward-confetti.png')} alt="" />
      <img className="reminder-reward-girl" src={assetUrl('images/reward-girl.png')} alt="" />
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
  const [goalEditing, setGoalEditing] = useState(false)
  const [goalSaved, setGoalSaved] = useState(false)
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
  const [introCompleted, setIntroCompleted] = useState(false)
  const [firstLaunchStage, setFirstLaunchStage] = useState(null)
  const [reminderStage, setReminderStage] = useState(null)
  const [reminderNames, setReminderNames] = useState([])
  const [networkStage, setNetworkStage] = useState('contacts')
  const [contactInviteStage, setContactInviteStage] = useState(null)
  const [selectedInviteNames, setSelectedInviteNames] = useState([])
  const [recentlyInvitedNames, setRecentlyInvitedNames] = useState([])
  const [networkInitialTab, setNetworkInitialTab] = useState('Contacts')
  const [pointsScreen, setPointsScreen] = useState('points')

  const handleGoalAmountChange = (event) => {
    setGoalAmount(Number(event.target.value))
    setGoalSaved(false)
  }

  const handleGoalMonthsChange = (nextMonths) => {
    if (nextMonths === months) return
    setMonths(nextMonths)
    setGoalSaved(false)
  }

  const handleGoalSave = () => setGoalSaved(true)

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

  const editActions = useMemo(() => {
    const round = (n) => Math.max(1, Math.round(n * scale))
    const next = {
      invites: round(BASE_ACTIONS.invites),
      remind: round(BASE_ACTIONS.remind),
      ppp: round(BASE_ACTIONS.ppp),
      sharp: round(BASE_ACTIONS.sharp),
    }
    return { ...next, total: next.invites + next.remind + next.ppp + next.sharp }
  }, [scale])

  const editNetworkReach = useMemo(() => {
    const round = (n) => Math.max(1, Math.round(n * scale))
    return { merchants: round(6), influencers: round(8) }
  }, [scale])

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (file) setAvatarUrl(URL.createObjectURL(file))
  }

  function openReminder(person) {
    setReminderNames([person.name])
    setReminderStage('preview')
  }

  function openContactInvite(person) {
    if (!person) return
    setSelectedInviteNames([person.name])
    setContactInviteStage('preview')
  }

  function finishFirstLaunchInNetwork(contactsAreSynced) {
    setLaunchMode('returning')
    setContactsSynced(contactsAreSynced)
    setFirstLaunchStage(null)
    setSelectedNav('Network')
    setNetworkStage('overview')
    setNetworkInitialTab('Contacts')
    setContactInviteStage(null)
  }

  function restartLaunchMode(mode) {
    setLaunchMode(mode)
    setSelectedNav('Home')
    setContactsSynced(mode !== 'first')
    setIntroCompleted(false)
    setFirstLaunchStage(null)
    setSelectedInviteNames([])
    setRecentlyInvitedNames([])
    setContactInviteStage(null)
    setNetworkStage(mode === 'first' ? 'contacts' : 'overview')
    setNetworkInitialTab('Contacts')
  }

  const availableSyncedContacts = SYNCED_CONTACTS.filter(({ name }) => !recentlyInvitedNames.includes(name))
  const visibleInvitedContacts = recentlyInvitedNames.map((name) => ({
    name,
    timing: 'Invited today',
    initial: name.slice(0, 1).toUpperCase(),
  }))

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
            <div className="status-icons" aria-hidden="true">
              <img src="/images/dashboard-signal.svg" alt="" />
              <img src="/images/dashboard-wifi.svg" alt="" />
              <img src="/images/dashboard-battery.svg" alt="" />
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
              points={1000}
              onBack={() => setFirstLaunchStage('checkin')}
              onContinue={() => setFirstLaunchStage('privacy')}
            />
          ) : launchMode === 'first' && firstLaunchStage === 'privacy' ? (
            <NetworkPrivacyConsentScreen
              selective
              showInfo={false}
              onBack={() => setFirstLaunchStage('network-offer')}
              onContinue={() => setFirstLaunchStage('sync-select')}
              onOpenGuide={() => setGuideTopic('contactSync')}
            />
          ) : launchMode === 'first' && firstLaunchStage === 'sync-select' ? (
            <ContactSyncSelectScreen
              onBack={() => setFirstLaunchStage('privacy')}
              onSync={() => setFirstLaunchStage('syncing')}
            />
          ) : launchMode === 'first' && firstLaunchStage === 'syncing' ? (
            <NetworkSyncingScreen
              showInfo={false}
              showPendingAction={false}
              onBack={() => setFirstLaunchStage('sync-select')}
              onComplete={() => setFirstLaunchStage('sync-success')}
              onOpenGuide={() => setGuideTopic('contactSync')}
            />
          ) : launchMode === 'first' && firstLaunchStage === 'sync-success' ? (
            <NetworkSyncSuccessScreen
              showInfo={false}
              onBack={() => setFirstLaunchStage('sync-select')}
              onContinue={() => setFirstLaunchStage('sync-reward')}
              onOpenGuide={() => setGuideTopic('contactSync')}
            />
          ) : launchMode === 'first' && firstLaunchStage === 'sync-reward' ? (
            <NetworkSyncRewardScreen
              points={2000}
              contactSync
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
                  setContactInviteStage('reward')
                }}
              />
            ) : contactInviteStage === 'reward' ? (
              <ContactInvitationReward
                onBack={() => setContactInviteStage('preview')}
                onNext={() => setContactInviteStage('sent')}
              />
            ) : contactInviteStage === 'sent' ? (
              <ContactInvitationSent
                names={selectedInviteNames}
                onBack={() => setContactInviteStage('reward')}
                onInviteMore={() => {
                  setNetworkStage('contacts')
                  setNetworkInitialTab('Contacts')
                  setContactInviteStage(null)
                }}
                onViewInvited={() => {
                  setNetworkStage('contacts')
                  setNetworkInitialTab('Invited')
                  setContactInviteStage(null)
                }}
              />
            ) : networkStage === 'not-sync' ? (
              <ContactNotSyncOfferScreen
                onBack={() => setNetworkStage('overview')}
                onContinue={() => setNetworkStage('consent')}
              />
            ) : networkStage === 'overview' ? (
              <NetworkOverviewScreen
                invitedCount={recentlyInvitedNames.length}
                onOpenGuide={() => setGuideTopic('network')}
                onBack={() => setSelectedNav('Home')}
                onInvite={() => {
                  setNetworkInitialTab('Contacts')
                  setNetworkStage('contacts')
                }}
                onNudge={() => {
                  setNetworkInitialTab('Invited')
                  setNetworkStage('contacts')
                }}
              />
            ) : networkStage === 'consent' ? (
              <NetworkPrivacyConsentScreen
                selective={launchMode === 'contact-not-sync'}
                onBack={() => setNetworkStage(launchMode === 'contact-not-sync' ? 'not-sync' : 'contacts')}
                onSkip={() => setNetworkStage('contacts')}
                onContinue={() => setNetworkStage(launchMode === 'contact-not-sync' ? 'sync-select' : 'syncing')}
                onOpenGuide={() => setGuideTopic('contactSync')}
              />
            ) : networkStage === 'sync-select' ? (
              <ContactSyncSelectScreen
                onBack={() => setNetworkStage('consent')}
                onSync={() => setNetworkStage('syncing')}
              />
            ) : networkStage === 'syncing' ? (
              <NetworkSyncingScreen
                showPendingAction={launchMode !== 'contact-not-sync'}
                onBack={() => setNetworkStage(launchMode === 'contact-not-sync' ? 'sync-select' : 'consent')}
                onComplete={() => setNetworkStage('success')}
                onOpenGuide={() => setGuideTopic('contactSync')}
              />
            ) : networkStage === 'success' ? (
              <NetworkSyncSuccessScreen
                points={2000}
                onBack={() => setNetworkStage(launchMode === 'contact-not-sync' ? 'sync-select' : 'consent')}
                onContinue={() => setNetworkStage('reward')}
                onOpenGuide={() => setGuideTopic('contactSync')}
              />
            ) : networkStage === 'reward' ? (
              <NetworkSyncRewardScreen
                points={2000}
                contactSync={launchMode === 'contact-not-sync'}
                onBack={() => setNetworkStage('success')}
                onNext={() => {
                  setContactsSynced(true)
                  setSelectedNav('Network')
                  setContactInviteStage(null)
                  setNetworkInitialTab('Contacts')
                  setNetworkStage('overview')
                }}
              />
            ) : (
              <NetworkContactsScreen
                key={`${contactsSynced ? 'contacts-synced' : 'contacts-not-synced'}-${networkInitialTab}-${recentlyInvitedNames.join('-')}`}
                contactsSynced={contactsSynced}
                syncedResult={launchMode === 'contact-not-sync' && contactsSynced}
                initialTab={networkInitialTab}
                contacts={launchMode === 'contact-not-sync' && contactsSynced ? CONTACT_SYNCED_RESULT_CONTACTS : availableSyncedContacts}
                invitedContacts={visibleInvitedContacts}
                onBack={() => setNetworkStage('overview')}
                onRemind={openReminder}
                onSync={() => setNetworkStage('consent')}
                onSkip={() => setSelectedNav('Home')}
                onInviteContact={openContactInvite}
                onTabChange={setNetworkInitialTab}
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
            <PointsFlow
              BankIcon={BankIcon}
              onOpenPointsGuide={() => setGuideTopic('points')}
              onScreenChange={setPointsScreen}
            />
          ) : (
          <div className="dashboard-scroll" tabIndex={0} aria-label="Dashboard content">
            <div className="dashboard-content">
              <div className="app-header">
                <span className="dashboard-header-spacer" aria-hidden="true" />
                <div className="dashboard-header-actions">
                  <button type="button" aria-label="Open VietPay card">
                    <span className="dashboard-card-icon" aria-hidden="true">
                      <img src="/images/dashboard-header-circle.svg" alt="" />
                      <img src="/images/dashboard-card.svg" alt="" />
                    </span>
                  </button>
                  <button type="button" aria-label="Open QR code">
                    <img src="/images/dashboard-qr.svg" alt="" />
                  </button>
                  <button type="button" aria-label="Open VietPay">
                    <img className="dashboard-bank-icon" src="/images/dashboard-bank.svg" alt="" />
                  </button>
                </div>
              </div>

              <section className="profile-card card">
                <button
                  className="avatar profile-avatar"
                  aria-label="Change profile photo"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img src={avatarUrl || '/images/dashboard-profile.png'} alt="" />
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

                <div className="profile-name-row">
                  <button
                    id="points-help"
                    className="profile-info-button"
                    aria-label="About profile points"
                    aria-expanded={pointsInfoOpen}
                    onClick={() => setPointsInfoOpen((v) => !v)}
                  >
                    <img src="/images/dashboard-profile-info.svg" alt="" />
                  </button>
                  <strong>Hi, Y Van Dang</strong>
                  <span className="tier">Silver</span>
                </div>

                <div className="dashboard-points-line current-points">
                  <span>Current points:</span>
                  <strong>9,000,000</strong>
                  <b>points</b>
                </div>
                <div className="dashboard-points-line my-points">
                  <span>My points:</span>
                  <strong>1,245,000,000</strong>
                  <b>points</b>
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

                {!goalEditing && <div className="dashboard-checkin-row">
                  <button
                    type="button"
                    className="dashboard-edit-checkin"
                    onClick={() => {
                      setCheckinStage('checkin')
                      setCheckinFlowOpen(true)
                    }}
                  >
                    <img src="/images/dashboard-calendar-check.svg" alt="" aria-hidden="true" />
                    <span><strong>Check in</strong><small>Keep your daily streak going</small></span>
                    <img src="/images/dashboard-chevron-down.svg" alt="" aria-hidden="true" />
                  </button>
                </div>}

                <section className={`dashboard-goal-editor card${goalEditing ? ' editing' : ''}`} aria-label="Edit income goal">
                <div className="sheet-label sheet-label-with-info">
                  <label htmlFor="income-goal">Monthly income plan</label>
                  <button
                    id="goal-help"
                    className="info-button"
                    aria-label="About monthly income goal"
                    aria-expanded={goalInfoOpen}
                    onClick={() => setGoalInfoOpen((v) => !v)}
                  >
                    <img src="/images/dashboard-info.svg" alt="" />
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
                  <button
                    type="button"
                    className="dashboard-edit-goal"
                    aria-label={goalEditing ? 'Close monthly income plan editor' : 'Edit monthly income plan'}
                    aria-pressed={goalEditing}
                    onClick={() => setGoalEditing((editing) => !editing)}
                  >
                    <img src="/images/dashboard-edit.svg" alt="" />
                    Edit
                  </button>
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
                    onChange={handleGoalAmountChange}
                  />
                </div>
                <div className="sheet-bounds"><span>5M</span><span>100M</span></div>

                <div className="sheet-months" role="group" aria-label="Time to reach your goal">
                  {[6, 12, 18].map((m) => (
                    <button
                      key={m}
                      aria-pressed={months === m}
                      onClick={() => handleGoalMonthsChange(m)}
                    >
                      {months === m && <img src="/images/dashboard-check.svg" alt="" aria-hidden="true" />}
                      {m} months
                    </button>
                  ))}
                </div>

                <section className="goal-network-stats card" aria-label="Network Reach">
                  <span className="goal-network-stats-values">
                    <span className="stat">
                      <strong>{goalEditing ? String(editNetworkReach.merchants).padStart(2, '0') : networkReach.merchants}</strong>
                      <span>{goalEditing ? 'Merchants' : 'Target Merchants'}</span>
                    </span>
                    <span className="divider" aria-hidden="true" />
                    <span className="stat">
                      <strong>{goalEditing ? String(editNetworkReach.influencers).padStart(2, '0') : networkReach.influencers}</strong>
                      <span>{goalEditing ? 'Influencers' : 'Target Influencers'}</span>
                    </span>
                  </span>
                </section>

                {goalEditing && (
                  <section className="dashboard-activities-summary" aria-live="polite" aria-label="Activities per day">
                    <div className="dashboard-activities-heading">
                      <span>
                        Activities / day
                        <button
                          type="button"
                          className="info-button"
                          aria-label="About activities per day"
                          aria-expanded={activitiesInfoOpen}
                          onClick={() => setActivitiesInfoOpen((open) => !open)}
                        >
                          <img src="/images/dashboard-activities-info.svg" alt="" />
                        </button>
                      </span>
                      <b>{editActions.total} actions</b>
                    </div>
                    {activitiesInfoOpen && (
                      <>
                        <button className="dismiss-tip" aria-label="Dismiss" onClick={() => setActivitiesInfoOpen(false)} />
                        <div className="sheet-help-bubble" role="dialog">
                          <button className="tip-close" aria-label="Close" onClick={() => setActivitiesInfoOpen(false)}>
                            <X size={16} />
                          </button>
                          <strong>Activities / day</strong>
                          <p>Your daily activity targets update with the income goal and timeline.</p>
                          <button
                            className="video-link"
                            onClick={() => { setActivitiesInfoOpen(false); setGuideTopic('activities') }}
                          >
                            <Play size={14} /> Watch guide
                          </button>
                        </div>
                      </>
                    )}
                    <div className="dashboard-activity-counts">
                      <span><strong>{editActions.invites}</strong><b>Invites</b></span>
                      <span><strong>{editActions.remind}</strong><b>Remind</b></span>
                      <span><strong>{editActions.ppp}</strong><b>PPP</b></span>
                      <span><strong>{editActions.sharp}</strong><b>SHARP</b></span>
                    </div>
                  </section>
                )}

                {goalEditing ? (
                  <button
                    type="button"
                    className="dashboard-save-button"
                    disabled={goalSaved}
                    aria-live="polite"
                    aria-atomic="true"
                    onClick={handleGoalSave}
                  >
                    {goalSaved ? 'Saved' : 'Save changes'}
                  </button>
                ) : null}

              </section>

              {goalEditing && (
                <div className="dashboard-after-goal">
                  <button
                    type="button"
                    className="dashboard-edit-checkin"
                    onClick={() => {
                      setCheckinStage('checkin')
                      setCheckinFlowOpen(true)
                    }}
                  >
                    <img src="/images/dashboard-calendar-check.svg" alt="" aria-hidden="true" />
                    <span><strong>Check in</strong><small>Keep your daily streak going</small></span>
                    <img src="/images/dashboard-chevron-down.svg" alt="" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="dashboard-edit-recent"
                    aria-expanded={activitiesOpen}
                    onClick={() => setActivitiesOpen((open) => !open)}
                  >
                    <img src="/images/dashboard-clock.svg" alt="" aria-hidden="true" />
                    <span>Recent Activities</span>
                    <img
                      src="/images/dashboard-recent-chevron.svg"
                      alt=""
                      aria-hidden="true"
                      style={{ transform: activitiesOpen ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>
                  {activitiesOpen && (
                    <div className="dashboard-recent-detail">No recent activity yet — invite a merchant to get started.</div>
                  )}
                </div>
              )}
            </div>
          </div>
          )}

          {!checkinFlowOpen && !(launchMode === 'first' && !introCompleted) && !(launchMode === 'first' && firstLaunchStage) && !reminderStage && !contactInviteStage && !(selectedNav === 'Network' && ['contacts', 'consent', 'sync-select', 'syncing', 'success', 'reward'].includes(networkStage)) && !(selectedNav === 'Points' && pointsScreen !== 'points') && (
          <nav className="bottom-bar" aria-label="Main navigation">
            {[
              { key: 'Home', icon: '/images/dashboard-home.svg' },
              { key: 'Network', icon: '/images/dashboard-network.svg' },
              { key: 'Plan', icon: '/images/dashboard-plan.svg' },
              { key: 'Points', icon: '/images/dashboard-points.svg' },
            ].map(({ key, icon }) => (
              <button
                key={key}
                className={`nav-item ${selectedNav === key ? 'selected' : ''}`}
                aria-pressed={selectedNav === key}
                onClick={() => {
                  if (key === 'Network') {
                    setNetworkStage('overview')
                    setNetworkInitialTab('Contacts')
                    setContactInviteStage(null)
                  }
                  setSelectedNav(key)
                }}
              >
                <img className="nav-item-icon" src={icon} alt="" aria-hidden="true" />
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
          aria-pressed={launchMode === 'contact-not-sync'}
          onClick={() => {
            setLaunchMode('contact-not-sync')
            setIntroCompleted(true)
            setFirstLaunchStage(null)
            setContactsSynced(false)
            setSelectedNav('Network')
            setNetworkStage('not-sync')
            setNetworkInitialTab('Contacts')
            setContactInviteStage(null)
            setReminderStage(null)
          }}
        >
          contact not sync
        </button>
        {[
          { key: 'first', label: 'first launch' },
          { key: 'returning', label: '>= second times launch' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={launchMode === key}
            onClick={() => restartLaunchMode(key)}
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
