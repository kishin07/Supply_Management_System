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
  IconButton
} from '@mui/material'
import supabase from '../supabase'
import {
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  LocalShipping as ShippingIcon,
  BarChart as AnalyticsIcon,
  People as SuppliersIcon,
  ArrowBack as ArrowBackIcon,
  Store as StoreIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js'
import { Pie, Line } from 'react-chartjs-2'
import SalesPerformance from '../components/company/SalesPerformance'
import SalesVsPurchase from '../components/company/SalesVsPurchase'
import InventoryLevels from '../components/company/InventoryLevels'
import VendorPerformance from '../components/company/VendorPerformance'
import OrderRawMaterials from '../components/company/OrderRawMaterials'
import ManageOrders from '../components/company/ManageOrders'
import ViewSuppliers from '../components/company/ViewSuppliers'
import ViewOrders from '../components/company/ViewOrders'
import CompanyBiddingSystem from '../components/company/BiddingSystem'
import ConsumerInventory from '../components/company/ConsumerInventory'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title)

function CompanyDashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  // Redirect to login if no user is found
  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])
  
  // Data for dashboard with real supplier data
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    pendingShipments: 0,
    activeSuppliers: 0,
    inventoryValue: 78000,
    orderDistribution: {
      labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50']
      }]
    },
    supplierPerformance: {
      labels: [],
      datasets: [{
        label: 'On-time Delivery %',
        data: [],
        borderColor: '#1976D2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4
      }]
    }
  })

  // Fetch dashboard data
  useEffect(() => {
    // In a real application, you would fetch data from an API here
    console.log('Fetching company dashboard data')
    
    // Fetch actual supplier data and order data from Supabase
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        // First, get all supplier relationships for the company
        const { data: relationships, error: relError } = await supabase
          .from('company_supplier_master')
          .select('supplier_id')
          .eq('company_id', currentUser.id);

        if (relError) throw relError;
        
        // Update active suppliers count with actual data
        if (relationships) {
          // Update dashboard data with real supplier count
          setDashboardData(prevData => ({
            ...prevData,
            activeSuppliers: relationships.length
          }));
          
          // If we have suppliers, update the supplier performance chart
          if (relationships.length > 0) {
            const supplierIds = relationships.map(rel => rel.supplier_id);
            
            // Get supplier details from suppliers table
            const { data: suppliersData, error: suppError } = await supabase
              .from('suppliers')
              .select('*')
              .in('supplier_id', supplierIds);

            if (suppError) throw suppError;
            
            // Get supplier names from users table
            const { data: usersData, error: usersError } = await supabase
              .from('users')
              .select('id, name')
              .in('id', supplierIds);

            if (usersError) throw usersError;
            
            // Update supplier performance chart with real data
            if (suppliersData && usersData) {
              const supplierNames = usersData.map(user => user.name || `Supplier ${user.id}`);
              
              // Generate random performance data for now (in a real app, this would come from actual metrics)
              const performanceData = suppliersData.map(() => Math.floor(Math.random() * 15) + 80); // Random values between 80-95%
              
              setDashboardData(prevData => ({
                ...prevData,
                supplierPerformance: {
                  ...prevData.supplierPerformance,
                  labels: supplierNames,
                  datasets: [{
                    ...prevData.supplierPerformance.datasets[0],
                    data: performanceData
                  }]
                }
              }));
            }
          }
        }
        
        // Fetch orders data to update order counts
        const { data: ordersData, error: ordersError } = await supabase
          .from('company_orders')
          .select('*')
          .eq('company_id', currentUser.id);

        if (ordersError) throw ordersError;
        
        if (ordersData) {
          // Count orders by status
          const pendingCount = ordersData.filter(order => order.order_status === 'Pending').length;
          const processingCount = ordersData.filter(order => order.order_status === 'Processing').length;
          const shippedCount = ordersData.filter(order => order.order_status === 'Shipped').length;
          const deliveredCount = ordersData.filter(order => order.order_status === 'Delivered').length;
          
          // Update dashboard with real order counts
          setDashboardData(prevData => ({
            ...prevData,
            totalOrders: ordersData.length,
            pendingShipments: pendingCount + processingCount, // Pending shipments include both pending and processing orders
            orderDistribution: {
              ...prevData.orderDistribution,
              datasets: [{
                ...prevData.orderDistribution.datasets[0],
                data: [pendingCount, processingCount, shippedCount, deliveredCount]
              }]
            }
          }));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    
    fetchDashboardData();
  }, [currentUser])

  // Company Dashboard
  const [companyView, setCompanyView] = useState('dashboard')

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
    )
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
    )
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
    )
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
    )
  }
  
  if (companyView === 'orderRawMaterials') {
    return <OrderRawMaterials dashboardData={dashboardData} setDashboardData={setDashboardData} setCompanyView={setCompanyView} />
  }
  
  if (companyView === 'manageOrders') {
    return <ManageOrders dashboardData={dashboardData} setDashboardData={setDashboardData} setCompanyView={setCompanyView} />
  }
  
  if (companyView === 'viewOrders') {
    return <ViewOrders setCompanyView={setCompanyView} />
  }
  
  if (companyView === 'viewSuppliers') {
    return <ViewSuppliers dashboardData={dashboardData} setDashboardData={setDashboardData} setCompanyView={setCompanyView} />
  }
  
  if (companyView === 'biddingSystem') {
    return <CompanyBiddingSystem setCompanyView={setCompanyView} />
  }
  
  if (companyView === 'consumerInventory') {
    return <ConsumerInventory setCompanyView={setCompanyView} />
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
          <Button 
            sx={{ 
              py: 2, 
              px: 3, 
              borderBottom: companyView === 'consumerInventory' ? 2 : 0,
              borderColor: 'primary.main',
              borderRadius: 0,
              color: companyView === 'consumerInventory' ? 'primary.main' : 'text.primary'
            }}
            onClick={() => setCompanyView('consumerInventory')}
          >
            Consumer Inventory
          </Button>
        </Box>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => setCompanyView('viewOrders')}>
            <CardContent>
              <OrdersIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h5" component="div">
                {dashboardData.totalOrders}
              </Typography>
              <Typography color="text.secondary">
                Total Orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => setCompanyView('viewOrders')}>
            <CardContent>
              <ShippingIcon color="secondary" sx={{ fontSize: 40 }} />
              <Typography variant="h5" component="div">
                {dashboardData.pendingShipments}
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
                {dashboardData.activeSuppliers}
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
                ${dashboardData.inventoryValue.toLocaleString()}
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
                <Pie data={dashboardData.orderDistribution} options={{ maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Supplier Performance" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Line data={dashboardData.supplierPerformance} options={{ 
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
        <Button 
          variant="contained" 
          startIcon={<OrdersIcon />} 
          onClick={() => setCompanyView('viewOrders')}
        >
          View Orders
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<SuppliersIcon />} 
          onClick={() => setCompanyView('viewSuppliers')}
        >
          View Suppliers
        </Button>
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<InventoryIcon />} 
          onClick={() => setCompanyView('orderRawMaterials')}
        >
          Order Raw Materials
        </Button>
        <Button 
          variant="contained" 
          color="info" 
          startIcon={<StoreIcon />} 
          onClick={() => setCompanyView('consumerInventory')}
        >
          Consumer Inventory
        </Button>
      </Box>
    </Container>
  )
}

export default CompanyDashboard