// App.js
import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Button, 
  TextField, 
  Box, 
  Paper, 
  Divider, 
  IconButton, 
  ToggleButton, 
  ToggleButtonGroup, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Snackbar,
  Alert,
  useMediaQuery,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  InputAdornment
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Add as AddIcon, 
  Remove as RemoveIcon, 
  Delete as DeleteIcon, 
  Person as PersonIcon,
  Receipt as ReceiptIcon, 
  ShoppingCart as CartIcon,
  AccessTime as AccessTimeIcon,
  LocalDining as DiningIcon,
  TakeoutDining as TakeoutIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';

// Import images from assets folder
import burgerImg from '../src/assets/food.png';


// Mock Data
const mockProducts = [
  { id: 1, name: 'Burger', price: 8.99, category: 'food', image: burgerImg },
  { id: 2, name: 'Pizza', price: 12.99, category: 'food', image: burgerImg },
  { id: 3, name: 'Fries', price: 4.99, category: 'sides', image: burgerImg },
  { id: 4, name: 'Salad', price: 7.99, category: 'food', image: burgerImg },
  { id: 5, name: 'Cola', price: 2.99, category: 'drinks', image: burgerImg },
  { id: 6, name: 'Milkshake', price: 5.99, category: 'drinks', image: burgerImg },
  { id: 7, name: 'Ice Cream', price: 3.99, category: 'desserts', image: burgerImg },
  { id: 8, name: 'Chicken Wings', price: 9.99, category: 'food', image: burgerImg }
];

const categories = ['All', 'food', 'drinks', 'sides', 'desserts'];

// Theme - Orange and White
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B00', // Orange
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#FF9A3D', // Lighter Orange
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#333333',
      secondary: '#666666'
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FF6B00'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 8
        }
      }
    }
  }
});

function App() {
  // States
  const [activeStep, setActiveStep] = useState(0);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState('dineIn');
  const [paymentOption, setPaymentOption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderCompleteDialog, setOrderCompleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Filtered products based on category and search
  const filteredProducts = mockProducts.filter(product => 
    (selectedCategory === 'All' || product.category === selectedCategory) &&
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate change
  const calculateChange = () => {
    const received = parseFloat(amountReceived) || 0;
    const total = calculateTotal();
    return Math.max(received - total, 0).toFixed(2);
  };

  // Handle adding products to cart
  const addToCart = (product) => {
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    setSnackbar({ open: true, message: `${product.name} added to cart`, severity: 'success' });
  };

  // Handle removing products from cart
  const removeFromCart = (id) => {
    const existingItemIndex = cart.findIndex(item => item.id === id);
    const updatedCart = [...cart];
    
    if (updatedCart[existingItemIndex].quantity > 1) {
      updatedCart[existingItemIndex].quantity -= 1;
      setCart(updatedCart);
    } else {
      setCart(cart.filter(item => item.id !== id));
    }
  };

  // Delete item from cart
  const deleteFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0 && cart.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add at least one product to the cart',
        severity: 'error'
      });
      return;
    }

    if (activeStep === 1 && !customerName) {
      setSnackbar({
        open: true,
        message: 'Please enter customer name',
        severity: 'error'
      });
      return;
    }

    if (activeStep === 2 && paymentOption === 'payNow' && (!amountReceived || parseFloat(amountReceived) < calculateTotal())) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid amount',
        severity: 'error'
      });
      return;
    }

    if (activeStep === 2) {
      completeOrder();
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle back
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Complete order
  const completeOrder = () => {
    setOrderNumber(Math.floor(1000 + Math.random() * 9000));
    setOrderCompleteDialog(true);
  };

  // Handle new order
  const handleNewOrder = () => {
    setCart([]);
    setCustomerName('');
    setOrderType('dineIn');
    setPaymentOption('');
    setAmountReceived('');
    setActiveStep(0);
    setOrderCompleteDialog(false);
  };

  // Steps for the stepper
  const steps = ['Select Products', 'Customer Details', 'Payment'];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              POS System
            </Typography>
            {activeStep > 0 && (
              <IconButton color="inherit" onClick={handleBack}>
                <ArrowBackIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
        
        {/* Stepper removed as requested */}
        
        <Container sx={{ flexGrow: 1, overflow: 'auto', py: 2 }}>
          {/* Step 1: Product Selection */}
          {activeStep === 0 && (
            <Box>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search products..."
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Box>
                
                <Tabs
                  value={selectedCategory}
                  onChange={(e, newValue) => setSelectedCategory(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ mb: 2 }}
                >
                  {categories.map((category) => (
                    <Tab key={category} label={category} value={category} />
                  ))}
                </Tabs>
                
                <Grid container spacing={2}>
                  {filteredProducts.map((product) => (
                    <Grid item xs={6} sm={4} key={product.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={product.image}
                          alt={product.name}
                        />
                        <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                          <Typography gutterBottom variant="subtitle1" component="div">
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            ${product.price.toFixed(2)}
                          </Typography>
                          
                          {cart.find(item => item.id === product.id) ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IconButton 
                                size="small" 
                                onClick={() => removeFromCart(product.id)}
                                sx={{ color: 'primary.main' }}
                              >
                                <RemoveIcon />
                              </IconButton>
                              <Typography sx={{ mx: 1 }}>
                                {cart.find(item => item.id === product.id).quantity}
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={() => addToCart(product)}
                                sx={{ color: 'primary.main' }}
                              >
                                <AddIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<AddIcon />}
                              onClick={() => addToCart(product)}
                              fullWidth
                            >
                              Add
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
              
              {cart.length > 0 && (
                <Paper sx={{ p: 2, position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2">
                        {cart.reduce((total, item) => total + item.quantity, 0)} items
                      </Typography>
                      <Typography variant="h6">
                        ${calculateTotal().toFixed(2)}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          )}
          
          {/* Step 2: Customer Details and Order Review */}
          {activeStep === 1 && (
            <Box>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Customer Details
                </Typography>
                
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  margin="normal"
                  required
                />
                
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Order Type
                </Typography>
                
                <ToggleButtonGroup
                  value={orderType}
                  exclusive
                  onChange={(e, newValue) => newValue && setOrderType(newValue)}
                  aria-label="order type"
                  fullWidth
                >
                  <ToggleButton value="dineIn" aria-label="dine in">
                    <DiningIcon sx={{ mr: 1 }} /> Dine In
                  </ToggleButton>
                  <ToggleButton value="takeOut" aria-label="take out">
                    <TakeoutIcon sx={{ mr: 1 }} /> Take Out
                  </ToggleButton>
                </ToggleButtonGroup>
              </Paper>
              
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                
                <List disablePadding>
                  {cart.map((item) => (
                    <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                      <ListItemText
                        primary={item.name}
                        secondary={`$${item.price.toFixed(2)} x ${item.quantity}`}
                      />
                      <Typography variant="body2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Total" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      ${calculateTotal().toFixed(2)}
                    </Typography>
                  </ListItem>
                </List>
              </Paper>
              
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Payment Option
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    startIcon={<AttachMoneyIcon />}
                    onClick={() => {
                      setPaymentOption('payNow');
                      handleNext();
                    }}
                    fullWidth
                  >
                    Pay Now
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="large"
                    startIcon={<AccessTimeIcon />}
                    onClick={() => {
                      setPaymentOption('payLater');
                      handleNext();
                    }}
                    fullWidth
                  >
                    Pay Later
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}
          
          {/* Step 3: Payment */}
          {activeStep === 2 && (
            <Box>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {paymentOption === 'payNow' ? 'Payment Details' : 'Order Confirmation'}
                </Typography>
                
                <List disablePadding>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemText primary="Customer" />
                    <Typography variant="body1">{customerName}</Typography>
                  </ListItem>
                  
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemText primary="Order Type" />
                    <Typography variant="body1">
                      {orderType === 'dineIn' ? 'Dine In' : 'Take Out'}
                    </Typography>
                  </ListItem>
                  
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemText primary="Payment" />
                    <Typography variant="body1">
                      {paymentOption === 'payNow' ? 'Pay Now' : 'Pay Later'}
                    </Typography>
                  </ListItem>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  {cart.map((item) => (
                    <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                      <ListItemText
                        primary={item.name}
                        secondary={`$${item.price.toFixed(2)} x ${item.quantity}`}
                      />
                      <Typography variant="body2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Total" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      ${calculateTotal().toFixed(2)}
                    </Typography>
                  </ListItem>
                </List>
                
                {paymentOption === 'payNow' && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Amount Received"
                      value={amountReceived}
                      onChange={(e) => {
                        // Only allow numbers and decimals
                        const re = /^[0-9]*\.?[0-9]*$/;
                        if (e.target.value === '' || re.test(e.target.value)) {
                          setAmountReceived(e.target.value);
                        }
                      }}
                      margin="normal"
                      type="text"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                    
                    {amountReceived && parseFloat(amountReceived) >= calculateTotal() && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'white' }}>
                          Change:
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                          ${calculateChange()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
                
                {paymentOption === 'payLater' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    This order will be saved for later payment.
                  </Alert>
                )}
              </Paper>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  size="large"
                  fullWidth
                >
                  {paymentOption === 'payNow' ? 'Complete Payment' : 'Save Order'}
                </Button>
              </Box>
            </Box>
          )}
        </Container>
        
        {/* Order Complete Dialog */}
        <Dialog open={orderCompleteDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
            {paymentOption === 'payNow' ? 'Payment Successful!' : 'Order Saved Successfully!'}
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pt: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
              Order #{orderNumber}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Customer: {customerName}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Order Type: {orderType === 'dineIn' ? 'Dine In' : 'Take Out'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Total: ${calculateTotal().toFixed(2)}
            </Typography>
            
            {paymentOption === 'payNow' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">
                  Amount Received: ${amountReceived}
                </Typography>
                <Typography variant="subtitle1">
                  Change: ${calculateChange()}
                </Typography>
              </Box>
            )}
            
            {paymentOption === 'payLater' && (
              <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                Remind the customer that payment is pending.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleNewOrder}
            >
              New Order
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;