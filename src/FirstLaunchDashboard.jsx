import { CircleCheck, Pencil, UserRound } from 'lucide-react'

function BankMark() {
  return <img className="first-launch-bank" src="/images/first-launch-bank.svg" alt="" />
}

export default function FirstLaunchDashboard({ onInvite }) {
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

      <button className="first-launch-invite" type="button" onClick={onInvite}>Invite friends</button>
    </div>
  )
}
