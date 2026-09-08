import { useEffect, useState } from 'react'
import { ArrowLeft, Check, House, UsersRound, Goal, CircleDollarSign } from 'lucide-react'

// CircleStar component from App.jsx
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

const DAYS = [
  { key: 'M', label: 'M' },
  { key: 'T', label: 'T' },
  { key: 'W', label: 'W' },
]

function CheckInScreen({ onCheckIn }) {
  return (
    <div className="checkin-flow-scroll">
      <header className="checkin-flow-header">
        <h1>Daily check-in</h1>
      </header>

      <div className="checkin-character">
        <img src="/images/checkin-character.png" alt="" />
      </div>

      <div className="checkin-info-bubble">
        <div className="checkin-info-bubble-inner">
          <p>
            Check in every day to earn reward points! Keep your streak going to receive special bonuses.
          </p>
        </div>
      </div>

      <section className="checkin-card-main">
        <div className="checkin-card-header">
          <h2>3-day streak = 1000 pts</h2>
          <span className="checkin-day-name">Monday</span>
        </div>

        <div className="checkin-progress-track">
          {DAYS.map((day, index) => (
            <div key={day.key} className="checkin-day-item">
              <div className={`checkin-day-circle ${index === 0 ? 'completed' : ''}`}>
                {index === 0 && <Check size={16} strokeWidth={3} />}
              </div>
              <span>{day.label}</span>
            </div>
          ))}
          <span className="checkin-connector checkin-connector-1 active" aria-hidden="true" />
          <span className="checkin-connector checkin-connector-2" aria-hidden="true" />
        </div>

        <button className="checkin-primary-button" onClick={onCheckIn}>
          Check in today get 1,000 pts
        </button>
      </section>
    </div>
  )
}

function ReturningSuccessScreen({ onNext }) {
  const [selectedNav] = useState('Home')

  return (
    <div className="checkin-flow-scroll success returning">
      <header className="checkin-flow-header">
        <button onClick={onNext} aria-label="Back to dashboard">
          <ArrowLeft size={16} />
        </button>
        <h1>Daily check-in</h1>
      </header>

      <div className="checkin-success-content">
        <div className="checkin-points-display">
          <img src="/images/points-1000.png" alt="1,000 points" />
        </div>

        <div className="checkin-success-character">
          <img src="/images/intro-sequence-confetti.png" alt="" className="checkin-confetti" />
          <img src="/images/intro-linh-celebrate.png" alt="" className="checkin-character-img" />
        </div>

        <img src="/images/reward-gradient-bottom.png" alt="" className="checkin-gradient-overlay" />
      </div>

      <div className="checkin-success-footer">
        <button className="checkin-next-button" onClick={onNext}>
          <img src="/images/reward-button.png" alt="Next" />
        </button>
      </div>

    </div>
  )
}

function SuccessScreen({ onNext, onBack, rewardPoints = 5000 }) {
  return (
    <div className="checkin-flow-scroll success">
      <header className="checkin-flow-header">
        <button onClick={onBack} aria-label="Back to check-in">
          <ArrowLeft size={16} />
        </button>
      </header>

      <div className="checkin-success-content">
        <div className="checkin-points-display">
          <img
            src={rewardPoints === 1000 ? '/images/points-1000.png' : '/images/points-5000-figma.png'}
            alt={`${rewardPoints.toLocaleString('en-US')} points`}
          />
        </div>

        <div className="checkin-success-character">
          <img src="/images/intro-sequence-confetti.png" alt="" className="checkin-confetti" />
          <img src="/images/intro-linh-celebrate.png" alt="" className="checkin-character-img" />
        </div>

        <img src="/images/reward-gradient-bottom.png" alt="" className="checkin-gradient-overlay" />
      </div>

      <div className="checkin-success-footer">
        <button className="checkin-next-button" onClick={onNext}>
          <img src="/images/reward-button.png" alt="Next" />
        </button>
      </div>
      <div className="checkin-success-progress" aria-hidden="true" />
    </div>
  )
}

export default function CheckInFlow({ launchMode = 'first', rewardPoints = 5000, onClose, onBack = onClose, onStageChange }) {
  const [screen, setScreen] = useState('checkin')

  useEffect(() => {
    onStageChange?.(screen)
  }, [onStageChange, screen])

  if (screen === 'success') {
    return launchMode === 'returning'
      ? <ReturningSuccessScreen onNext={onClose} />
      : <SuccessScreen onNext={onClose} onBack={() => setScreen('checkin')} rewardPoints={rewardPoints} />
  }

  return <CheckInScreen onCheckIn={() => setScreen('success')} />
}
