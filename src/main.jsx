import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'sonner'
import router from './router'
import './index.css'
import { NotificationProvider } from './context/NotificationContext'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [initialLoading, setInitialLoading] = React.useState(true);

  if (initialLoading) {
    return <LoadingScreen onDone={() => setInitialLoading(false)} />;
  }

  return (
    <>
      <AuthProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
          {/* Toaster global de Sonner — disponible en toda la app */}
          <Toaster
            position="top-right"
            richColors
            expand={false}
            duration={4000}
            style={{ marginTop: '60px' }}
            toastOptions={{
              style: { fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
