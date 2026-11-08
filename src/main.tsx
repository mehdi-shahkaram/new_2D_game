import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/vazirmatn'
import '@fontsource/lalezar'
import './index.css'
import App from './App.tsx'
import { DevPreview } from './DevPreview.tsx'

const preview = import.meta.env.DEV && location.hash.startsWith('#bg=')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {preview ? <DevPreview hash={location.hash} /> : <App />}
  </StrictMode>,
)
