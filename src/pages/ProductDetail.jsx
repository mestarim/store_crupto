import React, { useState } from 'react';
import { ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function ProductDetail({ onBack }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const product = location.state;
  
  // Use a default product if none is passed for now
  const item = product || {
    id: 2, 
    title: 'PUBG Mobile 660 UC', 
    price: '9.99', 
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
    category: 'Games', 
    type: 'game',
    description: 'شحن فوري ومباشر لحسابك في ببجي موبايل. استخدم الشدات لشراء الرويال باس، السكنات، والأسلحة المميزة.'
  };

  const hasOptions = item.options && item.options.length > 0;
  
  // Set initial option based on whether the product has options
  const [selectedOption, setSelectedOption] = useState(hasOptions ? item.options[0] : null);

  const currentPrice = selectedOption ? selectedOption.price : item.price;
  const currentTitle = selectedOption ? `${item.title} - ${selectedOption.label}` : item.title;

  const badgeClass = `badge badge-${item.type}`;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--bg-dark)', zIndex: 100, position: 'relative' }}>
      
      {/* Product Image Header */}
      <div style={{ position: 'relative', height: '350px', width: '100%' }}>
        <img src={item.image} alt={currentTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Gradient overlay for better text visibility */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(9,9,11,0.6) 0%, rgba(9,9,11,0) 40%, rgba(9,9,11,1) 100%)' }}></div>
        
        {/* Back button over image */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
          <button onClick={onBack} style={{ backgroundColor: 'rgba(24, 24, 27, 0.7)', backdropFilter: 'blur(8px)', padding: '12px', borderRadius: '50%' }}>
            <ArrowRight size={24} className="text-main" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ padding: '0 16px', marginTop: '-40px', position: 'relative', zIndex: 2 }}>
        <span className={badgeClass} style={{ marginBottom: '12px' }}>{item.category}</span>
        
        <h1 className="h1" style={{ marginBottom: '8px', lineHeight: 1.3 }}>{currentTitle}</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', color: 'var(--accent-secondary)' }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
          </div>
          <span className="text-sm text-muted">(4.9/5 التقييم)</span>
        </div>

        <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', marginBottom: '32px' }}>
          {currentPrice} MRU
        </div>

        {/* Product Options */}
        {hasOptions && (
          <div style={{ marginBottom: '32px' }}>
            <h3 className="h3" style={{ marginBottom: '12px' }}>اختر الفئة:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {item.options.map((option, index) => {
                const isActive = selectedOption && selectedOption.label === option.label;
                return (
                  <button 
                    key={index} 
                    onClick={() => setSelectedOption(option)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
                      backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                      color: isActive ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: isActive ? 'bold' : 'normal',
                      flex: '1 1 calc(33% - 12px)',
                      minWidth: '100px',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>{option.label}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>{option.price} MRU</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Features Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '50%', color: 'var(--accent)' }}>
              <Zap size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>تسليم فوري</div>
              <div className="text-xs text-muted">تلقائي بعد الدفع</div>
            </div>
          </div>
          <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>دفع آمن</div>
              <div className="text-xs text-muted">حماية 100%</div>
            </div>
          </div>
        </div>

        <h3 className="h2" style={{ marginBottom: '12px' }}>الوصف</h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
          {item.description || 'شحن فوري ومباشر ومضمون بأفضل الأسعار المتاحة في السوق.'}
        </p>
      </div>

      {/* Add to Cart Fixed Bottom */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', zIndex: 10 }}>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            const optionToPass = item.options ? item.options[selectedOption] : null;
            addToCart(item, 1, optionToPass);
            navigate('/cart');
          }}
          style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          إضافة للسلة
        </button>
      </div>

    </div>
  );
}
