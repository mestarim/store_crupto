import React, { useState } from 'react';
import { ShieldCheck, Lock, X, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginModal() {
  const { isAdminModalOpen, setIsAdminModalOpen, adminLogin } = useStore();
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  if (!isAdminModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin.trim()) return;

    const ok = adminLogin(pin.trim());
    if (ok) {
      setIsAdminModalOpen(false);
      setPin('');
      setHasError(false);
      navigate('/admin');
    } else {
      setHasError(true);
      setTimeout(() => setHasError(false), 800);
    }
  };

  return (
    <div className="modal-overlay" dir="rtl" onClick={() => setIsAdminModalOpen(false)}>
      <div 
        className={`modal-card ${hasError ? 'animate-shake' : ''}`} 
        onClick={e => e.stopPropagation()} 
        style={{ padding: '32px 24px', maxWidth: '420px', position: 'relative' }}
      >
        <button 
          onClick={() => setIsAdminModalOpen(false)}
          style={{ position: 'absolute', left: '16px', top: '16px', padding: '8px', color: 'var(--text-muted)' }}
          aria-label="إغلاق"
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: 'rgba(99, 102, 241, 0.15)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px',
            color: 'var(--primary)'
          }}>
            <ShieldCheck size={36} />
          </div>
          <h2 className="h2" style={{ marginBottom: '6px' }}>تسجيل دخول المسؤول</h2>
          <p className="text-sm text-muted">
            يرجى إدخال رمز المرور السري للوصول إلى لوحة التحكم
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              className="form-input" 
              placeholder="رمز المرور (PIN)" 
              value={pin} 
              onChange={(e) => {
                setPin(e.target.value);
                setHasError(false);
              }}
              autoFocus
              style={{ paddingRight: '42px', letterSpacing: pin ? '4px' : 'normal', textAlign: 'right' }}
            />
          </div>

          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.04)', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>الرمز الافتراضي:</span>
            <code style={{ color: 'var(--accent)', fontWeight: 'bold' }}>admin123</code>
          </div>

          {hasError && (
            <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>
              ⚠️ رمز المرور غير صحيح! يرجى المحاولة مرة أخرى.
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1, padding: '12px', gap: '8px' }}
            >
              <span>دخول للوحة التحكم</span>
              <ArrowLeft size={18} />
            </button>
            <button 
              type="button" 
              onClick={() => setIsAdminModalOpen(false)}
              className="btn" 
              style={{ backgroundColor: 'var(--bg-dark)', padding: '12px 16px', border: '1px solid var(--border-color)' }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
