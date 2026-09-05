import React, { useState } from 'react';
import { ArrowRight, Star, ShieldCheck, Zap, Plus, Minus, ShoppingCart, CreditCard, Check, MessageCircle, ThumbsUp, Send, CheckCircle2, User, X, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const categoryConfig = {
  Crypto: { badgeClass: 'badge-crypto', label: 'عملة رقمية' },
  Games: { badgeClass: 'badge-game', label: 'شحن ألعاب' },
  Cards: { badgeClass: 'badge-gift', label: 'بطاقة هدية' },
};

export default function ProductDetail({ onBack }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, products, storeSettings, getProductReviews, addReview, showToast } = useStore();
  
  const product = location.state || products[0];
  
  const [quantity, setQuantity] = useState(1);
  const hasOptions = product?.options && product.options.length > 0;
  const [selectedOption, setSelectedOption] = useState(hasOptions ? product.options[0] : null);
  const [addedToCart, setAddedToCart] = useState(false);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }} dir="rtl">
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>المنتج غير موجود</p>
        <button onClick={onBack} className="btn btn-primary">العودة للرئيسية</button>
      </div>
    );
  }

  const productReviews = getProductReviews ? getProductReviews(product.id) : [];
  const avgRating = productReviews.length > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    : '5.0';

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewName.trim()) {
      if (showToast) showToast('يرجى إدخال اسمك الكريم', 'error');
      return;
    }
    if (!reviewComment.trim()) {
      if (showToast) showToast('يرجى كتابة رأيك في المنتج', 'error');
      return;
    }

    addReview(product.id, {
      name: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      verified: true
    });

    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
    setShowReviewModal(false);
  };

  const currentPrice = selectedOption ? selectedOption.price : product.price;
  const totalPrice = (currentPrice * quantity).toFixed(2);
  const config = categoryConfig[product.category] || { badgeClass: 'badge-game', label: product.category };

  const handleAddToCart = (redirect = false) => {
    addToCart(product, quantity, selectedOption);
    if (redirect) {
      navigate('/cart');
    } else {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const whatsappUrl = `https://wa.me/${storeSettings.whatsappNumber || '22233445566'}?text=${encodeURIComponent(`مرحباً، أريد شراء: ${product.title}${selectedOption ? ' - ' + selectedOption.label : ''} بسعر ${currentPrice} MRU`)}`;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--bg-dark)' }} dir="rtl">
      
      {/* Hero Image */}
      <div style={{ position: 'relative', height: '300px', width: '100%' }}>
        <img 
          src={product.image} 
          alt={product.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)';
          }}
        />
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to bottom, rgba(6,6,8,0.5) 0%, rgba(6,6,8,0.0) 40%, rgba(6,6,8,0.95) 100%)' 
        }} />
        
        {/* Back Button */}
        <button 
          onClick={onBack} 
          style={{ 
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            background: 'rgba(6,6,8,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
          }}
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="container" style={{ padding: '0 16px', marginTop: '-40px', position: 'relative', zIndex: 2 }}>
        
        {/* Title Area */}
        <div style={{ marginBottom: '20px' }}>
          <span className={`badge ${config.badgeClass}`} style={{ marginBottom: '10px', display: 'inline-flex' }}>
            {config.label}
          </span>
          <h1 style={{ 
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: '900',
            lineHeight: '1.25',
            letterSpacing: '-0.02em',
            marginBottom: '10px',
            color: 'var(--text-main)'
          }}>
            {product.title}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i <= Math.round(Number(avgRating)) ? "#f59e0b" : "transparent"} 
                  color="#f59e0b" 
                />
              ))}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {avgRating}/5 • ({productReviews.length} {productReviews.length === 1 ? 'تقييم' : 'تقييمات'})
            </span>
          </div>
        </div>

        {/* Price + Quantity Card */}
        <div className="card" style={{ 
          padding: '18px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(11,11,14,0.9) 100%)',
          border: '1px solid rgba(16,185,129,0.15)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                {quantity > 1 ? `${currentPrice} MRU × ${quantity}` : 'السعر الإجمالي'}
              </span>
              {selectedOption?.originalPrice && selectedOption.originalPrice > currentPrice && (
                <span style={{ 
                  fontSize: '10px', 
                  color: '#10b981', 
                  fontWeight: '800', 
                  backgroundColor: 'rgba(16,185,129,0.15)', 
                  padding: '1px 6px', 
                  borderRadius: '4px' 
                }}>
                  وفر {Math.round(((selectedOption.originalPrice - currentPrice) / selectedOption.originalPrice) * 100)}%
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent)', lineHeight: 1 }}>
                {totalPrice}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', marginRight: '4px' }}>MRU</span>
              {selectedOption?.originalPrice && selectedOption.originalPrice > currentPrice && (
                <span style={{ fontSize: '14px', color: '#64748b', textDecoration: 'line-through' }}>
                  {(selectedOption.originalPrice * quantity).toFixed(2)} MRU
                </span>
              )}
            </div>
          </div>

          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <button 
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ 
                padding: '8px 14px', color: 'var(--text-muted)',
                fontSize: '18px', fontWeight: '300',
                transition: 'color 0.2s',
                borderLeft: '1px solid var(--border-color)'
              }}
            >
              <Minus size={16} />
            </button>
            <span style={{ 
              fontWeight: '800', minWidth: '36px', textAlign: 'center',
              fontSize: '16px', padding: '0 4px'
            }}>
              {quantity}
            </span>
            <button 
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              style={{ 
                padding: '8px 14px', color: 'var(--text-main)',
                fontSize: '18px', fontWeight: '300',
                transition: 'color 0.2s',
                borderRight: '1px solid var(--border-color)'
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Options Selection */}
        {hasOptions && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '15px', fontWeight: '700', 
              marginBottom: '14px', 
              color: 'var(--text-main)',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <Zap size={16} color="var(--accent-secondary)" />
              اختر الباقة / الفئة المطلوبة:
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
              gap: '12px' 
            }}>
              {product.options.map((option, index) => {
                const isActive = selectedOption && selectedOption.label === option.label;
                const hasDiscount = option.originalPrice && option.originalPrice > option.price;
                return (
                  <button 
                    key={index} 
                    type="button"
                    onClick={() => setSelectedOption(option)}
                    style={{
                      padding: '14px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.08) 100%)'
                        : 'rgba(255,255,255,0.03)',
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative',
                      boxShadow: isActive ? '0 4px 16px rgba(99,102,241,0.2)' : 'none',
                      textAlign: 'right'
                    }}
                  >
                    {isActive && (
                      <div style={{ 
                        position: 'absolute', top: '8px', left: '8px',
                        backgroundColor: 'var(--primary)',
                        borderRadius: '50%',
                        width: '18px', height: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Check size={11} color="white" strokeWidth={3} />
                      </div>
                    )}
                    
                    {option.badge && (
                      <div style={{
                        display: 'inline-block',
                        fontSize: '9.5px',
                        fontWeight: '800',
                        color: '#fbbf24',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        marginBottom: '6px'
                      }}>
                        {option.badge}
                      </div>
                    )}

                    <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px', color: isActive ? '#fff' : 'var(--text-main)' }}>
                      {option.label}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ 
                        fontSize: '16px', fontWeight: '800', 
                        color: isActive ? '#34d399' : 'var(--accent)'
                      }}>
                        {option.price} <span style={{ fontSize: '11px', fontWeight: '600' }}>MRU</span>
                      </span>
                      {hasDiscount && (
                        <span style={{ fontSize: '11px', color: '#64748b', textDecoration: 'line-through' }}>
                          {option.originalPrice}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Trust Features */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: Zap, title: 'تسليم فوري', sub: 'خلال دقيقة من التحويل', color: 'var(--accent)', bg: 'rgba(16,185,129,0.1)' },
            { icon: ShieldCheck, title: 'دفع آمن ومضمون', sub: 'بنكيلي • مصرفي • سداد', color: 'var(--primary)', bg: 'rgba(99,102,241,0.1)' }
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ backgroundColor: item.bg, padding: '10px', borderRadius: 'var(--radius-sm)', color: item.color, flexShrink: 0 }}>
                <item.icon size={18} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px' }}>{item.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '2px' }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        {product.description && (
          <div className="card" style={{ padding: '18px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>تفاصيل المنتج</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '14px' }}>
              {product.description}
            </p>
          </div>
        )}

        {/* Customer Reviews & Ratings Section */}
        <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={18} fill="#f59e0b" color="#f59e0b" />
                آراء وتقييمات العملاء
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                متوسط التقييم {avgRating} من 5 ({productReviews.length} تقييم)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="btn btn-primary"
              style={{ padding: '8px 14px', fontSize: '12px', borderRadius: 'var(--radius-full)' }}
            >
              <Sparkles size={14} />
              أضف تقييمك
            </button>
          </div>

          {productReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              كن أول من يكتب تقييماً وتجربة شراء لهذا المنتج ✨
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {productReviews.map((rev) => (
                <div 
                  key={rev.id} 
                  style={{ 
                    padding: '14px', 
                    borderRadius: 'var(--radius-md)', 
                    backgroundColor: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-light)' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '28px', height: '28px', borderRadius: '50%', 
                        backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: '800'
                      }}>
                        {rev.name ? rev.name[0] : 'ع'}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{rev.name}</span>
                      {rev.verified && (
                        <span style={{ 
                          fontSize: '10px', 
                          backgroundColor: 'rgba(16,185,129,0.12)', 
                          color: '#34d399', 
                          padding: '2px 8px', 
                          borderRadius: 'var(--radius-full)',
                          display: 'inline-flex', alignItems: 'center', gap: '3px'
                        }}>
                          <CheckCircle2 size={10} /> مشتري موثوق
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{rev.date}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={12} 
                        fill={s <= rev.rating ? "#f59e0b" : "transparent"} 
                        color="#f59e0b" 
                      />
                    ))}
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WhatsApp contact */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '13px',
            backgroundColor: 'rgba(37, 211, 102, 0.08)',
            border: '1px solid rgba(37, 211, 102, 0.25)',
            borderRadius: 'var(--radius-md)',
            color: '#25D366', fontWeight: '700', fontSize: '14px',
            textDecoration: 'none',
            transition: 'all 0.2s',
            marginBottom: '8px'
          }}
        >
          <MessageCircle size={18} />
          تواصل عبر واتساب للاستفسار
        </a>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div 
            className="modal-card" 
            onClick={e => e.stopPropagation()} 
            style={{ maxWidth: '440px', padding: '24px', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--accent)" />
                تقييم: {product.title}
              </h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                style={{ color: 'var(--text-subtle)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  درجة التقييم:
                </label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transform: reviewRating >= star ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s'
                      }}
                    >
                      <Star 
                        size={28} 
                        fill={reviewRating >= star ? "#f59e0b" : "transparent"} 
                        color="#f59e0b" 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  اسمك الكريم
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="مثال: أحمد محمد"
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  رأيك وتجربتك
                </label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  placeholder="شاركنا رأيك في سرعة التسليم وجودة الخدمة..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '4px' }}
              >
                <Send size={16} />
                نشر التقييم الآن
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fixed CTA Bottom */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        padding: '14px 18px',
        background: 'rgba(6, 6, 8, 0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-color)',
        zIndex: 50,
        display: 'flex', gap: '12px',
      }}>
        <button 
          onClick={() => handleAddToCart(false)}
          style={{ 
            flex: 1, padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: addedToCart ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${addedToCart ? 'rgba(16,185,129,0.4)' : 'var(--border-color)'}`,
            color: addedToCart ? 'var(--accent)' : 'white',
            fontWeight: '700', fontSize: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.3s', cursor: 'pointer'
          }}
        >
          {addedToCart ? <Check size={18} /> : <ShoppingCart size={18} />}
          <span>{addedToCart ? 'تمت الإضافة ✓' : 'أضف للسلة'}</span>
        </button>

        <button 
          className="btn btn-primary"
          onClick={() => handleAddToCart(true)}
          style={{ 
            flex: 1.5, padding: '14px',
            fontSize: '14px', fontWeight: '800',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <CreditCard size={18} />
          <span>شراء الآن • {totalPrice} MRU</span>
        </button>
      </div>
    </div>
  );
}
