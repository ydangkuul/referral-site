import { useEffect } from 'react'
import { CircleCheck, Pencil, UserRound } from 'lucide-react'

function BankMark() {
  return <img className="first-launch-bank" src="/images/first-launch-bank.svg" alt="" />
}

export default function FirstLaunchDashboard({ preview = false, onPreviewComplete, onInvite }) {
  useEffect(() => {
    if (!preview) return undefined
    const timer = window.setTimeout(onPreviewComplete, 2000)
    return () => window.clearTimeout(timer)
  }, [preview, onPreviewComplete])

  if (preview) {
    return (
      <div className="first-launch-scene-zero" aria-label="First check-in dashboard">
        <header className="first-launch-zero-header"><BankMark /></header>
        <section className="first-launch-zero-profile">
          <img className="first-launch-zero-avatar" src="/images/first-launch-avatar.png" alt="" />
          <div className="first-launch-zero-name"><strong>Hi, Y Van Dang</strong><span>Silver</span></div>
          <img className="first-launch-zero-info" src="/images/first-launch-info.svg" alt="" />
          <div className="first-launch-zero-points current"><span>Current points:</span><strong>9,000,000</strong><b>pts</b></div>
          <div className="first-launch-zero-points mine"><span>My points:</span><strong>1,245,000,000</strong><b>pts</b></div>
        </section>
        <section className="first-launch-zero-streak">
          <div className="first-launch-zero-streak-heading"><strong>3-day streak = 1000 pts</strong><span>Monday</span></div>
          <div className="first-launch-zero-days">
            <div><span className="checked"><img src="/images/first-launch-check.svg" alt="" /></span><b>M</b></div><i />
            <div><span /><b>T</b></div><i />
            <div><span /><b>W</b></div>
          </div>
          <button type="button">Check in today get 1000 pts</button>
        </section>
        <section className="first-launch-zero-goal">
          <div className="first-launch-zero-goal-title">Monthly income goal <img src="/images/first-launch-info.svg" alt="" /></div>
          <div className="first-launch-zero-goal-value"><strong>30,000,000</strong><span>VND</span><button type="button"><img src="/images/first-launch-edit.svg" alt="" />Edit</button></div>
          <div className="first-launch-zero-goal-overlay" aria-hidden="true" />
        </section>
      </div>
    )
  }

  return (
    <div className="first-launch-dashboard is-complete">
      <header className="first-launch-dashboard-header"><BankMark /></header>
      <section className="first-launch-profile">
        <span className="first-launch-avatar"><UserRound size={27} /></span>
        <strong>Hi, Y Dang</strong><span className="first-launch-tier">Silver</span>
        <div className="first-launch-point-row"><span>Current points:</span><strong>9,000,000 pts</strong></div>
        <div className="first-launch-point-row"><span>My points:</span><strong>1,245,000,000 pts</strong></div>
      </section>

      <section className="first-launch-goal-card">
        <div className="first-launch-goal-heading">
          <strong>Monthly income plan</strong>
          <button type="button"><Pencil size={12} /> Edit</button>
        </div>
        <div className="first-launch-goal-amount"><strong>30,000,000</strong><span>VND</span></div>
        <>
            <div className="first-launch-slider"><span /></div>
            <div className="first-launch-bounds"><span>5M</span><span>100M</span></div>
            <div className="first-launch-months"><span className="selected">12 months <CircleCheck size={10} /></span><span>18 months</span><span>24 months</span></div>
            <div className="first-launch-targets">
              <span><strong>27</strong><small>Target<br />Merchants</small></span>
              <span><strong>40</strong><small>Target<br />Influencers</small></span>
            </div>
        </>
      </section>

    </div>
  )
}
