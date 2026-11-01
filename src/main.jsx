import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import { SettingsProvider } from './lib/settings.jsx'
import './index.css'

// BrowserRouter gives clean links (/about, /volunteer) that Google can index; netlify.toml redirects them to index.html.
const Router = import.meta.env.VITE_PREVIEW ? MemoryRouter : BrowserRouter

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </Router>
  </React.StrictMode>
)
