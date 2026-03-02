import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'sonner'
import router from './router'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      {/* Toaster global de Sonner — disponible en toda la app */}
      <Toaster
        position="top-right"
        richColors
        expand={false}
        duration={4000}
        toastOptions={{
          style: { fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' },
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
)

