import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, Wallet, CheckCircle2, UploadCloud, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function Cart({ onBack }) {
  const { cart, updateCartQuantity, removeFromCart, clearCart, addOrder } = useStore();
  const navigate = useNavigate();
  
  const [selectedPayment, setSelectedPayment] = useState('bankily');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    account: '',
    image: null
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '80px', minHeight: '100vh', backgroundColor: 'var(--bg-dark)' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(9, 9, 11, 0.9)', backdropFilter: 'blur(10px)', padding: '16px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)', zIndex: 10 }}>
        <button onClick={onBack} style={{ padding: '8px', marginRight: 'auto' }}>
          <ArrowRight size={24} className="text-main" />
        </button>
        <h2 className="h2" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>السلة</h2>
      </div>

      <div className="container" style={{ padding: '16px' }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p>السلة فارغة</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="card" style={{ display: 'flex', padding: '12px', gap: '12px', alignItems: 'center' }}>
                <img src={item.image} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h3 className="h3" style={{ fontSize: '15px' }}>{item.title}</h3>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{item.price} MRU</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
                      <button onClick={() => updateCartQuantity(item.cartItemId, -1)} style={{ padding: '4px 8px' }}><Minus size={16} /></button>
                      <span style={{ margin: '0 8px', fontWeight: '600' }}>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.cartItemId, 1)} style={{ padding: '4px 8px' }}><Plus size={16} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.cartItemId)} style={{ color: '#ef4444', padding: '8px' }}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <h3 className="h3" style={{ marginBottom: '16px' }}>ملخص الطلب</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="text-muted">المجموع الفرعي</span>
            <span>{subtotal.toFixed(2)} MRU</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px' }}>
            <span className="text-muted">رسوم الخدمة</span>
            <span>0.00 MRU</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="h3">الإجمالي</span>
            <span className="h2" style={{ color: 'var(--primary)' }}>{total.toFixed(2)} MRU</span>
          </div>
        </div>
        {/* Payment Methods */}
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <h3 className="h3" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={20} className="text-primary" /> طرق الدفع المتاحة
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            
            {/* Bankily */}
            <button 
              onClick={() => setSelectedPayment('bankily')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 'var(--radius-md)', border: `1px solid ${selectedPayment === 'bankily' ? 'var(--primary)' : 'var(--border-color)'}`, backgroundColor: selectedPayment === 'bankily' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#0070bc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>بنكيلي</div>
                <span style={{ fontWeight: '600' }}>بنكيلي (Bankily)</span>
              </div>
              {selectedPayment === 'bankily' && <CheckCircle2 size={20} className="text-primary" />}
            </button>

            {/* Masrivi */}
            <button 
              onClick={() => setSelectedPayment('masrivi')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 'var(--radius-md)', border: `1px solid ${selectedPayment === 'masrivi' ? 'var(--primary)' : 'var(--border-color)'}`, backgroundColor: selectedPayment === 'masrivi' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#eab308', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>مصرفي</div>
                <span style={{ fontWeight: '600' }}>مصرفي (Masrivi)</span>
              </div>
              {selectedPayment === 'masrivi' && <CheckCircle2 size={20} className="text-primary" />}
            </button>

            {/* Sedad */}
            <button 
              onClick={() => setSelectedPayment('sedad')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 'var(--radius-md)', border: `1px solid ${selectedPayment === 'sedad' ? 'var(--primary)' : 'var(--border-color)'}`, backgroundColor: selectedPayment === 'sedad' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>السداد</div>
                <span style={{ fontWeight: '600' }}>السداد (Sedad)</span>
              </div>
              {selectedPayment === 'sedad' && <CheckCircle2 size={20} className="text-primary" />}
            </button>

          </div>
        </div>

      </div>

      {/* Checkout Button Fixed Bottom */}
      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', zIndex: 10 }}>
          <button 
            className="btn btn-primary" 
            onClick={() => setIsCheckoutModalOpen(true)}
            style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>إتمام الدفع عبر {selectedPayment === 'bankily' ? 'بنكيلي' : selectedPayment === 'masrivi' ? 'مصرفي' : 'السداد'}</span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>{total.toFixed(2)} MRU</span>
          </button>
        </div>
      )}

      {/* Payment Modal Overlay */}
      {isCheckoutModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          
          <div className="animate-fade-in" style={{ backgroundColor: 'var(--bg-card)', width: '100%', maxWidth: '500px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {!isSuccess ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 className="h2">تأكيد الدفع</h3>
                  <button onClick={() => setIsCheckoutModalOpen(false)} style={{ padding: '8px', backgroundColor: 'var(--bg-dark)', borderRadius: '50%' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px' }}>تعليمات الدفع:</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    الرجاء تحويل مبلغ <strong style={{ color: 'var(--text-main)' }}>{total.toFixed(2)} MRU</strong> إلى حسابنا في <strong>{selectedPayment === 'bankily' ? 'بنكيلي' : selectedPayment === 'masrivi' ? 'مصرفي' : 'السداد'}</strong> على الرقم: <br/>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)', display: 'block', marginTop: '8px', letterSpacing: '2px' }}>33 44 55 66</span>
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>رقم الهاتف المحول منه</label>
                    <input 
                      type="tel" 
                      placeholder="أدخل رقم هاتفك" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'white', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>رقم الحساب / اسم المحول</label>
                    <input 
                      type="text" 
                      placeholder="اسم صاحب الحساب"
                      value={formData.account}
                      onChange={e => setFormData({...formData, account: e.target.value})}
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'white', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>إثبات الإرسال (صورة الوصل)</label>
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', border: '2px dashed var(--border-color)', borderRadius: '12px', cursor: 'pointer', backgroundColor: 'var(--bg-dark)' }}>
                      <UploadCloud size={32} className="text-primary" style={{ marginBottom: '12px' }} />
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{formData.image ? 'تم اختيار الصورة بنجاح' : 'اضغط هنا لرفع صورة الوصل'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={e => setFormData({...formData, image: e.target.files[0]})}
                      />
                    </label>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    addOrder({
                      customer: formData.account,
                      total: total,
                      paymentMethod: selectedPayment,
                      phone: formData.phone,
                      items: cart
                    });
                    setIsSuccess(true);
                  }}
                  disabled={!formData.phone || !formData.account || !formData.image}
                  style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', opacity: (!formData.phone || !formData.account || !formData.image) ? 0.5 : 1 }}
                >
                  إرسال وتأكيد الطلب
                </button>
              </>
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <CheckCircle2 size={80} style={{ color: '#10b981', margin: '0 auto 24px auto' }} />
                <h3 className="h2" style={{ marginBottom: '12px' }}>تم استلام طلبك بنجاح!</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
                  جاري مراجعة إثبات الدفع الخاص بك. ستتلقى إشعاراً فور تأكيد الطلب وتسليم مشترياتك.
                </p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => { 
                    setIsSuccess(false); 
                    setIsCheckoutModalOpen(false); 
                    clearCart();
                    navigate('/');
                  }}
                  style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px' }}
                >
                  العودة للرئيسية
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
