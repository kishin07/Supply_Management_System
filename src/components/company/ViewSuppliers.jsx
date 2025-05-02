import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Grid,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import supabase from '../../supabase';

const ViewSuppliers = ({ dashboardData, setDashboardData, setCompanyView }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load suppliers data from Supabase
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*, users(*)');

        if (error) throw error;

        setSuppliers(data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setSnackbarMessage('Error loading suppliers');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchError, setSearchError] = useState('');

  // Update dashboard data when suppliers change
  useEffect(() => {
    // Only proceed if both dashboardData and setDashboardData are available
    if (dashboardData && setDashboardData && typeof setDashboardData === 'function') {
      // Get active suppliers count
      const activeCount = suppliers.filter(supplier => supplier.status === 'Active').length;
      
      // Get supplier names and on-time delivery percentages for chart
      const supplierNames = suppliers.map(supplier => supplier.name);
      const otdValues = suppliers.map(supplier => supplier.onTimeDelivery);
      
      // Update dashboard data
      setDashboardData(prev => {
        // Ensure prev exists
        if (!prev) return {
          company: {
            activeSuppliers: activeCount,
            supplierPerformance: {
              labels: supplierNames,
              datasets: [{
                label: 'On-time Delivery %',
                data: otdValues,
                borderColor: '#1976D2',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                tension: 0.4
              }]
            }
          }
        };
        
        // Create a safe copy of the previous state
        const newState = {...prev};
        
        // Update company data - ensure company property exists first
        newState.company = {
          ...(newState.company || {}),  // Use empty object if company doesn't exist
          activeSuppliers: activeCount,
          supplierPerformance: {
            labels: supplierNames,
            datasets: [{
              label: 'On-time Delivery %',
              data: otdValues,
              borderColor: '#1976D2',
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              tension: 0.4
            }]
          }
        };
        
        return newState;
      });
    }
  }, [suppliers, dashboardData, setDashboardData]);

  const [emailSearchDialog, setEmailSearchDialog] = useState(false);
  const [emailSearchValue, setEmailSearchValue] = useState('');

  const handleOpenDialog = (supplier = null) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormData({ ...supplier });
      setOpenDialog(true);
    } else {
      setEmailSearchDialog(true);
    }
  };

  const handleEmailSearch = async () => {
    // For the search dialog
    if (emailSearchDialog) {
      if (!emailSearchValue) {
        setSearchError('Please enter an email to search');
        return;
      }

      try {
        // First check if user exists in users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('uid, Email, name')
          .eq('email', emailSearchValue)
          .single();

        if (userError) {
          console.error('Error searching user:', userError);
          setSearchError('Error searching for user');
          return;
        }

        if (!userData) {
          setSearchError('No user found with this email');
          return;
        }

        // Then check if user is already a supplier
        const { data: supplierData, error: supplierError } = await supabase
          .from('suppliers')
          .select('*')
          .eq('supplier_id', userData.id)
          .single();

        if (supplierError && supplierError.code !== 'PGRST116') {
          console.error('Error checking supplier:', supplierError);
          setSearchError('Error checking supplier status');
          return;
        }

        if (supplierData) {
          setSelectedSupplier(supplierData);
          setFormData({ ...supplierData });
          setSnackbarMessage('Supplier with this email already exists');
          setSnackbarSeverity('info');
          setOpenSnackbar(true);
        } else {
          setSelectedSupplier(null);
          setFormData({
            name: userData.name || '',
            contactPerson: userData.name || '',
            email: userData.email,
            user_id: userData.id,
            phone: '',
            category: '',
            rating: 0,
            onTimeDelivery: 80,
            status: 'Active'
          });
        }

        setEmailSearchDialog(false);
        setOpenDialog(true);
      } catch (error) {
        console.error('Error searching supplier:', error);
        setSearchError('Error searching for supplier');
        setSnackbarMessage('Error searching for supplier');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } 
    // For the search bar
    else {
      if (!searchEmail) {
        setSearchError('Please enter an email to search');
        return;
      }
      try {
        // First find the user with the given email
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', searchEmail)
          .single();

        if (userError) {
          console.error('Error searching user:', userError);
          setSearchError('Error searching for user');
          return;
        }

        if (!userData) {
          setSearchError('No user found with this email');
          return;
        }

        // Then find the supplier associated with this user
        const { data: suppliers, error: supplierError } = await supabase
          .from('suppliers')
          .select('*, users(*)')
          .eq('user_id', userData.id);

        if (supplierError) {
          console.error('Error searching suppliers:', supplierError);
          setSearchError('Error searching suppliers');
          return;
        }

        if (suppliers.length === 0) {
          setSearchError('No suppliers found with this email');
        }
        setSuppliers(suppliers);
      } catch (error) {
        console.error('Error searching suppliers:', error);
        setSearchError('Error searching suppliers');
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSupplier(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'searchEmail') {
      setSearchEmail(value);
      setSearchError('');
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRatingChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedSupplier) {
        // Update existing supplier
        const { error } = await supabase
          .from('suppliers')
          .update({
            name: formData.name,
            contact_person: formData.contactPerson,
            phone: formData.phone,
            category: formData.category,
            status: formData.status
          })
          .eq('id', selectedSupplier.id);

        if (error) throw error;

        // Update local state
        setSuppliers(prev =>
          prev.map(supplier =>
            supplier.id === selectedSupplier.id ? { ...supplier, ...formData } : supplier
          )
        );
        setSnackbarMessage('Supplier updated successfully');
      } else {
        // Add new supplier
        const { data: newSupplier, error } = await supabase
          .from('suppliers')
          .insert([
            {
              user_id: formData.user_id,
              name: formData.name,
              contact_person: formData.contactPerson,
              phone: formData.phone,
              category: formData.category,
              rating: formData.rating || 0,
              on_time_delivery: formData.onTimeDelivery || 80,
              status: formData.status || 'Active'
            }
          ])
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setSuppliers(prev => [...prev, newSupplier]);
        setSnackbarMessage('Supplier added successfully');
      }
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving supplier:', error);
      setSnackbarMessage('Error saving supplier');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleDelete = (id) => {
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    setSnackbarMessage('Supplier deleted successfully');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  // Save suppliers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => setCompanyView('dashboard')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Manage Suppliers
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            name="searchEmail"
            label="Search by Email"
            value={searchEmail}
            onChange={handleInputChange}
            error={!!searchError}
            helperText={searchError}
            size="small"
            sx={{ width: 250 }}
          />
          <Button
            variant="contained"
            onClick={handleEmailSearch}
            color="secondary"
          >
            Search
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Supplier
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>On-time Delivery</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.contactPerson}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.category}</TableCell>
                <TableCell>
                  <Rating value={supplier.rating} readOnly precision={0.5} />
                </TableCell>
                <TableCell>{supplier.onTimeDelivery}%</TableCell>
                <TableCell>
                  <Chip 
                    label={supplier.status} 
                    color={supplier.status === 'Active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(supplier)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(supplier.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Email Search Dialog */}
      <Dialog open={emailSearchDialog} onClose={() => setEmailSearchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Search Supplier by Email</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              value={emailSearchValue}
              onChange={(e) => {
                setEmailSearchValue(e.target.value);
                setSearchError('');
              }}
              error={!!searchError}
              helperText={searchError}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailSearchDialog(false)}>Cancel</Button>
          <Button onClick={handleEmailSearch} variant="contained" color="primary">
            Search & Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Supplier Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ViewSuppliers;