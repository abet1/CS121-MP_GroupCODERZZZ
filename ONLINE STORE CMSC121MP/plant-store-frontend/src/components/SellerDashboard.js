// Import necessary React hooks for state management and side effects
import React, { useState, useEffect } from 'react';
// Import API functions for product and sales management
import { getProducts, createProduct, updateProduct, deleteProduct, getSoldProducts } from '../api';
// Import routing hook for navigation
import { useNavigate } from 'react-router-dom';
// Import logout function for authentication
import { logout } from '../api';

/* SellerDashboard Component
 * A comprehensive dashboard for sellers with the following features:
 * - Product management (CRUD operations)
 * - Sales tracking and analytics
 * - Product statistics and performance metrics
 * - Pagination for products and sales
 * - Image upload handling
 * - Error and success state management
 * - Responsive design
 */
const SellerDashboard = () => {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  // State for managing products list
  const [products, setProducts] = useState([]);
  // State for managing sold products data
  const [soldProducts, setSoldProducts] = useState([]);
  // State for controlling add/edit product modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for controlling delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // State for storing product to be deleted
  const [productToDelete, setProductToDelete] = useState(null);
  // State for storing product being edited
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form data state for product creation/editing
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null
  });
  
  // Loading state for initial data fetch
  const [loading, setLoading] = useState(true);
  // Error message state
  const [error, setError] = useState('');
  // Success message state
  const [success, setSuccess] = useState('');
  
  // Pagination states
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const [currentSalesPage, setCurrentSalesPage] = useState(1);
  // Number of items to display per page
  const itemsPerPage = 10;

  // Effect hook to load initial data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  /* Load initial data from API
   * Fetches both products and sold products data
   * Handles loading states and errors
   */
  const loadData = async () => {
    try {
      // Fetch products and sold products data concurrently
      const [productsRes, soldProductsRes] = await Promise.all([
        getProducts(),
        getSoldProducts()
      ]);
      
      // Debug logging for sold products data
      console.log('Sold Products Response:', soldProductsRes);
      console.log('Number of sold products:', soldProductsRes.data.length);
      
      // Update state with fetched data
      setProducts(productsRes.data);
      setSoldProducts(soldProductsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  /* Form submission handler for product creation/editing
   * Handles both new product creation and existing product updates
   * Manages form data, file uploads, and API calls
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('category', formData.category);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Debug logging for form data
      console.log('Sending data:', {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        category: formData.category,
        hasImage: !!formData.image
      });

      if (editingProduct) {
        // Handle product update
        console.log('Updating product:', editingProduct.id);
        const response = await updateProduct(editingProduct.id, formDataToSend);
        console.log('Update response:', response);
        
        if (response.data) {
          setSuccess('Product updated successfully!');
          await loadData();
          setIsModalOpen(false);
          resetForm();
        }
      } else {
        // Handle new product creation
        const response = await createProduct(formDataToSend);
        if (response.data) {
          setSuccess('Product added successfully!');
          await loadData();
          setIsModalOpen(false);
          resetForm();
        }
      }
    } catch (err) {
      // Error handling with detailed logging
      console.error('Error saving product:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        err.message || 
        'Failed to save product. Please try again.'
      );
    }
  };

  /* Product deletion handler
   * Handles product deletion with confirmation
   * @param {number} productId - ID of the product to delete
   */
  const handleDelete = async (productId) => {
    try {
      const response = await deleteProduct(productId);
      if (response.status === 204) {
        setSuccess('Product deleted successfully!');
        await loadData();
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.error || 'Failed to delete product. Please try again.');
    }
  };

  /* Product edit handler
   * Prepares form data for editing an existing product
   * @param {Object} product - Product object to edit
   */
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: null
    });
    setIsModalOpen(true);
  };

  /* Image change handler
   * Updates form data with selected image file
   * @param {Event} e - File input change event
   */
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        image: e.target.files[0]
      });
    }
  };

  /* Form reset handler
   * Clears form data and related states
   */
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      image: null
    });
    setEditingProduct(null);
    setError('');
    setSuccess('');
  };

  /* Modal close handler
   * Closes modal and resets form
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  /* Delete modal open handler
   * Sets product to delete and opens confirmation modal
   * @param {Object} product - Product to be deleted
   */
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  /* Pagination helper functions */
  
  // Get items for current page
  const getCurrentPageItems = (items, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  // Calculate total number of pages
  const getTotalPages = (items) => {
    return Math.ceil(items.length / itemsPerPage);
  };

  // Render pagination controls
  const renderPagination = (currentPage, totalPages, onPageChange) => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  /* Calculate product statistics
   * Analyzes sales data to determine top and least selling products
   * @returns {Object} Object containing top and least selling products
   */
  const getProductStats = () => {
    const productSales = {};
    
    // Calculate sales metrics for each product
    soldProducts.forEach(sale => {
      const productId = sale.product.id;
      if (!productSales[productId]) {
        productSales[productId] = {
          totalSold: 0,
          totalRevenue: 0
        };
      }
      productSales[productId].totalSold += sale.quantity;
      productSales[productId].totalRevenue += parseFloat(sale.total_price);
    });

    // Add sales data to products
    const productsWithStats = products.map(product => ({
      ...product,
      totalSold: productSales[product.id]?.totalSold || 0,
      totalRevenue: productSales[product.id]?.totalRevenue || 0
    }));

    // Get top 3 selling products
    const topProducts = [...productsWithStats]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 3);

    // Get 3 least selling products
    const leastProducts = [...productsWithStats]
      .sort((a, b) => a.totalSold - b.totalSold)
      .slice(0, 3);

    // Debug logging for product statistics
    console.log('Product Stats:', {
      productSales,
      productsWithStats,
      topProducts,
      leastProducts
    });

    return { topProducts, leastProducts };
  };

  /* Logout handler
   * Handles user logout and navigation
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Failed to logout. Please try again.');
    }
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center text-xl text-primary">Loading...</div>
      </div>
    );
  }

  // Calculate current page items and statistics
  const { topProducts, leastProducts } = getProductStats();
  const currentProducts = getCurrentPageItems(products, currentProductsPage);
  const currentSales = getCurrentPageItems(soldProducts, currentSalesPage);
  const totalProductPages = getTotalPages(products);
  const totalSalesPages = getTotalPages(soldProducts);

  // Main component render
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
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
            <div className="flex items-center space-x-4">
              <div className="text-white text-xl font-semibold">Seller Dashboard</div>
              <button
                onClick={handleLogout}
                className="bg-secondary text-primary px-4 py-2 rounded hover:bg-accent hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Products Sold Card */}
          <div className="bg-[#F9F1E7] rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-primary font-medium">Total Products Sold</h3>
                <p className="text-3xl font-bold text-primary mt-2">
                  {soldProducts.reduce((total, sale) => total + sale.quantity, 0)}
                </p>
              </div>
              <div className="bg-primary bg-opacity-10 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-[#F9F1E7] rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-primary font-medium">Total Revenue</h3>
                <p className="text-3xl font-bold text-primary mt-2">
                  ₱{soldProducts.reduce((total, sale) => total + parseFloat(sale.total_price), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-primary bg-opacity-10 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Top Selling Products */}
          <div className="bg-[#F9F1E7] rounded-lg shadow-md p-6">
            <h2 className="text-2xl text-primary font-semibold mb-4">Top Selling Products</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-primary">{index + 1}</span>
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="font-semibold text-primary">{product.name}</h3>
                      <p className="text-sm text-gray-600">Units Sold: {product.totalSold}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">₱{product.totalRevenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Least Popular Products */}
          <div className="bg-[#F9F1E7] rounded-lg shadow-md p-6">
            <h2 className="text-2xl text-primary font-semibold mb-4">Least Popular Products</h2>
            <div className="space-y-4">
              {leastProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-primary">{index + 1}</span>
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="font-semibold text-primary">{product.name}</h3>
                      <p className="text-sm text-gray-600">Units Sold: {product.totalSold}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">₱{product.totalRevenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Management Section */}
        <div className="bg-[#F9F1E7] rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-primary font-semibold">Products Management</h2>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary hover:text-primary transition-colors"
              >
                Add New Product
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white">
                    <th className="px-6 py-3 text-left text-primary font-semibold">Image</th>
                    <th className="px-6 py-3 text-left text-primary font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-primary font-semibold">Category</th>
                    <th className="px-6 py-3 text-left text-primary font-semibold">Price</th>
                    <th className="px-6 py-3 text-left text-primary font-semibold">Stock</th>
                    <th className="px-6 py-3 text-left text-primary font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentProducts.map((product) => (
                    <tr key={product.id} className="bg-white">
                      <td className="px-6 py-4">
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      </td>
                      <td className="px-6 py-4 text-primary">{product.name}</td>
                      <td className="px-6 py-4 text-primary">{product.category}</td>
                      <td className="px-6 py-4 text-primary">₱{parseFloat(product.price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-primary">{product.stock}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-primary hover:text-secondary transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Products Pagination */}
            {totalProductPages > 1 && (
              <div className="flex justify-center space-x-2 mt-6">
                {renderPagination(currentProductsPage, totalProductPages, setCurrentProductsPage)}
              </div>
            )}
          </div>
        </div>

        {/* Sales History Section */}
        <div className="bg-[#F9F1E7] rounded-lg shadow-md overflow-hidden mt-8">
          <div className="p-6">
            <h2 className="text-2xl text-primary font-semibold mb-6">Sales History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white">
                    <th className="px-6 py-3 text-left text-primary font-semibold">Product</th>
                    <th className="px-6 py-3 text-left text-primary font-semibold">Buyer</th>
                    <th className="px-6 py-3 text-left text-primary font-semibold">Quantity</th>
                    <th className="px-6 py-3 text-left text-primary font-semibold">Total Price</th>
                    <th className="px-6 py-3 text-left text-primary font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-primary font-semibold">Shipping Address</th>
                    <th className="px-6 py-3 text-left text-primary font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentSales.map((sale) => (
                    <tr key={sale.id} className="bg-white">
                      <td className="px-6 py-4 text-primary">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={sale.product.image} 
                            alt={sale.product.name} 
                            className="w-10 h-10 object-cover rounded"
                          />
                          <span>{sale.product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-primary">
                        <div className="flex flex-col">
                          <span className="font-medium">{sale.buyer.username}</span>
                          <span className="text-sm text-gray-600">{sale.buyer.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-primary">{sale.quantity}</td>
                      <td className="px-6 py-4 text-primary">₱{parseFloat(sale.total_price).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          sale.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          sale.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          sale.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                          sale.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-primary">{sale.shipping_address}</td>
                      <td className="px-6 py-4 text-primary">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sales Pagination */}
            {totalSalesPages > 1 && (
              <div className="flex justify-center space-x-2 mt-6">
                {renderPagination(currentSalesPage, totalSalesPages, setCurrentSalesPage)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            <h2 className="text-2xl text-primary font-semibold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
              {/* Product Name and Category Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-primary font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-primary font-medium mb-2">Category</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Plants">Plants</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Gardening Tools">Gardening Tools</option>
                    <option value="Pots & Planters">Pots & Planters</option>
                  </select>
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-primary font-medium mb-2">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="3"
                  required
                />
              </div>

              {/* Price and Stock Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-primary font-medium mb-2">Price</label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="stock" className="block text-primary font-medium mb-2">Stock</label>
                  <input
                    type="number"
                    id="stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Image Upload Field */}
              <div>
                <label htmlFor="image" className="block text-primary font-medium mb-2">Product Image</label>
                <input
                  type="file"
                  id="image"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  accept="image/*"
                  required={!editingProduct}
                />
                {editingProduct && formData.image && (
                  <p className="mt-2 text-sm text-gray-600">New image selected</p>
                )}
                {editingProduct && !formData.image && (
                  <p className="mt-2 text-sm text-gray-600">Current image will be kept</p>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-primary text-primary rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded hover:bg-secondary hover:text-primary transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <svg 
                className="mx-auto h-12 w-12 text-red-500 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <h2 className="text-2xl text-primary font-semibold mb-4">Delete Product</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{productToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setProductToDelete(null);
                  }}
                  className="px-6 py-2 border border-primary text-primary rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(productToDelete.id)}
                  className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export SellerDashboard component
export default SellerDashboard; 