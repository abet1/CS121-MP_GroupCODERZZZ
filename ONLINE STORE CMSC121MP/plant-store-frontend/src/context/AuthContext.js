// Import necessary React hooks and utilities
import React, { createContext, useContext, useState, useEffect } from 'react';
// Import API function to fetch current user data
import { getCurrentUser } from '../api';

/* Create AuthContext
 * This context will be used to provide authentication state and methods
 * throughout the application
 */
const AuthContext = createContext();

/* useAuth Custom Hook
 * A custom hook that provides access to the authentication context
 * Throws an error if used outside of AuthProvider
 * @returns {Object} The authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/* AuthProvider Component
 * A provider component that manages authentication state
 * and provides it to all child components
 * 
 * Features:
 * - User state management
 * - Loading state handling
 * - Automatic user data fetching
 * - Authentication status checking
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 */
export const AuthProvider = ({ children }) => {
  // State for storing the current user's data
  const [user, setUser] = useState(null);
  // State for tracking loading status during user data fetching
  const [loading, setLoading] = useState(true);

  /* Effect hook to load user data when component mounts
   * Fetches current user data from API and updates state accordingly
   * Handles loading states and errors
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Attempt to fetch current user data
        const response = await getCurrentUser();
        // Update user state with fetched data
        setUser(response.data);
      } catch (error) {
        // Log error and clear user state on failure
        console.error('Failed to load user:', error);
        setUser(null);
      } finally {
        // Update loading state regardless of success/failure
        setLoading(false);
      }
    };

    // Execute the loadUser function
    loadUser();
  }, []); // Empty dependency array means this effect runs once on mount

  /* Context value object
   * Contains all the authentication-related state and methods
   * that will be available to consuming components
   */
  const value = {
    user,           // Current user data
    setUser,        // Function to update user data
    loading,        // Loading state
    isAuthenticated: !!user  // Boolean indicating if user is authenticated
  };

  /* Render AuthContext.Provider
   * Only renders children when loading is complete
   * This prevents flashing of unauthenticated content
   */
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 