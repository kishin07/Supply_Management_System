import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Mock register function - in a real app, this would call an API
  const register = async (userData) => {
    setLoading(true)
    setError('')
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate validation
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match')
      }
      
      // In a real app, you would send the data to your backend API
      console.log('Registering user:', userData)
      
      // Simulate successful registration
      const user = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email: userData.email,
        name: userData.name,
        role: userData.role
      }
      
      setCurrentUser(user)
      setUserRole(userData.role)
      
      return user
    } catch (err) {
      setError(err.message || 'Failed to register')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Mock login function
  const login = async (email, password) => {
    setLoading(true)
    setError('')
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Predefined supplier accounts
      const supplierAccounts = [
        { id: 1, email: 'supplierA@example.com', password: 'password', name: 'Supplier A', role: 'supplier' },
        { id: 2, email: 'supplierB@example.com', password: 'password', name: 'Supplier B', role: 'supplier' },
        { id: 3, email: 'supplierC@example.com', password: 'password', name: 'Supplier C', role: 'supplier' },
        { id: 4, email: 'supplierD@example.com', password: 'password', name: 'Supplier D', role: 'supplier' },
        { id: 5, email: 'supplierE@example.com', password: 'password', name: 'Supplier E', role: 'supplier' }
      ];
      
      // Check if it's a supplier login
      const supplierAccount = supplierAccounts.find(account => account.email === email && account.password === password);
      
      if (supplierAccount) {
        setCurrentUser(supplierAccount)
        setUserRole(supplierAccount.role)
        return supplierAccount
      }
      // In a real app, you would validate credentials with your backend
      else if (email === 'test@example.com' && password === 'password') {
        const user = {
          id: 'user-123',
          email: email,
          name: 'Test User',
          role: 'company' // Default role for test user
        }
        
        setCurrentUser(user)
        setUserRole(user.role)
        return user
      } else {
        throw new Error('Invalid email or password')
      }
    } catch (err) {
      setError(err.message || 'Failed to login')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setUserRole(null)
  }

  const value = {
    currentUser,
    setCurrentUser,
    userRole,
    loading,
    error,
    register,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}