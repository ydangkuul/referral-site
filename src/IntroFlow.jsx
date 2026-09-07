import { useEffect, useRef, useState } from 'react'
import {
  BatteryFull, Camera, ChevronLeft, Info, Play, Signal,
  Upload, UserPlus, Wifi, X,
} from 'lucide-react'
import { INTRO_STAGES } from './introSequence.js'

function IntroStatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <div>
        <Signal size={17} />
        <Wifi size={18} />
        <BatteryFull size={25} />
      </div>
    </div>
  )
}

function IntroBackButton({ onBack }) {
  return (
    <button className="intro-back-button" type="button" aria-label="Previous step" onClick={onBack}>
      <ChevronLeft size={23} strokeWidth={2} />
    </button>
  )
}

function WelcomeScreen({ onNext }) {
  const [seconds, setSeconds] = useState(5)

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds((value) => value - 1), 1000)
      return () => clearTimeout(timer)
    }
    onNext()
  }, [seconds, onNext])

  return (
    <div className="intro-screen welcome-screen">
      <IntroStatusBar />

      <h1 className="intro-welcome-title">
        Refer merchants<br />
        and get income<br />
        for 3 years
      </h1>

      <div className="intro-countdown-badge">
        <div className="countdown-number">0{seconds}</div>
        <div className="countdown-label">sec</div>
      </div>

      <div className="intro-welcome-container">
        <img src="/images/intro-bg.png" alt="" className="intro-bg-image" />
        <img src="/images/intro-linh-welcome.png" alt="" className="intro-character-image" />
      </div>
    </div>
  )
}

function PointingHero({ compact = false, guideSrc = '/images/intro-linh-guide-line.png' }) {
  return (
    <div className={`intro-pointing-hero${compact ? ' compact' : ''}`} aria-hidden="true">
      <img className="intro-pointing-guide" src={guideSrc} alt="" />
      <img className="intro-pointing-mascot" src="/images/intro-linh-pointing.png" alt="" />
    </div>
  )
}

function SequenceFooter({ children, onClick, icon: Icon }) {
  return (
    <button className="intro-sequence-footer" type="button" onClick={onClick}>
      {Icon && <Icon size={18} strokeWidth={2} />}
      <span>{children}</span>
    </button>
  )
}

function EstimateScreen({ merchants, onMerchantsChange, onNext, onBack, onOpenEstimateGuide }) {
  const [infoOpen, setInfoOpen] = useState(false)
  const [merchantInput, setMerchantInput] = useState(String(merchants))
  const points = merchants * 1500

  useEffect(() => {
    setMerchantInput(String(merchants))
  }, [merchants])

  function handleMerchantInput(event) {
    const nextValue = event.target.value.replace(/\D/g, '').slice(0, 2)
    setMerchantInput(nextValue)
    if (nextValue) onMerchantsChange(Math.min(99, Math.max(1, Number(nextValue))))
  }

  return (
    <div className="intro-screen intro-sequence-screen estimate-screen">
      <IntroStatusBar />
      <IntroBackButton onBack={onBack} />
      <h1 className="intro-sequence-title">Estimate<br />my monthly income</h1>
      <button
        className="intro-title-info"
        type="button"
        aria-label="About estimated income"
        aria-expanded={infoOpen}
        onClick={() => setInfoOpen((value) => !value)}
      >
        <Info size={17} />
      </button>
      {infoOpen && (
        <>
          <button className="dismiss-tip" aria-label="Dismiss" onClick={() => setInfoOpen(false)} />
          <div className="bubble intro-estimate-bubble" role="dialog" aria-modal="false">
            <button className="tip-close" aria-label="Close" onClick={() => setInfoOpen(false)}>
              <X size={16} />
            </button>
            <strong>Estimated monthly reward</strong>
            <p>See how merchants you know can turn into recurring referral income.</p>
            <button
              className="video-link"
              onClick={() => {
                setInfoOpen(false)
                onOpenEstimateGuide()
              }}
            >
              <Play size={14} /> Watch guide
            </button>
          </div>
        </>
      )}
      <PointingHero />

      <section className="intro-estimate-card" aria-label="Your estimated reward">
        <span>Your Estimated Reward</span>
        <strong>{points.toLocaleString('en-US')} pt</strong>
        <small>≈ {points.toLocaleString('en-US')},000 ₫</small>
      </section>

      <div className="intro-stepper-label">
        <strong>Merchants I know</strong>
        <span>Level 2</span>
      </div>
      <div className="intro-stepper" role="group" aria-label="Merchants I know">
        <button type="button" aria-label="Decrease merchants" onClick={() => onMerchantsChange(Math.max(1, merchants - 1))}>−</button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={merchantInput}
          aria-label="Number of merchants I know"
          onChange={handleMerchantInput}
          onBlur={() => {
            if (!merchantInput) setMerchantInput(String(merchants))
          }}
          onFocus={(event) => event.currentTarget.select()}
        />
        <button className="primary" type="button" aria-label="Increase merchants" onClick={() => onMerchantsChange(Math.min(99, merchants + 1))}>+</button>
      </div>

      <SequenceFooter onClick={onNext}>Claim 1,000 pts</SequenceFooter>
    </div>
  )
}

const REWARD_ASSETS = {
  1000: '/images/intro-reward-1000.png',
  2000: '/images/intro-reward-2000.png',
  3000: '/images/intro-reward-3000.png',
  4000: '/images/intro-reward-4000.png',
}

function RewardScreen({ points, onNext, onBack }) {
  return (
    <div className="intro-screen intro-sequence-reward" data-points={points}>
      <IntroStatusBar />
      <IntroBackButton onBack={onBack} />
      <div className="intro-reward-points" aria-label={`${points.toLocaleString('en-US')} points`}>
        <img src={REWARD_ASSETS[points]} alt="" />
      </div>
      <img className="intro-reward-confetti" src="/images/intro-sequence-confetti.png" alt="" />
      <img className="intro-reward-girl" src="/images/intro-linh-celebrate.png" alt="" />
      <div className="intro-reward-gradient" aria-hidden="true" />
      <SequenceFooter onClick={onNext}>Next</SequenceFooter>
      <div className="intro-home-indicator" aria-hidden="true" />
    </div>
  )
}

function AvatarChoice({ selected, label, image, imageClass, onSelect }) {
  return (
    <button className={`intro-avatar-choice${selected ? ' selected' : ''}`} type="button" aria-pressed={selected} onClick={onSelect}>
      <span className="intro-radio" aria-hidden="true"><span /></span>
      <strong>{label}</strong>
      <span className="intro-avatar-image">
        <img className={imageClass} src={image} alt="" />
      </span>
    </button>
  )
}

function AvatarScreen({ choice, name, onChoiceChange, onNameChange, onNext, onBack }) {
  return (
    <div className="intro-screen intro-sequence-screen avatar-screen">
      <IntroStatusBar />
      <IntroBackButton onBack={onBack} />
      <h1 className="intro-sequence-title">Select<br />My Avatar</h1>
      <PointingHero />

      <div className="intro-avatar-card">
        <AvatarChoice
          selected={choice === 'female'}
          label="Female"
          image="/images/intro-avatar-female.png"
          imageClass="female"
          onSelect={() => onChoiceChange('female')}
        />
        <AvatarChoice
          selected={choice === 'male'}
          label="Male"
          image="/images/intro-avatar-male.png"
          imageClass="male"
          onSelect={() => onChoiceChange('male')}
        />
      </div>

      <input
        className="intro-name-input"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Please type your name here"
        aria-label="Your name"
      />
      <SequenceFooter onClick={onNext}>Claim 1,000 pts</SequenceFooter>
    </div>
  )
}

function UploadScreen({ fileName, onFileChange, onNext, onBack }) {
  const fileInputRef = useRef(null)

  return (
    <div className="intro-screen intro-sequence-screen upload-screen">
      <IntroStatusBar />
      <IntroBackButton onBack={onBack} />
      <h1 className="intro-sequence-title">Upload<br />My photo</h1>
      <PointingHero />

      <section className="intro-upload-card" aria-label="Upload your photo">
        <div className="intro-camera-circle"><Camera size={56} strokeWidth={1.6} /></div>
        <strong>{fileName || 'Upload your photo'}</strong>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          <Upload size={19} /> Browse photos
        </button>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          tabIndex={-1}
          onChange={(event) => onFileChange(event.target.files?.[0]?.name || '')}
        />
      </section>
      <SequenceFooter onClick={onNext}>Claim 1,000 pts</SequenceFooter>
    </div>
  )
}

function InviteScreen({ playing, onPlayingChange, onNext, onBack }) {
  return (
    <div className="intro-screen intro-sequence-screen invite-screen">
      <IntroStatusBar />
      <IntroBackButton onBack={onBack} />
      <h1 className="intro-video-title">Watch video<br />get more points</h1>
      <PointingHero compact guideSrc="/images/intro-linh-video-guide-line.png" />
      <button className="intro-video-card" type="button" aria-label={playing ? 'Pause intro video' : 'Play intro video'} onClick={() => onPlayingChange(!playing)}>
        <img src="/images/intro-video-thumbnail.png" alt="" />
        <span className={playing ? 'playing' : ''}><img src="/images/intro-video-play.svg" alt="" /></span>
      </button>
      <SequenceFooter onClick={onNext}>Next</SequenceFooter>
    </div>
  )
}

const INVITATION_LINK = 'vietpay.vn/invite/VIET2024XY'
const DEFAULT_INVITATION_MESSAGE = 'Hi! I’d like to invite you to join VietPay — a simple way to make payments and earn rewards. Use my invitation link below.'

function InvitationShareScreen({ onNext, onBack }) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState(DEFAULT_INVITATION_MESSAGE)

  async function copyInvitationLink() {
    await navigator.clipboard.writeText(INVITATION_LINK)
    setCopied(true)
  }

  return (
    <div className="intro-screen invitation-share-screen">
      <IntroStatusBar />
      <IntroBackButton onBack={onBack} />
      <button className="invitation-share-info" type="button" aria-label="About invitations">
        <Info size={17} />
      </button>

      <PointingHero compact />

      <div className="invitation-ready-banner">
        <img src="/images/invite-sparkles.svg" alt="" />
        <strong>Your invitation is ready to send</strong>
      </div>

      <section className="invitation-card" aria-label="Your invitation">
        <div className="invitation-card-heading">
          <h1>Your invitation</h1>
          <button type="button" onClick={() => setEditing((value) => !value)}>
            {editing ? 'Done' : 'Edit message'}
          </button>
        </div>

        <div className="invitation-message-preview">
          {editing ? (
            <textarea
              autoFocus
              value={message}
              aria-label="Invitation message"
              onChange={(event) => setMessage(event.target.value)}
            />
          ) : (
            <p>{message}</p>
          )}
        </div>

        <span className="invitation-link-label">Invitation link</span>
        <div className="invitation-link-row">
          <strong>{INVITATION_LINK}</strong>
          <button type="button" onClick={copyInvitationLink}>
            <img src="/images/invite-copy.svg" alt="" />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>

      <section className="invitation-share-options" aria-label="Send invitation via">
        <h2>Send invitation via</h2>
        <div>
          <button type="button" onClick={onNext} aria-label="Send via Zalo">
            <span className="invitation-share-icon zalo"><img src="/images/invite-zalo.svg" alt="" /></span>
            <span>Zalo</span>
          </button>
          <button type="button" onClick={onNext} aria-label="Send via Messenger">
            <span className="invitation-share-icon messenger"><img src="/images/invite-messenger.svg" alt="" /></span>
            <span>Messenger</span>
          </button>
          <button type="button" onClick={onNext} aria-label="Send via SMS">
            <span className="invitation-share-icon sms"><img src="/images/invite-sms.svg" alt="" /></span>
            <span>SMS</span>
          </button>
          <button type="button" onClick={onNext} aria-label="Send via Email">
            <span className="invitation-share-icon email"><img src="/images/invite-email.svg" alt="" /></span>
            <span>Email</span>
          </button>
        </div>
      </section>
    </div>
  )
}

export default function IntroFlow({ onComplete, onOpenEstimateGuide }) {
  const [stage, setStage] = useState('welcome')
  const [merchants, setMerchants] = useState(10)
  const [avatarChoice, setAvatarChoice] = useState('female')
  const [name, setName] = useState('')
  const [fileName, setFileName] = useState('')
  const [videoPlaying, setVideoPlaying] = useState(false)

  const stageIndex = INTRO_STAGES.indexOf(stage)

  function goNext() {
    if (stage === 'welcome') {
      setStage(INTRO_STAGES[0])
    } else if (stageIndex === INTRO_STAGES.length - 1) {
      onComplete()
    } else {
      setStage(INTRO_STAGES[stageIndex + 1])
    }
  }

  function goBack() {
    setVideoPlaying(false)
    setStage(stageIndex <= 0 ? 'welcome' : INTRO_STAGES[stageIndex - 1])
  }

  if (stage === 'welcome') return <WelcomeScreen onNext={goNext} />
  if (stage === 'estimate') return <EstimateScreen merchants={merchants} onMerchantsChange={setMerchants} onNext={goNext} onBack={goBack} onOpenEstimateGuide={onOpenEstimateGuide} />
  if (stage === 'avatar') return <AvatarScreen choice={avatarChoice} name={name} onChoiceChange={setAvatarChoice} onNameChange={setName} onNext={goNext} onBack={goBack} />
  if (stage === 'upload') return <UploadScreen fileName={fileName} onFileChange={setFileName} onNext={goNext} onBack={goBack} />
  if (stage === 'invite') return <InviteScreen playing={videoPlaying} onPlayingChange={setVideoPlaying} onNext={goNext} onBack={goBack} />
  if (stage === 'invitation-share') return <InvitationShareScreen onNext={goNext} onBack={goBack} />
  const points = Number(stage.split('-')[1])
  return <RewardScreen points={points} onNext={goNext} onBack={goBack} />
}
