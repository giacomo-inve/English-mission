import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Apply theme and font size immediately before React renders
const savedTheme = localStorage.getItem('emc-theme')
if (savedTheme === 'light') {
  document.documentElement.classList.add('light-theme')
} else {
  document.documentElement.classList.remove('light-theme')
}

const savedFontSize = localStorage.getItem('emc-font-size') || 'standard'
document.documentElement.setAttribute('data-font-size', savedFontSize)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
