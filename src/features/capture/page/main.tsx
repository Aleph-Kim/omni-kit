import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { t, uiDir } from '../../../i18n'
import { App } from './App'
import '../../../theme.css'

document.documentElement.dir = uiDir()
document.title = t('editorTitle')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
