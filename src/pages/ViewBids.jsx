import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Button
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../supabase';

const ViewBids = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bids, setBids] = useState([]);
  const [quotation, setQuotation] = useState(null);
  
  // Get quotation_id from location state
  const quotationId = location.state?.quotationId;

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!quotationId) {
      navigate('/bidding-system');
      return;
    }
    
    fetchQuotationDetails();
    fetchBids();
  }, [currentUser, navigate, quotationId]);

  // Fetch quotation details
  const fetchQuotationDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('quotation_id', quotationId)
        .single();

      if (error) throw error;
      setQuotation(data);
    } catch (err) {
      console.error('Error fetching quotation details:', err);
      setError('Failed to load quotation details');
    }
  };

  // Fetch bids for the quotation
  const fetchBids = async () => {
    setLoading(true);
    try {
      // Join supplier_bids with users table to get supplier information
      const { data, error } = await supabase
        .from('supplier_bids')
        .select(`
          *,
          supplier:supplier_id(id, name, email)
        `)
        .eq('quotation_id', quotationId)
        .order('bid_price', { ascending: true });

      if (error) throw error;
      setBids(data || []);
    } catch (err) {
      console.error('Error fetching bids:', err);
      setError('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status chip based on bid status
  const getBidStatusChip = (status) => {
    switch (status) {
      case 'accepted':
        return <Chip label="Accepted" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      case 'pending':
      default:
        return <Chip label="Pending" color="primary" size="small" />;
    }
  };

  // Accept a bid
  const acceptBid = async (bidId) => {
    try {
      // Update the selected bid to accepted
      const { error: updateError } = await supabase
        .from('supplier_bids')
        .update({ status: 'accepted' })
        .eq('bid_id', bidId);

      if (updateError) throw updateError;

      // Update all other bids for this quotation to rejected
      const { error: rejectError } = await supabase
        .from('supplier_bids')
        .update({ status: 'rejected' })
        .eq('quotation_id', quotationId)
        .neq('bid_id', bidId);

      if (rejectError) throw rejectError;

      // Refresh bids
      fetchBids();
    } catch (err) {
      console.error('Error accepting bid:', err);
      setError('Failed to accept bid');
    }
  };

  // Reject a bid
  const rejectBid = async (bidId) => {
    try {
      const { error } = await supabase
        .from('supplier_bids')
        .update({ status: 'rejected' })
        .eq('bid_id', bidId);

      if (error) throw error;

      // Refresh bids
      fetchBids();
    } catch (err) {
      console.error('Error rejecting bid:', err);
      setError('Failed to reject bid');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => navigate('/bidding-system')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Supplier Bids
        </Typography>
      </Box>

      {/* Quotation Details */}
      {quotation && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Quotation Details</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="subtitle2">Item Name</Typography>
              <Typography variant="body1">{quotation.item_name}</Typography>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="subtitle2">Quantity</Typography>
              <Typography variant="body1">{quotation.quantity}</Typography>
            </Box>
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="subtitle2">Delivery Location</Typography>
              <Typography variant="body1">{quotation.delivery_location}</Typography>
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <Typography variant="subtitle2">Bid Deadline</Typography>
              <Typography variant="body1">{formatDate(quotation.bid_deadline)}</Typography>
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <Typography variant="subtitle2">Expected Price</Typography>
              <Typography variant="body1">
                {quotation.expected_price ? `$${quotation.expected_price.toLocaleString()}` : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Bids Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Supplier Bids</Typography>
        
        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 3 }} />}
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        {!loading && !error && bids.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No bids have been received for this quotation yet.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Bid Amount</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell>Submitted On</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bids.map((bid) => (
                  <TableRow key={bid.bid_id}>
                    <TableCell>
                      {bid.supplier?.name || 'Unknown'}
                      <Typography variant="caption" display="block" color="textSecondary">
                        {bid.supplier?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>${bid.bid_price.toLocaleString()}</TableCell>
                    <TableCell>{formatDate(bid.bid_delivery)}</TableCell>
                    <TableCell>{new Date(bid.created_at).toLocaleString()}</TableCell>
                    <TableCell>{getBidStatusChip(bid.status)}</TableCell>
npm                    <TableCell>
                      {bid.status === 'pending' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="success"
                            onClick={() => acceptBid(bid.bid_id)}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error"
                            onClick={() => rejectBid(bid.bid_id)}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default ViewBids;