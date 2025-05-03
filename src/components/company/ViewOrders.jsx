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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import AddOrder from './AddOrder';
import supabase from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';

const ViewOrders = ({ setCompanyView }) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderView, setOrderView] = useState('list'); // 'list' or 'add'

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch orders for the current company
        const { data: ordersData, error: ordersError } = await supabase
          .from('company_orders')
          .select('*')
          .eq('company_id', currentUser.id)
          .order('order_date', { ascending: false });

        if (ordersError) throw ordersError;

        // Fetch order items for each order
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order) => {
            const { data: itemsData, error: itemsError } = await supabase
              .from('company_order_items')
              .select('*')
              .eq('order_id', order.order_id);

            if (itemsError) throw itemsError;

            // Fetch supplier details
            const { data: supplierData, error: supplierError } = await supabase
              .from('users')
              .select('name')
              .eq('id', order.order_supplier)
              .single();

            if (supplierError && supplierError.code !== 'PGRST116') {
              // PGRST116 is the error code for no rows returned
              throw supplierError;
            }

            return {
              ...order,
              items: itemsData || [],
              supplierName: supplierData?.name || 'Unknown Supplier'
            };
          })
        );

        setOrders(ordersWithItems || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, orderView]);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (orderView === 'add') {
    return <AddOrder setOrderView={setOrderView} />;
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
          Manage Orders
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOrderView('add')}
          >
            Create Order
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      ) : orders.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Items</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell>{order.order_no}</TableCell>
                  <TableCell>{order.supplierName}</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(order.order_total_amount)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.order_status} 
                      color={getStatusColor(order.order_status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{order.items.length} items</TableCell>
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
            No orders present. Click on the Create Order button to add an order.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ViewOrders;