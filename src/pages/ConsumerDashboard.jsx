import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material'
import {
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
  BarChart as AnalyticsIcon,
  Store as StoreIcon,
  History as HistoryIcon
} from '@mui/icons-material'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js'
import { Pie, Line } from 'react-chartjs-2'
import OrderHistory from '../components/consumer/OrderHistory'
import ActiveOrders from '../components/consumer/ActiveOrders'
import SpendingAnalysis from '../components/consumer/SpendingAnalysis'
import BrowseProducts from '../components/consumer/BrowseProducts'
import Checkout from '../components/consumer/Checkout'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title)

function ConsumerDashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { formatPriceSync } = useCurrency()
  
  // Redirect to login if no user is found
  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])
  
  // Data for dashboard with real order data
  const [dashboardData, setDashboardData] = useState({
    orderHistory: 8,
    activeOrders: 3,
    totalSpent: 2500,
    orderStatus: {
      labels: ['Processing', 'Shipped', 'Delivered'],
      datasets: [{
        data: [2, 1, 5], // Updated to match actual order counts from ActiveOrders and OrderHistory
        backgroundColor: ['#FF6384', '#36A2EB', '#4CAF50'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#4CAF50']
      }]
    },
    spendingHistory: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Spending',
        data: [300, 450, 380, 500, 420, 450],
        borderColor: '#9C27B0',
        backgroundColor: 'rgba(135, 3, 158, 0.1)',
        tension: 0.4
      }]
    }
  })

  // Fetch dashboard data and synchronize order status counts
  useEffect(() => {
    // In a real application, you would fetch data from an API here
    console.log('Fetching consumer dashboard data')
    
    // Get order data from ActiveOrders and OrderHistory components
    const activeOrders = [
      {
        id: 101,
        orderNumber: '17020000001234',
        date: '2023-10-25',
        status: 'Processing'
      },
      {
        id: 102,
        orderNumber: '17025000002345',
        date: '2023-10-28',
        status: 'Shipped'
      },
      {
        id: 103,
        orderNumber: '17030000003456',
        date: '2023-10-30',
        status: 'Processing'
      }
    ];
    
    const orderHistory = [
      {
        id: 1,
        orderNumber: '16990000001234',
        date: '2023-06-15',
        status: 'Delivered'
      },
      {
        id: 2,
        orderNumber: '16995000002345',
        date: '2023-07-20',
        status: 'Delivered'
      },
      {
        id: 3,
        orderNumber: '17000000003456',
        date: '2023-08-05',
        status: 'Delivered'
      },
      {
        id: 4,
        orderNumber: '17005000004567',
        date: '2023-09-10',
        status: 'Delivered'
      },
      {
        id: 5,
        orderNumber: '17010000005678',
        date: '2023-10-15',
        status: 'Delivered'
      }
    ];
    
    // Count orders by status
    const processingCount = activeOrders.filter(order => order.status === 'Processing').length;
    const shippedCount = activeOrders.filter(order => order.status === 'Shipped').length;
    const deliveredCount = orderHistory.filter(order => order.status === 'Delivered').length;
    
    // Update dashboard data with real counts
    setDashboardData(prevData => ({
      ...prevData,
      orderStatus: {
        ...prevData.orderStatus,
        datasets: [{
          ...prevData.orderStatus.datasets[0],
          data: [processingCount, shippedCount, deliveredCount]
        }]
      }
    }));
  }, [])

  // Consumer Dashboard
  const [consumerView, setConsumerView] = useState('dashboard')

  if (consumerView === 'orderHistory') {
    return <OrderHistory dashboardData={dashboardData} setDashboardData={setDashboardData} setConsumerView={setConsumerView} />
  }
  
  if (consumerView === 'activeOrders') {
    return <ActiveOrders dashboardData={dashboardData} setDashboardData={setDashboardData} setConsumerView={setConsumerView} />
  }
  
  if (consumerView === 'spendingAnalysis') {
    return <SpendingAnalysis dashboardData={dashboardData} setDashboardData={setDashboardData} setConsumerView={setConsumerView} />
  }
  
  if (consumerView === 'browseProducts') {
    return <BrowseProducts dashboardData={dashboardData} setDashboardData={setDashboardData} setConsumerView={setConsumerView} />
  }
  
  if (consumerView === 'checkout') {
    return <Checkout setConsumerView={setConsumerView} />
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Consumer Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <List>
              <ListItem button onClick={() => setConsumerView('browseProducts')}>
                <ListItemIcon>
                  <StoreIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Browse Products" />
              </ListItem>
              <ListItem button onClick={() => setConsumerView('activeOrders')}>
                <ListItemIcon>
                  <ShippingIcon color="secondary" />
                </ListItemIcon>
                <ListItemText primary="Active Orders" />
              </ListItem>
              <ListItem button onClick={() => setConsumerView('orderHistory')}>
                <ListItemIcon>
                  <HistoryIcon color="action" />
                </ListItemIcon>
                <ListItemText primary="Order History" />
              </ListItem>
              <ListItem button onClick={() => setConsumerView('spendingAnalysis')}>
                <ListItemIcon>
                  <AnalyticsIcon color="info" />
                </ListItemIcon>
                <ListItemText primary="Spending Analysis" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          {/* Summary Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => setConsumerView('activeOrders')}>
                <CardContent>
                  <ShippingIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h5" component="div">
                    {dashboardData.activeOrders}
                  </Typography>
                  <Typography color="text.secondary">
                    Active Orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => setConsumerView('orderHistory')}>
                <CardContent>
                  <HistoryIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="h5" component="div">
                    {dashboardData.orderHistory}
                  </Typography>
                  <Typography color="text.secondary">
                    Order History
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => setConsumerView('spendingAnalysis')}>
                <CardContent>
                  <AnalyticsIcon color="info" sx={{ fontSize: 40 }} />
                  <Typography variant="h5" component="div">
                    {formatPriceSync(dashboardData.totalSpent)}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Spent
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Call to Action */}
          <Paper sx={{ p: 3, mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Ready to shop?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph align="center">
              Browse our latest products and place your order today.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              startIcon={<StoreIcon />}
              onClick={() => setConsumerView('browseProducts')}
              sx={{ mt: 2 }}
            >
              Browse Products
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Order Status" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Pie data={dashboardData.orderStatus} options={{ maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Spending History" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Line data={dashboardData.spendingHistory} options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `₹${value}`
                      }
                    }
                  }
                }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<CartIcon />} 
          onClick={() => setConsumerView('browseProducts')}
        >
          Shop Now
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<ShippingIcon />} 
          onClick={() => setConsumerView('activeOrders')}
        >
          Track Orders
        </Button>
      </Box>
    </Container>
  )
}

export default ConsumerDashboard