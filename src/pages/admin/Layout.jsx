import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, ArrowRight, ShieldCheck, Menu, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const navItems = [
  { name: 'الإحصائيات', path: '/admin', icon: LayoutDashboard },
  { name: 'المنتجات', path: '/admin/products', icon: Package },
  { name: 'الطلبات', path: '/admin/orders', icon: ShoppingCart },
  { name: 'الإعدادات', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, adminLogout, setIsAdminModalOpen, orders, products } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  // Auth Guard
  if (!isAdmin) {
    return (
      <div dir="rtl" style={{ 
        minHeight: '100vh', background: 'linear-gradient(135deg, #060608 0%, #0f172a 100%)', 
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' 
      }}>
        <div style={{ 
          maxWidth: '420px', width: '100%', padding: '40px 28px', textAlign: 'center',
          background: 'rgba(16,16,22,0.9)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
        }}>
          <div style={{ 
            width: '72px', height: '72px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>منطقة محمية</h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '28px', lineHeight: '1.7' }}>
            يجب تسجيل الدخول برمز المرور للوصول إلى لوحة التحكم الإدارية.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              style={{
                padding: '13px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', fontWeight: '800', fontSize: '15px',
                cursor: 'pointer', border: 'none',
                boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <ShieldCheck size={18} />
              تسجيل الدخول الآن
            </button>
            <Link 
              to="/" 
              style={{ 
                padding: '12px', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', textDecoration: 'none',
                fontWeight: '600', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <ArrowRight size={16} />
              العودة إلى المتجر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    adminLogout();
    navigate('/');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ 
        padding: '22px 20px', 
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <div style={{ 
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '900', fontSize: '16px',
          boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
        }}>
          D
        </div>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '900', color: 'white', lineHeight: 1 }}>DigiStore</h2>
          <span style={{ fontSize: '11px', color: '#64748b' }}>لوحة الإدارة</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const count = item.path === '/admin/orders' ? pendingCount : 
                        item.path === '/admin/products' ? products.length : 0;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '10px', padding: '11px 14px',
                borderRadius: '10px', textDecoration: 'none',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.12) 100%)'
                  : 'transparent',
                border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                color: isActive ? '#a5b4fc' : '#64748b',
                fontWeight: isActive ? '700' : '500',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={17} />
                <span>{item.name}</span>
              </div>
              {count > 0 && (
                <span style={{
                  backgroundColor: isActive ? '#6366f1' : '#ef4444',
                  color: 'white', fontSize: '11px', fontWeight: '800',
                  padding: '2px 7px', borderRadius: '999px', minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Link 
          to="/"
          onClick={() => setIsSidebarOpen(false)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', color: '#38bdf8', textDecoration: 'none',
            fontWeight: '700', fontSize: '13px', borderRadius: '10px',
            backgroundColor: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.15)',
            transition: 'all 0.2s'
          }}
        >
          <ArrowRight size={16} />
          عرض المتجر
        </Link>

        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', color: '#f87171', fontWeight: '700',
            fontSize: '13px', borderRadius: '10px',
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            width: '100%', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-layout" dir="rtl" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#060608', color: '#f0f4f8' }}>
      
      {/* Sidebar - Desktop */}
      <aside style={{ 
        width: '230px', flexShrink: 0,
        background: 'linear-gradient(180deg, #0d1117 0%, #090c12 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '4px 0 30px rgba(0,0,0,0.5)'
      }} className="desktop-only">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 200 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className="mobile-only"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '240px',
          background: '#0d1117',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
          zIndex: 201,
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '-4px 0 30px rgba(0,0,0,0.6)'
        }}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{ 
          height: '62px', flexShrink: 0,
          background: 'rgba(9, 9, 14, 0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', padding: '0 20px',
          justifyContent: 'space-between', gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile menu toggle */}
            <button
              className="mobile-only"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                width: '36px', height: '36px', borderRadius: '9px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', cursor: 'pointer'
              }}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div>
              <h1 style={{ fontSize: '16px', fontWeight: '800', color: 'white', lineHeight: 1 }}>
                مرحباً، مدير النظام 👋
              </h1>
              <span style={{ fontSize: '11px', color: '#475569' }}>
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {pendingCount > 0 && (
              <Link 
                to="/admin/orders"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  color: '#fbbf24', padding: '6px 12px',
                  borderRadius: '999px', fontSize: '12px', fontWeight: '700',
                  textDecoration: 'none', animation: 'dotPulse 2s ease-in-out infinite'
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#fbbf24', display: 'inline-block' }} />
                {pendingCount} طلب معلق
              </Link>
            )}
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: '#34d399', padding: '6px 12px',
              borderRadius: '999px', fontSize: '12px', fontWeight: '700'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#34d399', animation: 'dotPulse 2s ease-in-out infinite' }} />
              نشط
            </div>
          </div>
        </header>

        <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
