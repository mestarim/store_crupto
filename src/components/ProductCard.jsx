import React, { useState } from 'react';
import { Plus, ShoppingCart, Zap, Check, Layers, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const categoryConfig = {
  Crypto: { badgeClass: 'badge-crypto', label: 'كريبتو' },
  Games: { badgeClass: 'badge-game', label: 'ألعاب' },
  Cards: { badgeClass: 'badge-gift', label: 'بطاقات' },
};

export default function ProductCard({ 
  id, 
  title, 
  price, 
  originalPrice,
  image, 
  category, 
  type = 'game', 
  options, 
  description, 
  onClick 
}) {
  const { addToCart } = useStore();
  const config = categoryConfig[category] || { badgeClass: 'badge-game', label: category };
  
  // Active selected option index inside the card
  const hasOptions = options && Array.isArray(options) && options.length > 0;
  const [selectedOptIndex, setSelectedOptIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const selectedOption = hasOptions 
    ? (options[selectedOptIndex] || options[0])
    : null;

  const activePrice = selectedOption ? selectedOption.price : price;
  const activeOriginalPrice = selectedOption?.originalPrice || (!hasOptions ? originalPrice : null);
  
  const discountPercent = activeOriginalPrice && activeOriginalPrice > activePrice
    ? Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100)
    : null;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    const product = { id, title, price, originalPrice, image, category, type, options, description };
    addToCart(product, 1, selectedOption);
    
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1400);
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
        position: 'relative',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
      }}
    >
      {/* ─── Image Header ─── */}
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
          background: 'linear-gradient(to bottom, transparent 40%, rgba(6,6,8,0.75) 100%)',
          pointerEvents: 'none'
        }} />

        {/* Category Badge */}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <span className={`badge ${config.badgeClass}`}>{config.label}</span>
        </div>

        {/* Options count indicator or Active option badge */}
        {hasOptions ? (
          <div style={{ 
            position: 'absolute', top: '10px', left: '10px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-full)',
            padding: '3px 8px',
            fontSize: '10px',
            fontWeight: '700',
            color: 'white',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <Layers size={11} color="#818cf8" />
            <span>{options.length} باقات</span>
          </div>
        ) : (
          <div style={{ 
            position: 'absolute', top: '10px', left: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-full)',
            padding: '2px 7px',
            fontSize: '10px',
            fontWeight: '700',
            color: '#34d399',
            display: 'flex', alignItems: 'center', gap: '3px'
          }}>
            <Zap size={10} color="#34d399" />
            تسليم فوري
          </div>
        )}

        {/* Selected Option Badge Overlay (if option has a promotional badge) */}
        {selectedOption?.badge && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '10px',
            backgroundColor: 'rgba(245, 158, 11, 0.9)',
            backdropFilter: 'blur(6px)',
            color: '#090d15',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
          }}>
            <Sparkles size={10} />
            <span>{selectedOption.badge}</span>
          </div>
        )}
      </div>

      {/* ─── Card Body ─── */}
      <div className="card-content" style={{ 
        display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between',
        padding: '12px 13px'
      }}>
        <div>
          <h3 style={{ 
            fontSize: '14px', fontWeight: '800', 
            marginBottom: '4px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            color: 'var(--text-main)'
          }}>
            {title}
          </h3>

          {/* ─── Interactive Variant Selector (Multi-items in 1 Card) ─── */}
          {hasOptions ? (
            <div style={{ margin: '6px 0 8px 0' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '5px' 
              }}>
                <span style={{ fontSize: '10px', color: 'var(--text-subtle)', fontWeight: '600' }}>
                  الباقة المحددة: <strong style={{ color: '#c7d2fe' }}>{selectedOption?.label}</strong>
                </span>
                {options.length > 3 && (
                  <span style={{ fontSize: '9px', color: '#64748b' }}>اسحب للمزيد ←</span>
                )}
              </div>

              {/* Horizontal Scrollable Pills */}
              <div 
                className="hide-scrollbar"
                onClick={e => e.stopPropagation()}
                style={{
                  display: 'flex',
                  gap: '5px',
                  overflowX: 'auto',
                  padding: '2px 1px 4px 1px',
                  scrollSnapType: 'x mandatory',
                }}
              >
                {options.map((opt, idx) => {
                  const isSelected = idx === selectedOptIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOptIndex(idx);
                      }}
                      title={`اختيار ${opt.label} بسعر ${opt.price} MRU`}
                      style={{
                        flexShrink: 0,
                        padding: '4px 8px',
                        borderRadius: '7px',
                        fontSize: '10.5px',
                        fontWeight: isSelected ? '800' : '600',
                        backgroundColor: isSelected 
                          ? 'rgba(99, 102, 241, 0.28)' 
                          : 'rgba(255, 255, 255, 0.04)',
                        border: isSelected 
                          ? '1px solid #818cf8' 
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                        boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                        scrollSnapAlign: 'start'
                      }}
                    >
                      {isSelected && (
                        <span style={{ 
                          width: '5px', height: '5px', 
                          borderRadius: '50%', 
                          backgroundColor: '#38bdf8',
                          boxShadow: '0 0 6px #38bdf8' 
                        }} />
                      )}
                      <span>{opt.label}</span>
                      {opt.badge && !isSelected && (
                        <span style={{
                          fontSize: '8.5px',
                          padding: '0 3px',
                          borderRadius: '3px',
                          backgroundColor: 'rgba(245, 158, 11, 0.2)',
                          color: '#fbbf24'
                        }}>
                          •
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '11px', color: 'var(--text-subtle)', marginBottom: '8px', lineHeight: '1.4' }}>
              سعر ثابت • تسليم فوري ⚡
            </p>
          )}
        </div>

        {/* ─── Price & Action Row ─── */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {hasOptions && (
                <span style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>
                  السعر:
                </span>
              )}
              {discountPercent && (
                <span style={{ 
                  fontSize: '9px', 
                  color: '#10b981', 
                  fontWeight: '800', 
                  backgroundColor: 'rgba(16,185,129,0.15)', 
                  padding: '1px 5px', 
                  borderRadius: '4px' 
                }}>
                  وفر {discountPercent}%
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ 
                fontSize: '17px', fontWeight: '900', 
                color: 'var(--accent)',
                lineHeight: 1.2
              }}>
                {activePrice} <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-subtle)' }}>MRU</span>
              </span>
              {activeOriginalPrice && activeOriginalPrice > activePrice && (
                <span style={{ fontSize: '11px', color: '#64748b', textDecoration: 'line-through' }}>
                  {activeOriginalPrice}
                </span>
              )}
            </div>
          </div>
          
          {/* Quick Add Button with Feedback Animation */}
          <button 
            type="button"
            onClick={handleQuickAdd}
            title={justAdded ? 'تمت الإضافة للسلة' : `إضافة (${selectedOption?.label || title}) للسلة`}
            style={{ 
              width: '36px', height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: justAdded
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: justAdded 
                ? '0 4px 14px rgba(16, 185, 129, 0.45)' 
                : '0 4px 12px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: justAdded ? 'scale(1.08)' : 'scale(1)',
              flexShrink: 0
            }}
            onMouseEnter={e => {
              if (!justAdded) e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={e => {
              if (!justAdded) e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {justAdded ? (
              <Check size={17} strokeWidth={3} className="animate-bounce" />
            ) : (
              <Plus size={17} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

