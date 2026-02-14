import React from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="296029296221-sgmc2ec37ejv8f86qhnee6lils1m239k.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
)