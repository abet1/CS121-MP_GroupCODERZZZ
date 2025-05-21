// Import necessary React hooks and utilities
import React, { createContext, useContext, useState, useEffect } from 'react';

/* Create CartContext
 * This context will be used to provide shopping cart state and methods
 * throughout the application
 */
const CartContext = createContext();

/* useCart Custom Hook
 * A custom hook that provides access to the cart context
 * Throws an error if used outside of CartProvider
 * @returns {Object} The cart context value containing cart state and methods
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

/* CartProvider Component
 * A provider component that manages shopping cart state
 * and provides it to all child components
 * 
 * Features:
 * - Cart state management with localStorage persistence
 * - Add/remove items from cart
 * - Update item quantities
 * - Clear cart
 * - Calculate cart totals and item count
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 */
export const CartProvider = ({ children }) => {
  /* Initialize cart state from localStorage
   * If no saved cart exists, initialize with empty array
   * Uses lazy initialization with useState callback
   */
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  /* Effect hook to persist cart state to localStorage
   * Runs whenever cart state changes
   * Saves cart data as JSON string
   */
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  /* Add item to cart
   * If item already exists, increases quantity
   * If item is new, adds it to cart
   * 
   * @param {Object} product - The product to add to cart
   * @param {number} quantity - Quantity to add (defaults to 1)
   */
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  /* Remove item from cart
   * Filters out the item with the specified ID
   * 
   * @param {string|number} productId - ID of the product to remove
   */
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  /* Update item quantity
   * Updates the quantity of a specific item
   * Prevents setting quantity below 1
   * 
   * @param {string|number} productId - ID of the product to update
   * @param {number} quantity - New quantity value
   */
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  /* Clear entire cart
   * Resets cart state to empty array
   */
  const clearCart = () => {
    setCart([]);
  };

  /* Calculate total cart value
   * Multiplies each item's price by quantity and sums all items
   * 
   * @returns {number} Total value of all items in cart
   */
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  /* Calculate total number of items in cart
   * Sums the quantity of all items
   * 
   * @returns {number} Total number of items in cart
   */
  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  /* Render CartContext.Provider
   * Provides cart state and methods to all child components
   */
  return (
    <CartContext.Provider
      value={{
        cart,           // Current cart state
        addToCart,      // Function to add items to cart
        removeFromCart, // Function to remove items from cart
        updateQuantity, // Function to update item quantities
        clearCart,      // Function to clear entire cart
        getCartTotal,   // Function to calculate cart total
        getCartCount,   // Function to calculate total items
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 