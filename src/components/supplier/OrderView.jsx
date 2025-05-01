import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
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
  DialogActions
} from '@mui/material';
import {
  Visibility as ViewIcon,
  LocalShipping as ShipIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const OrderView = ({ setSelectedView }) => {
  const { currentUser } = useAuth(); // Get current user from AuthContext
  // Load all orders from localStorage initially
  const [allOrders, setAllOrders] = useState(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  // State to hold orders filtered for the current supplier
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Effect to filter orders when component mounts or currentUser/allOrders change
  useEffect(() => {
    if (currentUser && currentUser.role === 'supplier') {
      // Filter orders for this supplier - strictly match by supplierId
      const supplierOrders = allOrders.filter(order => {
        // Only show orders specifically assigned to this supplier by ID
        return order.supplierId === currentUser.id;
      });
      setFilteredOrders(supplierOrders);
      
      // Update the UI to show pending orders count
      const pendingCount = supplierOrders.filter(order => 
        order.status === 'Pending' || order.status === 'Processing'
      ).length;
      
      console.log(`Found ${supplierOrders.length} orders for supplier ID: ${currentUser.id}, ${pendingCount} pending`);
    } else {
      // Handle case where user is not a supplier or not logged in
      setFilteredOrders([]); 
    }
  }, [currentUser, allOrders]);

  // Mock data (kept for reference, but filtering logic uses localStorage data)
  const [mockOrders, setMockOrders] = useState([ // Renamed from 'orders' to avoid conflict
    {
      id: 1,
      orderNumber: 'ORD-2023-001',
      customerName: 'Tech Corp',
      items: [
        { name: 'Raw Material A', quantity: 50 },
        { name: 'Component C', quantity: 25 }
      ],
      orderDate: '2023-07-15',
      status: 'Pending',
      totalAmount: 2500
    },
    {
      id: 2,
      orderNumber: 'ORD-2023-002',
      customerName: 'Innovation Ltd',
      items: [
        { name: 'Product B', quantity: 30 }
      ],
      orderDate: '2023-07-16',
      status: 'Processing',
      totalAmount: 1800
    },
    {
      id: 3,
      orderNumber: 'ORD-2023-003',
      customerName: 'Global Systems',
      items: [
        { name: 'Raw Material A', quantity: 100 },
        { name: 'Product B', quantity: 20 }
      ],
      orderDate: '2023-07-17',
      status: 'Ready to Ship',
      totalAmount: 3500
    }
  ]);

  // Effect to update localStorage when the main orders list changes (e.g., status update)
  // Note: This assumes status updates modify the 'allOrders' state, which might need adjustment
  // depending on how status updates are handled globally.
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(allOrders));
  }, [allOrders]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };
``
  const handleShipOrder = (orderId) => {
    // Update the status in the main list (allOrders)
    setAllOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: 'Shipped' }
          : order
      )
    );
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
        <IconButton 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => setSelectedView('dashboard')}
        >
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
            {/* Map over filteredOrders instead of the mock data */}
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderName || order.orderNumber}</TableCell>
                <TableCell>{order.customerName || 'N/A'}</TableCell>
                <TableCell>{order.orderDate}</TableCell>
                <TableCell>${order.totalAmount?.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewDetails(order)}
                  >
                    <ViewIcon />
                  </IconButton>
                  {(order.status === 'Ready to Ship' || order.status === 'Processing') && (
                    <IconButton
                      color="success"
                      onClick={() => handleShipOrder(order.id)}
                    >
                      <ShipIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              Order Details - {selectedOrder.orderName}
            </DialogTitle>
            <DialogContent>
              <DialogContentText component="div">
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    Category: {selectedOrder.category}
                  </Typography>
                  <Typography variant="subtitle1">
                    Customer: {selectedOrder.customerName}
                  </Typography>
                  <Typography variant="subtitle1">
                    Order Date: {selectedOrder.orderDate}
                  </Typography>
                  <Typography variant="subtitle1">
                    Quantity: {selectedOrder.quantity}
                  </Typography>
                  <Typography variant="subtitle1">
                    Status: <Chip
                      label={selectedOrder.status}
                      color={getStatusColor(selectedOrder.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="subtitle1">
                    Company Expected Date: {selectedOrder.companyExpectedDate || 'Not specified'}
                  </Typography>
                  <Typography variant="subtitle1">
                    Supplier Committed Date: {selectedOrder.supplierCommittedDate || 'Not specified'}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">
                    Total Amount: ${selectedOrder.totalAmount?.toLocaleString()}
                  </Typography>
                </Box>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              {selectedOrder.status === 'Ready to Ship' && (
                <Button
                  onClick={() => {
                    handleShipOrder(selectedOrder.id);
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