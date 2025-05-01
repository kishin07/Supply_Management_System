import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

const SupplierSelection = ({ setSelectedView }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Load suppliers from localStorage
  useEffect(() => {
    const savedSuppliers = localStorage.getItem('suppliers');
    if (savedSuppliers) {
      const parsedSuppliers = JSON.parse(savedSuppliers);
      setSuppliers(parsedSuppliers);
    } else {
      // If no suppliers in localStorage, use default suppliers
      const defaultSuppliers = [
        {
          id: 1,
          name: 'Supplier A',
          contactPerson: 'John Smith',
          email: 'john@suppliera.com',
          phone: '(555) 123-4567',
          category: 'Fruit Pulp',
          rating: 4.5,
          onTimeDelivery: 95,
          status: 'Active'
        },
        {
          id: 2,
          name: 'Supplier B',
          contactPerson: 'Jane Doe',
          email: 'jane@supplierb.com',
          phone: '(555) 987-6543',
          category: 'Fruit Extract',
          rating: 4.0,
          onTimeDelivery: 88,
          status: 'Active'
        },
        {
          id: 3,
          name: 'Supplier C',
          contactPerson: 'Robert Johnson',
          email: 'robert@supplierc.com',
          phone: '(555) 456-7890',
          category: 'Fruit Concentrate',
          rating: 4.2,
          onTimeDelivery: 92,
          status: 'Active'
        },
        {
          id: 4,
          name: 'Supplier D',
          contactPerson: 'Emily Davis',
          email: 'emily@supplierd.com',
          phone: '(555) 567-8901',
          category: 'Fruit Juice',
          rating: 4.3,
          onTimeDelivery: 90,
          status: 'Active'
        },
        {
          id: 5,
          name: 'Supplier E',
          contactPerson: 'David Wilson',
          email: 'david@suppliere.com',
          phone: '(555) 678-9012',
          category: 'Fruit Powder',
          rating: 4.1,
          onTimeDelivery: 87,
          status: 'Active'
        }
      ];
      setSuppliers(defaultSuppliers);
      localStorage.setItem('suppliers', JSON.stringify(defaultSuppliers));
    }
  }, []);

  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
    setOpenDialog(true);
  };

  const handleConfirmSelection = () => {
    // Update the current user with the selected supplier's ID
    const updatedUser = {
      ...currentUser,
      id: selectedSupplier.id, // This will be used to filter orders
      supplierName: selectedSupplier.name,
      supplierDetails: selectedSupplier
    };
    
    // Update the current user in the auth context
    setCurrentUser(updatedUser);
    
    // Close the dialog
    setOpenDialog(false);
    
    // Navigate to the dashboard
    setSelectedView('dashboard');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Select Your Supplier Account
        </Typography>
        <Typography variant="body1" paragraph align="center" color="text.secondary">
          Please select which supplier you represent to view your specific orders and inventory.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {suppliers.map((supplier) => (
            <Grid item xs={12} sm={6} md={4} key={supplier.id}>
              <Card 
                elevation={3} 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => handleSupplierSelect(supplier)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        bgcolor: 'primary.main',
                        mb: 2
                      }}
                    >
                      <BusinessIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom align="center">
                      {supplier.name}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Category:</strong> {supplier.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Contact:</strong> {supplier.contactPerson}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Rating:</strong> {supplier.rating}/5
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Confirm Selection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to log in as {selectedSupplier?.name}. All orders and inventory will be filtered for this supplier.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmSelection} 
            variant="contained" 
            color="primary"
            endIcon={<ArrowForwardIcon />}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SupplierSelection;