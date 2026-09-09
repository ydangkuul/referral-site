import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { assetCssUrl } from './assetUrl.js'
import './styles.css'
import './figma-overrides.css'
import './checkin.css'
import './intro.css'
import './first-launch.css'
import './dashboard-home.css'

document.documentElement.style.setProperty('--countdown-badge-image', assetCssUrl('images/countdown-badge.png'))
document.documentElement.style.setProperty('--dashboard-slider-image', assetCssUrl('images/dashboard-slider.svg'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
