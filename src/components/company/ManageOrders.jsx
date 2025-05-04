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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Snackbar,
  Alert,
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
import AddOrder from './AddOrder';

const ManageOrders = ({ dashboardData, setDashboardData, setCompanyView }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderView, setOrderView] = useState('list'); // 'list' or 'add'

  // Fetch orders and suppliers from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('company_orders')
          .select('*')
          .order('order_date', { ascending: false });

        if (ordersError) throw ordersError;

        // Fetch order items for each order
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order) => {
            const { data: itemsData, error: itemsError } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.order_id);

            if (itemsError) throw itemsError;

            return {
              ...order,
              items: itemsData || []
            };
          })
        );

        // Fetch suppliers
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('suppliers')
          .select('*');

        if (suppliersError) throw suppliersError;

        setOrders(ordersWithItems);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbarMessage('Error loading data');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    orderNumber: '',
    supplierId: '', // Changed from supplier
    supplierName: '', // Added for convenience
    items: [],
    orderDate: '',
    status: '',
    totalAmount: 0
  });
  const [currentItem, setCurrentItem] = useState({ name: '', quantity: 0, price: 0 });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Update dashboard data when orders change
  useEffect(() => {
    if (dashboardData && setDashboardData) {
      // Calculate new values based on orders
      const pendingCount = orders.filter(order => order.order_status === 'Pending').length;
      const processingCount = orders.filter(order => order.order_status === 'Processing').length;
      const shippedCount = orders.filter(order => order.order_status === 'Shipped').length;
      const deliveredCount = orders.filter(order => order.order_status === 'Delivered').length;
      
      // Update dashboard data
      setDashboardData(prev => ({
        ...prev,
        totalOrders: orders.length,
        pendingShipments: pendingCount + processingCount,
        orderDistribution: {
          labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
          datasets: [{
            data: [pendingCount, processingCount, shippedCount, deliveredCount],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50']
          }]
        }
      }));
    }
  }, [orders, dashboardData, setDashboardData]);

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    // Find supplier name from ID if not stored directly (assuming suppliers state has {id, name})
    // Also handle cases where order might still have 'supplier' instead of 'supplierId'
    const supplier = suppliers.find(s => s.id === order.supplierId);
    setFormData({
      ...order,
      supplierId: order.supplierId || '', // Use existing supplierId or default
      supplierName: supplier ? supplier.name : order.supplierName || order.supplier || '', // Use found name, existing name, or legacy name
      items: [...order.items] // Create a deep copy of items array
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setCurrentItem({ name: '', quantity: 0, price: 0 });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special handling for supplier selection to update both ID and Name
    if (name === 'supplierId') {
      const selectedSupplier = suppliers.find(s => s.id === value);
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

  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value)
    }));
  };

  const addItem = () => {
    if (currentItem.name && currentItem.quantity > 0 && currentItem.price > 0) {
      const newItems = [...formData.items, { ...currentItem }];
      const newTotalAmount = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      setFormData(prev => ({
        ...prev,
        items: newItems,
        totalAmount: newTotalAmount
      }));
      
      setCurrentItem({ name: '', quantity: 0, price: 0 });
    }
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const newTotalAmount = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      totalAmount: newTotalAmount
    }));
  };

  // This useEffect is redundant and can be removed as we already have a similar one above

  const handleSubmit = async () => {
    try {
      if (formData.supplierId && formData.items.length > 0) {
        const orderData = {
          order_no: formData.orderNumber,
          company_id: dashboardData.company.id,
          order_supplier: formData.supplierId,
          order_date: formData.orderDate,
          order_total_amount: formData.totalAmount,
          order_status: formData.status
        };

        // Update existing order
        const { error: orderError } = await supabase
          .from('company_orders')
          .update(orderData)
          .eq('order_id', selectedOrder.order_id);

        if (orderError) throw orderError;

        // Delete existing items
        const { error: deleteError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', selectedOrder.order_id);

        if (deleteError) throw deleteError;

        // Insert new items
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            formData.items.map(item => ({
              order_id: selectedOrder.order_id,
              item_name: item.name,
              quantity: item.quantity,
              price: item.price
            }))
          );

        if (itemsError) throw itemsError;

        setSnackbarMessage('Order updated successfully');
        setSnackbarSeverity('success');
        handleCloseDialog();

        // Refresh orders
        const { data: updatedOrders, error: fetchError } = await supabase
          .from('company_orders')
          .select('*')
          .order('order_date', { ascending: false });

        if (fetchError) throw fetchError;

        const ordersWithItems = await Promise.all(
          updatedOrders.map(async (order) => {
            const { data: itemsData, error: itemsError } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.order_id);

            if (itemsError) throw itemsError;

            return {
              ...order,
              items: itemsData || []
            };
          })
        );

        setOrders(ordersWithItems);
      } else {
        setSnackbarMessage('Please fill all required fields');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      setSnackbarMessage('Error saving order');
      setSnackbarSeverity('error');
    }
    setOpenSnackbar(true);
  };

  const handleDelete = async (orderId) => {
    try {
      const { error: deleteError } = await supabase
        .from('company_orders')
        .delete()
        .eq('order_id', orderId);

      if (deleteError) throw deleteError;

      setOrders(prev => prev.filter(order => order.order_id !== orderId));
      setSnackbarMessage('Order deleted successfully');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Error deleting order:', error);
      setSnackbarMessage('Error deleting order');
      setSnackbarSeverity('error');
    }
    setOpenSnackbar(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Processing':
        return 'info';
      case 'Shipped':
        return 'primary';
      case 'Delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // If in add order view, render the AddOrder component
  if (orderView === 'add') {
    return <AddOrder setOrderView={setOrderView} dashboardData={dashboardData} />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => setCompanyView('dashboard')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Manage Orders
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ ml: 'auto' }}
          onClick={() => setOrderView('add')}
        >
          New Order
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.order_id}>
                <TableCell>{order.order_no}</TableCell>
                <TableCell>{order.supplierName || order.order_supplier}</TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={order.order_status} 
                    color={getStatusColor(order.order_status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="right">${(order.order_total || 0).toLocaleString()}</TableCell>
                <TableCell align="center">
                  <IconButton 
                    color="primary" 
                    size="small"
                    onClick={() => handleOpenDialog(order)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    size="small"
                    onClick={() => handleDelete(order.order_id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {/* Order Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Order
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="orderNumber"
                label="Order Number"
                value={formData.orderNumber}
                onChange={handleInputChange}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="orderDate"
                label="Order Date"
                type="date"
                value={formData.orderDate}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Supplier</InputLabel>
                <Select
                  name="supplierId" // Changed name to supplierId
                  value={formData.supplierId} // Changed value to supplierId
                  onChange={handleInputChange}
                  label="Supplier"
                >
                  {suppliers.length > 0 ? (
                    suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}> {/* Value is now supplier.id */}
                        {supplier.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      No suppliers available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Processing">Processing</MenuItem>
                  <MenuItem value="Shipped">Shipped</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Order Items
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.price}</TableCell>
                        <TableCell align="right">${(item.quantity * item.price).toLocaleString()}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => removeItem(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <strong>Total:</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>${formData.totalAmount.toLocaleString()}</strong>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
                <TextField
                  name="name"
                  label="Item Name"
                  value={currentItem.name}
                  onChange={handleItemInputChange}
                  sx={{ flexGrow: 1 }}
                />
                <TextField
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={currentItem.quantity}
                  onChange={handleItemInputChange}
                  sx={{ width: 120 }}
                  InputProps={{ inputProps: { min: 1 } }}
                />
                <TextField
                  name="price"
                  label="Price"
                  type="number"
                  value={currentItem.price}
                  onChange={handleItemInputChange}
                  sx={{ width: 120 }}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={addItem}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageOrders;