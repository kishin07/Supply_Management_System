import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import supabase from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';

const AddSupplier = ({ setCompanyView }) => {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [searchStatus, setSearchStatus] = useState(null); // 'success', 'error', or null
  const [searchMessage, setSearchMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [supplierData, setSupplierData] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSearch = async () => {
    if (!email) {
      setSearchStatus('error');
      setSearchMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setSearchStatus(null);
    setSearchMessage('');
    setSupplierData(null);

    try {
      // First, search in users table for a user with supplier role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', 'supplier')
        .single();

      if (userError) throw userError;

      if (!userData) {
        setSearchStatus('error');
        setSearchMessage('No supplier found with this email address.');
        return;
      }

      // If user found, fetch their supplier details
      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('supplier_id', userData.id)
        .single();

      if (supplierError) throw supplierError;

      if (!supplierData) {
        setSearchStatus('error');
        setSearchMessage('Supplier account exists but no supplier details found.');
        return;
      }

      // Combine user and supplier data
      setSupplierData({ ...userData, ...supplierData });
      setSearchStatus('success');
      setSearchMessage('Supplier found! Review their details below.');

    } catch (error) {
      console.error('Error searching for supplier:', error);
      setSearchStatus('error');
      setSearchMessage('An error occurred while searching for the supplier.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async () => {
    if (!currentUser || !supplierData) return;

    setLoading(true);
    try {
      // Check if relationship already exists
      const { data: existingRelation, error: checkError } = await supabase
        .from('company_supplier_master')
        .select('*')
        .eq('company_id', currentUser.id)
        .eq('supplier_id', supplierData.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw checkError;
      }

      if (existingRelation) {
        setSnackbar({
          open: true,
          message: 'This supplier is already added to your company.',
          severity: 'warning'
        });
        return;
      }

      // Add new relationship
      const { error: insertError } = await supabase
        .from('company_supplier_master')
        .insert([
          {
            company_id: currentUser.id,
            supplier_id: supplierData.id
          }
        ]);

      if (insertError) throw insertError;

      setSnackbar({
        open: true,
        message: 'Supplier added successfully!',
        severity: 'success'
      });

      // Navigate back to suppliers list
      setCompanyView('viewSuppliers');

    } catch (error) {
      console.error('Error adding supplier:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add supplier. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          color="primary"
          sx={{ mr: 2 }}
          onClick={() => setCompanyView('viewSuppliers')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Add New Supplier
        </Typography>
      </Box>

      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Enter the supplier's email address to search for their account.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Supplier Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter supplier's email address"
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ minWidth: 120 }}
          >
            Search
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {searchStatus && (
          <Alert severity={searchStatus} sx={{ mt: 2 }}>
            {searchMessage}
          </Alert>
        )}

        {supplierData && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Supplier Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {supplierData.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {supplierData.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Category:</strong> {supplierData.category}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Contact:</strong> {supplierData.contact}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Rating:</strong> {supplierData.rating}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Address:</strong> {supplierData.address}
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleAddSupplier}
                >
                  Add Supplier
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddSupplier;