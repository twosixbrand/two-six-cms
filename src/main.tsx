import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Styles
import "../src/styles/App.css";
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
