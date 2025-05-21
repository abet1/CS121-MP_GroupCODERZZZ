// Import necessary React hooks and custom hooks for routing and state management
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import API functions for fetching product data
import { getProducts, getSoldProducts } from '../api';
// Import cart context hook for managing shopping cart
import { useCart } from '../context/CartContext';

/* HomePage Component
 * Main landing page of the Garden of Eden plant store
 * Features:
 * - Hero section with welcome message
 * - Featured categories grid
 * - Featured products section showing best-selling items
 * - Responsive navigation and footer
 */
export default function HomePage() {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // Get addToCart function from cart context
  const { addToCart } = useCart();
  // State for search functionality (not implemented in current view)
  const [searchQuery, setSearchQuery] = useState('');
  // State to store featured products data
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Define store categories with icons
  const categories = [
    { id: 1, name: 'Plants', icon: '🌱' },
    { id: 2, name: 'Seeds', icon: '🍃' },
    { id: 3, name: 'Gardening Tools', icon: '🛠️' },
    { id: 4, name: 'Pots & Planters', icon: '🪴' }
  ];

  /* useEffect hook to load featured products on component mount
   * Process:
   * 1. Fetch both products and sales data
   * 2. Calculate total sales for each product
   * 3. Sort products by sales volume
   * 4. Select top 4 best-selling products
   * Fallback: Show first 4 products if no sales data or error
   */
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        // Fetch products and sales data concurrently
        const [productsRes, soldProductsRes] = await Promise.all([
          getProducts(),
          getSoldProducts()
        ]);

        // Create sales summary object
        const productSales = {};
        soldProductsRes.data.forEach(sale => {
          const productId = sale.product.id;
          if (!productSales[productId]) {
            productSales[productId] = 0;
          }
          productSales[productId] += sale.quantity;
        });

        // Process products with sales data
        const productsWithSales = productsRes.data.map(product => ({
          ...product,
          totalSold: productSales[product.id] || 0
        }));

        // Sort by sales volume and select top 4
        const sortedProducts = productsWithSales
          .sort((a, b) => b.totalSold - a.totalSold)
          .slice(0, 4);

        setFeaturedProducts(sortedProducts);
      } catch (error) {
        console.error('Error loading featured products:', error);
        // Fallback to showing first 4 products
        try {
          const productsRes = await getProducts();
          setFeaturedProducts(productsRes.data.slice(0, 4));
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          setFeaturedProducts([]); // Set empty array if all attempts fail
        }
      }
    };

    loadFeaturedProducts();
  }, []); // Empty dependency array means this runs once on mount

  /* Event Handlers */
  // Handle adding product to cart
  const handleAddToCart = (product) => {
    addToCart(product);
    alert('Product added to cart!');
  };

  // Handle category selection and navigation
  const handleCategoryClick = (categoryName) => {
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar - Fixed at top */}
      <nav className="bg-primary py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation content with logo, links, and auth buttons */}
          <div className="flex justify-between items-center">
            {/* Logo and brand name */}
            <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img 
                src="/garden-of-eden-logo.png" 
                alt="Garden of Eden" 
                className="h-12 w-auto"
              />
              <span className="text-white text-2xl font-bold">Garden of Eden</span>
            </a>
            {/* Navigation links - hidden on mobile */}
            <div className="hidden md:flex space-x-8">
              <a href="/" className="text-white hover:text-secondary transition-colors">Home</a>
              <a href="/shop" className="text-white hover:text-secondary transition-colors">Shop</a>
              <a href="/blog" className="text-white hover:text-secondary transition-colors">Blog</a>
              <a href="/cart" className="text-white hover:text-secondary transition-colors">Cart</a>
            </div>
            {/* Authentication buttons */}
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

      {/* Hero Section - Full-width banner with background image */}
      <div className="relative h-[500px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('homepage_background.jpg')" }}
        >
          {/* Overlay with welcome text and CTA */}
          <div className="absolute inset-0 bg-primary bg-opacity-70 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-5xl font-bold mb-4">Welcome to Garden of Eden</h1>
              <p className="text-xl mb-8">We bring nature to your doorstep. Grow your green space with us!</p>
              <button 
                onClick={() => window.location.href='/shop'} 
                className="btn btn-secondary text-lg px-8 py-4"
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories Section */}
      <section className="py-16 px-4">
        <h2 className="text-4xl text-primary text-center mb-12 font-bold">Featured Categories</h2>
        {/* Categories grid - responsive layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map(category => (
            <div 
              key={category.id} 
              className="bg-accent p-8 rounded-lg text-center transform hover:-translate-y-1 transition-transform shadow-md cursor-pointer"
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="text-5xl mb-4">{category.icon}</div>
              <div>
                <h3 className="text-xl text-primary font-semibold mb-2">{category.name}</h3>
                <p className="text-primary">Explore {category.name.toLowerCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 bg-secondary">
        <h2 className="text-4xl text-primary text-center mb-12 font-bold">Featured Products</h2>
        {/* Products grid - responsive layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              {/* Product image */}
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-48 object-cover"
              />
              {/* Product details */}
              <div className="p-6">
                <h3 className="text-xl text-primary font-semibold mb-2">{product.name}</h3>
                <div className="text-xl text-primary font-bold mb-4">₱{parseFloat(product.price).toFixed(2)}</div>
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-secondary hover:text-primary transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Show more products button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/shop')}
            className="bg-primary text-white text-lg px-8 py-3 rounded hover:scale-105 transition-transform duration-300"
          >
            Show More Products
          </button>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-primary text-white py-16 px-4">
        {/* Footer content grid - responsive layout */}
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
} 