import React from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const ExecutiveView = () => {
  // Mock data for KPIs
  const kpiData = {
    crboi: '10.82%',
    sales: '$81,256,906',
    profitMargin: '19.87%',
    avgPurchaseValue: '$1,083.64',
    lossSales: '$161,536',
    cogs: '$65,113,615',
    fillRate: '99.80%',
    salesTransactions: '74,985',
    turnoverRatio: '5.05',
    otd: '-17%'
  };

  // Mock data for customer pie chart
  const customerData = {
    labels: ['New Customers', 'Existing Customers'],
    datasets: [{
      data: [42.35, 57.65],
      backgroundColor: ['#1976D2', '#FF9800'],
      hoverBackgroundColor: ['#1565C0', '#F57C00']
    }]
  };

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}%`
        }
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom align="center">
        Executive View
      </Typography>

      {/* Top Row KPIs */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              CRBOI
            </Typography>
            <Typography variant="h4" color="primary">
              {kpiData.crboi}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Sales
            </Typography>
            <Typography variant="h4" color="primary">
              {kpiData.sales}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Profit Margin
            </Typography>
            <Typography variant="h4" color="primary">
              {kpiData.profitMargin}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Average Purchase Value
            </Typography>
            <Typography variant="h4" color="primary">
              {kpiData.avgPurchaseValue}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Middle Row KPIs */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Loss Sales
            </Typography>
            <Typography variant="h4" color="error">
              {kpiData.lossSales}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              COGS
            </Typography>
            <Typography variant="h4" color="primary">
              {kpiData.cogs}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Fill Rate
            </Typography>
            <Typography variant="h4" color="success">
              {kpiData.fillRate}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Old Vs New Customers
            </Typography>
            <Box sx={{ height: 150 }}>
              <Pie data={customerData} options={pieChartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Row KPIs */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Sales Transactions
            </Typography>
            <Typography variant="h4" color="primary">
              {kpiData.salesTransactions}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Turnover Ratio
            </Typography>
            <Typography variant="h4" color="primary">
              {kpiData.turnoverRatio}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              OTD
            </Typography>
            <Typography variant="h4" color="error">
              {kpiData.otd}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExecutiveView;