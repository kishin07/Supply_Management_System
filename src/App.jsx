import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { BiddingProvider } from './contexts/BiddingContext'
import { CurrencyProvider } from './contexts/CurrencyContext'
import MainLayout from './components/layout/MainLayout'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SupplierDashboard from './pages/SupplierDashboard'
import CompanyDashboard from './pages/CompanyDashboard'
import ConsumerDashboard from './pages/ConsumerDashboard'
import BiddingSystem from './pages/BiddingSystem'
import ViewBids from './pages/ViewBids'

function App() {
  const { currentUser, userRole } = useAuth()

  // Check if user is authenticated for protected routes
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />
    }
    return children
  }
  
  // Redirect to role-specific dashboard
  const RoleBasedRedirect = () => {
    switch(userRole) {
      case 'supplier':
        return <Navigate to="/supplier" />
      case 'company':
        return <Navigate to="/company" />
      case 'consumer':
        return <Navigate to="/consumer" />
      default:
        return <Dashboard />
    }
  }

  return (
    <BiddingProvider>
      <CurrencyProvider>
        <MainLayout>
          <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/supplier" 
            element={
              <ProtectedRoute>
                <SupplierDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company" 
            element={
              <ProtectedRoute>
                <CompanyDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consumer" 
            element={
              <ProtectedRoute>
                <ConsumerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bidding-system" 
            element={
              <ProtectedRoute>
                {userRole === 'company' ? <BiddingSystem /> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/view-bids" 
            element={
              <ProtectedRoute>
                {userRole === 'company' ? <ViewBids /> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
          </Routes>
        </MainLayout>
      </CurrencyProvider>
    </BiddingProvider>
  )
}

export default App