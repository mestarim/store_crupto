import React, { useState } from 'react';
import { User, ShieldCheck, Headphones, ExternalLink, LogOut, Phone, Hash, Copy, CheckCircle, Palette, Check, Sparkles, Gift, Share2, Award } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

function InfoRow({ label, value, onCopy }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy();
  };
  return (
    <div style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    }}>
      <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{value}</span>
        {onCopy && (
          <button
            onClick={handleCopy}
            style={{ color: copied ? 'var(--accent)' : 'var(--text-subtle)', padding: '4px', transition: 'color 0.2s' }}
            title="نسخ"
          >
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const { isAdmin, adminLogout, setIsAdminModalOpen, storeSettings, showToast, referralCode, referralStats } = useStore();
  const navigate = useNavigate();

  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('digistore_theme') || 'emerald';
  });

  const themes = [
    { 
      id: 'emerald', 
      name: 'الزمرد الرقمي', 
      desc: 'أخضر مالي وكريبتو',
      primary: '#10b981', 
      accent: '#06b6d4',
      badge: 'الافتراضي'
    },
    { 
      id: 'gold', 
      name: 'الذهب الملكي', 
      desc: 'بايننس وكريبتو فاخر',
      primary: '#f59e0b', 
      accent: '#10b981',
      badge: 'VIP'
    },
    { 
      id: 'cyan', 
      name: 'السايبر بانك', 
      desc: 'أكوا متوهج وبنفسجي',
      primary: '#06b6d4', 
      accent: '#a855f7',
      badge: 'نيون'
    },
    { 
      id: 'purple', 
      name: 'الياقوت الفاخر', 
      desc: 'بنفسجي وأزرق هادئ',
      primary: '#8b5cf6', 
      accent: '#06b6d4',
      badge: 'فخم'
    },
  ];

  const handleThemeChange = (themeId, themeName) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('digistore_theme', themeId);
    if (showToast) showToast(`تم تفعيل مظهر "${themeName}" بنجاح 🎨`);
  };

  const paymentAccounts = [
    { method: 'بنكيلي', number: storeSettings.bankilyNumber, color: '#00b4d8' },
    { method: 'مصرفي', number: storeSettings.masriviNumber, color: 'var(--primary)' },
    { method: 'السداد', number: storeSettings.sedadNumber, color: '#10b981' },
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '24px 16px', paddingBottom: '100px' }} dir="rtl">
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="h1" style={{ fontSize: '22px', marginBottom: '6px' }}>حسابي</h1>
        <p className="text-sm text-muted">إعداداتك، تخصيص المظهر، ومعلومات الدعم</p>
      </div>

      {/* User Avatar Card */}
      <div className="card" style={{ 
        padding: '24px', marginBottom: '16px',
        background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(11,11,14,0.9) 100%)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '62px', height: '62px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', flexShrink: 0,
            boxShadow: 'var(--shadow-primary)'
          }}>
            <User size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>
              عميل DigiStore
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ 
                fontSize: '12px', 
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-light)',
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                color: 'var(--text-muted)'
              }}>
                🇲🇷 موريتانيا
              </span>
              <span style={{ 
                fontSize: '12px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                color: 'var(--accent)'
              }}>
                MRU
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Theme & Colors Selector Card ─── */}
      <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '10px', 
            backgroundColor: 'var(--primary-light)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Palette size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800' }}>مظهر وألوان المتجر</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>اختر السمة واللون المفضل للتصميم</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          {themes.map(th => {
            const isSelected = currentTheme === th.id;
            return (
              <button
                key={th.id}
                onClick={() => handleThemeChange(th.id, th.name)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  padding: '14px', borderRadius: '14px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  border: isSelected ? `2px solid ${th.primary}` : '1px solid var(--border-light)',
                  cursor: 'pointer', textAlign: 'right', transition: 'all 0.2s',
                  position: 'relative',
                  boxShadow: isSelected ? `0 6px 20px ${th.primary}25` : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    width: '22px', height: '22px', borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${th.primary} 0%, ${th.accent} 100%)`,
                    boxShadow: `0 0 10px ${th.primary}66`,
                    display: 'inline-block'
                  }} />
                  {isSelected ? (
                    <Check size={16} style={{ color: th.primary }} />
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--text-subtle)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>
                      {th.badge}
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: isSelected ? 'white' : 'var(--text-main)', marginBottom: '2px' }}>
                    {th.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                    {th.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Referral & Rewards Program Card ─── */}
      <div className="card" style={{ 
        padding: '22px', marginBottom: '16px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(11, 11, 14, 0.95) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '38px', height: '38px', borderRadius: '10px', 
              backgroundColor: 'rgba(245, 158, 11, 0.15)', 
              color: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Gift size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white' }}>برنامج الإحالة والمكافآت</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>اربح رصيداً ومكافآت بمشاركة المتجر مع أصدقائك</p>
            </div>
          </div>
          <span style={{ 
            fontSize: '11px', fontWeight: '800', 
            backgroundColor: 'rgba(245, 158, 11, 0.2)', 
            color: '#fbbf24', 
            padding: '3px 10px', borderRadius: 'var(--radius-full)' 
          }}>
            اربح 50 MRU / إحالة
          </span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
          شارك كود الدعوة الخاص بك مع معارفك، وعند إتمامهم لأي طلب يحصل صديقك على خصم 10% وتحصل أنت فوراً على 50 MRU!
        </p>

        {/* Code & Link Box */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', backgroundColor: 'rgba(0,0,0,0.4)',
          border: '1px dashed rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-md)', marginBottom: '14px'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'block' }}>كود الإحالة الحصري بك:</span>
            <code style={{ fontSize: '18px', fontWeight: '900', color: '#fbbf24', letterSpacing: '1px' }}>
              {referralCode || 'MR-7742'}
            </code>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(referralCode || 'MR-7742');
              if (showToast) showToast('تم نسخ كود الإحالة بنجاح 🎁');
            }}
            style={{
              padding: '8px 14px', borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24', fontWeight: '700', fontSize: '12px',
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
            }}
          >
            <Copy size={14} />
            نسخ الكود
          </button>
        </div>

        {/* WhatsApp Share Button */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`استخدم كود الخصم الترحيبي الخاص بي (${referralCode || 'MR-7742'}) في متجر DigiStore لشراء العملات الرقمية وشحن الألعاب بخصم خاص: https://digistore.mr/?ref=${referralCode || 'MR-7742'}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '12px',
            backgroundColor: 'rgba(37, 211, 102, 0.12)',
            border: '1px solid rgba(37, 211, 102, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#25D366', fontWeight: '700', fontSize: '13px',
            textDecoration: 'none', marginBottom: '16px'
          }}
        >
          <Share2 size={16} />
          مشاركة الرابط عبر واتساب
        </a>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>الأصدقاء المسجلين</span>
            <strong style={{ fontSize: '16px', color: 'white' }}>{referralStats?.invitedCount || 3}</strong>
          </div>
          <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>إجمالي الأرباح</span>
            <strong style={{ fontSize: '16px', color: '#34d399' }}>{referralStats?.rewardMru || 150} <span style={{ fontSize: '11px' }}>MRU</span></strong>
          </div>
          <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>خصم الصديق</span>
            <strong style={{ fontSize: '16px', color: '#fbbf24' }}>10%</strong>
          </div>
        </div>
      </div>

      {/* Admin Portal Card */}
      <div 
        className="card" 
        style={{ 
          padding: '20px', marginBottom: '16px',
          background: isAdmin 
            ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(11,11,14,0.9) 100%)' 
            : 'linear-gradient(135deg, var(--primary-light) 0%, rgba(11,11,14,0.9) 100%)',
          border: `1px solid ${isAdmin ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ 
            width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
            backgroundColor: isAdmin ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
            color: isAdmin ? 'var(--accent)' : 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '3px' }}>
              {isAdmin ? '👑 مدير النظام' : 'لوحة تحكم المسؤول'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {isAdmin 
                ? 'لديك صلاحيات كاملة لإدارة المنتجات والطلبات'
                : 'خاصة بمدير المتجر والمشرفين فقط'}
            </p>
          </div>
        </div>

        {isAdmin ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/admin')}
              className="btn btn-primary"
              style={{ flex: 1, padding: '11px' }}
            >
              <ExternalLink size={17} />
              فتح لوحة التحكم
            </button>
            <button
              onClick={() => { adminLogout(); }}
              style={{ 
                padding: '11px 16px',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', borderRadius: 'var(--radius-md)',
                fontWeight: '700', fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '6px',
                cursor: 'pointer', transition: 'all 0.2s',
                flexShrink: 0
              }}
            >
              <LogOut size={17} />
              خروج
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            <ShieldCheck size={17} />
            تسجيل الدخول للوحة التحكم
          </button>
        )}
      </div>

      {/* Payment Accounts */}
      <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={18} style={{ color: 'var(--primary)' }} />
          حسابات الدفع المعتمدة
        </h3>
        {paymentAccounts.map((acc, i) => (
          <div key={acc.method} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '13px 0',
            borderBottom: i < paymentAccounts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                background: `${acc.color}22`,
                border: `1px solid ${acc.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: acc.color, flexShrink: 0,
                fontSize: '11px', fontWeight: '900'
              }}>
                {acc.method[0]}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{acc.method}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: acc.color, letterSpacing: '0.03em' }}>
                {acc.number}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(acc.number?.replace(/\s+/g, ''));
                  showToast(`تم نسخ رقم ${acc.method} 📋`);
                }}
                style={{ color: 'var(--text-subtle)', padding: '4px', transition: 'color 0.2s' }}
                title="نسخ الرقم"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Support Card */}
      <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Headphones size={18} style={{ color: 'var(--accent-secondary)' }} />
          الدعم الفني
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.7' }}>
          إذا واجهتك أي مشكلة أثناء التحويل أو تأخر وصول طلبك، نحن هنا لمساعدتك.
        </p>
        <a
          href={`https://wa.me/${storeSettings.whatsappNumber || '22233445566'}?text=${encodeURIComponent('مرحباً، أحتاج مساعدة من فريق DigiStore')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '13px',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            color: 'white', borderRadius: 'var(--radius-md)',
            fontWeight: '800', fontSize: '14px', textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(37,211,102,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(37,211,102,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,0.3)'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.570-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          تواصل مع الدعم عبر واتساب
        </a>
      </div>

      {/* App Info */}
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
          DigiStore — النسخة 2.0 • موريتانيا 🇲🇷
        </p>
        <p style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px', opacity: 0.7 }}>
          جميع المعاملات مشفرة ومحمية
        </p>
      </div>
    </div>
  );
}
