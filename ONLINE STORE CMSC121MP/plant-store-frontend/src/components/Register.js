// Import necessary React hooks for state management and routing
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import API function for user registration
import { register } from '../api';

/* Register Component
 * Handles new user registration with the following features:
 * - Comprehensive form validation
 * - Password confirmation
 * - Error handling and display
 * - Loading state management
 * - Responsive design
 * - Navigation after successful registration
 */
const Register = () => {
  // Hook for programmatic navigation after registration
  const navigate = useNavigate();
  
  // Form data state management with all required fields
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  // Error message state for displaying validation/registration errors
  const [error, setError] = useState('');
  // Loading state for UI feedback during registration process
  const [isLoading, setIsLoading] = useState(false);

  /* Event handler for form input changes
   * Updates formData state with new values as user types
   * Uses computed property name to dynamically update the correct field
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /* Form submission handler
   * Processes registration with the following steps:
   * 1. Prevents default form submission
   * 2. Validates password confirmation
   * 3. Sets loading state
   * 4. Clears any previous errors
   * 5. Prepares and sends registration data
   * 6. Handles success/failure scenarios
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate password confirmation before proceeding
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Prepare registration data in API-expected format
      const registrationData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        phone_number: formData.phone_number,
        address: formData.address,
        is_seller: false
      };

      // Log registration attempt for debugging
      console.log('Sending registration data:', registrationData);

      // Attempt registration through API
      const response = await register(registrationData);
      console.log('Registration response:', response);

      // Navigate to login page on successful registration
      if (response.data) {
        navigate('/login');
      }
    } catch (err) {
      // Comprehensive error logging for debugging
      console.error('Full error object:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      console.error('Error response headers:', err.response?.headers);

      // Handle specific error cases with detailed error messages
      const errorData = err.response?.data;
      if (errorData) {
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (errorData.message) {
          setError(errorData.message);
        } else if (errorData.username) {
          setError(`Username error: ${Array.isArray(errorData.username) ? errorData.username.join(', ') : errorData.username}`);
        } else if (errorData.email) {
          setError(`Email error: ${Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email}`);
        } else if (errorData.password) {
          setError(`Password error: ${Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password}`);
        } else if (errorData.phone_number) {
          setError(`Phone error: ${Array.isArray(errorData.phone_number) ? errorData.phone_number.join(', ') : errorData.phone_number}`);
        } else if (errorData.first_name) {
          setError(`First name error: ${Array.isArray(errorData.first_name) ? errorData.first_name.join(', ') : errorData.first_name}`);
        } else if (errorData.last_name) {
          setError(`Last name error: ${Array.isArray(errorData.last_name) ? errorData.last_name.join(', ') : errorData.last_name}`);
        } else if (errorData.non_field_errors) {
          setError(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(', ') : errorData.non_field_errors);
        } else {
          // Log all error fields for debugging
          console.error('All error fields:', Object.keys(errorData));
          setError('Registration failed. Please check your information and try again.');
        }
      } else {
        setError('Registration failed. Please try again later.');
      }
    } finally {
      // Reset loading state regardless of outcome
      setIsLoading(false);
    }
  };

  return (
    // Main container with minimum height and background color
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

      {/* Registration Form Container */}
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-8">Register</h2>
          
          {/* Error Message Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Registration Form */}
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
                placeholder="Choose a username"
              />
            </div>

            {/* Name Fields - Grid Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name Input */}
              <div>
                <label htmlFor="first_name" className="block text-primary font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Enter your first name"
                />
              </div>

              {/* Last Name Input */}
              <div>
                <label htmlFor="last_name" className="block text-primary font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Email Input Field */}
            <div>
              <label htmlFor="email" className="block text-primary font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Enter your email address"
              />
            </div>

            {/* Phone Number Input Field */}
            <div>
              <label htmlFor="phone_number" className="block text-primary font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Address Input Field - Textarea */}
            <div>
              <label htmlFor="address" className="block text-primary font-medium mb-2">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Enter your complete address"
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
                placeholder="Create a password"
              />
            </div>

            {/* Password Confirmation Input Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-primary font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Confirm your password"
              />
            </div>

            {/* Submit Button - Shows loading state */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-secondary hover:text-primary transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>

          {/* Login Link Section */}
          <div className="mt-6 text-center">
            <p className="text-primary">
              Already have an account?{' '}
              <a href="/login" className="text-secondary hover:text-primary transition-colors font-semibold">
                Login here
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

// Export Register component
export default Register; 