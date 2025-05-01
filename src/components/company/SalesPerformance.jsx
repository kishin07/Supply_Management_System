import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const SalesPerformance = () => {
  // Mock data for sales performance charts
  const salesTrendData = {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    datasets: [{
      label: 'Sales',
      data: [6.77, 5.58, 7.79, 7.35, 7.27, 5.56],
      borderColor: '#1976D2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#1976D2',
    }]
  };

  const salesByOrderTypeData = {
    labels: ['Direct', 'Distributor', 'Online', 'Retail'],
    datasets: [{
      data: [27, 26, 25, 23],
      backgroundColor: ['#1976D2', '#90CAF9', '#FF9800', '#FFCC80'],
      hoverBackgroundColor: ['#1565C0', '#64B5F6', '#F57C00', '#FFB74D']
    }]
  };

  const categorySalesData = {
    labels: ['Technology', 'Furniture', 'Office Supplies'],
    datasets: [{
      label: 'Sales',
      data: [40000000, 30000000, 10000000],
      backgroundColor: '#FF9800',
      barThickness: 40,
    }]
  };

  const subCategorySalesData = {
    labels: [
      'Copiers', 'Chairs', 'Machines', 'Appliances', 'Bookcases', 
      'Tables', 'Accessories', 'Furnishings', 'Phones', 'Labels', 
      'Art', 'Paper', 'Binders', 'Fasteners'
    ],
    datasets: [{
      label: 'Sales',
      data: [
        20000000, 15000000, 10000000, 8000000, 7000000, 
        6000000, 5000000, 4000000, 3000000, 2500000, 
        2000000, 1500000, 1000000, 500000
      ],
      backgroundColor: '#F44336',
      barThickness: 15,
    }]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `$${value}M`
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

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

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
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
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
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
        Sales Performance
      </Typography>

      {/* Top row charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              Sales Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={salesTrendData} options={lineChartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              Sales by Order Type
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie data={salesByOrderTypeData} options={pieChartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom row charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              Location Sales
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Map visualization requires additional libraries
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              Category Sales
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={categorySalesData} options={horizontalBarChartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              Sub-category Sales
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={subCategorySalesData} options={barChartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesPerformance;