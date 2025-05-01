import React from 'react';
import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const VendorPerformance = () => {
  // Mock data for OTD trend chart
  const otdTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'OTD %',
        data: [85, 82, 88, 75, 80, 78, 85, 90, 87, 85, 82, 88],
        borderColor: '#1976D2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#1976D2',
      },
      {
        label: 'Target',
        data: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        borderDash: [5, 5],
        tension: 0,
        pointRadius: 0,
      }
    ]
  };

  // Mock data for top 20 vendor OTD
  const top20VendorData = [
    { vendor: 'ABC Inc', otd: '95%' },
    { vendor: 'XYZ Corp', otd: '93%' },
    { vendor: 'Best Supply', otd: '92%' },
    { vendor: 'Quality Parts', otd: '92%' },
    { vendor: 'Fast Delivery', otd: '90%' },
    { vendor: 'Global Mfg', otd: '90%' },
    { vendor: 'Reliable Co', otd: '89%' },
    { vendor: 'Prime Logistics', otd: '88%' },
    { vendor: 'Elite Materials', otd: '87%' },
    { vendor: 'Superior Goods', otd: '86%' }
  ];

  // Mock data for bottom 20 vendor OTD
  const bottom20VendorData = [
    { vendor: 'Slow Shipping', otd: '65%' },
    { vendor: 'Late Arrivals', otd: '64%' },
    { vendor: 'Delay Logistics', otd: '62%' },
    { vendor: 'Tardy Inc', otd: '60%' },
    { vendor: 'Last Minute', otd: '58%' },
    { vendor: 'Behind Schedule', otd: '57%' },
    { vendor: 'Overdue Express', otd: '55%' },
    { vendor: 'Lagging Supply', otd: '52%' },
    { vendor: 'Procrastinate Co', otd: '50%' },
    { vendor: 'Deadline Missers', otd: '48%' }
  ];

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
        Vendor Performance
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

      {/* Top and Bottom Vendor Tables */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              Top 20 Vendor OTD
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Vendor</TableCell>
                    <TableCell align="right">OTD</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {top20VendorData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.vendor}</TableCell>
                      <TableCell align="right">{row.otd}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              Bottom 20 Vendor OTD
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Vendor</TableCell>
                    <TableCell align="right">OTD</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bottom20VendorData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.vendor}</TableCell>
                      <TableCell align="right">{row.otd}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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

export default VendorPerformance;