import React, { useState } from 'react';
import { ShoppingCart, Search, X, Home, Grid3X3, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar({ onCartClick, searchQuery = '', onSearchChange, activeTab = 'home', onChangeTab }) {
  const { cart, orders } = useStore();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const navLinks = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'categories', label: 'الأقسام', icon: Grid3X3 },
    { id: 'orders', label: 'طلباتي', icon: ShoppingBag, count: pendingOrdersCount },
    { id: 'profile', label: 'حسابي', icon: User },
  ];

  return (
    <>
      <header className="navbar" dir="rtl">
        <div className="container flex items-center justify-between" style={{ width: '100%', gap: '12px' }}>
          
          {/* Brand */}
          <Link 
            to="/" 
            onClick={() => onChangeTab && onChangeTab('home')} 
            style={{ display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0, textDecoration: 'none' }}
          >
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '900', fontSize: '17px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
              flexShrink: 0
            }}>
              D
            </div>
            <span className="desktop-only" style={{ 
              fontSize: '18px', fontWeight: '900',
              background: 'linear-gradient(to right, #fff 0%, #a5b4fc 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
            }}>
              Digi<span style={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>Store</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {onChangeTab && (
            <nav className="desktop-nav-links" style={{ display: 'none', gap: '4px' }}>
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => onChangeTab(link.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      border: isActive ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent'
                    }}
                  >
                    <Icon size={15} />
                    <span>{link.label}</span>
                    {link.count > 0 && (
                      <span style={{
                        backgroundColor: 'var(--accent)', color: 'white',
                        fontSize: '10px', fontWeight: 'bold',
                        padding: '1px 6px', borderRadius: '999px',
                      }}>
                        {link.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Desktop Search Bar */}
          {onSearchChange && (
            <div className="search-desktop" style={{ flex: 1, maxWidth: '300px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="ابحث عن USDT، شدات..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="form-input"
                style={{
                  paddingRight: '38px',
                  paddingLeft: searchQuery ? '34px' : '14px',
                  height: '38px',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-full)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', padding: '2px' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
          
          {/* Actions Area */}
          <div className="flex items-center" style={{ gap: '8px', flexShrink: 0 }}>
            
            {/* Mobile Search Toggle */}
            {onSearchChange && (
              <button
                className="mobile-only"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                style={{
                  width: '38px', height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isSearchOpen ? 'var(--primary)' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}
                aria-label="بحث"
              >
                {isSearchOpen ? <X size={18} /> : <Search size={18} />}
              </button>
            )}

            {/* Cart Button */}
            <button
              aria-label="السلة"
              onClick={onCartClick}
              style={{
                position: 'relative',
                width: '40px', height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background-color 0.2s',
                border: '1px solid var(--border-light)'
              }}
            >
              <ShoppingCart size={19} />
              {cartItemCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  backgroundColor: 'var(--primary)',
                  color: 'white', fontSize: '10px', fontWeight: '800',
                  minWidth: '19px', height: '19px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 0 0 2px var(--bg-dark), 0 0 10px rgba(99, 102, 241, 0.7)',
                  animation: cartItemCount > 0 ? 'dotPulse 2s ease-in-out infinite' : 'none'
                }}>
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar - Dropdown */}
      {isSearchOpen && onSearchChange && (
        <div 
          className="mobile-only"
          style={{
            position: 'fixed',
            top: 'var(--nav-height)',
            left: 0, right: 0,
            backgroundColor: 'rgba(6, 6, 8, 0.97)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-color)',
            padding: '14px 16px',
            zIndex: 99,
            animation: 'slideUp 0.25s ease'
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              placeholder="ابحث عن USDT، شدات، بطاقات..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="form-input"
              style={{ paddingRight: '42px', paddingLeft: searchQuery ? '38px' : '14px', height: '44px' }}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => { onSearchChange(''); }}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
