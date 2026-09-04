import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import OrdersHistory from './pages/OrdersHistory';
import Profile from './pages/Profile';
import Toast from './components/Toast';
import AdminLoginModal from './components/AdminLoginModal';
import WhatsAppSupport from './components/WhatsAppSupport';
import PWAInstallPrompt from './components/PWAInstallPrompt';

import AdminLayout from './pages/admin/Layout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Settings from './pages/admin/Settings';
import { StoreProvider, useStore } from './context/StoreContext';
import { usePageTitle } from './hooks/usePageTitle';

/** ─── Component that sets dynamic page title ─── */
function PageTitleManager() {
  usePageTitle();
  return null;
}

/** ─── Component that syncs theme from localStorage ─── */
function ThemeManager() {
  useEffect(() => {
    const saved = localStorage.getItem('digistore_theme') || 'emerald';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);
  return null;
}

/** ─── Main store layout (tabs-based SPA) ─── */
function StoreLayout() {
  const { products } = useStore();
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  return (
    <div dir="rtl" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        onCartClick={() => navigate('/cart')} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <Home 
            products={products} 
            searchQuery={searchQuery}
            onNavigate={(path, state) => navigate(path, { state })} 
          />
        )}
        
        {activeTab === 'categories' && (
          <Categories 
            onSelectCategory={(catName) => {
              setSearchQuery(catName);
              setActiveTab('home');
            }} 
          />
        )}

        {activeTab === 'orders' && <OrdersHistory />}
        {activeTab === 'profile' && <Profile />}
      </main>

      <WhatsAppSupport />
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}

/** ─── Root App ─── */
function App() {
  return (
    <StoreProvider>
      <Router>
        {/* Global managers & overlays */}
        <ThemeManager />
        <PageTitleManager />
        <Toast />
        <AdminLoginModal />
        <PWAInstallPrompt />

        <Routes>
          {/* Store Front */}
          <Route path="/" element={<StoreLayout />} />
        
          <Route path="/cart" element={
            <div dir="rtl">
              <Cart onBack={() => window.history.back()} />
            </div>
          } />
          
          <Route path="/product" element={
            <div dir="rtl">
              <ProductDetail onBack={() => window.history.back()} />
            </div>
          } />

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;
