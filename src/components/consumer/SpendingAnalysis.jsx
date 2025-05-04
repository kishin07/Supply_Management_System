import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const SpendingAnalysis = ({ dashboardData, setDashboardData }) => {
  const data = dashboardData.consumer;
  // Use currency context for INR conversion
  const { formatPriceSync } = useCurrency();
  
  // Monthly spending data (already in dashboardData)
  const monthlySpendingData = data.spendingHistory;

  // Mock data for category spending
  const categorySpendingData = {
    labels: ['Electronics', 'Furniture', 'Office Supplies', 'Services', 'Other'],
    datasets: [{
      label: 'Spending by Category',
      data: [1200, 600, 350, 200, 150],
      backgroundColor: ['#1976D2', '#FF9800', '#4CAF50', '#9C27B0', '#F44336'],
      barThickness: 40,
    }]
  };

  // Mock data for year-over-year comparison
  const yearlyComparisonData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: '2023',
        data: [300, 450, 380, 500, 420, 450, 470, 490, 520, 550, 580, 600],
        borderColor: '#1976D2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4
      },
      {
        label: '2022',
        data: [250, 380, 320, 430, 390, 410, 400, 420, 450, 480, 500, 520],
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        tension: 0.4,
        borderDash: [5, 5]
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`
        }
      }
    },
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Spending Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Spent</Typography>
              <Typography variant="h3" color="primary">{formatPriceSync(data.totalSpent)}</Typography>
              <Typography variant="body2" color="text.secondary">Lifetime spending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Average Order</Typography>
              <Typography variant="h3" color="secondary">{formatPriceSync(data.totalSpent / data.orderHistory)}</Typography>
              <Typography variant="body2" color="text.secondary">Based on {data.orderHistory} orders</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Last Purchase</Typography>
              <Typography variant="h3" color="info.main">{formatPriceSync(450)}</Typography>
              <Typography variant="body2" color="text.secondary">October 30, 2023</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Spending Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Monthly Spending Trend
        </Typography>
        <Box sx={{ height: 300 }}>
          <Line data={monthlySpendingData} options={lineChartOptions} />
        </Box>
      </Paper>

      {/* Category Spending Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Spending by Category
        </Typography>
        <Box sx={{ height: 300 }}>
          <Bar data={categorySpendingData} options={barChartOptions} />
        </Box>
      </Paper>

      {/* Year-over-Year Comparison */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Year-over-Year Comparison
        </Typography>
        <Box sx={{ height: 300 }}>
          <Line data={yearlyComparisonData} options={lineChartOptions} />
        </Box>
      </Paper>

      {/* Spending Insights */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Spending Insights
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>Top Spending Category</Typography>
            <Typography variant="body1">Electronics - {formatPriceSync(1200)}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>Highest Spending Month</Typography>
            <Typography variant="body1">April - {formatPriceSync(500)}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>Year-over-Year Growth</Typography>
            <Typography variant="body1">+15% compared to last year</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SpendingAnalysis;