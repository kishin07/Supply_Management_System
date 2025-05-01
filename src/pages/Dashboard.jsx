import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, CircularProgress, Container, Paper } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import SupplierDashboard from './SupplierDashboard'
import CompanyDashboard from './CompanyDashboard'
import ConsumerDashboard from './ConsumerDashboard'

function Dashboard() {
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  
  // Redirect based on user role
  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    
    // Set loading to false after checking user
    setLoading(false)
  }, [currentUser, navigate])
  
  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading dashboard...
        </Typography>
      </Container>
    )
  }

  // If no user is authenticated, the redirect in useEffect will handle it
  if (!currentUser) {
    return null
  }

  // Render appropriate dashboard based on user role
  switch(userRole) {
    case 'supplier':
      return <SupplierDashboard />
    case 'company':
      return <CompanyDashboard />
    case 'consumer':
      return <ConsumerDashboard />
    default:
      // If no valid role, show error message
      return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" color="error" gutterBottom>
              Access Error
            </Typography>
            <Typography variant="body1" paragraph>
              Your account doesn't have a valid role assigned. Please contact the system administrator.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                User ID: {currentUser.uid}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Role: {userRole || 'None'}
              </Typography>
            </Box>
          </Paper>
        </Container>
      )
  }
}

export default Dashboard