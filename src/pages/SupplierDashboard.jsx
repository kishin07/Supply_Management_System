import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  LocalShipping as ShippingIcon,
  BarChart as AnalyticsIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js'
import { Pie, Line } from 'react-chartjs-2'
import InventoryManagement from '../components/supplier/InventoryManagement'
import OrderView from '../components/supplier/OrderView'
import SupplierBiddingSystem from '../components/supplier/BiddingSystem'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title)

function SupplierDashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  // Redirect to login if no user is found
  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])
  
  // Mock data for dashboard
  const [dashboardData, setDashboardData] = useState({
    inventoryCount: 120,
    pendingOrders: 15,
    shippedOrders: 8,
    totalRevenue: 45000,
    inventoryDistribution: {
      labels: ['Raw Materials', 'Work in Progress', 'Finished Goods'],
      datasets: [{
        data: [35, 25, 60],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]
    },
    monthlyRevenue: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [5000, 7500, 8000, 9500, 7000, 8000],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4
      }]
    }
  })

  // Fetch dashboard data
  useEffect(() => {
    // In a real application, you would fetch data from an API here
    console.log('Fetching supplier dashboard data')
  }, [])

  // Supplier Dashboard
  const [selectedView, setSelectedView] = useState('dashboard')

  if (selectedView === 'inventory') {
    return <InventoryManagement setSelectedView={setSelectedView} />
  }
  
  if (selectedView === 'orders') {
    return <OrderView setSelectedView={setSelectedView} />
  }
  
  if (selectedView === 'bidding') {
    return <SupplierBiddingSystem setSelectedView={setSelectedView} />
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Supplier Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <List>
              <ListItem button onClick={() => setSelectedView('inventory')}>
                <ListItemIcon>
                  <InventoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Manage Inventory" />
              </ListItem>
              <ListItem button onClick={() => setSelectedView('orders')}>
                <ListItemIcon>
                  <OrdersIcon color="secondary" />
                </ListItemIcon>
                <ListItemText primary="View Orders" />
              </ListItem>
              <ListItem button onClick={() => setSelectedView('bidding')}>
                <ListItemIcon>
                  <AnalyticsIcon color="info" />
                </ListItemIcon>
                <ListItemText primary="Bidding System" />
              </ListItem>

            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          {/* Summary Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h5" component="div">
                    {dashboardData.inventoryCount}
                  </Typography>
                  <Typography color="text.secondary">
                    Inventory Items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <OrdersIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="h5" component="div">
                    {dashboardData.pendingOrders}
                  </Typography>
                  <Typography color="text.secondary">
                    Pending Orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <ShippingIcon color="success" sx={{ fontSize: 40 }} />
                  <Typography variant="h5" component="div">
                    {dashboardData.shippedOrders}
                  </Typography>
                  <Typography color="text.secondary">
                    Shipped Orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <AnalyticsIcon color="info" sx={{ fontSize: 40 }} />
                  <Typography variant="h5" component="div">
                    ${dashboardData.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Revenue
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
      {/* Charts section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Inventory Distribution" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Pie data={dashboardData.inventoryDistribution} options={{ maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Monthly Revenue" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Line data={dashboardData.monthlyRevenue} options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value}`
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
        <Button variant="contained" startIcon={<InventoryIcon />} onClick={() => setSelectedView('inventory')}>
          Manage Inventory
        </Button>
        <Button variant="contained" color="secondary" startIcon={<OrdersIcon />} onClick={() => setSelectedView('orders')}>
          View Orders
        </Button>
      </Box>
    </Container>
  )
}

export default SupplierDashboard