import React from 'react';
import { Home, Grid, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function BottomNav({ activeTab = 'home', onChangeTab }) {
  const { cart } = useStore();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'categories', label: 'الأقسام', icon: Grid },
    { id: 'orders', label: 'طلباتي', icon: ShoppingBag },
    { id: 'profile', label: 'حسابي', icon: User },
  ];

  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(9, 9, 11, 0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '12px 16px', borderTop: '1px solid var(--border-color)', zIndex: 50 }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: isActive ? 'var(--primary)' : 'var(--text-muted)', position: 'relative' }}
          >
            {tab.id === 'orders' && cartItemCount > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                {cartItemCount}
              </span>
            )}
            <Icon size={24} />
            <span style={{ fontSize: '11px', fontWeight: isActive ? '600' : '400' }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
