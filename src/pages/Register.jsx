import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material'
import { PersonAddOutlined as PersonAddOutlinedIcon } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

function Register() {
  const navigate = useNavigate()
  const { register, error, loading } = useAuth()
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  })
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  })

  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear field error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      })
    }
  }

  // Validate form
  const validateForm = () => {
    let isValid = true
    const errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    }

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
      isValid = false
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
      isValid = false
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required'
      isValid = false
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
      isValid = false
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
      isValid = false
    }

    // Role validation
    if (!formData.role) {
      errors.role = 'Please select a role'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Call register function from AuthContext with Supabase
      await register(formData)
      
      // Navigate to login page on success
      navigate('/login')
    } catch (err) {
      // Handle Supabase specific errors
      if (err.message.includes('email')) {
        setSubmitError('This email is already registered or invalid. Please use another email address.')
      } else if (err.message.includes('password')) {
        setSubmitError('Password error: ' + err.message)
      } else if (err.message.includes('adding user to')) {
        // Handle role-based table insertion errors
        setSubmitError(err.message)
      } else {
        setSubmitError(err.message || 'Registration failed. Please try again.')
      }
      console.error('Registration error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PersonAddOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
            <Typography component="h1" variant="h5" gutterBottom>
              Create an Account
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Join our Supply Chain Management platform
            </Typography>
            
            {(error || submitError) && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error || submitError}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="Full Name"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    disabled={isSubmitting || loading}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="email"
                    label="Email Address"
                    type="email"
                    fullWidth
                    value={formData.email}
                    onChange={handleChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    disabled={isSubmitting || loading}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="password"
                    label="Password"
                    type="password"
                    fullWidth
                    value={formData.password}
                    onChange={handleChange}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    disabled={isSubmitting || loading}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!formErrors.confirmPassword}
                    helperText={formErrors.confirmPassword}
                    disabled={isSubmitting || loading}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!formErrors.role} disabled={isSubmitting || loading} required>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      labelId="role-label"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      label="Role"
                    >
                      <MenuItem value="supplier">Supplier</MenuItem>
                      <MenuItem value="company">Company</MenuItem>
                      <MenuItem value="consumer">Consumer</MenuItem>
                    </Select>
                    {formErrors.role && (
                      <Typography variant="caption" color="error">
                        {formErrors.role}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting || loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {(isSubmitting || loading) ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Register'
                )}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Register
