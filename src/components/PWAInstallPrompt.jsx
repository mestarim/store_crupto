import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

/**
 * PWA Install Prompt Banner
 * يظهر تلقائياً عند توفر حدث beforeinstallprompt (Chrome/Edge/Android)
 * أو يعرض تعليمات iOS يدوياً
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setInstalled(true);
      return;
    }

    // Check if user already dismissed
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) return;

    // iOS detection
    const ua = window.navigator.userAgent;
    const iosDevice = /iphone|ipad|ipod/i.test(ua);
    const safariOnly = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);
    
    if (iosDevice && safariOnly) {
      setIsIOS(true);
      // Show iOS instructions after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    // Android/Chrome: listen for beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setInstalled(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_prompt_dismissed', '1');
  };

  if (!showBanner || installed) return null;

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bottom-nav-height, 68px) + 16px)',
        right: '12px',
        left: '12px',
        zIndex: 500,
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, rgba(22,22,30,0.98) 0%, rgba(14,14,20,0.98) 100%)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '20px',
        padding: '18px 18px 16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        {/* App Icon */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 6px 18px rgba(99,102,241,0.35)',
          color: 'white', fontWeight: '900', fontSize: '22px',
        }}>
          D
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '800', fontSize: '15px', marginBottom: '4px', color: 'white' }}>
            ثبّت DigiStore على هاتفك
          </div>
          {isIOS ? (
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
              اضغط على <strong style={{ color: '#60a5fa' }}>مشاركة</strong> ثم اختر{' '}
              <strong style={{ color: '#60a5fa' }}>"إضافة إلى الشاشة الرئيسية"</strong> للوصول الفوري بدون إنترنت
            </p>
          ) : (
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
              احصل على تجربة تطبيق كاملة — أسرع، بدون متصفح، وتعمل بدون إنترنت
            </p>
          )}

          {!isIOS && (
            <button
              onClick={handleInstall}
              style={{
                marginTop: '12px',
                padding: '9px 20px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', borderRadius: '10px',
                fontWeight: '800', fontSize: '13px',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '7px',
                boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <Download size={15} />
              تثبيت التطبيق مجاناً
            </button>
          )}
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          style={{
            color: '#475569', padding: '4px', flexShrink: 0,
            transition: 'color 0.2s', cursor: 'pointer',
          }}
          aria-label="إغلاق"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
