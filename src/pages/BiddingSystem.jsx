import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import supabase from '../supabase';

const BiddingSystem = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [openQuotationDialog, setOpenQuotationDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // New quotation form state
  const [quotationForm, setQuotationForm] = useState({
    item_name: '',
    quantity: '',
    description: '',
    delivery_location: '',
    delivery_timeline: null,
    expected_price: '',
    bid_deadline: null
  });

  // Load quotations on component mount
  useEffect(() => {
    if (currentUser) {
      fetchQuotations();
    } else {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch quotations from Supabase
  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('company_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (err) {
      console.error('Error fetching quotations:', err);
      setError('Failed to load quotations');
      setSnackbar({
        open: true,
        message: 'Failed to load quotations: ' + err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new quotation
  const createQuotation = async () => {
    // Validate form
    if (!quotationForm.item_name || !quotationForm.quantity || !quotationForm.delivery_location || !quotationForm.bid_deadline) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // Format dates for Supabase
      const formattedData = {
        ...quotationForm,
        delivery_timeline: quotationForm.delivery_timeline ? format(quotationForm.delivery_timeline, 'yyyy-MM-dd') : null,
        bid_deadline: quotationForm.bid_deadline ? format(quotationForm.bid_deadline, 'yyyy-MM-dd') : null,
        company_id: currentUser.id,
        quantity: parseInt(quotationForm.quantity),
        expected_price: parseFloat(quotationForm.expected_price) || 0
      };

      const { data, error } = await supabase
        .from('quotations')
        .insert([formattedData])
        .select();

      if (error) throw error;

      setQuotations(prev => [data[0], ...prev]);
      setOpenQuotationDialog(false);
      resetForm();
      setSnackbar({
        open: true,
        message: 'Quotation created successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error creating quotation:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create quotation: ' + err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update an existing quotation
  const updateQuotation = async () => {
    if (!selectedQuotation) return;

    // Validate form
    if (!quotationForm.item_name || !quotationForm.quantity || !quotationForm.delivery_location || !quotationForm.bid_deadline) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // Format dates for Supabase
      const formattedData = {
        ...quotationForm,
        delivery_timeline: quotationForm.delivery_timeline ? format(quotationForm.delivery_timeline, 'yyyy-MM-dd') : null,
        bid_deadline: quotationForm.bid_deadline ? format(quotationForm.bid_deadline, 'yyyy-MM-dd') : null,
        quantity: parseInt(quotationForm.quantity),
        expected_price: parseFloat(quotationForm.expected_price) || 0
      };

      const { data, error } = await supabase
        .from('quotations')
        .update(formattedData)
        .eq('quotation_id', selectedQuotation.quotation_id)
        .select();

      if (error) throw error;

      setQuotations(prev => 
        prev.map(q => q.quotation_id === selectedQuotation.quotation_id ? data[0] : q)
      );
      setOpenEditDialog(false);
      resetForm();
      setSnackbar({
        open: true,
        message: 'Quotation updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating quotation:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update quotation: ' + err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a quotation
  const deleteQuotation = async () => {
    if (!selectedQuotation) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('quotation_id', selectedQuotation.quotation_id);

      if (error) throw error;

      setQuotations(prev => 
        prev.filter(q => q.quotation_id !== selectedQuotation.quotation_id)
      );
      setOpenDeleteDialog(false);
      setSnackbar({
        open: true,
        message: 'Quotation deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting quotation:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete quotation: ' + err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuotationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setQuotationForm(prev => ({
      ...prev,
      [name]: date
    }));
  };

  // Reset form fields
  const resetForm = () => {
    setQuotationForm({
      item_name: '',
      quantity: '',
      description: '',
      delivery_location: '',
      delivery_timeline: null,
      expected_price: '',
      bid_deadline: null
    });
    setSelectedQuotation(null);
  };

  // Open edit dialog with selected quotation data
  const handleEditClick = (quotation) => {
    setSelectedQuotation(quotation);
    setQuotationForm({
      item_name: quotation.item_name,
      quantity: quotation.quantity.toString(),
      description: quotation.description || '',
      delivery_location: quotation.delivery_location,
      delivery_timeline: quotation.delivery_timeline ? new Date(quotation.delivery_timeline) : null,
      expected_price: quotation.expected_price ? quotation.expected_price.toString() : '',
      bid_deadline: quotation.bid_deadline ? new Date(quotation.bid_deadline) : null
    });
    setOpenEditDialog(true);
  };

  // Open view dialog with selected quotation data
  const handleViewClick = (quotation) => {
    setSelectedQuotation(quotation);
    setOpenViewDialog(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (quotation) => {
    setSelectedQuotation(quotation);
    setOpenDeleteDialog(true);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => navigate('/dashboard')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Bidding System
        </Typography>
      </Box>

      {/* Main content */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">My Quotations</Typography>
          <Box>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />} 
              onClick={fetchQuotations}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />} 
              onClick={() => {
                resetForm();
                setOpenQuotationDialog(true);
              }}
            >
              New Quotation
            </Button>
          </Box>
        </Box>

        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 3 }} />}

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {!loading && !error && quotations.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No quotations found. Create your first quotation to get started.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Delivery Location</TableCell>
                  <TableCell>Bid Deadline</TableCell>
                  <TableCell>Expected Price</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotations.map((quotation) => (
                  <TableRow key={quotation.quotation_id}>
                    <TableCell>{quotation.item_name}</TableCell>
                    <TableCell>{quotation.quantity}</TableCell>
                    <TableCell>{quotation.delivery_location}</TableCell>
                    <TableCell>
                      {quotation.bid_deadline ? new Date(quotation.bid_deadline).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {quotation.expected_price ? `$${quotation.expected_price.toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton onClick={() => handleViewClick(quotation)} color="primary">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditClick(quotation)} color="secondary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteClick(quotation)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="info"
                        sx={{ ml: 1 }}
                        onClick={() => navigate('/view-bids', { state: { quotationId: quotation.quotation_id } })}
                      >
                        Show Bids
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create Quotation Dialog */}
      <Dialog open={openQuotationDialog} onClose={() => setOpenQuotationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Quotation</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="item_name"
                label="Item Name"
                value={quotationForm.item_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                value={quotationForm.quantity}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={quotationForm.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="delivery_location"
                label="Delivery Location"
                value={quotationForm.delivery_location}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Delivery Timeline"
                  value={quotationForm.delivery_timeline}
                  onChange={(date) => handleDateChange('delivery_timeline', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="expected_price"
                label="Expected Price ($)"
                type="number"
                value={quotationForm.expected_price}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Bid Deadline"
                  value={quotationForm.bid_deadline}
                  onChange={(date) => handleDateChange('bid_deadline', date)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuotationDialog(false)}>Cancel</Button>
          <Button 
            onClick={createQuotation} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Quotation Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        {selectedQuotation && (
          <>
            <DialogTitle>Quotation Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Item Name</Typography>
                  <Typography variant="body1">{selectedQuotation.item_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Quantity</Typography>
                  <Typography variant="body1">{selectedQuotation.quantity}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body1">{selectedQuotation.description || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Delivery Location</Typography>
                  <Typography variant="body1">{selectedQuotation.delivery_location}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Delivery Timeline</Typography>
                  <Typography variant="body1">
                    {selectedQuotation.delivery_timeline 
                      ? new Date(selectedQuotation.delivery_timeline).toLocaleDateString() 
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Expected Price</Typography>
                  <Typography variant="body1">
                    {selectedQuotation.expected_price 
                      ? `$${selectedQuotation.expected_price.toLocaleString()}` 
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Bid Deadline</Typography>
                  <Typography variant="body1">
                    {selectedQuotation.bid_deadline 
                      ? new Date(selectedQuotation.bid_deadline).toLocaleDateString() 
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Created At</Typography>
                  <Typography variant="body1">
                    {new Date(selectedQuotation.created_at).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
              <Button 
                onClick={() => {
                  setOpenViewDialog(false);
                  handleEditClick(selectedQuotation);
                }} 
                color="primary"
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Quotation Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Quotation</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="item_name"
                label="Item Name"
                value={quotationForm.item_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                value={quotationForm.quantity}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={quotationForm.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="delivery_location"
                label="Delivery Location"
                value={quotationForm.delivery_location}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Delivery Timeline"
                  value={quotationForm.delivery_timeline}
                  onChange={(date) => handleDateChange('delivery_timeline', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="expected_price"
                label="Expected Price ($)"
                type="number"
                value={quotationForm.expected_price}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Bid Deadline"
                  value={quotationForm.bid_deadline}
                  onChange={(date) => handleDateChange('bid_deadline', date)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={updateQuotation} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this quotation?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={deleteQuotation} 
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BiddingSystem;