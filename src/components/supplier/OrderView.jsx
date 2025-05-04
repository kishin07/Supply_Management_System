import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../supabase';
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
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Visibility as ViewIcon,
  LocalShipping as ShipIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const OrderView = ({ setSelectedView }) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch orders for the current supplier
        const { data, error } = await supabase
          .from('company_orders')
          .select('*')
          .eq('order_supplier', currentUser.id);

        if (error) throw error;
        
        // Fetch company names from users table for each order
        if (data && data.length > 0) {
          const companyIds = data.map(order => order.company_id);
          
          // Get company names from users table
          const { data: companiesData, error: companiesError } = await supabase
            .from('users')
            .select('id, name')
            .in('id', companyIds);

          if (companiesError) throw companiesError;
          
          // Add company names to orders
          const ordersWithCompanyNames = data.map(order => {
            const company = companiesData.find(company => company.id === order.company_id);
            return {
              ...order,
              companyName: company?.name || 'Unknown Company'
            };
          });
          
          setOrders(ordersWithCompanyNames || []);
        } else {
          setOrders([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  useEffect(() => {
    const fetchOrderItems = async () => {
      if (orders.length === 0) return;

      try {
        const orderIds = orders.map(order => order.order_id);
        const { data, error } = await supabase
          .from('company_order_items')
          .select('*')
          .in('order_id', orderIds);

        if (error) throw error;

        const ordersWithItems = orders.map(order => {
          const items = data
            .filter(item => item.order_id === order.order_id)
            .map(item => ({
              name: item.item_name,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.quantity * item.price
            }));
          // Preserve the companyName property when adding items
          return { ...order, items };
        });

        setOrders(ordersWithItems);
      } catch (err) {
        console.error('Error fetching order items:', err);
      }
    };

    fetchOrderItems();
  }, [orders.length]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('company_orders')
        .update({ order_status: newStatus })
        .eq('order_id', orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(order =>
          order.order_id === orderId
            ? { ...order, order_status: newStatus }
            : order
        )
      );
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      return false;
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
    
    // If items aren't loaded yet, fetch them specifically for this order
    if (!order.items || order.items.length === 0) {
      const fetchOrderItemsForSelected = async () => {
        try {
          const { data, error } = await supabase
            .from('company_order_items')
            .select('*')
            .eq('order_id', order.order_id);

          if (error) throw error;

          const items = data.map(item => ({
            name: item.item_name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price
          }));

          setSelectedOrder(prev => ({ ...prev, items }));
        } catch (err) {
          console.error('Error fetching order items for selected order:', err);
        }
      };

      fetchOrderItemsForSelected();
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleShipOrder = async (orderId) => {
    const success = await updateOrderStatus(orderId, 'Shipped');
    if (!success) {
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleEditStatus = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.order_status);
    setOpenStatusDialog(true);
  };

  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  const handleStatusDialogClose = () => {
    setOpenStatusDialog(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async () => {
    if (selectedOrder && newStatus) {
      const success = await updateOrderStatus(selectedOrder.order_id, newStatus);
      if (success) {
        handleStatusDialogClose();
      } else {
        alert('Failed to update order status. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Processing':
        return 'info';
      case 'Ready to Ship':
        return 'primary';
      case 'Shipped':
        return 'success';
      case 'Delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton color="primary" sx={{ mr: 2 }} onClick={() => setSelectedView('dashboard')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Order Management
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Alert severity="error">{error}</Alert>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No orders found for your account.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell>{order.order_no}</TableCell>
                  <TableCell>{order.companyName || 'N/A'}</TableCell>
                  <TableCell>{order.order_date}</TableCell>
                  <TableCell>${order.order_total_amount?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.order_status}
                      color={getStatusColor(order.order_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleViewDetails(order)}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton color="info" onClick={() => handleEditStatus(order)}>
                      <EditIcon />
                    </IconButton>
                    {(order.order_status === 'Ready to Ship' || order.order_status === 'Processing') && (
                      <IconButton color="success" onClick={() => handleShipOrder(order.order_id)}>
                        <ShipIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle>Order Details - {selectedOrder.order_no}</DialogTitle>
            <DialogContent>
              <DialogContentText component="div">
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    Customer: {selectedOrder.companyName || 'N/A'}
                  </Typography>
                  <Typography variant="subtitle1">
                    Order Date: {new Date(selectedOrder.order_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="subtitle1">
                    Status: <Chip label={selectedOrder.order_status} color={getStatusColor(selectedOrder.order_status)} size="small" sx={{ ml: 1 }} />
                  </Typography>
                </Box>

                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Order Items:
                </Typography>
                
                {!selectedOrder.items ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress size={30} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Loading order items...
                    </Typography>
                  </Box>
                ) : selectedOrder.items.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item Name</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">${parseFloat(item.price).toFixed(2)}</TableCell>
                            <TableCell align="right">${parseFloat(item.subtotal).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No items found for this order.
                  </Typography>
                )}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="h6">
                    Total Amount: ${selectedOrder.order_total_amount?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              {selectedOrder.order_status === 'Ready to Ship' && (
                <Button
                  onClick={async () => {
                    await handleShipOrder(selectedOrder.order_id);
                    handleCloseDialog();
                  }}
                  variant="contained"
                  color="success"
                  startIcon={<ShipIcon />}
                >
                  Ship Order
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Status Edit Dialog */}
      <Dialog open={openStatusDialog} onClose={handleStatusDialogClose}>
        {selectedOrder && (
          <>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                Update the status for order {selectedOrder.order_no}
              </DialogContentText>
              <Box sx={{ minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    value={newStatus}
                    label="Status"
                    onChange={handleStatusChange}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Processing">Processing</MenuItem>
                    <MenuItem value="Ready to Ship">Ready to Ship</MenuItem>
                    <MenuItem value="Shipped">Shipped</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleStatusDialogClose}>Cancel</Button>
              <Button onClick={handleStatusUpdate} variant="contained" color="primary">
                Update Status
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default OrderView;
