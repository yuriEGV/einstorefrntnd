import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import CartPage from './pages/CartPage';
import { apiFetch } from './api';
import { getCartKey, writeCart, getCartCount, readCart } from './utils/cart';
import Link from 'react-router-dom';
import CheckoutPage from './pages/CheckoutPage';
import CategoriesPage from './pages/CategoriesPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import Success from './pages/Success';
import PaymentStatus from './pages/PaymentStatus';
import Dashboard from './pages/Dashboard';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MainLayout from './layout/MainLayout';
import './i18n'; // Import i18n config

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Helper to update cart count
  const updateCount = (userId) => {
    const key = userId ? `cart:${userId}` : getCartKey(null);
    setCartItemCount(getCartCount(key));
  };

  // Al cargar, intento obtener usuario autenticado
  useEffect(() => {
    apiFetch('/auth/showMe')
      .then(data => {
        setUser(data.user);
        setLoading(false);
        updateCount(data.user?.userId);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
        updateCount(null);
      });
  }, []);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = (event) => {
      // If we could determine if this event is relevant for current user...
      // For now, just re-read based on current user state
      // But user state might be stale in closure. 
      // safer to read from event detail if possible, or just re-check current correct key
      const currentKey = user ? `cart:${user.userId}` : getCartKey(null);
      if (event.detail.cartKey === currentKey) {
        setCartItemCount(getCartCount(currentKey));
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [user]);

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout');
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      // clear the user's cart (if any) when logging out and switch to guest
      try {
        const key = getCartKey(user);
        writeCart(key, []); // This triggers cartUpdated
      } catch (err) {
        // ignore
      }
      setUser(null);
      // redirect to home for clarity
      window.location.assign('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <MainLayout user={user} onLogout={handleLogout} cartItemCount={cartItemCount}>
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/products" element={<ProductsPage user={user} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route path="/cart" element={<CartPage user={user} />} />
          <Route path="/checkout" element={<CheckoutPage user={user} />} />
          <Route path="/categories" element={<CategoriesPage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/success" element={<Success user={user} />} />
          <Route path="/failure" element={<PaymentStatus />} />
          <Route path="/pending" element={<PaymentStatus />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
