import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  ShoppingBag as PurchaseIcon
} from '@mui/icons-material';

const SavedProducts = ({ dashboardData, setDashboardData }) => {
  // State for saved products from localStorage
  const [savedProducts, setSavedProducts] = useState([]);
  
  // State for snackbar notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // State for purchase dialog
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Load saved products from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('savedProducts');
    if (savedItems) {
      setSavedProducts(JSON.parse(savedItems));
    }
  }, []);
  
  // Update dashboard data when saved products change
  useEffect(() => {
    if (setDashboardData) {
      setDashboardData(prev => ({
        ...prev,
        consumer: {
          ...prev.consumer,
          savedProducts: savedProducts.length
        }
      }));
    }
    
    // Save to localStorage whenever savedProducts changes
    localStorage.setItem('savedProducts', JSON.stringify(savedProducts));
  }, [savedProducts, setDashboardData]);

  const handleRemoveFromSaved = (productId) => {
    // Remove product from saved items
    const updatedSavedProducts = savedProducts.filter(product => product.id !== productId);
    setSavedProducts(updatedSavedProducts);
    
    // Show success message
    setSnackbarMessage('Product removed from saved items');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleAddToCart = (product) => {
    // Get current cart from localStorage
    const currentCart = localStorage.getItem('cart');
    const cart = currentCart ? JSON.parse(currentCart) : [];
    
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Product already in cart, increase quantity
      cart[existingItemIndex].quantity += 1;
    } else {
      // Product not in cart, add it with quantity 1
      cart.push({ ...product, quantity: 1 });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update dashboard data
    if (setDashboardData) {
      setDashboardData(prev => ({
        ...prev,
        consumer: {
          ...prev.consumer,
          cartItems: cart.reduce((total, item) => total + item.quantity, 0),
          cartTotal: cart.reduce((total, item) => total + (item.price * item.quantity), 0)
        }
      }));
    }
    
    // Show success message
    setSnackbarMessage(`${product.name} added to cart`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  const handleInitiatePurchase = (product) => {
    setSelectedProduct(product);
    setPurchaseDialogOpen(true);
  };
  
  const handleConfirmPurchase = () => {
    // Here you would implement the actual purchase logic
    // For now, we'll just show a success message
    setPurchaseDialogOpen(false);
    setSnackbarMessage(`Purchase initiated for ${selectedProduct.name}`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Saved Products ({savedProducts.length})
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Items you've saved for later. Click on a product to view details or add to cart.
        </Typography>

        {savedProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              You don't have any saved products yet.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Browse products and click the heart icon to save items for later.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {savedProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={product.image}
                    alt={product.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {product.category || product.brand} {product.volume && `• ${product.volume}`}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </Typography>
                    {product.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {product.description.length > 60 ? `${product.description.substring(0, 60)}...` : product.description}
                      </Typography>
                    )}
                    <Box sx={{ mt: 1 }}>
                      {product.inStock ? (
                        <Chip label="In Stock" color="success" size="small" />
                      ) : (
                        <Chip label="Out of Stock" color="error" size="small" />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Box>
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveFromSaved(product.id)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleInitiatePurchase(product)}
                        size="small"
                        disabled={!product.inStock}
                      >
                        <PurchaseIcon />
                      </IconButton>
                    </Box>
                    <Button 
                      variant="contained" 
                      size="small" 
                      startIcon={<CartIcon />}
                      disabled={!product.inStock}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {savedProducts.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Saved by Category
          </Typography>
          <Grid container spacing={2}>
            {Array.from(new Set(savedProducts.map(p => p.category || p.brand))).map(category => (
              <Grid item xs={12} sm={4} key={category}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {savedProducts.filter(p => (p.category || p.brand) === category).length}
                    </Typography>
                    <Typography color="text.secondary">
                      {category}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      {/* Purchase Confirmation Dialog */}
      <Dialog
        open={purchaseDialogOpen}
        onClose={() => setPurchaseDialogOpen(false)}
      >
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to purchase {selectedProduct?.name}?
            {selectedProduct && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Price: ${typeof selectedProduct.price === 'number' ? selectedProduct.price.toFixed(2) : selectedProduct.price}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmPurchase} variant="contained" color="primary">
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SavedProducts;