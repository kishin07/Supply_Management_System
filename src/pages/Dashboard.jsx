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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material'
import {
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  LocalShipping as ShippingIcon,
  BarChart as AnalyticsIcon,
  People as SuppliersIcon,
  Store as ProductsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js'
import { Pie, Line } from 'react-chartjs-2'
import InventoryManagement from '../components/supplier/InventoryManagement'
import OrderView from '../components/supplier/OrderView'
import SupplierSelection from '../components/supplier/SupplierSelection'
import SupplierBiddingSystem from '../components/supplier/BiddingSystem'
import SalesPerformance from '../components/company/SalesPerformance'
import SalesVsPurchase from '../components/company/SalesVsPurchase'
import InventoryLevels from '../components/company/InventoryLevels'
import VendorPerformance from '../components/company/VendorPerformance'
import OrderRawMaterials from '../components/company/OrderRawMaterials'
import ManageOrders from '../components/company/ManageOrders'
import ViewSuppliers from '../components/company/ViewSuppliers'
import CompanyBiddingSystem from '../components/company/BiddingSystem'
import OrderHistory from '../components/consumer/OrderHistory'
import ActiveOrders from '../components/consumer/ActiveOrders'
import SpendingAnalysis from '../components/consumer/SpendingAnalysis'
import BrowseProducts from '../components/consumer/BrowseProducts'
import Checkout from '../components/consumer/Checkout'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title)

function Dashboard() {
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()
  
  // Mock data for dashboard
  const [dashboardData, setDashboardData] = useState({
    supplier: {
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
    },
    company: {
      totalOrders: 45,
      pendingShipments: 12,
      activeSuppliers: 8,
      inventoryValue: 78000,
      orderDistribution: {
        labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
        datasets: [{
          data: [15, 10, 12, 8],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50']
        }]
      },
      supplierPerformance: {
        labels: ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D', 'Supplier E'],
        datasets: [{
          label: 'On-time Delivery %',
          data: [95, 88, 92, 78, 85],
          borderColor: '#1976D2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4
        }]
      }
    },
    consumer: {
      orderHistory: 8,
      activeOrders: 3,
      totalSpent: 2500,
      orderStatus: {
        labels: ['Processing', 'Shipped', 'Delivered'],
        datasets: [{
          data: [2, 3, 3],
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
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          tension: 0.4
        }]
      }
    }
  })

  // Fetch dashboard data based on user role
  useEffect(() => {
    // In a real application, you would fetch data from an API here
    // For now, we're using the mock data initialized above
    console.log('Fetching dashboard data for role:', userRole)
  }, [userRole])

  // Helper function to render role-specific dashboard
  const renderDashboard = () => {
    switch(userRole) {
      case 'supplier':
        return renderSupplierDashboard()
      case 'company':
        return renderCompanyDashboard()
      case 'consumer':
        return renderConsumerDashboard()
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h5" color="error">
              Invalid user role. Please contact support.
            </Typography>
          </Box>
        )
    }
  }

  // Supplier Dashboard
  const [selectedView, setSelectedView] = useState('supplier-selection');

  const renderSupplierDashboard = () => {
    const data = dashboardData.supplier
    
    if (selectedView === 'supplier-selection') {
      return <SupplierSelection setSelectedView={setSelectedView} />;
    }
    
    if (selectedView === 'inventory') {
      return <InventoryManagement setSelectedView={setSelectedView} />;
    }
    
    if (selectedView === 'orders') {
      return <OrderView setSelectedView={setSelectedView} />;
    }
    
    if (selectedView === 'bidding') {
      return <SupplierBiddingSystem setSelectedView={setSelectedView} />;
    }

    return (
      <>
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
                      {data.inventoryCount}
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
                      {data.pendingOrders}
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
                      {data.shippedOrders}
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
                      ${data.totalRevenue.toLocaleString()}
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
                  <Pie data={data.inventoryDistribution} options={{ maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Monthly Revenue" />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Line data={data.monthlyRevenue} options={{ 
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
          <Button variant="contained" startIcon={<InventoryIcon />} onClick={() => navigate('/inventory')}>
            Manage Inventory
          </Button>
          <Button variant="contained" color="secondary" startIcon={<OrdersIcon />} onClick={() => navigate('/orders')}>
            View Orders
          </Button>
        </Box>
      </>
    )
  }

  // Company Dashboard
  const [companyView, setCompanyView] = useState('dashboard');

  const renderCompanyDashboard = () => {
    const data = dashboardData.company
    
    // Render different views based on selected tab
    if (companyView === 'salesPerformance') {
      return (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              color="primary" 
              sx={{ mr: 2 }}
              onClick={() => setCompanyView('dashboard')}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              Sales Performance
            </Typography>
          </Box>
          <SalesPerformance />
        </>
      );
    }
    
    if (companyView === 'salesVsPurchase') {
      return (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              color="primary" 
              sx={{ mr: 2 }}
              onClick={() => setCompanyView('dashboard')}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              Sales vs Purchase
            </Typography>
          </Box>
          <SalesVsPurchase />
        </>
      );
    }
    
    if (companyView === 'inventoryLevels') {
      return (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              color="primary" 
              sx={{ mr: 2 }}
              onClick={() => setCompanyView('dashboard')}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              Inventory Levels
            </Typography>
          </Box>
          <InventoryLevels />
        </>
      );
    }
    
    if (companyView === 'vendorPerformance') {
      return (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              color="primary" 
              sx={{ mr: 2 }}
              onClick={() => setCompanyView('dashboard')}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              Vendor Performance
            </Typography>
          </Box>
          <VendorPerformance />
        </>
      );
    }
    
    if (companyView === 'orderRawMaterials') {
      return <OrderRawMaterials dashboardData={dashboardData} setDashboardData={setDashboardData} setCompanyView={setCompanyView} />;
    }
    
    if (companyView === 'manageOrders') {
      return <ManageOrders dashboardData={dashboardData} setDashboardData={setDashboardData} setCompanyView={setCompanyView} />;
    }
    
    if (companyView === 'viewSuppliers') {
      return <ViewSuppliers dashboardData={dashboardData} setDashboardData={setDashboardData} setCompanyView={setCompanyView} />;
    }
    
    if (companyView === 'biddingSystem') {
      return <CompanyBiddingSystem setCompanyView={setCompanyView} />;
    }

    return (
      <>
        <Typography variant="h4" gutterBottom>
          Company Dashboard
        </Typography>
        
        {/* Dashboard Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', overflowX: 'auto', borderBottom: 1, borderColor: 'divider' }}>
            <Button 
              sx={{ 
                py: 2, 
                px: 3, 
                borderBottom: companyView === 'salesPerformance' ? 2 : 0,
                borderColor: 'primary.main',
                borderRadius: 0,
                color: companyView === 'salesPerformance' ? 'primary.main' : 'text.primary'
              }}
              onClick={() => setCompanyView('salesPerformance')}
            >
              Sales Performance
            </Button>
            <Button 
              sx={{ 
                py: 2, 
                px: 3, 
                borderBottom: companyView === 'salesVsPurchase' ? 2 : 0,
                borderColor: 'primary.main',
                borderRadius: 0,
                color: companyView === 'salesVsPurchase' ? 'primary.main' : 'text.primary'
              }}
              onClick={() => setCompanyView('salesVsPurchase')}
            >
              Sales vs Purchase
            </Button>
            <Button 
              sx={{ 
                py: 2, 
                px: 3, 
                borderBottom: companyView === 'inventoryLevels' ? 2 : 0,
                borderColor: 'primary.main',
                borderRadius: 0,
                color: companyView === 'inventoryLevels' ? 'primary.main' : 'text.primary'
              }}
              onClick={() => setCompanyView('inventoryLevels')}
            >
              Inventory Levels
            </Button>
            <Button 
              sx={{ 
                py: 2, 
                px: 3, 
                borderBottom: companyView === 'vendorPerformance' ? 2 : 0,
                borderColor: 'primary.main',
                borderRadius: 0,
                color: companyView === 'vendorPerformance' ? 'primary.main' : 'text.primary'
              }}
              onClick={() => setCompanyView('vendorPerformance')}
            >
              Vendor Performance
            </Button>
            <Button 
              sx={{ 
                py: 2, 
                px: 3, 
                borderBottom: companyView === 'biddingSystem' ? 2 : 0,
                borderColor: 'primary.main',
                borderRadius: 0,
                color: companyView === 'biddingSystem' ? 'primary.main' : 'text.primary'
              }}
              onClick={() => setCompanyView('biddingSystem')}
            >
              Bidding System
            </Button>
            <Button 
              sx={{ 
                py: 2, 
                px: 3, 
                borderBottom: companyView === 'orderRawMaterials' ? 2 : 0,
                borderColor: 'primary.main',
                borderRadius: 0,
                color: companyView === 'orderRawMaterials' ? 'primary.main' : 'text.primary'
              }}
              onClick={() => setCompanyView('orderRawMaterials')}
            >
              Order Raw Materials
            </Button>
          </Box>
        </Paper>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => setCompanyView('manageOrders')}>
              <CardContent>
                <OrdersIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h5" component="div">
                  {data.totalOrders}
                </Typography>
                <Typography color="text.secondary">
                  Total Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => setCompanyView('manageOrders')}>
              <CardContent>
                <ShippingIcon color="secondary" sx={{ fontSize: 40 }} />
                <Typography variant="h5" component="div">
                  {data.pendingShipments}
                </Typography>
                <Typography color="text.secondary">
                  Pending Shipments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <SuppliersIcon color="success" sx={{ fontSize: 40 }} />
                <Typography variant="h5" component="div">
                  {data.activeSuppliers}
                </Typography>
                <Typography color="text.secondary">
                  Active Suppliers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => setCompanyView('inventoryLevels')}>
              <CardContent>
                <InventoryIcon color="info" sx={{ fontSize: 40 }} />
                <Typography variant="h5" component="div">
                  ${data.inventoryValue.toLocaleString()}
                </Typography>
                <Typography color="text.secondary">
                  Inventory Value
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Charts */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Order Distribution" />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Pie data={data.orderDistribution} options={{ maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Supplier Performance" />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Line data={data.supplierPerformance} options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: (value) => `${value}%`
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
          <Button variant="contained" startIcon={<OrdersIcon />} onClick={() => setCompanyView('manageOrders')}>
            Manage Orders
          </Button>
          <Button variant="contained" color="secondary" startIcon={<SuppliersIcon />} onClick={() => setCompanyView('viewSuppliers')}>
            View Suppliers
          </Button>
        </Box>
      </>
    )
  }

  // Consumer Dashboard
  const [consumerView, setConsumerView] = useState('dashboard');

  const renderConsumerDashboard = () => {
    const data = dashboardData.consumer
    
    // Render different views based on selected view
    if (consumerView === 'orderHistory') {
      return (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              color="primary" 
              sx={{ mr: 2 }}
              onClick={() => setConsumerView('dashboard')}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              Order History
            </Typography>
          </Box>
          <OrderHistory dashboardData={dashboardData} setDashboardData={setDashboardData} />
        </>
      );
    }
    
    if (consumerView === 'activeOrders') {
      return (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              color="primary" 
              sx={{ mr: 2 }}
              onClick={() => setConsumerView('dashboard')}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              Active Orders
            </Typography>
          </Box>
          <ActiveOrders dashboardData={dashboardData} setDashboardData={setDashboardData} />
        </>
      );
    }
    

    
    if (consumerView === 'spendingAnalysis') {
      return (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              color="primary" 
              sx={{ mr: 2 }}
              onClick={() => setConsumerView('dashboard')}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              Spending Analysis
            </Typography>
          </Box>
          <SpendingAnalysis dashboardData={dashboardData} setDashboardData={setDashboardData} />
        </>
      );
    }
    
    if (consumerView === 'browseProducts') {
      return (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              color="primary" 
              sx={{ mr: 2 }}
              onClick={() => setConsumerView('dashboard')}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              Browse Products
            </Typography>
          </Box>
          <BrowseProducts dashboardData={dashboardData} setDashboardData={setDashboardData} setConsumerView={setConsumerView} />
        </>
      );
    }
    
    if (consumerView === 'checkout') {
      return (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              color="primary" 
              sx={{ mr: 2 }}
              onClick={() => setConsumerView('browseProducts')}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              Checkout
            </Typography>
          </Box>
          <Checkout dashboardData={dashboardData} setDashboardData={setDashboardData} setConsumerView={setConsumerView} />
        </>
      );
    }

    return (
      <>
        <Typography variant="h4" gutterBottom>
          Consumer Dashboard
        </Typography>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => setConsumerView('orderHistory')}>
              <CardContent>
                <OrdersIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h5" component="div">
                  {data.orderHistory}
                </Typography>
                <Typography color="text.secondary">
                  Order History
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => setConsumerView('activeOrders')}>
              <CardContent>
                <ShippingIcon color="secondary" sx={{ fontSize: 40 }} />
                <Typography variant="h5" component="div">
                  {data.activeOrders}
                </Typography>
                <Typography color="text.secondary">
                  Active Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => setConsumerView('spendingAnalysis')}>
              <CardContent>
                <AnalyticsIcon color="info" sx={{ fontSize: 40 }} />
                <Typography variant="h5" component="div">
                  ${data.totalSpent.toLocaleString()}
                </Typography>
                <Typography color="text.secondary">
                  Total Spent
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Charts */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Order Status" />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Pie data={data.orderStatus} options={{ maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Spending History" />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Line data={data.spendingHistory} options={{ 
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
          <Button variant="contained" startIcon={<OrdersIcon />} onClick={() => setConsumerView('activeOrders')}>
            MY ORDERS
          </Button>
          <Button variant="contained" color="secondary" startIcon={<ProductsIcon />} onClick={() => setConsumerView('browseProducts')}>
            BROWSE PRODUCTS
          </Button>
        </Box>
      </>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        {renderDashboard()}
      </Paper>
    </Container>
  )
}

export default Dashboard