import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  CreditCard as CreditCardIcon,
  LocalShipping as ShippingIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Home as HomeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Checkout = ({ setConsumerView }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Load cart from localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // State for checkout process
  const [activeStep, setActiveStep] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: currentUser?.name || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    phone: ''
  });
  
  // List of Indian states for dropdown
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 
    'Lakshadweep', 'Puducherry'
  ];
  
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [showCardDetails, setShowCardDetails] = useState(false);
  
  // Form validation states
  const [shippingErrors, setShippingErrors] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});
  
  // Calculate cart totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shippingCost + tax;
  
  // Steps for the checkout process
  const steps = ['Shopping Cart', 'Shipping Address', 'Payment Method', 'Review Order'];
  
  // Handle shipping form changes
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (shippingErrors[name]) {
      setShippingErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle payment form changes
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (paymentErrors[name]) {
      setPaymentErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate shipping form
  const validateShippingForm = () => {
    const errors = {};
    
    if (!shippingAddress.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!shippingAddress.addressLine1.trim()) {
      errors.addressLine1 = 'Address is required';
    }
    
    if (!shippingAddress.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!shippingAddress.state.trim()) {
      errors.state = 'State is required';
    }
    
    if (!shippingAddress.pinCode.trim()) {
      errors.pinCode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(shippingAddress.pinCode.trim())) {
      errors.pinCode = 'Invalid PIN code format. Indian PIN codes must be 6 digits';
    }
    
    if (!shippingAddress.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^(\+91[\-\s]?)?[0]?[6789]\d{9}$/.test(shippingAddress.phone.trim())) {
      errors.phone = 'Invalid phone format. Use 10 digits or +91 followed by 10 digits';
    }
    
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate payment form
  const validatePaymentForm = () => {
    if (paymentMethod !== 'creditCard') return true;
    
    const errors = {};
    
    if (!cardDetails.cardNumber.trim()) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Invalid card number';
    }
    
    if (!cardDetails.cardName.trim()) {
      errors.cardName = 'Name on card is required';
    }
    
    if (!cardDetails.expiryDate.trim()) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
      errors.expiryDate = 'Invalid format. Use MM/YY';
    }
    
    if (!cardDetails.cvv.trim()) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      errors.cvv = 'Invalid CVV';
    }
    
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    // Validate current step before proceeding
    if (activeStep === 1 && !validateShippingForm()) {
      setSnackbarMessage('Please fill all required fields correctly');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (activeStep === 2 && !validatePaymentForm()) {
      setSnackbarMessage('Please fill all payment details correctly');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (activeStep === 3) {
      // Process order
      placeOrder();
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Place order
  const placeOrder = () => {
    // Generate a numeric-only order number
    const timestamp = Date.now().toString();
    const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const newOrderNumber = timestamp + randomDigits;
    setOrderNumber(newOrderNumber);
    
    // Create order object
    const order = {
      id: Date.now(),
      orderNumber: newOrderNumber,
      customerId: currentUser?.id,
      customerName: currentUser?.name || shippingAddress.fullName,
      items: [...cart],
      shippingAddress: {...shippingAddress},
      paymentMethod: paymentMethod,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Processing',
      totalAmount: total
    };
    
    // Get existing orders or initialize empty array
    const existingOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    
    // Add new order
    const updatedOrders = [...existingOrders, order];
    
    // Save to localStorage
    localStorage.setItem('customerOrders', JSON.stringify(updatedOrders));
    
    // Clear cart
    localStorage.setItem('cart', JSON.stringify([]));
    setCart([]);
    
    // Show success message
    setSnackbarMessage('Order placed successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Set order complete
    setOrderComplete(true);
  };
  
  // Render cart items
  const renderCartItems = () => {
    if (cart.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            onClick={() => setConsumerView('browseProducts')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Box>
      );
    }
    
    return (
      <>
        <List>
          {cart.map((item) => (
            <ListItem key={item.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar alt={item.name} src={item.image} variant="rounded" />
              </ListItemAvatar>
              <ListItemText
                primary={item.name}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </Typography>
                }
              />
              <Typography variant="body1">
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ px: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body1">Subtotal</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body1">Shipping</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body1">
                {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body1">Tax</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body1">${tax.toFixed(2)}</Typography>
            </Grid>
            
            <Grid item xs={6} sx={{ mt: 2 }}>
              <Typography variant="h6">Total</Typography>
            </Grid>
            <Grid item xs={6} sx={{ mt: 2, textAlign: 'right' }}>
              <Typography variant="h6">${total.toFixed(2)}</Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => setConsumerView('browseProducts')}
          >
            Back to Shopping
          </Button>
          <Button 
            variant="contained" 
            endIcon={<ArrowForwardIcon />}
            onClick={handleNext}
          >
            Proceed to Shipping
          </Button>
        </Box>
      </>
    );
  };
  
  // Render shipping form
  const renderShippingForm = () => {
    return (
      <>
        <Typography variant="h6" gutterBottom>Shipping Address</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Full Name"
              name="fullName"
              value={shippingAddress.fullName}
              onChange={handleShippingChange}
              error={!!shippingErrors.fullName}
              helperText={shippingErrors.fullName}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Address Line 1"
              name="addressLine1"
              value={shippingAddress.addressLine1}
              onChange={handleShippingChange}
              error={!!shippingErrors.addressLine1}
              helperText={shippingErrors.addressLine1}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 2 (Optional)"
              name="addressLine2"
              value={shippingAddress.addressLine2}
              onChange={handleShippingChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="City"
              name="city"
              value={shippingAddress.city}
              onChange={handleShippingChange}
              error={!!shippingErrors.city}
              helperText={shippingErrors.city}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!shippingErrors.state}>
              <InputLabel id="state-select-label">State</InputLabel>
              <Select
                labelId="state-select-label"
                name="state"
                value={shippingAddress.state}
                label="State"
                onChange={handleShippingChange}
              >
                {indianStates.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
              {shippingErrors.state && (
                <Typography variant="caption" color="error">
                  {shippingErrors.state}
                </Typography>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="PIN Code"
              name="pinCode"
              value={shippingAddress.pinCode}
              onChange={handleShippingChange}
              error={!!shippingErrors.pinCode}
              helperText={shippingErrors.pinCode || "6-digit PIN code"}
              inputProps={{ maxLength: 6 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Country"
              name="country"
              value={shippingAddress.country}
              onChange={handleShippingChange}
              disabled
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Phone Number"
              name="phone"
              value={shippingAddress.phone}
              onChange={handleShippingChange}
              error={!!shippingErrors.phone}
              helperText={shippingErrors.phone || "10-digit mobile number or with +91 prefix"}
              placeholder="+91 9876543210"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back to Cart
          </Button>
          <Button 
            variant="contained" 
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
          >
            Continue to Payment
          </Button>
        </Box>
      </>
    );
  };
  
  // Render payment form
  const renderPaymentForm = () => {
    return (
      <>
        <Typography variant="h6" gutterBottom>Payment Method</Typography>
        
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <RadioGroup
            name="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel 
              value="creditCard" 
              control={<Radio />} 
              label="Credit / Debit Card" 
            />
            <FormControlLabel 
              value="paypal" 
              control={<Radio />} 
              label="PayPal" 
            />
            <FormControlLabel 
              value="applePay" 
              control={<Radio />} 
              label="Apple Pay" 
            />
          </RadioGroup>
        </FormControl>
        
        {paymentMethod === 'creditCard' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Card Number"
                name="cardNumber"
                value={cardDetails.cardNumber}
                onChange={handlePaymentChange}
                error={!!paymentErrors.cardNumber}
                helperText={paymentErrors.cardNumber}
                placeholder="1234 5678 9012 3456"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CreditCardIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Name on Card"
                name="cardName"
                value={cardDetails.cardName}
                onChange={handlePaymentChange}
                error={!!paymentErrors.cardName}
                helperText={paymentErrors.cardName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Expiry Date"
                name="expiryDate"
                value={cardDetails.expiryDate}
                onChange={handlePaymentChange}
                error={!!paymentErrors.expiryDate}
                helperText={paymentErrors.expiryDate}
                placeholder="MM/YY"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="CVV"
                name="cvv"
                type={showCardDetails ? 'text' : 'password'}
                value={cardDetails.cvv}
                onChange={handlePaymentChange}
                error={!!paymentErrors.cvv}
                helperText={paymentErrors.cvv}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCardDetails(!showCardDetails)}
                        edge="end"
                      >
                        {showCardDetails ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        )}
        
        {paymentMethod !== 'creditCard' && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You will be redirected to complete your payment after reviewing your order.
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back to Shipping
          </Button>
          <Button 
            variant="contained" 
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
          >
            Review Order
          </Button>
        </Box>
      </>
    );
  };
  
  // Render order review
  const renderOrderReview = () => {
    return (
      <>
        <Typography variant="h6" gutterBottom>Order Review</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Shipping Address
                </Typography>
                <Typography variant="body1">{shippingAddress.fullName}</Typography>
                <Typography variant="body2">{shippingAddress.addressLine1}</Typography>
                {shippingAddress.addressLine2 && (
                  <Typography variant="body2">{shippingAddress.addressLine2}</Typography>
                )}
                <Typography variant="body2">
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </Typography>
                <Typography variant="body2">{shippingAddress.country}</Typography>
                <Typography variant="body2">{shippingAddress.phone}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CreditCardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Payment Method
                </Typography>
                {paymentMethod === 'creditCard' ? (
                  <>
                    <Typography variant="body1">Credit Card</Typography>
                    <Typography variant="body2">
                      **** **** **** {cardDetails.cardNumber.slice(-4)}
                    </Typography>
                    <Typography variant="body2">{cardDetails.cardName}</Typography>
                    <Typography variant="body2">Expires: {cardDetails.expiryDate}</Typography>
                  </>
                ) : (
                  <Typography variant="body1">
                    {paymentMethod === 'paypal' ? 'PayPal' : 'Apple Pay'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Order Items</Typography>
        
        <List>
          {cart.map((item) => (
            <ListItem key={item.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar alt={item.name} src={item.image} variant="rounded" />
              </ListItemAvatar>
              <ListItemText
                primary={item.name}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </Typography>
                }
              />
              <Typography variant="body1">
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ px: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body1">Subtotal</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body1">Shipping</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body1">
                {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body1">Tax</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body1">${tax.toFixed(2)}</Typography>
            </Grid>
            
            <Grid item xs={6} sx={{ mt: 2 }}>
              <Typography variant="h6">Total</Typography>
            </Grid>
            <Grid item xs={6} sx={{ mt: 2, textAlign: 'right' }}>
              <Typography variant="h6">${total.toFixed(2)}</Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back to Payment
          </Button>
          <Button 
            variant="contained" 
            onClick={handleNext}
            endIcon={<CheckIcon />}
            color="success"
          >
            Place Order
          </Button>
        </Box>
      </>
    );
  };
  
  // Render order confirmation
  const renderOrderConfirmation = () => {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" gutterBottom>Thank You!</Typography>
        <Typography variant="h6" gutterBottom>Your order has been placed successfully</Typography>
        <Typography variant="body1" gutterBottom>Order Number: {orderNumber}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          We've sent a confirmation email with your order details.
        </Typography>
        
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button 
              variant="contained" 
              startIcon={<HomeIcon />}
              onClick={() => setConsumerView('dashboard')}
            >
              Back to Dashboard
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined"
              onClick={() => setConsumerView('orderHistory')}
            >
              View Order History
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderCartItems();
      case 1:
        return renderShippingForm();
      case 2:
        return renderPaymentForm();
      case 3:
        return renderOrderReview();
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Order Complete Dialog */}
      <Dialog
        open={orderComplete}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          {renderOrderConfirmation()}
        </DialogContent>
      </Dialog>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>Checkout</Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 2 }}>
          {getStepContent(activeStep)}
        </Box>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Checkout;