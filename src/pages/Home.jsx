import React from 'react';
import ProductCard from '../components/ProductCard';

export default function Home({ products, onNavigate }) {

  return (
    <div className="container animate-fade-in" style={{ padding: '24px 16px' }}>
      
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 24px',
        marginBottom: '32px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="h1" style={{ marginBottom: '8px' }}>مرحباً بك في عالم الرقميات</h2>
          <p style={{ opacity: 0.9, marginBottom: '16px', maxWidth: '80%' }}>
            أفضل الأسعار للعملات الرقمية، شحن الألعاب، وبطاقات الهدايا.
          </p>
          <button style={{ backgroundColor: 'white', color: 'var(--primary)', padding: '10px 20px', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}>
            تسوق الآن
          </button>
        </div>
        {/* Abstract decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
        <div style={{ position: 'absolute', bottom: -30, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div style={{ marginBottom: '32px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h2 className="h2">الأقسام</h2>
        </div>
        <div className="flex gap-4 hide-scrollbar" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          {['الكل', 'عملات رقمية', 'شحن ألعاب', 'بطاقات هدايا'].map((cat, i) => (
            <button 
              key={i} 
              style={{
                padding: '8px 20px',
                backgroundColor: i === 0 ? 'var(--primary)' : 'var(--bg-card)',
                color: i === 0 ? 'white' : 'var(--text-main)',
                border: i === 0 ? 'none' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products Grid */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h2 className="h2">العروض المميزة</h2>
          <button className="text-sm" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            عرض الكل
          </button>
        </div>
        <div className="grid-responsive">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              {...product} 
              onClick={() => onNavigate('/product', product)} 
            />
          ))}
        </div>
      </div>
      
    </div>
  );
}
