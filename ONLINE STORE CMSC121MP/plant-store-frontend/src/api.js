// Import axios for making HTTP requests
import axios from 'axios';

/* API Configuration
 * Base URL for all API endpoints
 * Points to the local development server
 */
const API_URL = 'http://localhost:8000/api';

/* Create axios instance with default configuration
 * - Sets base URL for all requests
 * - Enables sending cookies with requests
 * - Sets default content type to JSON
 */
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

/* Request Interceptor
 * Automatically adds CSRF token to all requests
 * Extracts token from cookies and adds it to request headers
 * This is required for Django's CSRF protection
 */
api.interceptors.request.use(async (config) => {
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
    if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
});

/* Response Interceptor
 * Handles common error responses
 * Specifically handles 401 Unauthorized errors
 * Logs authentication errors to console
 */
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Handle unauthorized error
            console.error('Authentication error:', error.response.data);
        }
        return Promise.reject(error);
    }
);

/* Authentication API Functions */

/* Login user
 * Sends credentials to server for authentication
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.username - User's username
 * @param {string} credentials.password - User's password
 * @returns {Promise} Response containing user data and tokens
 */
export const login = (credentials) => {
    return api.post('/users/login/', credentials);
};

/* Register new user
 * Creates a new user account
 * @param {Object} userData - User registration data
 * @returns {Promise} Response containing new user data
 */
export const register = (userData) => {
    return api.post('/users/register/', userData);
};

/* Logout user
 * Ends the current user session
 * @returns {Promise} Response confirming logout
 */
export const logout = () => {
    return api.post('/users/logout/');
};

/* Product Management API Functions */

/* Get all products
 * Retrieves list of all available products
 * @returns {Promise} Response containing array of products
 */
export const getProducts = () => {
    return api.get('/products/');
};

/* Get single product
 * Retrieves details of a specific product
 * @param {string|number} id - Product ID
 * @returns {Promise} Response containing product details
 */
export const getProduct = (id) => {
    return api.get(`/products/${id}/`);
};

/* Create new product
 * Adds a new product to the catalog
 * @param {FormData} productData - Product data including image
 * @returns {Promise} Response containing new product data
 */
export const createProduct = (productData) => {
    return api.post('/products/', productData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/* Get sold products
 * Retrieves list of all sold products
 * Includes detailed logging for debugging
 * @returns {Promise} Response containing array of sold products
 */
export const getSoldProducts = async () => {
    try {
        const response = await api.get('/sold-products/');
        console.log('getSoldProducts API response:', response);
        return response;
    } catch (error) {
        console.error('getSoldProducts API error:', error.response || error);
        throw error;
    }
};

/* Create sold product record
 * Records a new product sale
 * @param {Object} soldProductData - Sale transaction data
 * @returns {Promise} Response containing new sale record
 */
export const createSoldProduct = (soldProductData) => {
    return api.post('/sold-products/', soldProductData, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

/* Update sold product status
 * Updates the status of a sold product
 * @param {string|number} id - Sold product ID
 * @param {string} status - New status value
 * @returns {Promise} Response containing updated sale record
 */
export const updateSoldProductStatus = (id, status) => {
    return api.patch(`/sold-products/${id}/`, { status });
};

/* Update existing product
 * Modifies details of an existing product
 * Handles multipart form data for image uploads
 * @param {string|number} productId - Product ID to update
 * @param {FormData} productData - Updated product data
 * @returns {Promise} Response containing updated product data
 */
export const updateProduct = (productId, productData) => {
    // For PATCH request, we need to ensure all fields are properly set
    const formData = new FormData();
    
    // Append all fields from the original FormData
    for (let [key, value] of productData.entries()) {
        formData.append(key, value);
    }

    return api.patch(`/products/${productId}/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/* Delete product
 * Removes a product from the catalog
 * @param {string|number} productId - ID of product to delete
 * @returns {Promise} Response confirming deletion
 */
export const deleteProduct = (productId) => {
    return api.delete(`/products/${productId}/`);
};

/* Get current user
 * Retrieves data of currently authenticated user
 * @returns {Promise} Response containing user data
 */
export const getCurrentUser = () => {
    return api.get('/users/current_user/');
};

// Export the configured axios instance as default
export default api; 