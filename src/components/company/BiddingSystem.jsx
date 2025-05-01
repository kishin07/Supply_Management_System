import { useState, useEffect } from 'react';
import { useBidding } from '../../contexts/BiddingContext';
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
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

const BiddingSystem = ({ setCompanyView }) => {
  const { currentUser } = useAuth();
  const { 
    createRfq, 
    getRfqs, 
    getBids, 
    updateBidStatus, 
    updateRfqStatus,
    getRfqById,
    loading,
    error 
  } = useBidding();
  
  const [tabValue, setTabValue] = useState(0);
  const [rfqs, setRfqs] = useState([]);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [bids, setBids] = useState([]);
  const [openRfqDialog, setOpenRfqDialog] = useState(false);
  const [openBidDialog, setOpenBidDialog] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [openCompareDialog, setOpenCompareDialog] = useState(false);
  const [selectedBids, setSelectedBids] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // New RFQ form state
  const [newRfq, setNewRfq] = useState({
    itemName: '',
    description: '',
    quantity: '',
    deliveryLocation: '',
    deliveryTimeline: null,
    expectedPrice: '',
    bidDeadline: null
  });

  // Load RFQs on component mount
  useEffect(() => {
    loadRfqs();
  }, []);

  const loadRfqs = () => {
    const companyRfqs = getRfqs();
    setRfqs(companyRfqs);
  };

  const loadBids = (rfqId) => {
    const rfqBids = getBids(rfqId);
    setBids(rfqBids);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRfqClick = (rfq) => {
    setSelectedRfq(rfq);
    loadBids(rfq.id);
    setTabValue(1); // Switch to Bids tab
  };

  const handleCreateRfq = () => {
    // Validate form
    if (!newRfq.itemName || !newRfq.quantity || !newRfq.deliveryLocation || !newRfq.bidDeadline) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    // Create RFQ
    createRfq(newRfq);
    setOpenRfqDialog(false);
    setNewRfq({
      itemName: '',
      description: '',
      quantity: '',
      deliveryLocation: '',
      deliveryTimeline: null,
      expectedPrice: '',
      bidDeadline: null
    });
    loadRfqs();
    setSnackbar({
      open: true,
      message: 'RFQ created successfully',
      severity: 'success'
    });
  };

  const handleViewBid = (bid) => {
    setSelectedBid(bid);
    setOpenBidDialog(true);
  };

  const handleAcceptBid = (bid) => {
    updateBidStatus(bid.id, 'Accepted');
    // Reject all other bids for this RFQ
    bids.forEach(otherBid => {
      if (otherBid.id !== bid.id) {
        updateBidStatus(otherBid.id, 'Rejected');
      }
    });
    // Update RFQ status
    updateRfqStatus(bid.rfqId, 'Awarded');
    loadBids(bid.rfqId);
    loadRfqs();
    setSnackbar({
      open: true,
      message: 'Bid accepted successfully',
      severity: 'success'
    });
  };

  const handleRejectBid = (bid) => {
    updateBidStatus(bid.id, 'Rejected');
    loadBids(bid.rfqId);
    setSnackbar({
      open: true,
      message: 'Bid rejected',
      severity: 'info'
    });
  };

  const handleCloseRfq = (rfqId) => {
    updateRfqStatus(rfqId, 'Closed');
    loadRfqs();
    loadBids(rfqId);
    setSnackbar({
      open: true,
      message: 'RFQ closed successfully',
      severity: 'info'
    });
  };

  const handleCompareBids = () => {
    const selectedForComparison = bids.filter(bid => bid.selected);
    if (selectedForComparison.length < 2) {
      setSnackbar({
        open: true,
        message: 'Please select at least 2 bids to compare',
        severity: 'error'
      });
      return;
    }
    setSelectedBids(selectedForComparison);
    setOpenCompareDialog(true);
  };

  const handleBidSelection = (bid) => {
    const updatedBids = bids.map(b => 
      b.id === bid.id ? { ...b, selected: !b.selected } : b
    );
    setBids(updatedBids);
  };

  const exportBidsToCSV = (rfqId) => {
    const rfq = getRfqById(rfqId);
    const rfqBids = getBids(rfqId);
    
    if (!rfq || rfqBids.length === 0) {
      setSnackbar({
        open: true,
        message: 'No data to export',
        severity: 'error'
      });
      return;
    }
    
    // Create CSV content
    const headers = ['Supplier', 'Price', 'Delivery Date', 'Status', 'Submission Date'];
    const rows = rfqBids.map(bid => [
      bid.supplierName,
      bid.price,
      bid.deliveryDate,
      bid.status,
      new Date(bid.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bids_for_${rfq.itemName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render RFQ list
  const renderRfqList = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Request for Quotations (RFQs)</Typography>
          <Box>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />} 
              onClick={loadRfqs}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />} 
              onClick={() => setOpenRfqDialog(true)}
            >
              New RFQ
            </Button>
          </Box>
        </Box>
        
        {rfqs.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No RFQs found. Create your first RFQ to get started.
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
                      Quantity: {rfq.quantity}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Location: {rfq.deliveryLocation}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Deadline: {new Date(rfq.bidDeadline).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Created: {new Date(rfq.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary" 
                      onClick={() => handleRfqClick(rfq)}
                    >
                      View Bids
                    </Button>
                    {rfq.status !== 'Closed' && (
                      <Button 
                        size="small" 
                        color="secondary" 
                        onClick={() => handleCloseRfq(rfq.id)}
                      >
                        Close RFQ
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

  // Render bids for selected RFQ
  const renderBidsList = () => {
    if (!selectedRfq) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Please select an RFQ to view its bids.
          </Typography>
        </Paper>
      );
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton color="primary" onClick={() => setTabValue(0)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">
            Bids for: {selectedRfq.itemName}
          </Typography>
        </Box>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                <strong>Status:</strong> {selectedRfq.status}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                <strong>Quantity:</strong> {selectedRfq.quantity}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                <strong>Location:</strong> {selectedRfq.deliveryLocation}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                <strong>Deadline:</strong> {new Date(selectedRfq.bidDeadline).toLocaleDateString()}
              </Typography>
            </Grid>
            {selectedRfq.description && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Description:</strong> {selectedRfq.description}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />} 
              onClick={() => loadBids(selectedRfq.id)}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            {bids.some(bid => bid.selected) && (
              <Button 
                variant="contained" 
                color="info" 
                startIcon={<CompareIcon />} 
                onClick={handleCompareBids}
                sx={{ mr: 1 }}
              >
                Compare Selected
              </Button>
            )}
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            onClick={() => exportBidsToCSV(selectedRfq.id)}
          >
            Export
          </Button>
        </Box>
        
        {bids.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No bids received yet for this RFQ.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    {/* Checkbox column for comparison */}
                  </TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bids.map(bid => (
                  <TableRow key={bid.id}>
                    <TableCell padding="checkbox">
                      <Tooltip title="Select for comparison">
                        <Chip 
                          label={bid.selected ? "Selected" : "Select"}
                          color={bid.selected ? "primary" : "default"}
                          size="small"
                          onClick={() => handleBidSelection(bid)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>{bid.supplierName}</TableCell>
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
                      {bid.status === 'Submitted' && selectedRfq.status !== 'Closed' && (
                        <>
                          <IconButton 
                            size="small" 
                            color="success" 
                            onClick={() => handleAcceptBid(bid)}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleRejectBid(bid)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
          onClick={() => setCompanyView('dashboard')}
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
          <Tab label="RFQs" />
          <Tab label="Bids" disabled={!selectedRfq} />
        </Tabs>
      </Paper>

      {tabValue === 0 ? renderRfqList() : renderBidsList()}

      {/* New RFQ Dialog */}
      <Dialog open={openRfqDialog} onClose={() => setOpenRfqDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New RFQ</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Item Name"
                fullWidth
                required
                value={newRfq.itemName}
                onChange={(e) => setNewRfq({...newRfq, itemName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity"
                fullWidth
                required
                type="number"
                value={newRfq.quantity}
                onChange={(e) => setNewRfq({...newRfq, quantity: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description/Specifications"
                fullWidth
                multiline
                rows={3}
                value={newRfq.description}
                onChange={(e) => setNewRfq({...newRfq, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Delivery Location"
                fullWidth
                required
                value={newRfq.deliveryLocation}
                onChange={(e) => setNewRfq({...newRfq, deliveryLocation: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Delivery Timeline"
                  value={newRfq.deliveryTimeline}
                  onChange={(date) => setNewRfq({...newRfq, deliveryTimeline: date})}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Expected Price (Optional)"
                fullWidth
                type="number"
                value={newRfq.expectedPrice}
                onChange={(e) => setNewRfq({...newRfq, expectedPrice: e.target.value})}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Bid Deadline"
                  value={newRfq.bidDeadline}
                  onChange={(date) => setNewRfq({...newRfq, bidDeadline: date})}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRfqDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateRfq} variant="contained" color="primary">
            Create RFQ
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Bid Dialog */}
      <Dialog open={openBidDialog} onClose={() => setOpenBidDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bid Details</DialogTitle>
        <DialogContent>
          {selectedBid && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Supplier</Typography>
                <Typography variant="body1">{selectedBid.supplierName}</Typography>
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
                  <List>
                    {selectedBid.documents.map((doc, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={doc.name} secondary={`${doc.size} KB`} />
                        <Button size="small" startIcon={<DownloadIcon />}>
                          Download
                        </Button>
                      </ListItem>
                    ))}
                  </List>
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
          <Button onClick={() => setOpenBidDialog(false)}>Close</Button>
          {selectedBid && selectedBid.status === 'Submitted' && (
            <>
              <Button 
                onClick={() => {
                  handleAcceptBid(selectedBid);
                  setOpenBidDialog(false);
                }} 
                variant="contained" 
                color="success"
              >
                Accept Bid
              </Button>
              <Button 
                onClick={() => {
                  handleRejectBid(selectedBid);
                  setOpenBidDialog(false);
                }} 
                variant="contained" 
                color="error"
              >
                Reject Bid
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Compare Bids Dialog */}
      <Dialog open={openCompareDialog} onClose={() => setOpenCompareDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Compare Bids</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Criteria</TableCell>
                  {selectedBids.map(bid => (
                    <TableCell key={bid.id}>{bid.supplierName}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Price</strong></TableCell>
                  {selectedBids.map(bid => (
                    <TableCell key={bid.id}>${bid.price}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell><strong>Delivery Date</strong></TableCell>
                  {selectedBids.map(bid => (
                    <TableCell key={bid.id}>{new Date(bid.deliveryDate).toLocaleDateString()}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell><strong>Terms</strong></TableCell>
                  {selectedBids.map(bid => (
                    <TableCell key={bid.id}>{bid.terms || 'Not specified'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell><strong>Documents</strong></TableCell>
                  {selectedBids.map(bid => (
                    <TableCell key={bid.id}>
                      {bid.documents && bid.documents.length > 0 
                        ? `${bid.documents.length} document(s)` 
                        : 'None'}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell><strong>Submitted</strong></TableCell>
                  {selectedBids.map(bid => (
                    <TableCell key={bid.id}>{new Date(bid.createdAt).toLocaleDateString()}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompareDialog(false)}>Close</Button>
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