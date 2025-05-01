import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const OrderRawMaterials = ({ dashboardData, setDashboardData, setCompanyView }) => {
  const { currentUser } = useAuth();
  
  // Load suppliers data from localStorage
  const [suppliers, setSuppliers] = useState(() => {
    const savedSuppliers = localStorage.getItem('suppliers');
    const parsedSuppliers = savedSuppliers ? JSON.parse(savedSuppliers) : [];
    console.log('Loaded suppliers:', parsedSuppliers);
    return parsedSuppliers;
  });
  
  // Effect to ensure suppliers are loaded
  useEffect(() => {
    // If no suppliers are loaded, check if we need to create default suppliers
    if (suppliers.length === 0) {
      console.log('No suppliers found, creating default suppliers');
      const defaultSuppliers = [
        {
          id: 1,
          name: 'Supplier A',
          contactPerson: 'John Smith',
          email: 'john@suppliera.com',
          phone: '(555) 123-4567',
          category: 'Fruit Pulp',
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
          category: 'Fruit Extract',
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
          category: 'Fruit Concentrate',
          rating: 4.2,
          onTimeDelivery: 92,
          status: 'Active'
        },
        {
          id: 4,
          name: 'Supplier D',
          contactPerson: 'Emily Davis',
          email: 'emily@supplierd.com',
          phone: '(555) 567-8901',
          category: 'Fruit Juice',
          rating: 4.3,
          onTimeDelivery: 90,
          status: 'Active'
        },
        {
          id: 5,
          name: 'Supplier E',
          contactPerson: 'David Wilson',
          email: 'david@suppliere.com',
          phone: '(555) 678-9012',
          category: 'Fruit Powder',
          rating: 4.1,
          onTimeDelivery: 87,
          status: 'Active'
        }
      ];
      
      setSuppliers(defaultSuppliers);
      localStorage.setItem('suppliers', JSON.stringify(defaultSuppliers));
    }
  }, [suppliers.length]);
  
  // Load orders data from localStorage or use mock data
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [
      {
        id: 1,
        orderName: 'Apple Pulp Order',
        category: 'Fruit Pulp',
        orderDate: '2023-07-15',
        quantity: 500,
        totalAmount: 2500,
        companyExpectedDate: '2023-07-30',
        supplierCommittedDate: '2023-07-28',
        status: 'Pending',
        supplierId: 1,
        supplierName: 'Supplier A',
        customerName: 'Tech Corp',
        companyId: currentUser?.id || 'company-123'
      },
      {
        id: 2,
        orderName: 'Mango Extract Order',
        category: 'Fruit Extract',
        orderDate: '2023-07-16',
        quantity: 300,
        totalAmount: 1800,
        companyExpectedDate: '2023-07-31',
        supplierCommittedDate: '2023-08-02',
        status: 'Processing',
        supplierId: 2,
        supplierName: 'Supplier B',
        customerName: 'Tech Corp',
        companyId: currentUser?.id || 'company-123'
      },
      {
        id: 3,
        orderName: 'Strawberry Concentrate',
        category: 'Fruit Concentrate',
        orderDate: '2023-07-17',
        quantity: 400,
        totalAmount: 3200,
        companyExpectedDate: '2023-08-05',
        supplierCommittedDate: '2023-08-03',
        status: 'Shipped',
        supplierId: 3,
        supplierName: 'Supplier C',
        customerName: 'Tech Corp',
        companyId: currentUser?.id || 'company-123'
      },
      {
        id: 4,
        orderName: 'Citrus Peel Order',
        category: 'Fruit Peel',
        orderDate: '2023-07-18',
        quantity: 200,
        totalAmount: 1200,
        companyExpectedDate: '2023-07-25',
        supplierCommittedDate: '2023-07-25',
        status: 'Delivered',
        supplierId: 4,
        supplierName: 'Supplier D',
        customerName: 'Tech Corp',
        companyId: currentUser?.id || 'company-123'
      }
    ];
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    orderName: '',
    category: '',
    orderDate: '',
    quantity: 0,
    totalAmount: 0,
    companyExpectedDate: '',
    supplierCommittedDate: '',
    status: 'Pending',
    supplierId: '',
    supplierName: '',
    customerName: currentUser?.name || 'Tech Corp',
    companyId: currentUser?.id || 'company-123'
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Categories for fruit raw materials
  const categories = [
    'Fruit Pulp',
    'Fruit Extract',
    'Fruit Concentrate',
    'Fruit Peel',
    'Fruit Juice',
    'Fruit Puree',
    'Fruit Powder',
    'Fruit Preservative'
  ];

  // Order statuses
  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Save orders to localStorage when they change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Update dashboard data
    if (dashboardData && setDashboardData) {
      const pendingCount = orders.filter(order => order.status === 'Pending').length;
      const processingCount = orders.filter(order => order.status === 'Processing').length;
      const shippedCount = orders.filter(order => order.status === 'Shipped').length;
      const deliveredCount = orders.filter(order => order.status === 'Delivered').length;
      
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
      setFormData({ ...order });
    } else {
      setSelectedOrder(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        orderName: '',
        category: '',
        orderDate: today,
        quantity: 0,
        totalAmount: 0,
        companyExpectedDate: '',
        supplierCommittedDate: '',
        status: 'Pending',
        supplierId: '',
        supplierName: '',
        customerName: currentUser?.name || 'Tech Corp',
        companyId: currentUser?.id || 'company-123'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for supplier selection
    if (name === 'supplierId') {
      // Convert value to appropriate type (string or number) based on how supplier IDs are stored
      const supplierId = value === '' ? '' : value;
      const selectedSupplier = suppliers.find(s => s.id == supplierId); // Use loose equality to handle type differences
      
      setFormData(prev => ({
        ...prev,
        supplierId: supplierId,
        supplierName: selectedSupplier ? selectedSupplier.name : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'quantity' || name === 'totalAmount' ? Number(value) : value
      }));
    }
  };

  const handleSaveOrder = () => {
    // Validate form data
    if (!formData.orderName || !formData.category || !formData.orderDate || formData.quantity <= 0 || formData.totalAmount <= 0 || !formData.supplierId) {
      setSnackbarMessage('Please fill all required fields with valid values');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (selectedOrder) {
      // Update existing order
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id ? { ...formData, id: selectedOrder.id } : order
      ));
      setSnackbarMessage('Order updated successfully');
    } else {
      // Add new order
      const newOrder = {
        ...formData,
        id: Date.now() // Simple way to generate unique ID
      };
      setOrders(prev => [...prev, newOrder]);
      setSnackbarMessage('New order added successfully');
    }

    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    handleCloseDialog();
  };

  const handleDeleteOrder = (id) => {
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
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => setCompanyView('dashboard')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Order Raw Materials
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Fruit Raw Material Orders</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Order
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Company Expected Date</TableCell>
                <TableCell>Supplier Committed Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderName}</TableCell>
                  <TableCell>{order.category}</TableCell>
                  <TableCell>{order.orderDate}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{order.companyExpectedDate}</TableCell>
                  <TableCell>{order.supplierCommittedDate}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenDialog(order)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteOrder(order.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Order Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedOrder ? 'Edit Order' : 'Add New Order'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Order Name"
                name="orderName"
                value={formData.orderName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Supplier</InputLabel>
                <Select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  label="Supplier"
                  displayEmpty
                >
                  <MenuItem value="" disabled>Select a supplier (A-E)</MenuItem>
                  {suppliers.length > 0 ? (
                    suppliers
                      .map((supplier) => (
                        <MenuItem key={supplier.id} value={supplier.id}>
                          {supplier.name} - {supplier.category}
                        </MenuItem>
                      ))
                  ) : (
                    <MenuItem disabled>No suppliers available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Order Date"
                name="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Amount ($)"
                name="totalAmount"
                type="number"
                value={formData.totalAmount}
                onChange={handleInputChange}
                required
              />
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
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Expected Date"
                name="companyExpectedDate"
                type="date"
                value={formData.companyExpectedDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Committed Date"
                name="supplierCommittedDate"
                type="date"
                value={formData.supplierCommittedDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveOrder} variant="contained" color="primary">
            {selectedOrder ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderRawMaterials;