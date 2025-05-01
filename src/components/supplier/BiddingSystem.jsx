import { useState, useEffect } from 'react';
import { useBidding } from '../../contexts/BiddingContext';
import { useAuth } from '../../contexts/AuthContext';
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
  AttachFile as AttachFileIcon
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
    getRfqById,
    loading,
    error 
  } = useBidding();
  
  const [tabValue, setTabValue] = useState(0);
  const [rfqs, setRfqs] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [openBidDialog, setOpenBidDialog] = useState(false);
  const [openViewRfqDialog, setOpenViewRfqDialog] = useState(false);
  const [openViewBidDialog, setOpenViewBidDialog] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // New bid form state
  const [newBid, setNewBid] = useState({
    price: '',
    deliveryDate: null,
    terms: '',
    documents: []
  });

  // Load RFQs and bids on component mount
  useEffect(() => {
    loadRfqs();
    loadMyBids();
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

  const loadMyBids = () => {
    const supplierBids = getBids();
    setMyBids(supplierBids);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
      terms: '',
      documents: []
    });
    setOpenBidDialog(true);
  };

  const handleSubmitBid = () => {
    // Validate form
    if (!newBid.price || !newBid.deliveryDate) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    // Submit bid
    submitBid(selectedRfq.id, newBid);
    setOpenBidDialog(false);
    loadMyBids();
    setSnackbar({
      open: true,
      message: 'Bid submitted successfully',
      severity: 'success'
    });
  };

  const handleViewBid = (bid) => {
    setSelectedBid(bid);
    setOpenViewBidDialog(true);
  };

  const handleAddDocument = () => {
    // In a real app, this would handle file uploads
    // For this demo, we'll just add a mock document
    const mockDocument = {
      name: `Document-${newBid.documents.length + 1}.pdf`,
      size: Math.floor(Math.random() * 1000) + 100, // Random size between 100-1100 KB
      uploadedAt: new Date().toISOString()
    };
    
    setNewBid({
      ...newBid,
      documents: [...newBid.documents, mockDocument]
    });
  };

  const handleRemoveDocument = (index) => {
    const updatedDocuments = [...newBid.documents];
    updatedDocuments.splice(index, 1);
    setNewBid({
      ...newBid,
      documents: updatedDocuments
    });
  };

  const markAllNotificationsAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
  };

  // Render available RFQs
  const renderRfqList = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Available RFQs</Typography>
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
              onClick={loadRfqs}
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
        
        {rfqs.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No RFQs available at the moment. Check back later.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {rfqs.map(rfq => (
              <Grid item xs={12} sm={6} md={4} key={rfq.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {rfq.itemName}
                    </Typography>
                    <Chip 
                      label={rfq.status} 
                      color={
                        rfq.status === 'Posted' ? 'primary' :
                        rfq.status === 'Bidding' ? 'info' :
                        rfq.status === 'Awarded' ? 'success' :
                        'default'
                      }
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Company: {rfq.companyName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Quantity: {rfq.quantity}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Location: {rfq.deliveryLocation}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Deadline: {new Date(rfq.bidDeadline).toLocaleDateString()}
                    </Typography>
                    {rfq.expectedPrice && (
                      <Typography variant="body2" color="textSecondary">
                        Expected Price: ${rfq.expectedPrice}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary" 
                      onClick={() => handleViewRfq(rfq)}
                    >
                      View Details
                    </Button>
                    {(rfq.status === 'Posted' || rfq.status === 'Bidding') && 
                     isAfter(new Date(rfq.bidDeadline), new Date()) && (
                      <Button 
                        size="small" 
                        color="secondary" 
                        onClick={() => handleBidOnRfq(rfq)}
                      >
                        Place Bid
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  // Render my bids
  const renderMyBids = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">My Bids</Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />} 
            onClick={loadMyBids}
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
                  const rfq = getRfqById(bid.rfqId);
                  return (
                    <TableRow key={bid.id}>
                      <TableCell>{rfq ? rfq.itemName : 'Unknown RFQ'}</TableCell>
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
                        {bid.status === 'Submitted' && rfq && 
                         (rfq.status === 'Posted' || rfq.status === 'Bidding') && 
                         isAfter(new Date(rfq.bidDeadline), new Date()) && (
                          <IconButton 
                            size="small" 
                            color="secondary" 
                            onClick={() => {
                              setSelectedRfq(rfq);
                              setNewBid({
                                price: bid.price,
                                deliveryDate: new Date(bid.deliveryDate),
                                terms: bid.terms || '',
                                documents: bid.documents || []
                              });
                              setOpenBidDialog(true);
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
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => setSelectedView('supplier-selection')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Bidding System
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Available RFQs" />
          <Tab label="My Bids" />
        </Tabs>
      </Paper>

      {tabValue === 0 ? renderRfqList() : renderMyBids()}

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
          {myBids.some(bid => bid.rfqId === selectedRfq?.id && bid.status === 'Submitted') 
            ? 'Edit Bid' 
            : 'Submit Bid'}
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
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                      minDate={new Date()}
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
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Attached Documents
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AttachFileIcon />}
                      onClick={handleAddDocument}
                    >
                      Add Document
                    </Button>
                  </Box>
                  {newBid.documents.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Size</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {newBid.documents.map((doc, index) => (
                            <TableRow key={index}>
                              <TableCell>{doc.name}</TableCell>
                              <TableCell>{doc.size} KB</TableCell>
                              <TableCell>
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => handleRemoveDocument(index)}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No documents attached
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBidDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitBid} variant="contained" color="primary">
            {myBids.some(bid => bid.rfqId === selectedRfq?.id && bid.status === 'Submitted') 
              ? 'Update Bid' 
              : 'Submit Bid'}
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
                <Typography variant="subtitle2">RFQ</Typography>
                <Typography variant="body1">
                  {getRfqById(selectedBid.rfqId)?.itemName || 'Unknown RFQ'}
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
              {selectedBid.documents && selectedBid.documents.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Attached Documents</Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Size</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedBid.documents.map((doc, index) => (
                          <TableRow key={index}>
                            <TableCell>{doc.name}</TableCell>
                            <TableCell>{doc.size} KB</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
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