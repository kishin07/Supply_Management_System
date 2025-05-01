import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { BiddingProvider } from './contexts/BiddingContext'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function App() {
  const { currentUser } = useAuth()

  return (
    <BiddingProvider>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            currentUser ? <Dashboard /> : <Navigate to="/register" />
          } 
        />
        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/register"} />} />
      </Routes>
    </BiddingProvider>
  )
}

export default App