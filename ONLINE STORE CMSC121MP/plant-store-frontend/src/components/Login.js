// Import necessary React hooks for state management and routing
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import API function for authentication
import { login } from '../api';
// Import authentication context hook
import { useAuth } from '../context/AuthContext';

/* Login Component
 * Handles user authentication with the following features:
 * - Username/password form validation
 * - Error handling and display
 * - Loading state management
 * - Conditional navigation based on user type
 * - Responsive design
 */
const Login = () => {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // Get setUser function from auth context to update global auth state
  const { setUser } = useAuth();
  
  // Form data state management
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  // Error message state for displaying authentication errors
  const [error, setError] = useState('');
  // Loading state for UI feedback during authentication
  const [isLoading, setIsLoading] = useState(false);

  /* Event handler for form input changes
   * Updates formData state with new values as user types
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /* Form submission handler
   * Processes login attempt with the following steps:
   * 1. Prevents default form submission
   * 2. Sets loading state
   * 3. Clears any previous errors
   * 4. Attempts authentication
   * 5. Handles success/failure scenarios
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Attempt login with provided credentials
      const response = await login(formData);
      if (response.data) {
        // Update global auth state with user data
        setUser(response.data);
        // Navigate based on user role
        if (response.data.is_seller) {
          navigate('/seller-dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      // Handle login failure with appropriate error message
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      // Reset loading state regardless of outcome
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Navigation Bar - Simplified version with only logo */}
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
          </div>
        </div>
      </nav>

      {/* Main Login Form Container */}
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-8">Login</h2>
          
          {/* Error Message Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input Field */}
            <div>
              <label htmlFor="username" className="block text-primary font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Enter your username"
              />
            </div>

            {/* Password Input Field */}
            <div>
              <label htmlFor="password" className="block text-primary font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button - Shows loading state */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-secondary hover:text-primary transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-primary">
              Don't have an account?{' '}
              <a href="/register" className="text-secondary hover:text-primary transition-colors font-semibold">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-primary text-white py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-secondary">&copy; {new Date().getFullYear()} Garden of Eden. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Export Login component
export default Login; 