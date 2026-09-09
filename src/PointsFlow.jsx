import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Check, CreditCard, Info, Link2, Play, QrCode, Rocket, Star, Sun, X,
} from 'lucide-react'

const POINT_VALUE = 1000
const MIN_POINTS = 100
const MAX_POINTS = 2000
const INITIAL_POINTS = 1245
const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

function formatNumber(n) {
  return n.toLocaleString('en-US')
}

function formatVnd(n) {
  return `${formatNumber(n)} ₫`
}

const historyItems = [
  { icon: Sun, tone: 'cyan', title: 'Daily check-in', meta: 'Today · 9:41', amount: '+500 pts', kind: 'earn' },
  { icon: Rocket, tone: 'lime', title: 'Referral · Michael', meta: 'Sep 3 · Pending', amount: '+1,000 pts', kind: 'pending' },
  { icon: Link2, tone: 'blue', title: 'Converted to VND', meta: 'Sep 2 · 1,245 VND', amount: '−1,245 pts', kind: 'spend' },
  { icon: Star, tone: 'sky', title: 'Task completed', meta: 'Sep 1 · Invite contacts', amount: '+250 pts', kind: 'earn' },
]

function StepperButton({ children, onClick, label, variant = 'muted' }) {
  return (
    <button className={`points-stepper-button ${variant}`} onClick={onClick} aria-label={label}>
      {children}
    </button>
  )
}

function PointsHome({ onConvert, BankIcon, onOpenPointsGuide }) {
  const [pointsInfoOpen, setPointsInfoOpen] = useState(false)

  return (
    <div className="points-flow-scroll">
      <header className="points-flow-header">
        <div className="network-overview-tools" aria-label="Points shortcuts">
          <span className="selected" aria-hidden="true"><CreditCard size={21} strokeWidth={1.8} /></span>
          <span aria-hidden="true"><QrCode size={20} strokeWidth={2} /></span>
          <span aria-hidden="true"><BankIcon width={23} height={21} /></span>
        </div>
      </header>

      <section className="points-balance-card">
        <div className="points-balance-top">
          <span>Available points</span>
          <button
            className="points-info-button"
            aria-label="About available points"
            aria-expanded={pointsInfoOpen}
            onClick={() => setPointsInfoOpen((v) => !v)}
          >
            <Info size={16} />
          </button>
        </div>
        {pointsInfoOpen && (
          <>
            <button className="dismiss-tip" aria-label="Dismiss" onClick={() => setPointsInfoOpen(false)} />
            <div className="bubble points points-flow-bubble" role="dialog" aria-modal="false">
            <button className="tip-close" aria-label="Close" onClick={() => setPointsInfoOpen(false)}>
                <X size={16} />
              </button>
              <strong>Available points</strong>
              <p>Points you can redeem right now for cash or rewards.</p>
              <button
                className="video-link"
                onClick={() => { setPointsInfoOpen(false); onOpenPointsGuide() }}
              >
                <Play size={14} /> Watch guide
              </button>
            </div>
          </>
        )}
        <div className="points-balance-main">
          <strong>1,245</strong>
          <span>pts</span>
        </div>
        <div className="points-balance-grid">
          <div>
            <span>Pending points</span>
            <strong>300 pts</strong>
          </div>
          <div>
            <span>Lifetime points</span>
            <strong>5,745 pts</strong>
          </div>
        </div>
        <button className="points-primary-button" onClick={onConvert}>Convert points</button>
      </section>

      <section className="points-history-section" aria-label="Points history">
        <div className="points-section-title">
          <h2>Points history</h2>
          <button>View all</button>
        </div>
        <div className="points-history-card">
          {historyItems.map(({ icon: Icon, tone, title, meta, amount, kind }) => (
            <div className="points-history-item" key={title}>
              <span className={`points-history-icon ${tone}`}>
                <Icon size={19} strokeWidth={2} />
              </span>
              <span className="points-history-copy">
                <strong>{title}</strong>
                <small>{meta}</small>
              </span>
              <strong className={`points-history-amount ${kind}`}>{amount}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ConvertPoints({ points, setPoints, onBack, onDone, onOpenGuide }) {
  const pct = ((points - MIN_POINTS) / (MAX_POINTS - MIN_POINTS)) * 100
  const amount = useMemo(() => points * POINT_VALUE, [points])

  return (
    <div className="points-flow-scroll convert">
      <header className="points-flow-header convert">
        <button onClick={onBack} aria-label="Back to points">
          <ArrowLeft size={22} />
        </button>
        <h1>Convert points</h1>
        <button aria-label="About convert points" onClick={onOpenGuide}>
          <Info size={16} />
        </button>
      </header>

      <div className="convert-points-hero" aria-hidden="true">
        <img className="convert-points-guide-line" src={assetUrl('images/points-convert-line.svg')} alt="" />
        <div className="convert-points-person-frame">
          <img src={assetUrl('images/points-convert-linh.png')} alt="" />
        </div>
      </div>

      <section className="convert-receive-card">
        <span>You will receive</span>
        <strong>{formatVnd(amount)}</strong>
      </section>

      <div className="points-stepper">
        <StepperButton label="Decrease points" onClick={() => setPoints((v) => Math.max(MIN_POINTS, v - 100))}>
          <img src={assetUrl('images/points-convert-minus.svg')} alt="" />
        </StepperButton>
        <strong>{formatNumber(points)} pts</strong>
        <StepperButton label="Increase points" variant="primary" onClick={() => setPoints((v) => Math.min(MAX_POINTS, v + 100))}>
          <img src={assetUrl('images/points-convert-plus.svg')} alt="" />
        </StepperButton>
      </div>

      <div className="points-range">
        <div className="points-range-fill" style={{ width: `${pct}%` }} />
        <input
          aria-label="Points to convert"
          type="range"
          min={MIN_POINTS}
          max={MAX_POINTS}
          step="5"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
        />
      </div>

      <button className="points-primary-button convert-cta" onClick={onDone}>
        Convert {formatNumber(points)} pts
      </button>
    </div>
  )
}

function ConvertedSuccess({ points, onBack, onOpenGuide }) {
  return (
    <div className="points-flow-scroll success">
      <header className="points-flow-header convert">
        <button onClick={onBack} aria-label="Back to points">
          <ArrowLeft size={22} />
        </button>
        <h1>Convert points</h1>
        <button aria-label="About converted points" onClick={onOpenGuide}>
          <Info size={16} />
        </button>
      </header>

      <section className="points-success-block">
        <div className="points-success-badge">
          <Check size={42} strokeWidth={2.2} />
          <span className="confetti c1" />
          <span className="confetti c2" />
          <span className="confetti c3" />
          <span className="confetti c4" />
        </div>
        <h1>Converted!</h1>
        <p>You've successfully converted<br />{formatNumber(points)} points to VND</p>
      </section>

      <section className="actual-points-card">
        <span>Actual points</span>
        <strong>7,376 pts</strong>
        <small>≈ 7,376,000 ₫</small>
      </section>
    </div>
  )
}

export default function PointsFlow({ BankIcon, onOpenPointsGuide, onScreenChange }) {
  const [screen, setScreen] = useState('points')
  const [points, setPoints] = useState(INITIAL_POINTS)

  useEffect(() => {
    onScreenChange?.(screen)
  }, [onScreenChange, screen])

  if (screen === 'convert') {
    return (
      <ConvertPoints
        points={points}
        setPoints={setPoints}
        onBack={() => setScreen('points')}
        onDone={() => setScreen('success')}
        onOpenGuide={onOpenPointsGuide}
      />
    )
  }

  if (screen === 'success') {
    return <ConvertedSuccess points={points} onBack={() => setScreen('points')} onOpenGuide={onOpenPointsGuide} />
  }

  return <PointsHome onConvert={() => setScreen('convert')} BankIcon={BankIcon} onOpenPointsGuide={onOpenPointsGuide} />
}
