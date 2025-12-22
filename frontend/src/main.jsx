import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Ensure default page title for the SPA matches the HTML title
document.title = "Walvee - Your best friend for trips. Or something like this";

ReactDOM.createRoot(document.getElementById('root')).render(<App />)