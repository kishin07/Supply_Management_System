import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

const ConsumerInventory = ({ setCompanyView }) => {
  const { currentUser } = useAuth();
  
  // Load consumer products from localStorage or use mock data
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('consumerProducts');
    return savedProducts ? JSON.parse(savedProducts) : [
      {
        id: 301,
        name: 'Tropical Mango Juice',
        category: 'Fruit Juice',
        brand: 'FreshFruit',
        price: 3.99,
        image: 'https://static.vecteezy.com/system/resources/previews/045/933/083/non_2x/tropical-delight-mango-juice-and-slices-cut-outs-free-png.png',
        inStock: true,
        stockQuantity: 150,
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
        stockQuantity: 120,
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
        stockQuantity: 200,
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
        stockQuantity: 0,
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
        stockQuantity: 180,
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
        stockQuantity: 130,
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
        stockQuantity: 90,
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
        stockQuantity: 110,
        description: 'Pure pomegranate juice. Rich in antioxidants.',
        volume: '750ml',
        tags: ['antioxidants', 'heart-healthy']
      }
    ];
  });

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('consumerProducts', JSON.stringify(products));
  }, [products]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    category: '',
    brand: '',
    price: 0,
    image: '',
    inStock: true,
    stockQuantity: 0,
    description: '',
    volume: '',
    tags: []
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Categories for dropdown
  const categories = [
    'Fruit Juice',
    'Smoothie',
    'Natural Drinks',
    'Energy Drinks',
    'Carbonated Drinks',
    'Water'
  ];

  // Brands for dropdown
  const brands = [
    'FreshFruit',
    'SmoothBlend',
    'CitrusFresh',
    'TropicCoco',
    'TropicalTaste',
    'HerbaTea'
  ];

  // Handle dialog open for adding new product
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormData({
      id: Math.max(0, ...products.map(p => p.id)) + 1,
      name: '',
      category: '',
      brand: '',
      price: 0,
      image: '',
      inStock: true,
      stockQuantity: 0,
      description: '',
      volume: '',
      tags: []
    });
    setOpenDialog(true);
  };

  // Handle dialog open for editing product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      ...product,
      tags: product.tags ? product.tags : []
    });
    setOpenDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'price' || name === 'stockQuantity') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle tags input (comma separated)
  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setFormData({ ...formData, tags: tagsArray });
  };

  // Handle save product
  const handleSaveProduct = () => {
    // Validate form data
    if (!formData.name || !formData.category || !formData.brand || formData.price <= 0) {
      setSnackbarMessage('Please fill all required fields');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // If product is not in stock, set quantity to 0
    const updatedFormData = {
      ...formData,
      stockQuantity: formData.inStock ? formData.stockQuantity : 0
    };

    if (selectedProduct) {
      // Update existing product
      const updatedProducts = products.map(p => 
        p.id === selectedProduct.id ? updatedFormData : p
      );
      setProducts(updatedProducts);
      setSnackbarMessage('Product updated successfully');
    } else {
      // Add new product
      setProducts([...products, updatedFormData]);
      setSnackbarMessage('Product added successfully');
    }

    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    setOpenDialog(false);
  };

  // Handle delete product
  const handleDeleteProduct = (productId) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    setSnackbarMessage('Product deleted successfully');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  // Handle stock toggle
  const handleStockToggle = (productId, newStatus) => {
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          inStock: newStatus,
          stockQuantity: newStatus ? p.stockQuantity : 0
        };
      }
      return p;
    });
    setProducts(updatedProducts);
    setSnackbarMessage(`Product ${newStatus ? 'marked as in stock' : 'marked as out of stock'}`);
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  // Handle stock quantity update
  const handleStockUpdate = (productId, newQuantity) => {
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stockQuantity: parseInt(newQuantity) || 0,
          inStock: parseInt(newQuantity) > 0
        };
      }
      return p;
    });
    setProducts(updatedProducts);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => setCompanyView('dashboard')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Consumer Inventory Management
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <InventoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Product Inventory
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
          >
            Add New Product
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Availability</TableCell>
                <TableCell>Stock Quantity</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={product.inStock}
                          onChange={(e) => handleStockToggle(product.id, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={product.inStock ? "In Stock" : "Out of Stock"}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={product.stockQuantity}
                      onChange={(e) => handleStockUpdate(product.id, e.target.value)}
                      disabled={!product.inStock}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditProduct(product)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteProduct(product.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Product Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Product Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Brand</InputLabel>
                <Select
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  label="Brand"
                >
                  {brands.map((brand) => (
                    <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
                required
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="image"
                label="Image URL"
                value={formData.image}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="In Stock"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="stockQuantity"
                label="Stock Quantity"
                type="number"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                fullWidth
                disabled={!formData.inStock}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="volume"
                label="Volume"
                value={formData.volume}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="tags"
                label="Tags (comma separated)"
                value={formData.tags.join(', ')}
                onChange={handleTagsChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConsumerInventory;