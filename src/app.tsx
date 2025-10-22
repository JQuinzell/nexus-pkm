import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Dashboard } from './Dashboard'
import { ThemeProvider } from './components/theme-provider'
import { FileTreeProvider } from './FileTree/FileTreeContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='nexus-pkm-theme'>
      <FileTreeProvider>
        <Dashboard />
      </FileTreeProvider>
    </ThemeProvider>
  </React.StrictMode>
)
