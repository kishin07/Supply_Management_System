import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const InventoryLevels = () => {
  // Mock data for inventory by category
  const inventoryByCategoryData = {
    labels: ['Technology', 'Furniture', 'Office Supplies'],
    datasets: [{
      label: 'Inventory Value',
      data: [2500000, 1700000, 800000],
      backgroundColor: ['#1976D2', '#FF9800', '#4CAF50'],
      barThickness: 40,
    }]
  };

  // Mock data for inventory by subcategory
  const inventoryBySubcategoryData = {
    labels: [
      'Phones', 'Computers', 'Chairs', 'Tables', 'Bookcases', 
      'Paper', 'Binders', 'Accessories', 'Appliances', 'Storage'
    ],
    datasets: [{
      label: 'Inventory Value',
      data: [
        1200000, 1300000, 800000, 600000, 300000, 
        300000, 200000, 150000, 100000, 50000
      ],
      backgroundColor: '#2196F3',
      barThickness: 20,
    }]
  };

  // Mock data for inventory by product
  const inventoryByProductData = {
    labels: [
      'iPhone 13', 'MacBook Pro', 'Dell XPS', 'HP Printer', 'Ergonomic Chair', 
      'Standing Desk', 'Filing Cabinet', 'Copy Paper', 'Stapler', 'Pens'
    ],
    datasets: [{
      label: 'Inventory Value',
      data: [
        500000, 400000, 300000, 250000, 200000, 
        150000, 100000, 80000, 50000, 30000
      ],
      backgroundColor: '#9C27B0',
      barThickness: 15,
    }]
  };

  // Chart options
  const horizontalBarChartOptions = {
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

  const verticalBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
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

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom align="center">
        Inventory Levels
      </Typography>

      {/* Inventory by Category */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom align="center">
          Inventory by Category
        </Typography>
        <Box sx={{ height: 300 }}>
          <Bar data={inventoryByCategoryData} options={verticalBarChartOptions} />
        </Box>
      </Paper>

      {/* Inventory by Subcategory */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom align="center">
          Inventory by Subcategory
        </Typography>
        <Box sx={{ height: 300 }}>
          <Bar data={inventoryBySubcategoryData} options={horizontalBarChartOptions} />
        </Box>
      </Paper>

      {/* Inventory by Product */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom align="center">
          Inventory by Product
        </Typography>
        <Box sx={{ height: 300 }}>
          <Bar data={inventoryByProductData} options={horizontalBarChartOptions} />
        </Box>
      </Paper>

      {/* Map visualization placeholder */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom align="center">
          Inventory by Location
        </Typography>
        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Map visualization requires additional libraries
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default InventoryLevels;