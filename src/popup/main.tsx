import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { uiDir } from '../i18n'
import { App } from './App'
import './index.css'

document.documentElement.dir = uiDir()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
