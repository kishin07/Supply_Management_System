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
  Alert
} from '@mui/material';
import {
  Visibility as ViewIcon,
  LocalShipping as ShipIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const OrderView = ({ setSelectedView }) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_supplier', currentUser.id);

        if (error) throw error;
        setOrders(data || []);
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
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);

        if (error) throw error;

        const ordersWithItems = orders.map(order => {
          const items = data
            .filter(item => item.order_id === order.order_id)
            .map(item => ({
              name: item.item_name,
              quantity: item.quantity,
              price: item.price
            }));
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
        .from('orders')
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
                  <TableCell>{order.company_id || 'N/A'}</TableCell>
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
                    Customer: {selectedOrder.company_id || 'N/A'}
                  </Typography>
                  <Typography variant="subtitle1">
                    Order Date: {selectedOrder.order_date}
                  </Typography>
                  <Typography variant="subtitle1">
                    Status: <Chip label={selectedOrder.order_status} color={getStatusColor(selectedOrder.order_status)} size="small" sx={{ ml: 1 }} />
                  </Typography>
                </Box>

                <Typography variant="h6" sx={{ mt: 2 }}>
                  Items:
                </Typography>
                {selectedOrder.items?.map((item, idx) => (
                  <Typography key={idx} variant="body2">
                    {item.name} — Qty: {item.quantity}, Price: ${item.price}
                  </Typography>
                ))}

                <Box sx={{ mt: 2 }}>
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
    </Container>
  );
};

export default OrderView;
