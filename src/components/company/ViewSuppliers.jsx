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
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const ViewSuppliers = ({ dashboardData, setDashboardData, setCompanyView }) => {
  // Load suppliers data from localStorage or use mock data
  const [suppliers, setSuppliers] = useState(() => {
    const savedSuppliers = localStorage.getItem('suppliers');
    return savedSuppliers ? JSON.parse(savedSuppliers) : [
    {
      id: 1,
      name: 'Supplier A',
      contactPerson: 'John Smith',
      email: 'john@suppliera.com',
      phone: '(555) 123-4567',
      category: 'Electronics',
      rating: 4.5,
      onTimeDelivery: 95,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Supplier B',
      contactPerson: 'Jane Doe',
      email: 'jane@supplierb.com',
      phone: '(555) 987-6543',
      category: 'Raw Materials',
      rating: 4.0,
      onTimeDelivery: 88,
      status: 'Active'
    },
    {
      id: 3,
      name: 'Supplier C',
      contactPerson: 'Robert Johnson',
      email: 'robert@supplierc.com',
      phone: '(555) 456-7890',
      category: 'Office Supplies',
      rating: 4.2,
      onTimeDelivery: 92,
      status: 'Active'
    },
    {
      id: 4,
      name: 'Supplier D',
      contactPerson: 'Sarah Williams',
      email: 'sarah@supplierd.com',
      phone: '(555) 789-0123',
      category: 'Furniture',
      rating: 3.5,
      onTimeDelivery: 78,
      status: 'Inactive'
    },
    {
      id: 5,
      name: 'Supplier E',
      contactPerson: 'Michael Brown',
      email: 'michael@suppliere.com',
      phone: '(555) 234-5678',
      category: 'Electronics',
      rating: 4.0,
      onTimeDelivery: 85,
      status: 'Active'
    }
  ];
  });

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: '',
    rating: 0,
    onTimeDelivery: 0,
    status: 'Active'
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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

  const handleOpenDialog = (supplier = null) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormData({ ...supplier });
    } else {
      setSelectedSupplier(null);
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        category: '',
        rating: 0,
        onTimeDelivery: 80, // Default value
        status: 'Active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSupplier(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue
    }));
  };

  const handleSubmit = () => {
    if (selectedSupplier) {
      // Update existing supplier
      setSuppliers(prev =>
        prev.map(supplier =>
          supplier.id === selectedSupplier.id ? { ...supplier, ...formData } : supplier
        )
      );
      setSnackbarMessage('Supplier updated successfully');
    } else {
      // Add new supplier
      const newSupplier = {
        id: suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
        ...formData
      };
      setSuppliers(prev => [...prev, newSupplier]);
      setSnackbarMessage('Supplier added successfully');
    }
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    handleCloseDialog();
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => setCompanyView('dashboard')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Supplier Management
        </Typography>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Supplier
        </Button>
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography component="legend">Rating</Typography>
                <Rating
                  name="rating"
                  value={formData.rating}
                  precision={0.5}
                  onChange={(event, newValue) => handleRatingChange(newValue)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="On-time Delivery %"
                name="onTimeDelivery"
                type="number"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                value={formData.onTimeDelivery}
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