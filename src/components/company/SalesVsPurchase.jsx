import React from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const SalesVsPurchase = () => {
  // Mock data for OTD trend chart
  const otdTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 75, 70, 80, 60, 55, 70, 60, 65, 70, 80, 75],
        borderColor: '#1976D2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#1976D2',
      },
      {
        label: 'Purchase',
        data: [55, 60, 65, 70, 55, 45, 60, 50, 55, 60, 70, 65],
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#FF9800',
      }
    ]
  };

  // Mock data for top 20 vendor OTD
  const top20VendorData = {
    labels: ['Vendor A', 'Vendor B', 'Vendor C', 'Vendor D', 'Vendor E', 'Vendor F', 'Vendor G', 'Vendor H', 'Vendor I', 'Vendor J'],
    datasets: [{
      label: 'On-time Delivery %',
      data: [95, 92, 90, 88, 87, 85, 84, 82, 80, 78],
      backgroundColor: '#4CAF50',
      barThickness: 20,
    }]
  };

  // Mock data for bottom 20 vendor OTD
  const bottom20VendorData = {
    labels: ['Vendor K', 'Vendor L', 'Vendor M', 'Vendor N', 'Vendor O', 'Vendor P', 'Vendor Q', 'Vendor R', 'Vendor S', 'Vendor T'],
    datasets: [{
      label: 'On-time Delivery %',
      data: [65, 64, 62, 60, 58, 55, 52, 50, 48, 45],
      backgroundColor: '#F44336',
      barThickness: 20,
    }]
  };

  // Mock data for OTD by category
  const otdByCategoryData = {
    labels: ['Electronics', 'Furniture', 'Office Supplies', 'Raw Materials'],
    datasets: [{
      label: 'On-time Delivery %',
      data: [85, 78, 92, 65],
      backgroundColor: ['#1976D2', '#FF9800', '#4CAF50', '#F44336'],
      barThickness: 40,
    }]
  };

  // Mock data for OTD by subcategory
  const otdBySubcategoryData = {
    labels: ['Computers', 'Phones', 'Chairs', 'Tables', 'Paper', 'Pens', 'Metals', 'Plastics'],
    datasets: [{
      label: 'On-time Delivery %',
      data: [88, 82, 75, 80, 95, 90, 60, 70],
      backgroundColor: '#2196F3',
      barThickness: 20,
    }]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
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
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  const horizontalBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
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
      <Typography variant="h5" gutterBottom align="center">
        Sales vs Purchase Analysis
      </Typography>

      {/* OTD Trend Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom align="center">
          OTD Trend
        </Typography>
        <Box sx={{ height: 300 }}>
          <Line data={otdTrendData} options={lineChartOptions} />
        </Box>
      </Paper>

      {/* Top and Bottom Vendor Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              Top 20 Vendor OTD
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={top20VendorData} options={barChartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              Bottom 20 Vendor OTD
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={bottom20VendorData} options={barChartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Category and Subcategory Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              OTD by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={otdByCategoryData} options={horizontalBarChartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              OTD by Subcategory
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={otdBySubcategoryData} options={horizontalBarChartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesVsPurchase;