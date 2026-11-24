import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

// 지원 언어 중 아랍어만 오른쪽에서 왼쪽으로 배치
document.documentElement.dir = chrome.i18n.getMessage('@@ui_locale').startsWith('ar') ? 'rtl' : 'ltr'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
