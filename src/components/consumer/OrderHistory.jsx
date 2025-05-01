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
  IconButton
} from '@mui/material';
import {
  Visibility as ViewIcon
} from '@mui/icons-material';

const OrderHistory = ({ dashboardData, setDashboardData }) => {
  // Mock order history data
  const orders = [
    {
      id: 1,
      orderNumber: 'ORD-2023-001',
      date: '2023-06-15',
      items: [
        { name: 'Laptop', quantity: 1, price: 1200 },
        { name: 'Mouse', quantity: 1, price: 50 }
      ],
      status: 'Delivered',
      total: 1250
    },
    {
      id: 2,
      orderNumber: 'ORD-2023-002',
      date: '2023-07-20',
      items: [
        { name: 'Office Chair', quantity: 2, price: 300 },
        { name: 'Desk Lamp', quantity: 1, price: 45 }
      ],
      status: 'Delivered',
      total: 645
    },
    {
      id: 3,
      orderNumber: 'ORD-2023-003',
      date: '2023-08-05',
      items: [
        { name: 'Printer', quantity: 1, price: 350 }
      ],
      status: 'Delivered',
      total: 350
    },
    {
      id: 4,
      orderNumber: 'ORD-2023-004',
      date: '2023-09-10',
      items: [
        { name: 'Headphones', quantity: 1, price: 120 },
        { name: 'Keyboard', quantity: 1, price: 85 }
      ],
      status: 'Delivered',
      total: 205
    },
    {
      id: 5,
      orderNumber: 'ORD-2023-005',
      date: '2023-10-15',
      items: [
        { name: 'Monitor', quantity: 1, price: 250 }
      ],
      status: 'Delivered',
      total: 250
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

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Order History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
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
                  <TableCell>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => console.log('View order details', order.id)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default OrderHistory;