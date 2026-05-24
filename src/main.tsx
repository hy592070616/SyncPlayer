import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import logoSrc from '@assets/LOGO.png'

const link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]')
if (link) {
  link.href = logoSrc
  link.type = 'image/png'
} else {
  const newLink = document.createElement('link')
  newLink.rel = 'icon'
  newLink.type = 'image/png'
  newLink.href = logoSrc
  document.head.appendChild(newLink)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)