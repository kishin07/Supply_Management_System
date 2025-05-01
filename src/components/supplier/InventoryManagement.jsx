import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../supabase';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const InventoryManagement = ({ setSelectedView }) => {
  const { currentUser } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    item_name: '',
    item_quantity: '',
    item_category: '',
    item_status: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch inventory items from Supabase
  useEffect(() => {
    const fetchInventory = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('supplier_items')
          .select('*')
          .eq('supplier_id', currentUser.id);

        if (error) throw error;
        
        setInventory(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to load inventory items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [currentUser]);

  const handleOpenDialog = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        item_name: item.item_name,
        item_quantity: item.item_quantity,
        item_category: item.item_category,
        item_status: item.item_status
      });
    } else {
      setSelectedItem(null);
      setFormData({
        item_name: '',
        item_quantity: '',
        item_category: '',
        item_status: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({
      item_name: '',
      item_quantity: '',
      item_category: '',
      item_status: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'You must be logged in to perform this action',
        severity: 'error'
      });
      return;
    }

    try {
      if (selectedItem) {
        // Update existing item
        const { error } = await supabase
          .from('supplier_items')
          .update({
            item_name: formData.item_name,
            item_quantity: formData.item_quantity,
            item_category: formData.item_category,
            item_status: formData.item_status
          })
          .eq('item_id', selectedItem.item_id);

        if (error) throw error;

        // Update local state
        setInventory(prev =>
          prev.map(item =>
            item.item_id === selectedItem.item_id ? { ...item, ...formData } : item
          )
        );

        setSnackbar({
          open: true,
          message: 'Item updated successfully',
          severity: 'success'
        });
      } else {
        // Add new item
        const { data, error } = await supabase
          .from('supplier_items')
          .insert([
            {
              item_name: formData.item_name,
              item_quantity: formData.item_quantity,
              item_category: formData.item_category,
              item_status: formData.item_status,
              supplier_id: currentUser.id
            }
          ])
          .select();

        if (error) throw error;

        // Update local state with the returned data
        if (data && data.length > 0) {
          setInventory(prev => [...prev, data[0]]);
        }

        setSnackbar({
          open: true,
          message: 'Item added successfully',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error saving item:', err);
      setSnackbar({
        open: true,
        message: `Failed to save item: ${err.message}`,
        severity: 'error'
      });
    } finally {
      handleCloseDialog();
    }
  };

  const handleDelete = async (itemId) => {
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'You must be logged in to perform this action',
        severity: 'error'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('supplier_items')
        .delete()
        .eq('item_id', itemId);

      if (error) throw error;

      // Update local state
      setInventory(prev => prev.filter(item => item.item_id !== itemId));

      setSnackbar({
        open: true,
        message: 'Item deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting item:', err);
      setSnackbar({
        open: true,
        message: `Failed to delete item: ${err.message}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="primary" 
            sx={{ mr: 2 }}
            onClick={() => setSelectedView('dashboard')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Inventory Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Item
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No inventory items found. Add your first item using the button above.
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item) => (
                  <TableRow key={item.item_id}>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell>{item.item_quantity}</TableCell>
                    <TableCell>{item.item_category}</TableCell>
                    <TableCell>{item.item_status}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(item.item_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="item_name"
            label="Item Name"
            type="text"
            fullWidth
            value={formData.item_name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="item_quantity"
            label="Quantity"
            type="number"
            fullWidth
            value={formData.item_quantity}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="item_category"
            label="Category"
            type="text"
            fullWidth
            value={formData.item_category}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="item_status"
            label="Status"
            type="text"
            fullWidth
            value={formData.item_status}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InventoryManagement;