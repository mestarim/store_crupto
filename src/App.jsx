import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';

// Mock data removed - now handled by StoreContext
function StoreLayout({ products }) {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  return (
    <div dir="rtl">
      <Navbar onCartClick={() => navigate('/cart')} />
      <main>
        {activeTab === 'home' && <Home products={products} onNavigate={(path, state) => navigate(path, { state })} />}
        {activeTab === 'categories' && (
          <div className="container" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <h2 className="h2" style={{ marginTop: '40px' }}>الأقسام</h2>
            <p className="text-muted" style={{ marginTop: '8px' }}>قريباً...</p>
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="container" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <h2 className="h2" style={{ marginTop: '40px' }}>طلباتي</h2>
            <p className="text-muted" style={{ marginTop: '8px' }}>قريباً...</p>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="container" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <h2 className="h2" style={{ marginTop: '40px' }}>حسابي</h2>
            <p className="text-muted" style={{ marginTop: '8px' }}>قريباً...</p>
          </div>
        )}
      </main>
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}

import AdminLayout from './pages/admin/Layout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import { StoreProvider, useStore } from './context/StoreContext';

// Create a wrapper component to consume context for StoreLayout
function StoreWrapper() {
  const { products } = useStore();
  return <StoreLayout products={products} />;
}

// Create a wrapper for Products admin page
function AdminProductsWrapper() {
  const { products, setProducts } = useStore();
  return <Products products={products} setProducts={setProducts} />;
}

function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          {/* Store Routes */}
          <Route path="/" element={<StoreWrapper />} />
        
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

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProductsWrapper />} />
            <Route path="orders" element={<Orders />} />
            <Route path="*" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;
