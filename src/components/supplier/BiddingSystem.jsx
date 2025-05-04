import { useState, useEffect } from 'react';
import { useBidding } from '../../contexts/BiddingContext';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../supabase';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Badge,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, isAfter } from 'date-fns';

const BiddingSystem = ({ setSelectedView }) => {
  const { currentUser } = useAuth();
  const { 
    getRfqs, 
    getBids, 
    submitBid,
    loading,
    error 
  } = useBidding();
  
  const [tabValue, setTabValue] = useState(0);
  const [rfqs, setRfqs] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [quotationsError, setQuotationsError] = useState(null);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [openBidDialog, setOpenBidDialog] = useState(false);
  const [openViewRfqDialog, setOpenViewRfqDialog] = useState(false);
  const [openViewBidDialog, setOpenViewBidDialog] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isEditingBid, setIsEditingBid] = useState(false);
  
  // New bid form state
  const [newBid, setNewBid] = useState({
    price: '',
    deliveryDate: null,
    terms: ''
  });

  // Load RFQs, bids, and quotations on component mount
  useEffect(() => {
    loadRfqs();
    const fetchData = async () => {
      await loadMyBids();
      await fetchQuotations();
    };
    fetchData();
    
    // Check for new RFQs and create notifications
    const storedNotifications = localStorage.getItem('supplierNotifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);


  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('supplierNotifications', JSON.stringify(notifications));
  }, [notifications]);

  const loadRfqs = () => {
    const availableRfqs = getRfqs();
    setRfqs(availableRfqs);
    
    // Check for new RFQs and create notifications
    const lastCheck = localStorage.getItem('lastRfqCheck') || 0;
    const newRfqs = availableRfqs.filter(rfq => new Date(rfq.createdAt) > new Date(lastCheck));
    
    if (newRfqs.length > 0) {
      const newNotifications = newRfqs.map(rfq => ({
        id: `notification-${Date.now()}-${rfq.id}`,
        type: 'new_rfq',
        rfqId: rfq.id,
        message: `New RFQ: ${rfq.itemName}`,
        createdAt: new Date().toISOString(),
        read: false
      }));
      
      setNotifications(prev => [...newNotifications, ...prev]);
    }
    
    localStorage.setItem('lastRfqCheck', new Date().toISOString());
  };

  const loadMyBids = async () => {
    try {
      // Fetch bids from supplier_bids table for the current supplier
      const { data, error } = await supabase
        .from('supplier_bids')
        .select('*')
        .eq('supplier_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Format the bids data for display
      const formattedBids = data.map(bid => ({
        id: bid.bid_id,
        rfqId: bid.quotation_id,
        price: bid.bid_price,
        deliveryDate: bid.bid_delivery,
        terms: bid.bid_terms,
        status: 'Submitted', // Default status
        createdAt: bid.created_at
      }));
      
      setMyBids(formattedBids);
    } catch (err) {
      console.error('Error fetching bids:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load bids: ' + err.message,
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Fetch quotations from Supabase
  const fetchQuotations = async () => {
    setQuotationsLoading(true);
    setQuotationsError(null);
    
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setQuotations(data || []);
    } catch (err) {
      console.error('Error fetching quotations:', err);
      setQuotationsError('Failed to load quotations. Please try again.');
    } finally {
      setQuotationsLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleViewRfq = (rfq) => {
    setSelectedRfq(rfq);
    setOpenViewRfqDialog(true);
    
    // Mark related notifications as read
    const updatedNotifications = notifications.map(notification => 
      notification.rfqId === rfq.id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
  };

  const handleBidOnRfq = (rfq) => {
    setSelectedRfq(rfq);
    setNewBid({
      price: '',
      deliveryDate: null,
      terms: ''
    });
    setIsEditingBid(false);
    setOpenBidDialog(true);
  };

  const handleSubmitBid = async () => {
    // Validate form
    if (!newBid.price || !newBid.deliveryDate) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    try {
      // Format the bid data for Supabase
      const bidData = {
        bid_price: parseFloat(newBid.price),
        bid_delivery: format(newBid.deliveryDate, 'yyyy-MM-dd'),
        bid_terms: newBid.terms || '',
        supplier_id: currentUser.id,
        quotation_id: selectedRfq.quotation_id || selectedRfq.id // Use quotation_id if available, otherwise fall back to id
      };

      let data, error;
      
      if (isEditingBid) {
        // Find the existing bid to update
        const existingBid = myBids.find(bid => bid.rfqId === selectedRfq.id && bid.status === 'Submitted');
        
        if (!existingBid) {
          throw new Error('Could not find the bid to update');
        }
        
        // Update existing bid
        ({ data, error } = await supabase
          .from('supplier_bids')
          .update(bidData)
          .eq('bid_id', existingBid.id)
          .select());
          
        if (error) throw error;
        
        setSnackbar({
          open: true,
          message: 'Bid updated successfully',
          severity: 'success'
        });
      } else {
        // Insert new bid
        ({ data, error } = await supabase
          .from('supplier_bids')
          .insert([bidData])
          .select());
          
        if (error) throw error;
        
        setSnackbar({
          open: true,
          message: 'Bid submitted successfully',
          severity: 'success'
        });
      }

      setOpenBidDialog(false);
      loadMyBids();
    } catch (err) {
      console.error('Error submitting bid:', err);
      setSnackbar({
        open: true,
        message: 'Failed to submit bid: ' + err.message,
        severity: 'error'
      });
    }
  };

  const handleViewBid = async (bid) => {
    try {
      // Get quotation details for this bid
      const quotation = await getQuotationById(bid.rfqId);
      
      // Set the bid with quotation details
      setSelectedBid({
        ...bid,
        quotation: quotation
      });
      
      setOpenViewBidDialog(true);
    } catch (err) {
      console.error('Error viewing bid details:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load bid details',
        severity: 'error'
      });
    }
  };

  // Document handling functions removed as per requirements

  const markAllNotificationsAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
  };

  // Render available Quotations
  const renderRfqList = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Available Quotations</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Notifications">
              <IconButton 
                color="primary" 
                onClick={() => setShowNotifications(!showNotifications)}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />} 
              onClick={() => {
                loadRfqs();
                fetchQuotations();
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        {/* Notifications panel */}
        {showNotifications && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Notifications</Typography>
              <Button size="small" onClick={markAllNotificationsAsRead}>
                Mark all as read
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {notifications.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No notifications
              </Typography>
            ) : (
              <List>
                {notifications.map(notification => (
                  <ListItem 
                    key={notification.id} 
                    sx={{ 
                      bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemText 
                      primary={notification.message} 
                      secondary={new Date(notification.createdAt).toLocaleString()} 
                    />
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => {
                        const rfq = rfqs.find(r => r.id === notification.rfqId);
                        if (rfq) handleViewRfq(rfq);
                      }}
                    >
                      View
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}
        
        {/* Quotations Section */}
        <Box>
          {quotationsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {quotationsError}
            </Alert>
          )}
          
          {quotationsLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : quotations.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No quotations found.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
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
                    <TableRow hover key={quotation.quotation_id}>
                      <TableCell>{quotation.item_name || 'N/A'}</TableCell>
                      <TableCell>{quotation.quantity || 'N/A'}</TableCell>
                      <TableCell>
                        {quotation.expected_price ? `$${parseFloat(quotation.expected_price).toFixed(2)}` : (quotation.price ? `$${parseFloat(quotation.price).toFixed(2)}` : 'N/A')}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={quotation.status || 'Pending'} 
                          color={
                            quotation.status?.toLowerCase() === 'approved' ? 'success' :
                            quotation.status?.toLowerCase() === 'rejected' ? 'error' :
                            'warning'
                          } 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{formatDate(quotation.created_at)}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          color="secondary" 
                          onClick={() => handleBidOnRfq({
                            id: quotation.id,
                            quotation_id: quotation.quotation_id, // Explicitly include quotation_id
                            itemName: quotation.item_name,
                            quantity: quotation.quantity,
                            expectedPrice: quotation.expected_price || quotation.price,
                            bidDeadline: new Date().toISOString() // Set a default deadline
                          })}
                        >
                          Add Bid
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    );
  };

  // Render my bids
  // Get quotation details by ID
  const getQuotationById = async (quotationId) => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', quotationId)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        quotation_id: data.id, // Explicitly include quotation_id
        itemName: data.item_name,
        quantity: data.quantity,
        expectedPrice: data.expected_price,
        status: data.status || 'Pending',
        bidDeadline: data.bid_deadline || new Date().toISOString()
      };
    } catch (err) {
      console.error('Error fetching quotation details:', err);
      return null;
    }
  };

  const renderMyBids = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">My Bids</Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />} 
            onClick={() => loadMyBids()}
          >
            Refresh
          </Button>
        </Box>
        
        {myBids.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              You haven't submitted any bids yet.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>RFQ</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myBids.map(bid => {
                  // We'll fetch quotation details when viewing the bid
                  return (
                    <TableRow key={bid.id}>
                      <TableCell>Quotation #{bid.rfqId}</TableCell>
                      <TableCell>${bid.price}</TableCell>
                      <TableCell>{new Date(bid.deliveryDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={bid.status} 
                          color={
                            bid.status === 'Accepted' ? 'success' :
                            bid.status === 'Rejected' ? 'error' :
                            'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(bid.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleViewBid(bid)}
                        >
                          <ViewIcon />
                        </IconButton>
                        {bid.status === 'Submitted' && (
                          <IconButton 
                            size="small" 
                            color="secondary" 
                            onClick={async () => {
                              const quotation = await getQuotationById(bid.rfqId);
                              if (quotation) {
                                setSelectedRfq(quotation);
                                setNewBid({
                                  price: bid.price,
                                  deliveryDate: new Date(bid.deliveryDate),
                                  terms: bid.terms || ''
                                });
                                setIsEditingBid(true);
                                setOpenBidDialog(true);
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  };



  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => setSelectedView('dashboard')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Bidding System
        </Typography>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Available RFQs" />
          <Tab label="My Bids" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && renderRfqList()}
          {tabValue === 1 && renderMyBids()}
        </Box>
      </Paper>
      
      {/* View RFQ Dialog */}

      {/* View RFQ Dialog */}
      <Dialog open={openViewRfqDialog} onClose={() => setOpenViewRfqDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>RFQ Details</DialogTitle>
        <DialogContent>
          {selectedRfq && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Item Name</Typography>
                <Typography variant="body1">{selectedRfq.itemName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip 
                  label={selectedRfq.status} 
                  color={
                    selectedRfq.status === 'Posted' ? 'primary' :
                    selectedRfq.status === 'Bidding' ? 'info' :
                    selectedRfq.status === 'Awarded' ? 'success' :
                    'default'
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Company</Typography>
                <Typography variant="body1">{selectedRfq.companyName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Quantity</Typography>
                <Typography variant="body1">{selectedRfq.quantity}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Delivery Location</Typography>
                <Typography variant="body1">{selectedRfq.deliveryLocation}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Delivery Timeline</Typography>
                <Typography variant="body1">
                  {selectedRfq.deliveryTimeline 
                    ? new Date(selectedRfq.deliveryTimeline).toLocaleDateString() 
                    : 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Bid Deadline</Typography>
                <Typography variant="body1">{new Date(selectedRfq.bidDeadline).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Expected Price</Typography>
                <Typography variant="body1">
                  {selectedRfq.expectedPrice ? `$${selectedRfq.expectedPrice}` : 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Description/Specifications</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                  <Typography variant="body2">{selectedRfq.description || 'No description provided'}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Created</Typography>
                <Typography variant="body2">
                  {new Date(selectedRfq.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewRfqDialog(false)}>Close</Button>
          {selectedRfq && (selectedRfq.status === 'Posted' || selectedRfq.status === 'Bidding') && 
           isAfter(new Date(selectedRfq.bidDeadline), new Date()) && (
            <Button 
              onClick={() => {
                setOpenViewRfqDialog(false);
                handleBidOnRfq(selectedRfq);
              }} 
              variant="contained" 
              color="primary"
              startIcon={<SendIcon />}
            >
              Place Bid
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Submit Bid Dialog */}
      <Dialog open={openBidDialog} onClose={() => setOpenBidDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditingBid ? 'Edit Bid' : 'Submit Bid'}
        </DialogTitle>
        <DialogContent>
          {selectedRfq && (
            <>
              <Box sx={{ mb: 3, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  RFQ: {selectedRfq.itemName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Quantity: {selectedRfq.quantity} | 
                  Deadline: {new Date(selectedRfq.bidDeadline).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price"
                    fullWidth
                    required
                    type="number"
                    value={newBid.price}
                    onChange={(e) => setNewBid({...newBid, price: e.target.value})}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Delivery Date"
                      value={newBid.deliveryDate}
                      onChange={(date) => setNewBid({...newBid, deliveryDate: date})}
                      minDate={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Terms & Conditions"
                    fullWidth
                    multiline
                    rows={3}
                    value={newBid.terms}
                    onChange={(e) => setNewBid({...newBid, terms: e.target.value})}
                  />
                </Grid>

              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBidDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitBid} variant="contained" color="primary">
            {isEditingBid ? 'Update Bid' : 'Submit Bid'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Bid Dialog */}
      <Dialog open={openViewBidDialog} onClose={() => setOpenViewBidDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bid Details</DialogTitle>
        <DialogContent>
          {selectedBid && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Quotation</Typography>
                <Typography variant="body1">
                  {selectedBid.quotation ? selectedBid.quotation.itemName : `Quotation #${selectedBid.rfqId}`}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Item Quantity</Typography>
                <Typography variant="body1">
                  {selectedBid.quotation ? selectedBid.quotation.quantity : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip 
                  label={selectedBid.status} 
                  color={
                    selectedBid.status === 'Accepted' ? 'success' :
                    selectedBid.status === 'Rejected' ? 'error' :
                    'default'
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Price</Typography>
                <Typography variant="body1">${selectedBid.price}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Delivery Date</Typography>
                <Typography variant="body1">{new Date(selectedBid.deliveryDate).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Terms & Conditions</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                  <Typography variant="body2">{selectedBid.terms || 'No terms specified'}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">Submitted</Typography>
                <Typography variant="body2">
                  {new Date(selectedBid.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewBidDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BiddingSystem;