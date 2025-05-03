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
  IconButton,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import AddSupplier from './AddSupplier';
import supabase from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';

const ViewSuppliers = ({ setCompanyView }) => {
  const { currentUser } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // First, get all supplier relationships for the company
        const { data: relationships, error: relError } = await supabase
          .from('company_supplier_master')
          .select('supplier_id')
          .eq('company_id', currentUser.id);

        if (relError) throw relError;

        if (relationships && relationships.length > 0) {
          // Get all supplier details for the related supplier IDs
          const supplierIds = relationships.map(rel => rel.supplier_id);
          
          // Get supplier details from suppliers table
          const { data: suppliersData, error: suppError } = await supabase
            .from('suppliers')
            .select('*')
            .in('supplier_id', supplierIds);

          if (suppError) throw suppError;
          
          // Get supplier names from users table
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', supplierIds);

          if (usersError) throw usersError;
          
          // Merge supplier data with user data
          const mergedData = suppliersData.map(supplier => {
            const user = usersData.find(user => user.id === supplier.supplier_id);
            return {
              ...supplier,
              name: user?.name || 'Not Available',
              email: user?.email || supplier.email
            };
          });
          
          setSuppliers(mergedData || []);
        } else {
          setSuppliers([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
        setError('Failed to load suppliers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [currentUser]);
  const [view, setView] = useState('list'); // 'list' or 'add'

  if (view === 'add') {
    return <AddSupplier setCompanyView={() => setView('list')} />;
  }

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
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setView('add')}
          >
            Add Supplier
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      ) : suppliers.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.supplier_id}>
                  <TableCell>{supplier.name || 'Not Updated'}</TableCell>
                  <TableCell>{supplier.email || 'Not Updated'}</TableCell>
                  <TableCell>{supplier.category || 'Not Updated'}</TableCell>
                  <TableCell>{supplier.contact || 'Not Updated'}</TableCell>
                  <TableCell>{supplier.rating || 'Not Updated'}</TableCell>
                  <TableCell>{supplier.address || 'Not Updated'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '200px',
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No suppliers added. Click on the Add Supplier button to add suppliers.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ViewSuppliers;