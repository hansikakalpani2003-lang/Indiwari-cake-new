import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css' 

// 1. ⚠️ මේ පේළිය ඔයාගේ ප්‍රොජෙක්ට් එකේ AuthProvider එක තියෙන තැන අනුව දාගන්න:
import { AuthProvider } from './context/AuthContext.jsx' // (නැත්නම් './src/context/AuthContext' වගේ ඇති)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* 👈 මේක ඇතුලට App එක දාන්න */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)