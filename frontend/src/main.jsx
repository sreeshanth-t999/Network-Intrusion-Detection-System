// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SimulateContextProvider } from './context/SimulateContext.jsx'

createRoot(document.getElementById('root')).render(
  <SimulateContextProvider>
    <StrictMode>
      <App />
    </StrictMode>,
  </SimulateContextProvider>
)
