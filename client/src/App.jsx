// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './context/Auth'
import Home from './pages/Home'
import Docs from './pages/Docs'
import Status from './pages/Status'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Profile from './pages/Profile'
import axios from 'axios'
import './index.css'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, initializing } = useAuth()
  
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, initializing } = useAuth()
  
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  return !user ? children : <Navigate to="/docs" replace />
}

function App() {
  const [metadata, setMetadata] = useState({
    creator: 'API Service',
    apititle: 'Modern API',
    github: '#',
    whatsapp: '#',
    youtube: '#'
  })

  useEffect(() => {
    // Fetch metadata from API
    axios.get('/api/metadata')
      .then(response => {
        if (response.data.status && response.data.result) {
          setMetadata(response.data.result)
        }
      })
      .catch(error => {
        console.error('Failed to fetch metadata:', error)
      })
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home metadata={metadata} />} />
        <Route path="/status" element={<Status metadata={metadata} />} />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/docs" 
          element={
            <ProtectedRoute>
              <Docs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
          
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App