import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'الرئيسية', path: '/admin', icon: LayoutDashboard },
    { name: 'المنتجات', path: '/admin/products', icon: Package },
    { name: 'الطلبات', path: '/admin/orders', icon: ShoppingCart },
    { name: 'العملاء', path: '/admin/users', icon: Users },
    { name: 'الإعدادات', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="admin-layout" dir="rtl" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: 'white', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#6366f1' }}>لوحة التحكم</h2>
        </div>
        
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  borderRadius: '8px', textDecoration: 'none',
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#4f46e5' : '#475569',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid #e2e8f0' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#ef4444', textDecoration: 'none', fontWeight: '500' }}>
            <LogOut size={20} />
            العودة للمتجر
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600' }}>مرحباً بك، مدير النظام 👋</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0' }}></div>
          </div>
        </header>

        <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
