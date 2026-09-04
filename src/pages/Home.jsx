import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import CryptoCalculator from '../components/CryptoCalculator';
import { useStore } from '../context/StoreContext';
import { Zap, ShieldCheck, Headphones, Sparkles, AlertCircle, Bitcoin, Gamepad2, Gift, ChevronLeft, Flame, Copy, Check, Clock, TrendingUp } from 'lucide-react';

const CATEGORIES = [
  { label: 'الكل', key: 'all', icon: Sparkles },
  { label: 'عملات رقمية', key: 'Crypto', icon: Bitcoin },
  { label: 'شحن ألعاب', key: 'Games', icon: Gamepad2 },
  { label: 'بطاقات هدايا', key: 'Cards', icon: Gift },
];

function LiveCryptoTicker() {
  const [rates] = useState([
    { symbol: 'USDT / MRU', price: '101.50', change: '+0.25%', up: true },
    { symbol: 'BTC / USD', price: '$89,450', change: '+3.14%', up: true },
    { symbol: 'ETH / USD', price: '$3,180', change: '+2.40%', up: true },
    { symbol: 'SOL / USD', price: '$198.20', change: '+5.65%', up: true },
  ]);

  return (
    <div style={{
      backgroundColor: '#090d15',
      borderBottom: '1px solid #1a2333',
      padding: '8px 16px',
      overflowX: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      fontSize: '12px',
      whiteSpace: 'nowrap'
    }} className="hide-scrollbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontWeight: '800', flexShrink: 0 }}>
        <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
        <span>أسعار السوق الفورية:</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {rates.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span style={{ color: '#94a3b8', fontWeight: '600' }}>{r.symbol}</span>
            <strong style={{ color: '#f8fafc' }}>{r.price}</strong>
            <span style={{ color: r.up ? '#10b981' : '#f87171', fontSize: '11px', fontWeight: '700' }}>
              {r.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlashSaleCountdown() {
  const { showToast } = useStore();
  const [copied, setCopied] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return Math.max(0, Math.floor((endOfDay - now) / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  const handleCopy = () => {
    navigator.clipboard.writeText('FLASH15');
    setCopied(true);
    if (showToast) showToast('تم نسخ كود الخصم (FLASH15) بنجاح! 🎉');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      marginBottom: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '14px',
      boxShadow: '0 10px 30px rgba(245, 158, 11, 0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#f59e0b', flexShrink: 0
        }}>
          <Flame size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'white' }}>
              عروض الفلاش الخاطفة 🔥
            </span>
            <span style={{ fontSize: '11px', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
              خصم 15%
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            استخدم كود <strong style={{ color: '#fbbf24' }}>FLASH15</strong> عند الدفع قبل انتهاء المؤقت
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Countdown Blocks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {[
            { val: hours, unit: 'ساعة' },
            { val: minutes, unit: 'دقيقة' },
            { val: seconds, unit: 'ثانية' }
          ].map((block, idx) => (
            <React.Fragment key={idx}>
              <div style={{
                backgroundColor: '#07090e',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '4px 8px',
                textAlign: 'center',
                minWidth: '38px'
              }}>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#fbbf24', fontFamily: 'monospace', lineHeight: 1.1 }}>
                  {block.val}
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>{block.unit}</div>
              </div>
              {idx < 2 && <span style={{ color: '#fbbf24', fontWeight: '900' }}>:</span>}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={handleCopy}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            backgroundColor: '#f59e0b',
            color: '#07090e',
            fontWeight: '800',
            fontSize: '12px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
            transition: 'transform 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'تم النسخ' : 'نسخ الكوبون'}</span>
        </button>
      </div>
    </div>
  );
}

function CategoryPill({ cat, isSelected, onClick }) {
  const Icon = cat.icon;
  return (
    <button 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '10px 18px',
        backgroundColor: isSelected 
          ? 'var(--primary)' 
          : 'rgba(255,255,255,0.04)',
        color: isSelected ? 'white' : 'var(--text-muted)',
        border: isSelected 
          ? '1px solid transparent' 
          : '1px solid var(--border-color)',
        borderRadius: 'var(--radius-full)',
        fontWeight: '700',
        fontSize: '13px',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isSelected ? 'var(--shadow-primary)' : 'none',
        flexShrink: 0
      }}
    >
      <Icon size={15} />
      <span>{cat.label}</span>
    </button>
  );
}

function FeatureCard({ icon: Icon, title, subtitle, color, bg }) {
  return (
    <div className="card" style={{ 
      padding: '18px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '14px',
    }}>
      <div style={{ 
        backgroundColor: bg, 
        padding: '12px', 
        borderRadius: 'var(--radius-md)', 
        color,
        flexShrink: 0
      }}>
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '3px' }}>{title}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-subtle)', lineHeight: '1.4' }}>{subtitle}</div>
      </div>
    </div>
  );
}

export default function Home({ products, onNavigate, searchQuery = '' }) {
  const { storeSettings } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  const activeKey = CATEGORIES.find(c => c.label === selectedCategory)?.key || 'all';

  const filteredProducts = products.filter(product => {
    const matchesCategory = 
      selectedCategory === 'الكل' || 
      product.category === activeKey ||
      (selectedCategory === 'عملات رقمية' && product.category === 'Crypto') ||
      (selectedCategory === 'شحن ألعاب' && product.category === 'Games') ||
      (selectedCategory === 'بطاقات هدايا' && product.category === 'Cards');

    const matchesSearch = !searchQuery.trim() || 
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div dir="rtl" style={{ paddingBottom: '90px' }}>
      
      {/* Live Crypto Rates Ticker */}
      <LiveCryptoTicker />

      {/* Notice Banner */}
      {storeSettings.bannerNotice && (
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(6, 182, 212, 0.05) 100%)',
          borderBottom: '1px solid var(--border-color)',
          padding: '11px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          color: 'var(--text-main)',
          fontWeight: '600'
        }}>
          <Sparkles size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {storeSettings.bannerNotice}
          </span>
        </div>
      )}

      <div className="container" style={{ padding: '20px 18px' }}>
        
        {/* Flash Sale Countdown Banner */}
        <FlashSaleCountdown />
      
        {/* ─── Hero Section ─── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(6, 182, 212, 0.05) 45%, var(--bg-card) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 28px',
          marginBottom: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px var(--primary-light)'
        }}>
          {/* Decorative orbs */}
          <div className="orb" style={{ top: -80, right: -60, width: 280, height: 280, background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)' }} />
          <div className="orb" style={{ bottom: -60, left: 60, width: 200, height: 200, background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)' }} />
          <div className="orb" style={{ top: '20%', left: '40%', width: 160, height: 160, background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
          
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px' }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px', fontWeight: '700',
              marginBottom: '16px',
              border: '1px solid rgba(255,255,255,0.15)'
            }}>
              <Zap size={13} color="#fbbf24" />
              <span>تسليم فوري وآمن 100%</span>
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(22px, 5vw, 34px)', 
              fontWeight: '900', 
              marginBottom: '12px',
              lineHeight: '1.2',
              letterSpacing: '-0.03em'
            }}>
              عالمك الرقمي في موريتانيا 🇲🇷
            </h1>
            
            <p style={{ 
              opacity: 0.85, marginBottom: '24px', 
              fontSize: '14px', lineHeight: '1.7',
              maxWidth: '480px',
              color: '#c7d2fe'
            }}>
              شراء USDT والبيتكوين، شحن شدات ببجي وفري فاير، وبطاقات أبل وبلايستيشن. الدفع بـ بنكيلي ومصرفي والسداد.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => {
                  document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ 
                  background: 'white',
                  color: '#07090e',
                  padding: '11px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '800',
                  fontSize: '14px',
                  display: 'flex', alignItems: 'center', gap: '7px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s',
                  border: 'none', cursor: 'pointer',
                  flexShrink: 0
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                تصفح المنتجات
                <ChevronLeft size={16} />
              </button>
              
              <button 
                onClick={() => setSelectedCategory('عملات رقمية')}
                style={{ 
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '11px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  flexShrink: 0
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              >
                <Bitcoin size={16} /> شراء كريبتو
              </button>
            </div>
          </div>
        </div>

        {/* ─── Feature Cards ─── */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '14px', 
          marginBottom: '28px' 
        }}>
          <FeatureCard 
            icon={Zap} 
            title="تسليم آلي وفوري" 
            subtitle="تصلك أكوادك فور تأكيد التحويل"
            color="#34d399" 
            bg="rgba(16, 185, 129, 0.12)" 
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="طرق دفع محلية مضمونة" 
            subtitle="بنكيلي، مصرفي، تطبيق السداد"
            color="var(--primary)" 
            bg="rgba(99, 102, 241, 0.12)" 
          />
          <FeatureCard 
            icon={Headphones} 
            title="دعم مباشر عبر واتساب" 
            subtitle="متاحون للرد السريع دائماً"
            color="#fbbf24" 
            bg="rgba(245, 158, 11, 0.12)" 
          />
        </div>

        {/* ─── Crypto Calculator ─── */}
        <CryptoCalculator />

        {/* ─── Category Filter ─── */}
        <div style={{ marginBottom: '24px' }}>
          <div className="section-header">
            <h2 className="section-title">تصفح المنتجات</h2>
            {selectedCategory !== 'الكل' && (
              <button 
                onClick={() => setSelectedCategory('الكل')}
                style={{ 
                  fontSize: '13px', color: 'var(--primary)', fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                عرض الكل ✕
              </button>
            )}
          </div>
          
          <div className="flex gap-3 hide-scrollbar" style={{ overflowX: 'auto', paddingBottom: '6px' }}>
            {CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat.key}
                cat={cat}
                isSelected={selectedCategory === cat.label}
                onClick={() => setSelectedCategory(cat.label)}
              />
            ))}
          </div>
        </div>

        {/* ─── Products Grid ─── */}
        <div id="products-section">
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
              {selectedCategory === 'الكل' ? 'جميع المنتجات' : `قسم: ${selectedCategory}`}
              <span style={{ fontSize: '13px', color: 'var(--text-subtle)', marginRight: '8px', fontWeight: '500' }}>
                ({filteredProducts.length})
              </span>
            </h2>
            {searchQuery && (
              <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                نتائج: "{searchQuery}"
              </span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="card" style={{ padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ 
                width: '72px', height: '72px',
                borderRadius: '50%',
                background: 'rgba(99,102,241,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <AlertCircle size={36} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>لا توجد نتائج</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                جرّب كلمات مختلفة أو اختر قسماً آخر
              </p>
              <button 
                onClick={() => setSelectedCategory('الكل')}
                className="btn btn-primary"
                style={{ padding: '10px 24px' }}
              >
                عرض كل المنتجات
              </button>
            </div>
          ) : (
            <div className="grid-responsive">
              {filteredProducts.map((product, idx) => (
                <div 
                  key={product.id} 
                  style={{ animation: `fadeIn 0.4s cubic-bezier(0.16,1,0.3,1) ${idx * 0.05}s both` }}
                >
                  <ProductCard 
                    {...product} 
                    onClick={() => onNavigate('/product', product)} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
