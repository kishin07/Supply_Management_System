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
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const ManageOrders = ({ dashboardData, setDashboardData, setCompanyView }) => {
  // Load suppliers data from localStorage
  const [suppliers, setSuppliers] = useState(() => {
    const savedSuppliers = localStorage.getItem('suppliers');
    return savedSuppliers ? JSON.parse(savedSuppliers) : [];
  });
  
  // Load orders data from localStorage or use mock data
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [
    {
      id: 1,
      orderNumber: 'ORD-2023-001',
      supplier: 'Supplier A',
      items: [
        { name: 'Raw Material A', quantity: 50, price: 20 },
        { name: 'Component C', quantity: 25, price: 40 }
      ],
      orderDate: '2023-07-15',
      status: 'Pending',
      totalAmount: 2500
    },
    {
      id: 2,
      orderNumber: 'ORD-2023-002',
      supplier: 'Supplier B',
      items: [
        { name: 'Product B', quantity: 30, price: 60 }
      ],
      orderDate: '2023-07-16',
      status: 'Processing',
      totalAmount: 1800
    },
    {
      id: 3,
      orderNumber: 'ORD-2023-003',
      supplier: 'Supplier C',
      items: [
        { name: 'Raw Material A', quantity: 100, price: 20 },
        { name: 'Product B', quantity: 20, price: 60 }
      ],
      orderDate: '2023-07-17',
      status: 'Shipped',
      totalAmount: 3200
    },
    {
      id: 4,
      orderNumber: 'ORD-2023-004',
      supplier: 'Supplier D',
      items: [
        { name: 'Component X', quantity: 40, price: 30 }
      ],
      orderDate: '2023-07-18',
      status: 'Delivered',
      totalAmount: 1200
    }
  ];
  });


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
      const pendingCount = orders.filter(order => order.status === 'Pending').length;
      const processingCount = orders.filter(order => order.status === 'Processing').length;
      const shippedCount = orders.filter(order => order.status === 'Shipped').length;
      const deliveredCount = orders.filter(order => order.status === 'Delivered').length;
      
      // Update dashboard data
      setDashboardData(prev => ({
        ...prev,
        company: {
          ...prev.company,
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
        }
      }));
    }
  }, [orders, dashboardData, setDashboardData]);

  const handleOpenDialog = (order = null) => {
    if (order) {
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
    } else {
      setSelectedOrder(null);
      setFormData({
        orderNumber: `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
        supplierId: '', // Changed from supplier
        supplierName: '', // Added
        items: [],
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        totalAmount: 0
      });
    }
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

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const handleSubmit = () => {
    // Validate using supplierId instead of supplier
    if (formData.supplierId && formData.items.length > 0) {
      if (selectedOrder) {
        // Update existing order, ensuring supplierId and supplierName are included
        setOrders(prev =>
          prev.map(order =>
            order.id === selectedOrder.id ? { ...formData, id: order.id } : order
          )
        );
        setSnackbarMessage('Order updated successfully');
      } else {
        // Add new order, formData already contains supplierId and supplierName
        const newOrder = {
          id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
          ...formData 
        };
        setOrders(prev => [...prev, newOrder]);
        setSnackbarMessage('Order added successfully');
      }
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      handleCloseDialog();
    } else {
      setSnackbarMessage('Please fill all required fields');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleDelete = (id) => {
    setOrders(prev => prev.filter(order => order.id !== id));
    setSnackbarMessage('Order deleted successfully');
    setSnackbarSeverity('success');
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
          onClick={() => handleOpenDialog()}
        >
          New Order
        </Button>
      </Box>

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
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.supplierName || order.supplier}</TableCell> {/* Display supplierName, fallback to supplier for older data */}
                <TableCell>{order.orderDate}</TableCell>
                <TableCell>
                  <Chip 
                    label={order.status} 
                    color={getStatusColor(order.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="right">${order.totalAmount.toLocaleString()}</TableCell>
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
                    onClick={() => handleDelete(order.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedOrder ? 'Edit Order' : 'New Order'}
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