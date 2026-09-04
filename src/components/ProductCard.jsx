import React from 'react';
import { Plus, ShoppingCart, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const categoryConfig = {
  Crypto: { badgeClass: 'badge-crypto', label: 'كريبتو' },
  Games: { badgeClass: 'badge-game', label: 'ألعاب' },
  Cards: { badgeClass: 'badge-gift', label: 'بطاقات' },
};

export default function ProductCard({ id, title, price, image, category, type = 'game', options, description, onClick }) {
  const { addToCart } = useStore();
  const config = categoryConfig[category] || { badgeClass: 'badge-game', label: category };
  
  const lowestPrice = options && options.length > 0 
    ? Math.min(...options.map(o => o.price)) 
    : price;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    const product = { id, title, price, image, category, type, options, description };
    const defaultOption = options && options.length > 0 ? options[0] : null;
    addToCart(product, 1, defaultOption);
  };
  
  return (
    <div 
      className="card animate-fade-in" 
      onClick={onClick} 
      style={{ 
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
        <img 
          src={image} 
          alt={title} 
          className="card-img" 
          loading="lazy"
          style={{ 
            width: '100%', height: '148px', objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onError={(e) => {
            e.currentTarget.style.background = '#1a1a22';
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=6366f1&color=fff&size=200`;
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 50%, rgba(6,6,8,0.7) 100%)',
          pointerEvents: 'none'
        }} />
        {/* Badge */}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <span className={`badge ${config.badgeClass}`}>{config.label}</span>
        </div>
        {/* Options count indicator */}
        {options && options.length > 1 && (
          <div style={{ 
            position: 'absolute', top: '10px', left: '10px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-full)',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: '700',
            color: 'white',
            display: 'flex', alignItems: 'center', gap: '3px'
          }}>
            <Zap size={10} color="#f59e0b" />
            {options.length} فئات
          </div>
        )}
      </div>

      {/* Content */}
      <div className="card-content" style={{ 
        display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between',
        padding: '13px'
      }}>
        <div>
          <h3 style={{ 
            fontSize: '14px', fontWeight: '700', 
            marginBottom: '5px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            color: 'var(--text-main)'
          }}>
            {title}
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-subtle)', marginBottom: '10px', lineHeight: '1.4' }}>
            {options && options.length > 0 
              ? `${options.length} خيار متاح • تسليم فوري ⚡` 
              : 'سعر ثابت • تسليم فوري ⚡'}
          </p>
        </div>

        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div>
            {options && options.length > 1 && (
              <span style={{ fontSize: '10px', color: 'var(--text-subtle)', display: 'block' }}>يبدأ من</span>
            )}
            <span style={{ 
              fontSize: '17px', fontWeight: '800', 
              color: 'var(--accent)',
              lineHeight: 1.2
            }}>
              {lowestPrice} <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-subtle)' }}>MRU</span>
            </span>
          </div>
          
          <button 
            type="button"
            onClick={handleQuickAdd}
            title="إضافة للسلة"
            style={{ 
              width: '36px', height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              flexShrink: 0
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
          >
            <Plus size={17} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
