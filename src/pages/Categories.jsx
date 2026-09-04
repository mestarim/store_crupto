import React from 'react';
import { Coins, Gamepad2, CreditCard, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Categories({ onSelectCategory }) {
  const { products } = useStore();

  const categories = [
    {
      id: 'Crypto',
      name: 'عملات رقمية مشفرة',
      subtitle: 'USDT, Bitcoin, Ethereum',
      icon: Coins,
      count: products.filter(p => p.category === 'Crypto').length,
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      color: '#10b981'
    },
    {
      id: 'Games',
      name: 'شحن ألعاب إلكترونية',
      subtitle: 'ببجي موبايل، فري فاير، روبلوكس',
      icon: Gamepad2,
      count: products.filter(p => p.category === 'Games').length,
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
      color: '#6366f1'
    },
    {
      id: 'Cards',
      name: 'بطاقات الهدايا والتسوق',
      subtitle: 'بلايستيشن، آبل، جوجل بلاي',
      icon: CreditCard,
      count: products.filter(p => p.category === 'Cards').length,
      gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      color: '#f59e0b'
    },
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '24px 16px', paddingBottom: '90px' }} dir="rtl">
      <div style={{ marginBottom: '24px' }}>
        <h2 className="h1" style={{ fontSize: '24px', marginBottom: '8px' }}>أقسام المتجر</h2>
        <p className="text-sm text-muted">اختر القسم الذي يناسبك لتصفح العروض والأسعار المتاحة</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="card"
              style={{
                padding: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1 }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: cat.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: `0 8px 20px ${cat.color}40`
                }}>
                  <Icon size={28} />
                </div>
                <div>
                  <h3 className="h2" style={{ fontSize: '18px', marginBottom: '4px' }}>{cat.name}</h3>
                  <p className="text-xs text-muted" style={{ marginBottom: '6px' }}>{cat.subtitle}</p>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    color: cat.color,
                    backgroundColor: `${cat.color}15`,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {cat.count} منتجات متوفرة
                  </span>
                </div>
              </div>

              <div style={{ color: 'var(--text-muted)', zIndex: 1 }}>
                <ArrowLeft size={20} />
              </div>

              {/* Subtle background glow */}
              <div style={{
                position: 'absolute',
                left: '-30px',
                bottom: '-30px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: `${cat.color}10`,
                filter: 'blur(30px)'
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
