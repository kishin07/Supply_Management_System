import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../supabase';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

function SupplierQuotations() {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  
  // Fetch quotations from Supabase on component mount
  useEffect(() => {
    // Redirect if not a supplier
    if (userRole !== 'supplier') {
      navigate('/dashboard');
      return;
    }
    
    fetchQuotations();
  }, [currentUser, userRole, navigate]);
  
  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch quotations from Supabase
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setQuotations(data || []);
    } catch (err) {
      console.error('Error fetching quotations:', err);
      setError('Failed to load quotations. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewQuotation = (quotation) => {
    setSelectedQuotation(quotation);
    setOpenViewDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenViewDialog(false);
  };
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const getStatusChip = (status) => {
    let color = 'default';
    
    switch(status?.toLowerCase()) {
      case 'pending':
        color = 'warning';
        break;
      case 'approved':
        color = 'success';
        break;
      case 'rejected':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status || 'Unknown'} 
        color={color} 
        size="small" 
      />
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/supplier')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Quotations</Typography>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchQuotations}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : quotations.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography variant="body1">No quotations found.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotations.map((quotation) => (
                  <TableRow hover key={quotation.id}>
                    <TableCell>{quotation.id}</TableCell>
                    <TableCell>{quotation.item_name || 'N/A'}</TableCell>
                    <TableCell>{quotation.quantity || 'N/A'}</TableCell>
                    <TableCell>
                      {quotation.price ? `$${quotation.price.toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusChip(quotation.status)}</TableCell>
                    <TableCell>{formatDate(quotation.created_at)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewQuotation(quotation)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Quotation Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Quotation Details</DialogTitle>
        <DialogContent dividers>
          {selectedQuotation && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">ID</Typography>
                <Typography variant="body1" gutterBottom>{selectedQuotation.id}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Typography variant="body1" gutterBottom>
                  {getStatusChip(selectedQuotation.status)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Item Name</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedQuotation.item_name || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Quantity</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedQuotation.quantity || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Price</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedQuotation.price ? `$${selectedQuotation.price.toFixed(2)}` : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Created At</Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedQuotation.created_at)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2">Description</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedQuotation.description || 'No description provided.'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2">Notes</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedQuotation.notes || 'No notes available.'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SupplierQuotations;