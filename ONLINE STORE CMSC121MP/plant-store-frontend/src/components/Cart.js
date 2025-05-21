// Import necessary React hooks and custom hooks for routing, cart management, and authentication
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createSoldProduct } from '../api';

/* Cart component - Main shopping cart page that handles:
 * - Displaying cart items
 * - Quantity updates
 * - Checkout process
 * - Order submission
 * - Address management
 */
const Cart = () => {
  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  // Authentication context values
  const { user, isAuthenticated } = useAuth();
  // Cart management functions from context
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  
  // State for modal and checkout process
  const [isModalOpen, setIsModalOpen] = useState(false);          // Controls shipping modal
  const [shippingAddress, setShippingAddress] = useState('');    // Custom shipping address
  const [useAccountAddress, setUseAccountAddress] = useState(false); // Use saved address toggle
  const [isSubmitting, setIsSubmitting] = useState(false);       // Order submission state
  const [error, setError] = useState('');                        // Error message handling
  const [showToast, setShowToast] = useState(false);            // Success notification

  /* handleCheckout - Processes the checkout flow:
   * 1. Validates authentication
   * 2. Validates shipping address
   * 3. Creates order records
   * 4. Handles success/error states
   */
  const handleCheckout = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Validate shipping address input
    if (!useAccountAddress && !shippingAddress.trim()) {
      setError('Please enter your shipping address');
      return;
    }

    // Begin checkout process
    setIsSubmitting(true);
    setError('');

    try {
      // Create order records for each cart item
      const soldProducts = await Promise.all(
        cart.map(item =>
          createSoldProduct({
            product_id: item.id,
            quantity: item.quantity,
            total_price: parseFloat((item.price * item.quantity).toFixed(2)),
            status: 'Pending',
            shipping_address: useAccountAddress ? user.address : shippingAddress.trim()
          })
        )
      );

      // Handle successful order creation
      if (soldProducts.every(sp => sp.data)) {
        setShowToast(true);
        clearCart();
        setIsModalOpen(false);
        setShippingAddress('');
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    } catch (error) {
      // Error handling for checkout process
      console.error('Checkout failed:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.quantity) {
          setError(`Checkout failed: ${errorData.quantity}`);
        } else {
          setError(`Checkout failed: ${JSON.stringify(errorData)}`);
        }
      } else {
        setError('Checkout failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Success notification toast - Appears after successful order placement */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-secondary text-primary px-8 py-4 rounded-lg shadow-xl z-[100] flex items-center space-x-3 animate-fade-in-up">
          <div className="bg-primary rounded-full p-1">
            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-lg font-semibold">Order placed successfully!</span>
        </div>
      )}

      {/* Main navigation bar */}
      <nav className="bg-primary py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img 
                src="/garden-of-eden-logo.png" 
                alt="Garden of Eden" 
                className="h-12 w-auto"
              />
              <span className="text-white text-2xl font-bold">Garden of Eden</span>
            </a>
            <div className="hidden md:flex space-x-8">
              <a href="/" className="text-white hover:text-secondary transition-colors">Home</a>
              <a href="/shop" className="text-white hover:text-secondary transition-colors">Shop</a>
              <a href="/blog" className="text-white hover:text-secondary transition-colors">Blog</a>
              <a href="/cart" className="text-white hover:text-secondary transition-colors">Cart</a>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => window.location.href='/login'} 
                className="bg-secondary text-primary px-4 py-2 rounded hover:bg-accent transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => window.location.href='/register'} 
                className="bg-secondary text-primary px-4 py-2 rounded hover:bg-accent transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section with background image */}
      <div className="relative h-[300px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('homepage_background.jpg')" }}
        >
          <div className="absolute inset-0 bg-primary bg-opacity-70 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-5xl font-bold mb-4">Your Cart</h1>
              <p className="text-xl">Review your items and proceed to checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main cart content area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cart items section - Left side */}
          <div className="lg:col-span-3">
            <div className="bg-[#F9F1E7] rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl text-primary font-semibold mb-6">Shopping Cart</h2>
                
                {/* Cart table header */}
                <div className="grid grid-cols-12 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="col-span-4 text-primary font-semibold">Product</div>
                  <div className="col-span-2 text-primary font-semibold text-center">Price</div>
                  <div className="col-span-3 text-primary font-semibold text-center">Quantity</div>
                  <div className="col-span-2 text-primary font-semibold text-center">Subtotal</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Cart items list */}
                <div className="space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-primary text-lg mb-4">Your cart is empty</p>
                      <a 
                        href="/shop" 
                        className="bg-primary text-white px-6 py-2 rounded hover:bg-secondary hover:text-primary transition-colors inline-block"
                      >
                        Continue Shopping
                      </a>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-200">
                        {/* Product details */}
                        <div className="col-span-4 flex items-center space-x-4">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-20 h-20 object-cover rounded"
                          />
                          <h3 className="text-primary font-semibold">{item.name}</h3>
                        </div>

                        {/* Price */}
                        <div className="col-span-2 text-primary text-center">
                          ₱{parseFloat(item.price).toFixed(2)}
                        </div>

                        {/* Quantity controls */}
                        <div className="col-span-3 flex justify-center">
                          <div className="flex items-center border border-primary rounded">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 text-primary hover:bg-primary hover:text-white transition-colors"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-primary">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 text-primary hover:bg-primary hover:text-white transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="col-span-2 text-primary font-semibold text-center">
                          ₱{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>

                        {/* Remove item button */}
                        <div className="col-span-1 text-center">
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order summary section - Right side */}
          <div className="lg:col-span-1">
            <div className="bg-[#F9F1E7] rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl text-primary font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-primary">
                  <span>Subtotal</span>
                  <span>₱{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-primary font-semibold text-lg">
                    <span>Total</span>
                    <span>₱{getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => isAuthenticated ? setIsModalOpen(true) : navigate('/login')}
                  disabled={cart.length === 0}
                  className="w-full bg-primary text-white py-3 rounded hover:bg-secondary hover:text-primary transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping address modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl text-primary font-semibold mb-6">Enter Shipping Address</h2>
            <div className="space-y-4">
              {/* Error message display */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {/* Account address option */}
              {isAuthenticated && (
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="useAccountAddress"
                    checked={useAccountAddress}
                    onChange={(e) => setUseAccountAddress(e.target.checked)}
                    className="rounded border-primary text-primary focus:ring-primary"
                  />
                  <label htmlFor="useAccountAddress" className="text-primary">
                    Use my account address
                  </label>
                </div>
              )}
              {/* Custom address input */}
              {(!isAuthenticated || !useAccountAddress) && (
                <div>
                  <label htmlFor="shippingAddress" className="block text-primary font-medium mb-2">
                    Shipping Address
                  </label>
                  <textarea
                    id="shippingAddress"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your complete shipping address"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows="4"
                    required
                  />
                </div>
              )}
              {/* Display saved account address */}
              {isAuthenticated && useAccountAddress && (
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-primary font-medium mb-2">Your Account Address:</p>
                  <p className="text-primary">{user.address}</p>
                </div>
              )}
              {/* Modal action buttons */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setShippingAddress('');
                    setError('');
                    setUseAccountAddress(false);
                  }}
                  className="px-6 py-2 border border-primary text-primary rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-white rounded hover:bg-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Site footer */}
      <footer className="bg-primary text-white py-16 px-4 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company information */}
          <div>
            <div className="text-xl font-bold mb-4">Garden of Eden</div>
            <div className="text-secondary">Your one-stop shop for all things green.</div>
          </div>
          {/* Quick links */}
          <div>
            <div className="text-xl font-bold mb-4">Quick Links</div>
            <div className="flex flex-col space-y-2">
              <a href="/" className="text-secondary hover:text-accent transition-colors">Home</a>
              <a href="/shop" className="text-secondary hover:text-accent transition-colors">Shop</a>
              <a href="/blog" className="text-secondary hover:text-accent transition-colors">Blog</a>
              <a href="/cart" className="text-secondary hover:text-accent transition-colors">Cart</a>
            </div>
          </div>
          {/* Contact information */}
          <div>
            <div className="text-xl font-bold mb-4">Contact Us</div>
            <div className="flex flex-col space-y-2 text-secondary">
              <p>123 Green St, City</p>
              <p>(555) 123-4567</p>
              <p>info@gardenofeden.com</p>
            </div>
          </div>
        </div>
        {/* Copyright notice */}
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-secondary text-center text-secondary">
          &copy; {new Date().getFullYear()} Garden of Eden. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

// Export Cart component
export default Cart; 