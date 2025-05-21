// Import necessary React hooks for state management and side effects
import React, { useState, useEffect } from 'react';
// Import routing hooks for navigation and location handling
import { useNavigate, useLocation, Link } from 'react-router-dom';
// Import API function to fetch products
import { getProducts } from '../api';
// Import cart context for managing shopping cart functionality
import { useCart } from '../context/CartContext';

/* NavigationBar Component
 * A reusable navigation component that appears at the top of the page
 * Contains logo, navigation links, and authentication buttons
 */
const NavigationBar = () => {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  return (
    <nav className="bg-primary py-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo and brand name with link to home page */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src="/garden-of-eden-logo.png" 
              alt="Garden of Eden" 
              className="h-12 w-auto"
            />
            <span className="text-white text-2xl font-bold">Garden of Eden</span>
          </Link>
          {/* Main navigation links - hidden on mobile */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-white hover:text-secondary transition-colors">Home</Link>
            <Link to="/shop" className="text-white hover:text-secondary transition-colors">Shop</Link>
            <Link to="/blog" className="text-white hover:text-secondary transition-colors">Blog</Link>
            <Link to="/cart" className="text-white hover:text-secondary transition-colors">Cart</Link>
          </div>
          {/* Authentication buttons */}
          <div className="flex space-x-2">
            <button 
              onClick={() => navigate('/login')} 
              className="bg-secondary text-primary px-4 py-2 rounded hover:bg-accent transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')} 
              className="bg-secondary text-primary px-4 py-2 rounded hover:bg-accent transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

/* Shop Component
 * Main component for the shop page with the following features:
 * - Product listing with filtering and sorting
 * - Search functionality
 * - Pagination
 * - Product detail modal
 * - Add to cart functionality
 * - Responsive design
 */
const Shop = () => {
  // Navigation and location hooks
  const navigate = useNavigate();
  const location = useLocation();
  // Cart context hook for managing cart operations
  const { addToCart } = useCart();

  // State management for products and UI
  const [products, setProducts] = useState([]); // All products from API
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered products based on user selection
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state
  const [selectedCategory, setSelectedCategory] = useState('All'); // Selected category filter
  const [sortBy, setSortBy] = useState('name'); // Current sort option
  const [searchQuery, setSearchQuery] = useState(''); // Search input value
  const [selectedProduct, setSelectedProduct] = useState(null); // Currently selected product for modal
  const [showToast, setShowToast] = useState(false); // Toast notification state
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const productsPerPage = 12; // Number of products to show per page

  // Available product categories
  const categories = ['All', 'Plants', 'Seeds', 'Gardening Tools', 'Pots & Planters'];

  // Effect to handle URL parameters and initial data loading
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get('category');
    
    if (categoryFromUrl && categories.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    }
    
    loadProducts();
  }, [location.search]);

  /* Load products from API
   * Fetches all products and updates state
   * Handles loading and error states
   */
  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
      setFilteredProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
    }
  };

  /* Effect to filter and sort products
   * Runs whenever products, category, sort option, or search query changes
   * Applies filters, search, and sorting to the product list
   */
  useEffect(() => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredProducts(result);
  }, [products, selectedCategory, sortBy, searchQuery]);

  // Pagination calculations
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  /* Handle page change
   * Updates current page and scrolls to top
   * @param {number} pageNumber - The page number to navigate to
   */
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Handle adding product to cart
   * Adds product to cart and shows success toast
   * @param {Object} product - The product to add to cart
   */
  const handleAddToCart = (product) => {
    addToCart(product);
    setSelectedProduct(null);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000); // Hide toast after 3 seconds
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavigationBar />
        <div className="text-center py-8 text-xl text-primary">Loading products...</div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="min-h-screen bg-secondary">
        <NavigationBar />
        <div className="text-center py-8 text-xl text-red-500">{error}</div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="min-h-screen bg-light">
      <NavigationBar />

      {/* Toast Notification for cart updates */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-secondary text-primary px-8 py-4 rounded-lg shadow-xl z-[100] flex items-center space-x-3 animate-fade-in-up">
          <div className="bg-primary rounded-full p-1">
            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-lg font-semibold">Product added to cart successfully!</span>
        </div>
      )}

      {/* Hero Section with background image */}
      <div className="relative h-[300px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('homepage_background.jpg')" }}
        >
          <div className="absolute inset-0 bg-primary bg-opacity-70 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-5xl font-bold mb-4">Shop</h1>
              <p className="text-xl">Discover our wide range of plants, seeds, and gardening essentials</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            {/* Search Input */}
            <div className="w-full md:w-96">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded border border-primary focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            {/* Category and Sort Dropdowns */}
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded border border-primary focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded border border-primary focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {currentProducts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-xl text-primary">
              No products found.
            </div>
          ) : (
            currentProducts.map(product => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Product Image */}
                <div 
                  className="h-48 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Product Details */}
                <div className="p-6">
                  <h3 
                    className="text-xl text-primary font-semibold mb-2 cursor-pointer hover:text-secondary transition-colors"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-primary mb-4 line-clamp-2">{product.description}</p>
                  <div className="text-xl text-primary font-bold mb-2">₱{parseFloat(product.price).toFixed(2)}</div>
                  <p className="text-primary mb-4">In Stock: {product.stock}</p>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-secondary hover:text-primary transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === index + 1
                    ? 'bg-primary text-white border-primary'
                    : 'border-primary text-primary hover:bg-primary hover:text-white'
                } transition-colors`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Product Image Section */}
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 w-full">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-[400px] object-contain bg-light"
                />
              </div>
              {/* Close Button */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Product Details Section */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-primary mb-4">{selectedProduct.name}</h2>
              <div className="text-2xl text-primary font-bold mb-4">₱{parseFloat(selectedProduct.price).toFixed(2)}</div>
              <p className="text-primary mb-6">{selectedProduct.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-primary font-semibold">Category:</p>
                  <p className="text-primary">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-primary font-semibold">Stock:</p>
                  <p className="text-primary">{selectedProduct.stock} units available</p>
                </div>
              </div>
              <button 
                onClick={() => handleAddToCart(selectedProduct)}
                className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary hover:text-primary transition-colors font-semibold"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-primary text-white py-16 px-4 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Information */}
          <div>
            <div className="text-xl font-bold mb-4">Garden of Eden</div>
            <div className="text-secondary">Your one-stop shop for all things green.</div>
          </div>
          {/* Quick Links */}
          <div>
            <div className="text-xl font-bold mb-4">Quick Links</div>
            <div className="flex flex-col space-y-2">
              <a href="/" className="text-secondary hover:text-accent transition-colors">Home</a>
              <a href="/shop" className="text-secondary hover:text-accent transition-colors">Shop</a>
              <a href="/blog" className="text-secondary hover:text-accent transition-colors">Blog</a>
              <a href="/cart" className="text-secondary hover:text-accent transition-colors">Cart</a>
            </div>
          </div>
          {/* Contact Information */}
          <div>
            <div className="text-xl font-bold mb-4">Contact Us</div>
            <div className="flex flex-col space-y-2 text-secondary">
              <p>123 Green St, City</p>
              <p>(555) 123-4567</p>
              <p>info@gardenofeden.com</p>
            </div>
          </div>
        </div>
        {/* Copyright Notice */}
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-secondary text-center text-secondary">
          &copy; {new Date().getFullYear()} Garden of Eden. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

// Export Shop component as default
export default Shop; 