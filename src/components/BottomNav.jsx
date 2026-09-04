import React from 'react';
import { Home, Grid3X3, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function BottomNav({ activeTab = 'home', onChangeTab }) {
  const { orders } = useStore();
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'categories', label: 'الأقسام', icon: Grid3X3 },
    { id: 'orders', label: 'طلباتي', icon: ShoppingBag, count: pendingOrdersCount },
    { id: 'profile', label: 'حسابي', icon: User },
  ];

  return (
    <nav className="bottom-nav" dir="rtl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`nav-item ${isActive ? 'active' : ''}`}
            aria-label={tab.label}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <div style={{
                width: '40px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '12px',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isActive ? 'translateY(-2px)' : 'none',
              }}>
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ transition: 'all 0.2s' }}
                />
              </div>
              {tab.count > 0 && (
                <span style={{
                  position: 'absolute', top: '-3px', right: '-4px',
                  backgroundColor: '#ef4444',
                  color: 'white', fontSize: '9px', fontWeight: '800',
                  minWidth: '16px', height: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%',
                  boxShadow: '0 0 0 2px rgba(6,6,8,0.95)'
                }}>
                  {tab.count > 9 ? '9+' : tab.count}
                </span>
              )}
            </div>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: isActive ? '700' : '500',
              letterSpacing: '0.01em'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
