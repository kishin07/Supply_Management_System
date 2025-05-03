import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Paper,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import supabase from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';

// Generate a unique numeric-only order number
const generateOrderNumber = () => {
  // Use timestamp for uniqueness, ensuring it's only numbers
  const timestamp = Date.now().toString();
  // Add random digits to further ensure uniqueness
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  // Combine for a purely numeric order number
  return timestamp + randomDigits;
};

const AddOrder = ({ setOrderView }) => {
  const { currentUser } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Initialize form data from localStorage or with default values
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem('orderFormData');
    return savedFormData ? JSON.parse(savedFormData) : {
      orderNumber: generateOrderNumber(),
      supplierId: '',
      supplierName: '',
      items: [],
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      totalAmount: 0
    };
  });
  
  // Initialize current item from localStorage or with default values
  const [currentItem, setCurrentItem] = useState(() => {
    const savedCurrentItem = localStorage.getItem('orderCurrentItem');
    return savedCurrentItem ? JSON.parse(savedCurrentItem) : { name: '', quantity: 0, price: 0 };
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch suppliers from Supabase
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

        // Set form data with generated order number if not already set
        if (!formData.orderNumber) {
          setFormData(prev => ({
            ...prev,
            orderNumber: generateOrderNumber(),
            orderDate: new Date().toISOString().split('T')[0]
          }));
        }
      } catch (err) {
        console.error('Error fetching suppliers:', err);
        setSnackbarMessage('Error loading suppliers');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [currentUser]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('orderFormData', JSON.stringify(formData));
    
    // Cleanup function to handle component unmounting
    return () => {
      // Don't remove localStorage on unmount - we want to persist the data
      // Only remove if navigating away from the form intentionally (handled in submit)
    };
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special handling for supplier selection to update both ID and Name
    if (name === 'supplierId') {
      const selectedSupplier = suppliers.find(s => s.supplier_id === value);
      setFormData(prev => ({
        ...prev,
        supplierId: value,
        supplierName: selectedSupplier ? selectedSupplier.name : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Save current item to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('orderCurrentItem', JSON.stringify(currentItem));
    
    // Cleanup function to handle component unmounting
    return () => {
      // Don't remove localStorage on unmount - we want to persist the data
      // Only remove if navigating away from the form intentionally (handled in submit)
    };
  }, [currentItem]);

  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value)
    }));
  };

  const addItem = () => {
    if (!currentItem.name || currentItem.quantity <= 0 || currentItem.price <= 0) {
      setSnackbarMessage('Please fill in all item fields with valid values');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const newItem = { ...currentItem };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
      totalAmount: prev.totalAmount + (newItem.quantity * newItem.price)
    }));
    setCurrentItem({ name: '', quantity: 0, price: 0 });
    // Clear current item from localStorage after adding to the order
    localStorage.removeItem('orderCurrentItem');
  };

  const removeItem = (index) => {
    const removedItem = formData.items[index];
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: newItems,
      totalAmount: prev.totalAmount - (removedItem.quantity * removedItem.price)
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      setSnackbarMessage('You must be logged in to perform this action');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (!formData.supplierId || formData.items.length === 0) {
      setSnackbarMessage('Please select a supplier and add at least one item');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      // Add new order
      const { data: orderData, error: orderError } = await supabase
        .from('company_orders')
        .insert([
          {
            order_no: formData.orderNumber,
            order_date: formData.orderDate,
            order_supplier: formData.supplierId,
            supplier_id: formData.supplierId, // Adding supplier_id field to match the table schema
            company_id: currentUser.id,
            order_status: formData.status,
            order_total_amount: formData.totalAmount
          }
        ])
        .select();

      if (orderError) throw orderError;

      if (orderData && orderData.length > 0) {
        // Add order items
        const orderItems = formData.items.map(item => ({
          order_id: orderData[0].order_id,
          item_name: item.name,
          quantity: item.quantity,
          price: item.price
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        setSnackbarMessage('Order created successfully');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);

        // Navigate back to orders list
        // Clear localStorage after successful order creation
        localStorage.removeItem('orderFormData');
        localStorage.removeItem('orderCurrentItem');
        
        setTimeout(() => {
          setOrderView('list');
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setSnackbarMessage(`Failed to create order: ${err.message}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => setOrderView('list')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Create New Order
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Order Number (Numeric Only)"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleInputChange}
                disabled
                margin="normal"
                helperText="Automatically generated numeric ID (e.g., 16990000001234)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Order Date"
                name="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="supplier-label">Supplier</InputLabel>
                <Select
                  labelId="supplier-label"
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  label="Supplier"
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.supplier_id} value={supplier.supplier_id}>
                      {supplier.name} ({supplier.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Order Items
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Item Name"
                name="name"
                value={currentItem.name}
                onChange={handleItemInputChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={currentItem.quantity}
                onChange={handleItemInputChange}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={currentItem.price}
                onChange={handleItemInputChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={addItem}
                startIcon={<AddIcon />}
                sx={{ height: '56px' }}
              >
                Add
              </Button>
            </Grid>
          </Grid>

          {formData.items.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                      <TableCell align="right">₹{(item.quantity * item.price).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton color="error" onClick={() => removeItem(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        Total Amount:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        ₹{formData.totalAmount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info" sx={{ mb: 4 }}>
              No items added yet. Add items using the form above.
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={formData.items.length === 0 || !formData.supplierId}
              sx={{ mt: 2 }}
            >
              Create Order
            </Button>
          </Box>
        </Paper>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddOrder;