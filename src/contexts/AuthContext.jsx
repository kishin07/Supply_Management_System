import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../supabase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true)
      
      try {
        // First check localStorage for user data
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setCurrentUser(userData)
          setUserRole(userData.role)
        }
        
        // Then verify with Supabase session
        const { data } = await supabase.auth.getSession()
        
        if (data?.session) {
          const { user } = data.session
          const userData = user.user_metadata || {}
          
          const sessionUser = {
            id: user.id,
            email: user.email,
            name: userData.name || userData.display_name || 'User',
            role: userData.role || 'consumer'
          }
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(sessionUser))
          
          setCurrentUser(sessionUser)
          setUserRole(sessionUser.role || 'consumer')
        } else if (storedUser) {
          // If no active session but we have stored user, clear it
          localStorage.removeItem('user')
          setCurrentUser(null)
          setUserRole(null)
        }
      } catch (err) {
        console.error('Error checking session:', err)
        // Clear potentially corrupted data
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }
    
    checkSession()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          const userData = session.user.user_metadata || {}
          
          const user = {
            id: session.user.id,
            email: session.user.email,
            name: userData.name || userData.display_name || 'User',
            role: userData.role || 'consumer'
          }
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(user))
          
          setCurrentUser(user)
          setUserRole(userData.role || 'consumer')
        } else {
          // Clear user data from localStorage
          localStorage.removeItem('user')
          setCurrentUser(null)
          setUserRole(null)
        }
      }
    )
    
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Register function using Supabase
  const register = async (userData) => {
    setLoading(true)
    setError('')
    
    try {
      // Validate passwords match
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match')
      }
      
      // Register user with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      })
      
      if (signUpError) throw signUpError
      
      // Update user profile to set display_name
      if (data.user) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { display_name: userData.name }
        })
        
        if (updateError) console.error('Error updating display name:', updateError)
      }
      
      // Add user to the appropriate table based on role
      if (data.user) {
        const userId = data.user.id
        let roleTableError = null
        
        // Add user to the appropriate table based on role
        if (userData.role === 'supplier') {
          const { error } = await supabase
            .from('suppliers')
            .insert([{ 
              supplier_id: userId,
              created_at: new Date(),
              category: '',
              contact: '',
              rating: ''
            }])
            .select()
          
          roleTableError = error
        } else if (userData.role === 'company') {
          const { error } = await supabase
            .from('company')
            .insert([{ 
              company_id: userId,
              created_at: new Date()
            }])
            .select()
          
          roleTableError = error
        } else if (userData.role === 'consumer') {
          const { error } = await supabase
            .from('consumers')
            .insert([{ 
              consumer_id: userId,
              created_at: new Date()
            }])
            .select()
          
          roleTableError = error
        }
        
        if (roleTableError) {
          console.error(`Error adding user to ${userData.role} table:`, roleTableError)
          // If adding to role table fails, we should throw an error to notify the user
          throw new Error(`Failed to complete registration. Error adding user to ${userData.role} database.`)
        }
      }
      
      console.log('User registered successfully:', data)
      
      // Set user data in context
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: userData.name,
        role: userData.role
      }
      
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user))
      
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

  // Login function using Supabase
  const login = async (email, password) => {
    setLoading(true)
    setError('')
    
    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) throw signInError
      
      // Get user metadata
      const userData = data.user.user_metadata || {}
      
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: userData.name || userData.display_name || 'User',
        role: userData.role || 'consumer'
      }
      
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user))
      
      setCurrentUser(user)
      setUserRole(user.role)
      
      return user
    } catch (err) {
      setError(err.message || 'Failed to login')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear user data from localStorage
      localStorage.removeItem('user')
      
      setCurrentUser(null)
      setUserRole(null)
    } catch (err) {
      console.error('Error signing out:', err)
      setError(err.message)
    }
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