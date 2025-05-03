import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Grid
} from '@mui/material';
import {
  Visibility as ViewIcon,
  LocalShipping as TrackIcon
} from '@mui/icons-material';

const ActiveOrders = ({ dashboardData, setDashboardData }) => {
  // Mock active orders data
  const activeOrders = [
    {
      id: 101,
      orderNumber: '17020000001234',
      date: '2023-10-25',
      items: [
        { name: 'Wireless Earbuds', quantity: 1, price: 89 },
        { name: 'Phone Case', quantity: 1, price: 25 }
      ],
      status: 'Processing',
      total: 114,
      estimatedDelivery: '2023-11-02'
    },
    {
      id: 102,
      orderNumber: '17025000002345',
      date: '2023-10-28',
      items: [
        { name: 'External Hard Drive', quantity: 1, price: 120 }
      ],
      status: 'Shipped',
      total: 120,
      estimatedDelivery: '2023-11-05',
      trackingNumber: 'TRK12345678'
    },
    {
      id: 103,
      orderNumber: '17030000003456',
      date: '2023-10-30',
      items: [
        { name: 'Wireless Mouse', quantity: 1, price: 45 },
        { name: 'Mousepad', quantity: 1, price: 15 }
      ],
      status: 'Processing',
      total: 60,
      estimatedDelivery: '2023-11-07'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'warning';
      case 'Shipped':
        return 'info';
      case 'Delivered':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleTrackOrder = (trackingNumber) => {
    console.log('Tracking order with number:', trackingNumber);
    // In a real application, this would open a tracking page or modal
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Active Orders
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Est. Delivery</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>${order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{order.estimatedDelivery}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => console.log('View order details', order.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                      {order.status === 'Shipped' && (
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => handleTrackOrder(order.trackingNumber)}
                        >
                          <TrackIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Order Summary */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Status Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>Processing:</strong> {activeOrders.filter(o => o.status === 'Processing').length} orders
              </Typography>
              <Typography variant="body1">
                <strong>Shipped:</strong> {activeOrders.filter(o => o.status === 'Shipped').length} orders
              </Typography>
              <Typography variant="body1">
                <strong>Total Active Orders:</strong> {activeOrders.length} orders
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Need Help?
            </Typography>
            <Typography variant="body2" paragraph>
              If you have any questions about your orders, our customer service team is here to help.
            </Typography>
            <Button variant="contained" color="primary">
              Contact Support
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActiveOrders;