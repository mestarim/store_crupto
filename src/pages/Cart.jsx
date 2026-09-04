import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, Wallet, CheckCircle2, UploadCloud, X, Copy, Check, Printer, Tag, FileText } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import InvoiceModal from '../components/InvoiceModal';

export default function Cart({ onBack }) {
  const { 
    cart, updateCartQuantity, removeFromCart, clearCart, addOrder, 
    storeSettings, showToast, appliedCoupon, applyCoupon, removeCoupon 
  } = useStore();
  const navigate = useNavigate();
  
  const [couponInput, setCouponInput] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [createdOrderForInvoice, setCreatedOrderForInvoice] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('bankily');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    account: '',
    walletAddress: '',
    playerId: '',
    deliveryContact: '',
    image: null,
    imagePreview: null
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discountAmount);

  // Digital Delivery detection based on items in cart
  const hasCrypto = cart.some(i => i.category === 'Crypto' || i.type === 'crypto');
  const hasGames = cart.some(i => i.category === 'Games' || i.type === 'game');
  const hasCards = cart.some(i => i.category === 'Cards' || i.type === 'gift');

  const currentPaymentNumber = 
    selectedPayment === 'bankily' ? storeSettings.bankilyNumber : 
    selectedPayment === 'masrivi' ? storeSettings.masriviNumber : 
    storeSettings.sedadNumber;

  const handleCopyPaymentNumber = () => {
    navigator.clipboard.writeText(currentPaymentNumber.replace(/\s+/g, ''));
    setCopiedNumber(true);
    showToast('تم نسخ رقم الحساب البنكي بنجاح 📋');
    setTimeout(() => setCopiedNumber(false), 2200);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(lastOrderId);
    setCopiedOrderId(true);
    showToast('تم نسخ رقم الطلب 📋');
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const isFormValid = () => {
    if (!formData.phone || !formData.account || !formData.image) return false;
    if (hasCrypto && !formData.walletAddress.trim()) return false;
    if (hasGames && !formData.playerId.trim()) return false;
    if (hasCards && !formData.deliveryContact.trim()) return false;
    return true;
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '90px', minHeight: '100vh', backgroundColor: 'var(--bg-dark)' }} dir="rtl">
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(9, 9, 11, 0.9)', backdropFilter: 'blur(10px)', padding: '16px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)', zIndex: 10 }}>
        <button onClick={onBack} style={{ padding: '8px', marginRight: 'auto' }} aria-label="الرجوع">
          <ArrowRight size={24} className="text-main" />
        </button>
        <h2 className="h2" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>سلة المشتريات</h2>
      </div>

      <div className="container" style={{ padding: '16px' }}>
        {/* Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {cart.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '16px', marginBottom: '16px' }}>سلة المشتريات فارغة حالياً</p>
              <button onClick={() => navigate('/')} className="btn btn-primary">
                تصفح المنتجات والعروض
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="card" style={{ display: 'flex', padding: '14px', gap: '14px', alignItems: 'center' }}>
                <img src={item.image} alt={item.title} style={{ width: '75px', height: '75px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h3 className="h3" style={{ fontSize: '15px' }}>{item.title}</h3>
                  <span style={{ fontWeight: '800', color: 'var(--accent)' }}>{(item.price * item.quantity).toFixed(2)} MRU</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius-md)', padding: '2px 6px', border: '1px solid var(--border-color)' }}>
                      <button onClick={() => updateCartQuantity(item.cartItemId, -1)} style={{ padding: '4px 8px' }}><Minus size={15} /></button>
                      <span style={{ margin: '0 8px', fontWeight: 'bold', fontSize: '14px' }}>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.cartItemId, 1)} style={{ padding: '4px 8px' }}><Plus size={15} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.cartItemId)} style={{ color: '#ef4444', padding: '6px', cursor: 'pointer' }} title="حذف">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <>
            {/* Promo Code Box */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Tag size={17} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '13px', fontWeight: '800' }}>كوبون الخصم أو الرمز الترويجي</span>
              </div>
              
              {appliedCoupon ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', backgroundColor: 'rgba(16,185,129,0.1)',
                  borderRadius: '10px', border: '1px solid rgba(16,185,129,0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <div>
                      <strong style={{ color: '#10b981', fontSize: '13px' }}>{appliedCoupon.code}</strong>
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginRight: '6px' }}>({appliedCoupon.label})</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    style={{ color: '#f87171', padding: '4px', cursor: 'pointer' }}
                    title="إلغاء الكوبون"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="أدخل رمز الكوبون (مثال: WELCOME10 أو FLASH15)..."
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    className="form-input"
                    style={{ flex: 1, fontSize: '13px', textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const res = applyCoupon(couponInput, subtotal);
                      if (res.success) setCouponInput('');
                    }}
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '10px' }}
                  >
                    تطبيق
                  </button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
              <h3 className="h3" style={{ marginBottom: '16px' }}>ملخص الطلب</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                <span className="text-muted">المجموع الفرعي ({cart.reduce((s, i) => s + i.quantity, 0)} عنصر)</span>
                <span>{subtotal.toFixed(2)} MRU</span>
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#f59e0b' }}>
                  <span>خصم الكوبون ({appliedCoupon.code})</span>
                  <span>-{discountAmount.toFixed(2)} MRU</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px', fontSize: '14px' }}>
                <span className="text-muted">رسوم التحويل والتسليم</span>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>مجاناً (0.00 MRU)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="h3">الإجمالي النهائي</span>
                <span className="h2" style={{ color: 'var(--accent)', fontWeight: '800' }}>{total.toFixed(2)} MRU</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
              <h3 className="h3" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={20} className="text-primary" /> اختر طريقة الدفع المحلية
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                
                {/* Bankily */}
                <button 
                  type="button"
                  onClick={() => setSelectedPayment('bankily')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: 'var(--radius-md)', border: `2px solid ${selectedPayment === 'bankily' ? 'var(--primary)' : 'var(--border-color)'}`, backgroundColor: selectedPayment === 'bankily' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#0070bc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>بنكيلي</div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '700', display: 'block', fontSize: '14px' }}>بنكيلي (Bankily)</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>رقم الحساب: {storeSettings.bankilyNumber}</span>
                    </div>
                  </div>
                  {selectedPayment === 'bankily' && <CheckCircle2 size={20} className="text-primary" />}
                </button>

                {/* Masrivi */}
                <button 
                  type="button"
                  onClick={() => setSelectedPayment('masrivi')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: 'var(--radius-md)', border: `2px solid ${selectedPayment === 'masrivi' ? 'var(--primary)' : 'var(--border-color)'}`, backgroundColor: selectedPayment === 'masrivi' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#eab308', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>مصرفي</div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '700', display: 'block', fontSize: '14px' }}>مصرفي (Masrivi)</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>رقم الحساب: {storeSettings.masriviNumber}</span>
                    </div>
                  </div>
                  {selectedPayment === 'masrivi' && <CheckCircle2 size={20} className="text-primary" />}
                </button>

                {/* Sedad */}
                <button 
                  type="button"
                  onClick={() => setSelectedPayment('sedad')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: 'var(--radius-md)', border: `2px solid ${selectedPayment === 'sedad' ? 'var(--primary)' : 'var(--border-color)'}`, backgroundColor: selectedPayment === 'sedad' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>السداد</div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '700', display: 'block', fontSize: '14px' }}>السداد (Sedad)</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>رقم الحساب: {storeSettings.sedadNumber}</span>
                    </div>
                  </div>
                  {selectedPayment === 'sedad' && <CheckCircle2 size={20} className="text-primary" />}
                </button>

              </div>
            </div>
          </>
        )}

      </div>

      {/* Checkout Button Fixed Bottom */}
      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px', backgroundColor: 'rgba(24, 24, 27, 0.95)', backdropFilter: 'blur(16px)', borderTop: '1px solid var(--border-color)', zIndex: 40 }}>
          <button 
            className="btn btn-primary" 
            onClick={() => setIsCheckoutModalOpen(true)}
            style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-md)' }}
          >
            <span>متابعة تأكيد الدفع والتسليم</span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontWeight: '800' }}>
              {total.toFixed(2)} MRU
            </span>
          </button>
        </div>
      )}

      {/* Payment & Delivery Modal Overlay */}
      {isCheckoutModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutModalOpen(false)}>
          
          <div 
            className="modal-card animate-fade-in" 
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '520px', padding: '24px' }}
          >
            
            {!isSuccess ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <h3 className="h2" style={{ fontSize: '18px' }}>تأكيد الدفع وبيانات التسليم</h3>
                  <button onClick={() => setIsCheckoutModalOpen(false)} style={{ padding: '6px', color: 'var(--text-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Transfer Instruction with 1-Click Copy */}
                <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <p style={{ fontWeight: '700', marginBottom: '6px', fontSize: '14px' }}>
                    تعليمات التحويل عبر {selectedPayment === 'bankily' ? 'بنكيلي' : selectedPayment === 'masrivi' ? 'مصرفي' : 'السداد'}:
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    يرجى تحويل مبلغ <strong style={{ color: 'var(--accent)', fontSize: '15px' }}>{total.toFixed(2)} MRU</strong> إلى رقم حسابنا:
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-dark)', padding: '10px 14px', borderRadius: '8px', border: '1px dashed var(--primary)' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px' }}>
                      {currentPaymentNumber}
                    </span>
                    <button 
                      type="button"
                      onClick={handleCopyPaymentNumber}
                      className="btn"
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '12px', 
                        backgroundColor: copiedNumber ? 'var(--accent)' : 'var(--primary)',
                        color: 'white',
                        gap: '4px'
                      }}
                    >
                      {copiedNumber ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedNumber ? 'تم النسخ!' : 'نسخ الرقم'}</span>
                    </button>
                  </div>
                </div>

                {/* Smart Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  
                  {/* Sender Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-muted)' }}>
                      رقم الهاتف المحول منه *
                    </label>
                    <input 
                      type="tel" 
                      placeholder="مثلاً: 33 12 34 56" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  {/* Sender Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-muted)' }}>
                      اسم المحول / صاحب الحساب *
                    </label>
                    <input 
                      type="text" 
                      placeholder="اسم صاحب الحساب أو المعرف" 
                      value={formData.account}
                      onChange={e => setFormData({...formData, account: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  {/* DIGITAL GOODS DYNAMIC DELIVERY FIELDS */}
                  {hasCrypto && (
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--accent)', fontWeight: 'bold' }}>
                        ⚡ عنوان محفظة استلام الكريبتو (USDT / Crypto Wallet Address) *
                      </label>
                      <input 
                        type="text" 
                        placeholder="أدخل عنوان محفظتك (TRC20 أو BEP20)" 
                        value={formData.walletAddress}
                        onChange={e => setFormData({...formData, walletAddress: e.target.value})}
                        className="form-input"
                        style={{ fontFamily: 'monospace', fontSize: '13px' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        تأكد من دقة العنوان لاكتمال التحويل الفوري لمحفظتك.
                      </span>
                    </div>
                  )}

                  {hasGames && (
                    <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--primary)', fontWeight: 'bold' }}>
                        🎮 معرف اللاعب في اللعبة (Player ID / UID) *
                      </label>
                      <input 
                        type="text" 
                        placeholder="أدخل رقم الـ ID في اللعبة (مثال: 5123456789)" 
                        value={formData.playerId}
                        onChange={e => setFormData({...formData, playerId: e.target.value})}
                        className="form-input"
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        سيتم شحن الحساب فورياً عن طريق الآيدي.
                      </span>
                    </div>
                  )}

                  {hasCards && (
                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--accent-secondary)', fontWeight: 'bold' }}>
                        🎁 البريد الإلكتروني أو الواتساب لاستلام كود البطاقة *
                      </label>
                      <input 
                        type="text" 
                        placeholder="أدخل بريدك أو رقم الواتساب لإرسال الكود" 
                        value={formData.deliveryContact}
                        onChange={e => setFormData({...formData, deliveryContact: e.target.value})}
                        className="form-input"
                      />
                    </div>
                  )}

                  {/* Payment Receipt Upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-muted)' }}>
                      إثبات الإرسال (صورة إشعار التحويل) *
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px', border: '2px dashed var(--border-color)', borderRadius: '12px', cursor: 'pointer', backgroundColor: 'var(--bg-dark)' }}>
                      <UploadCloud size={28} className="text-primary" style={{ marginBottom: '6px' }} />
                      <span style={{ fontSize: '12px', color: formData.image ? 'var(--accent)' : 'var(--text-muted)', fontWeight: formData.image ? 'bold' : 'normal' }}>
                        {formData.image ? `تم اختيار الصورة: ${formData.image.name}` : 'اضغط هنا لرفع صورة الوصل أو لقطة الشاشة'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const preview = URL.createObjectURL(file);
                            setFormData({ ...formData, image: file, imagePreview: preview });
                          }
                        }}
                      />
                    </label>
                    {formData.imagePreview && (
                      <div style={{ marginTop: '8px', textAlign: 'center' }}>
                        <img src={formData.imagePreview} alt="Receipt Preview" style={{ maxHeight: '80px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={() => {
                    const newOrd = addOrder({
                      customer: formData.account,
                      subtotal: subtotal,
                      total: total,
                      couponCode: appliedCoupon ? appliedCoupon.code : null,
                      discountAmount: discountAmount,
                      paymentMethod: selectedPayment,
                      phone: formData.phone,
                      receiptImage: formData.imagePreview,
                      deliveryInfo: {
                        walletAddress: formData.walletAddress,
                        playerId: formData.playerId,
                        deliveryContact: formData.deliveryContact
                      },
                      items: [...cart]
                    });
                    setLastOrderId(newOrd.id);
                    setCreatedOrderForInvoice(newOrd);
                    setIsSuccess(true);
                  }}
                  disabled={!isFormValid()}
                  style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '12px', opacity: !isFormValid() ? 0.5 : 1 }}
                >
                  إرسال وتأكيد الطلب
                </button>
              </>
            ) : (
              /* Success Screen */
              <div style={{ padding: '24px 12px', textAlign: 'center' }}>
                <CheckCircle2 size={70} style={{ color: '#10b981', margin: '0 auto 16px auto' }} />
                <h3 className="h2" style={{ marginBottom: '8px' }}>تم استلام طلبك بنجاح!</h3>
                
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                  color: 'var(--accent)', 
                  padding: '6px 16px', 
                  borderRadius: 'var(--radius-full)', 
                  fontWeight: 'bold', 
                  fontSize: '14px', 
                  marginBottom: '16px' 
                }}>
                  <span>رقم الطلب: {lastOrderId}</span>
                  <button onClick={handleCopyOrderId} style={{ color: 'var(--accent)', cursor: 'pointer' }} title="نسخ">
                    {copiedOrderId ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px', fontSize: '13px' }}>
                  جاري تدقيق التحويل وتنفيذ التسليم الفوري عبر البيانات المدخلة. يمكنك متابعة تقدم الطلب وتحميل فاتورتك الرسمية.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <FileText size={18} />
                    <span>عرض الفاتورة الرسمية (QR Code)</span>
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handlePrintInvoice}
                      className="btn"
                      style={{ flex: 1, padding: '11px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', gap: '6px', fontSize: '13px' }}
                    >
                      <Printer size={16} />
                      <span>طباعة سريعة</span>
                    </button>

                    <button 
                      type="button"
                      className="btn" 
                      onClick={() => { 
                        setIsSuccess(false); 
                        setIsCheckoutModalOpen(false); 
                        clearCart();
                        navigate('/');
                      }}
                      style={{ flex: 1, padding: '11px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', fontSize: '13px' }}
                    >
                      العودة للرئيسية
                    </button>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && createdOrderForInvoice && (
        <InvoiceModal 
          order={createdOrderForInvoice} 
          onClose={() => setShowInvoiceModal(false)} 
        />
      )}
    </div>
  );
}
