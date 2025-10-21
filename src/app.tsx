import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Dashboard } from './Dashboard'
import { ThemeProvider } from './components/theme-provider'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='nexus-pkm-theme'>
      <Dashboard />
    </ThemeProvider>
  </React.StrictMode>
)
