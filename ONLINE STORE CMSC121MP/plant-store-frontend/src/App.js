import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import SellerDashboard from './components/SellerDashboard';
import Shop from './components/Shop';
import Cart from './components/Cart';
import Blog from './components/Blog';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
    <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
    </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
