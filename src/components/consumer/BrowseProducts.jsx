import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Divider,
  InputAdornment,
  OutlinedInput,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';

const BrowseProducts = ({ dashboardData, setDashboardData, setConsumerView }) => {
  // Use the currency context for INR conversion
  const { formatPriceSync } = useCurrency();
  // Load cart from localStorage or initialize empty array
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // State for cart drawer and notifications
  const [cartOpen, setCartOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Mock FMCG fruit drinks products data
  const allProducts = [
    {
      id: 301,
      name: 'Tropical Mango Juice',
      category: 'Fruit Juice',
      brand: 'FreshFruit',
      price: 3.99,
      image: 'https://static.vecteezy.com/system/resources/previews/045/933/083/non_2x/tropical-delight-mango-juice-and-slices-cut-outs-free-png.png',
      inStock: true,
      description: 'Natural mango juice with no added sugar. Made from 100% fresh mangoes.',
      volume: '1 liter',
      tags: ['natural', 'no preservatives']
    },
    {
      id: 302,
      name: 'Mixed Berry Smoothie',
      category: 'Smoothie',
      brand: 'SmoothBlend',
      price: 4.49,
      image: 'https://thejoyfilledkitchen.com/wp-content/uploads/2021/05/DSC_0067-2-500x375.jpg?crop=1',
      inStock: true,
      description: 'Blend of strawberries, blueberries and raspberries. Rich in antioxidants.',
      volume: '750ml',
      tags: ['antioxidants', 'vitamin-rich']
    },
    {
      id: 303,
      name: 'Orange Nectar',
      category: 'Fruit Juice',
      brand: 'CitrusFresh',
      price: 2.99,
      image: 'https://images.unsplash.com/photo-1587015990127-424b954e38b5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      inStock: true,
      description: 'Freshly squeezed orange juice with pulp. High in vitamin C.',
      volume: '1 liter',
      tags: ['vitamin C', 'immunity booster']
    },
    {
      id: 304,
      name: 'Apple & Kiwi Juice',
      category: 'Fruit Juice',
      brand: 'FreshFruit',
      price: 3.49,
      image: 'https://www.archanaskitchen.com/images/archanaskitchen/1-Author/sibyl_sunitha/Apple_Kiwi_Pineapple_Juice_Recipe.jpg',
      inStock: false,
      description: 'Refreshing blend of apple and kiwi. No artificial flavors.',
      volume: '750ml',
      tags: ['natural', 'refreshing']
    },
    {
      id: 305,
      name: 'Coconut Water',
      category: 'Natural Drinks',
      brand: 'TropicCoco',
      price: 2.79,
      image: 'https://static.india.com/wp-content/uploads/2024/04/WhatsApp-Image-2024-04-14-at-11.13.02-AM.jpeg?impolicy=Medium_Widthonly&w=400',
      inStock: true,
      description: 'Pure coconut water. Natural electrolytes for hydration.',
      volume: '500ml',
      tags: ['hydration', 'electrolytes']
    },
    {
      id: 306,
      name: 'Pineapple Passion Juice',
      category: 'Fruit Juice',
      brand: 'TropicalTaste',
      price: 3.29,
      image: 'https://barossadistilling.com/wp-content/uploads/2023/11/Cocktails-4.png',
      inStock: true,
      description: 'Sweet pineapple juice with a hint of passion fruit.',
      volume: '1 liter',
      tags: ['tropical', 'sweet']
    },
    {
      id: 307,
      name: 'Green Detox Smoothie',
      category: 'Smoothie',
      brand: 'SmoothBlend',
      price: 4.99,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUYNdOs9705K69pTZYajisWaYGZhM1agqmqA&s',
      inStock: true,
      description: 'Blend of spinach, apple, cucumber and lime. Perfect for detox.',
      volume: '500ml',
      tags: ['detox', 'cleansing']
    },
    {
      id: 308,
      name: 'Pomegranate Juice',
      category: 'Fruit Juice',
      brand: 'CitrusFresh',
      price: 4.79,
      image: 'https://images.stockcake.com/public/6/c/7/6c700625-55b8-412e-8b6d-41b1826663d7_large/pomegranate-juice-glass-stockcake.jpg',
      inStock: true,
      description: 'Pure pomegranate juice. Rich in antioxidants.',
      volume: '750ml',
      tags: ['antioxidants', 'heart-healthy']
    },
    {
      id: 309,
      name: 'Watermelon Cooler',
      category: 'Natural Drinks',
      brand: 'FreshFruit',
      price: 3.19,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1PcT06FvbHIPuWEPplwobCFsqLgPPhbhGew&s',
      inStock: true,
      description: 'Refreshing watermelon juice. Perfect for hot summer days.',
      volume: '1 liter',
      tags: ['hydrating', 'summer']
    },
    {
      id: 310,
      name: 'Blueberry Acai Smoothie',
      category: 'Smoothie',
      brand: 'SmoothBlend',
      price: 5.49,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBtWoJxiuTHG2-HLeLGDjaO0RgilwT1cvymw&s',
      inStock: false,
      description: 'Premium smoothie with blueberries and acai. Superfood blend.',
      volume: '500ml',
      tags: ['superfood', 'energy']
    },
    {
      id: 311,
      name: 'Lemon Ginger Tea',
      category: 'Natural Drinks',
      brand: 'HerbaTea',
      price: 2.99,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6_Usm3yJKblXVagPLvgQM11cShIlDlyE9YA&s',
      inStock: true,
      description: 'Refreshing lemon tea with ginger. Soothes and energizes.',
      volume: '750ml',
      tags: ['immunity', 'digestive']
    },
    {
      id: 312,
      name: 'Grape Juice',
      category: 'Fruit Juice',
      brand: 'TropicalTaste',
      price: 3.59,
      image: 'https://www.saberhealth.com/uploaded/blog/images/grape-juice(1).jpg',
      inStock: true,
      description: 'Pure grape juice from premium grapes. No added sugar.',
      volume: '1 liter',
      tags: ['natural', 'antioxidants']
    }
  ];

  // State for products and filters
  const [products, setProducts] = useState(allProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10]);
  
  // Load saved products from localStorage
  const [savedItems, setSavedItems] = useState(() => {
    const savedProducts = localStorage.getItem('savedProducts');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  // Get unique categories and brands for filters
  const categories = ['all', ...new Set(allProducts.map(product => product.category))];
  const brands = ['all', ...new Set(allProducts.map(product => product.brand))];

  // Filter products when filters change
  useEffect(() => {
    let filtered = allProducts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply brand filter
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    // Apply price range filter
    filtered = filtered.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setProducts(filtered);
  }, [searchTerm, selectedCategory, selectedBrand, priceRange]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update dashboard data to reflect the current cart count
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
  }, [cart, setDashboardData]);

  // Handle adding to cart
  const handleAddToCart = (product) => {
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Product already in cart, increase quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Product not in cart, add it with quantity 1
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    // Show success message
    setSnackbarMessage(`${product.name} added to cart`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  // Handle removing from cart
  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    setSnackbarMessage('Item removed from cart');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  // Handle updating quantity
  const handleUpdateQuantity = (productId, delta) => {
    const updatedCart = cart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(updatedCart);
  };
  
  // Calculate total items in cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total price
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Handle saving for later
  const handleSaveForLater = (product) => {
    // Check if product is already saved
    const isAlreadySaved = savedItems.some(item => item.id === product.id);
    
    if (!isAlreadySaved) {
      // Add current date to the product
      const productWithDate = {
        ...product,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      
      // Update state
      const updatedSavedItems = [...savedItems, productWithDate];
      setSavedItems(updatedSavedItems);
      
      // Save to localStorage
      localStorage.setItem('savedProducts', JSON.stringify(updatedSavedItems));
      
      // Update dashboard data
      if (setDashboardData) {
        setDashboardData(prev => ({
          ...prev,
          consumer: {
            ...prev.consumer,
            savedProducts: updatedSavedItems.length
          }
        }));
      }
      
      // Show notification
      setSnackbarMessage(`${product.name} saved for later`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } else {
      // Product already saved, show notification
      setSnackbarMessage(`${product.name} is already in your saved items`);
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* Cart Button with Badge */}
      <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 2 }}>
        <IconButton 
          color="primary" 
          onClick={() => setCartOpen(true)}
          sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: 1 }}
        >
          <Badge badgeContent={cartItemCount} color="secondary">
            <CartIcon />
          </Badge>
        </IconButton>
      </Box>
      
      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Typography variant="h6" gutterBottom>Your Cart</Typography>
          <Divider sx={{ mb: 2 }} />
          
          {cart.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ my: 4, textAlign: 'center' }}>
              Your cart is empty
            </Typography>
          ) : (
            <>
              <List sx={{ mb: 2 }}>
                {cart.map((item) => (
                  <ListItem key={item.id} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar alt={item.name} src={item.image} variant="rounded" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {formatPriceSync(item.price)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, -1)}>
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                            <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, 1)}>
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {formatPriceSync(item.price * item.quantity)}
                      </Typography>
                      <IconButton edge="end" onClick={() => handleRemoveFromCart(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">Total:</Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {formatPriceSync(cartTotal)}
                </Typography>
              </Box>
              
              <Button 
                variant="contained" 
                fullWidth 
                color="primary"
                onClick={() => {
                  // Use the setConsumerView prop passed from Dashboard
                  setConsumerView('checkout');
                }}
              >
                Checkout
              </Button>
            </>
          )}
        </Box>
      </Drawer>
      
      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <OutlinedInput
              fullWidth
              placeholder="Search fruit drinks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={selectedBrand}
                    label="Brand"
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  >
                    {brands.map(brand => (
                      <MenuItem key={brand} value={brand}>
                        {brand === 'all' ? 'All Brands' : brand}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography gutterBottom>Price Range: {formatPriceSync(priceRange[0])} - {formatPriceSync(priceRange[1])}</Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={10}
                  step={0.5}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Typography variant="subtitle1" gutterBottom>
        Showing {products.length} products
      </Typography>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={product.image}
                alt={product.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {product.brand} • {product.volume}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  {formatPriceSync(product.price)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {product.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {product.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                <Box sx={{ mt: 1 }}>
                  {product.inStock ? (
                    <Chip label="In Stock" color="success" size="small" />
                  ) : (
                    <Chip label="Out of Stock" color="error" size="small" />
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <IconButton 
                  color="primary" 
                  onClick={() => handleSaveForLater(product)}
                  size="small"
                >
                  <FavoriteIcon />
                </IconButton>
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

      {/* No Results Message */}
      {products.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No products match your filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Paper>
      )}
      
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

export default BrowseProducts;