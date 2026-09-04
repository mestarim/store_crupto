import React from 'react';
import { X, Printer, Share2, CheckCircle2, Download, ShieldCheck, Copy, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function InvoiceModal({ order, onClose }) {
  const { showToast } = useStore();
  const [copiedCode, setCopiedCode] = React.useState(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    if (showToast) showToast('تم نسخ كود الاستلام بنجاح 📋');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `فاتورة شراء من DigiStore 🧾\nرقم الطلب: ${order.id}\nالتاريخ: ${order.date}\nالمبلغ: ${order.total} MRU\nالحالة: ${order.status === 'completed' ? 'مكتمل' : 'قيد المعالجة'}${order.digitalCode ? `\nكود التسليم: ${order.digitalCode}` : ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const paymentName = 
    order.paymentMethod === 'bankily' ? 'بنكيلي (Bankily)' :
    order.paymentMethod === 'masrivi' ? 'مصرفي (Masrvi)' :
    order.paymentMethod === 'sedad' ? 'السداد (Sedad)' : order.paymentMethod || 'تحويل بنكي';

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{ zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      dir="rtl"
    >
      <div 
        className="modal-card print-invoice-card" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '560px', 
          width: '100%', 
          backgroundColor: '#0c1017', 
          border: '1px solid #1f293d',
          borderRadius: '24px', 
          overflow: 'hidden',
          boxShadow: '0 30px 70px rgba(0,0,0,0.85)',
          position: 'relative'
        }}
      >
        {/* Actions Bar (Top) */}
        <div className="no-print" style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '14px 20px', backgroundColor: '#131a26', borderBottom: '1px solid #1f293d' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={handlePrint} 
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={15} />
              <span>طباعة / حفظ PDF</span>
            </button>
            <button 
              onClick={handleShareWhatsApp}
              style={{ 
                padding: '6px 12px', backgroundColor: 'rgba(37,211,102,0.15)', 
                color: '#25D366', borderRadius: '8px', border: '1px solid rgba(37,211,102,0.3)',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' 
              }}
            >
              <Share2 size={14} />
              واتساب
            </button>
          </div>

          <button 
            onClick={onClose}
            style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.06)', color: '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Invoice Area */}
        <div style={{ padding: '26px 24px', color: '#f8fafc' }} id="printable-invoice">
          
          {/* Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid #1f293d', paddingBottom: '18px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '8px', 
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '900', color: 'white' 
                }}>
                  D
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>DigiStore</h2>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>المتجر الرقمي الأول في موريتانيا 🇲🇷</p>
              <p style={{ fontSize: '11px', color: '#64748b' }}>support@digistore.mr</p>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontSize: '11px', fontWeight: '800', 
                backgroundColor: order.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: order.status === 'completed' ? '#10b981' : '#f59e0b',
                padding: '3px 10px', borderRadius: '999px', display: 'inline-block', marginBottom: '6px'
              }}>
                {order.status === 'completed' ? 'فاتورة مدفوعة ومكتملة' : 'فاتورة قيد المعالجة'}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>{order.id}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>التاريخ: {order.date}</div>
            </div>
          </div>

          {/* Customer & Payment Info Grid */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', 
            padding: '14px', backgroundColor: '#131a26', borderRadius: '14px', marginBottom: '20px',
            fontSize: '12px'
          }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>اسم العميل:</span>
              <strong style={{ color: '#e2e8f0' }}>{order.customer || 'عميل DigiStore'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>رقم الهاتف:</span>
              <strong style={{ color: '#e2e8f0', direction: 'ltr', display: 'inline-block' }}>{order.phone || 'غير محدد'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>طريقة الدفع:</span>
              <strong style={{ color: '#10b981' }}>{paymentName}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>رقم العملية / الإشعار:</span>
              <strong style={{ color: '#e2e8f0' }}>{order.account || 'تم التحقق بنجاح'}</strong>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div style={{ marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1f293d', color: '#94a3b8', fontSize: '12px' }}>
                  <th style={{ padding: '8px 0', textAlign: 'right' }}>المنتج / الوصف</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>الكمية</th>
                  <th style={{ padding: '8px 0', textAlign: 'left' }}>المجموع</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 0', fontWeight: '700', color: '#f1f5f9' }}>
                      {item.title}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#94a3b8' }}>
                      ×{item.quantity}
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'left', fontWeight: '800', color: '#10b981' }}>
                      {(item.price * item.quantity).toFixed(2)} MRU
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div style={{ 
            borderTop: '1px solid #1f293d', paddingTop: '14px', marginBottom: '22px',
            display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>المجموع الفرعي:</span>
              <span>{(order.subtotal || order.total).toFixed(2)} MRU</span>
            </div>

            {order.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                <span>خصم الكوبون ({order.couponCode || 'PROMO'}):</span>
                <span>-{Number(order.discountAmount).toFixed(2)} MRU</span>
              </div>
            )}

            <div style={{ 
              display: 'flex', justifyContent: 'space-between', 
              fontSize: '16px', fontWeight: '900', color: 'white',
              borderTop: '1px solid #1f293d', paddingTop: '10px', marginTop: '4px'
            }}>
              <span>المبلغ الإجمالي المدفوع:</span>
              <span style={{ color: '#10b981' }}>{Number(order.total).toFixed(2)} MRU</span>
            </div>
          </div>

          {/* Digital Code Vault (If order is completed) */}
          {order.digitalCode ? (
            <div style={{ 
              padding: '16px', backgroundColor: 'rgba(16,185,129,0.08)', 
              border: '1px solid rgba(16,185,129,0.25)', borderRadius: '14px', marginBottom: '20px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                🔑 كود التسليم الرقمي المباشر (Digital Delivery Code)
              </span>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                backgroundColor: '#07090e', padding: '8px 16px', borderRadius: '10px',
                border: '1px dashed #10b981'
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: '900', color: '#38bdf8', letterSpacing: '1px' }}>
                  {order.digitalCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(order.digitalCode)}
                  style={{ color: copiedCode ? '#10b981' : '#94a3b8', padding: '4px', cursor: 'pointer' }}
                  title="نسخ الكود"
                >
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                تم تسليم هذا الرمز وتوثيقه رسمياً في حسابك
              </p>
            </div>
          ) : (
            <div style={{ 
              padding: '12px', backgroundColor: 'rgba(245,158,11,0.08)', 
              border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', marginBottom: '20px',
              textAlign: 'center', fontSize: '12px', color: '#fbbf24'
            }}>
              ⏳ الطلب قيد التأكيد والمطابقة من المشرفين، سيظهر كود التسليم هنا فور اعتماده.
            </div>
          )}

          {/* Footer with QR Code & Official Stamp */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            borderTop: '1px dashed #1f293d', paddingTop: '16px' 
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: '800', marginBottom: '2px' }}>
                <ShieldCheck size={16} />
                <span>معتمد رسمياً • DigiStore Certified</span>
              </div>
              <p style={{ fontSize: '10px', color: '#64748b' }}>شكراً لتسوقكم معنا! يرجى الاحتفاظ بهذه الفاتورة.</p>
            </div>

            {/* Generated Decorative SVG QR Code */}
            <div style={{ 
              backgroundColor: 'white', padding: '6px', borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)', textAlign: 'center' 
            }}>
              <svg width="52" height="52" viewBox="0 0 100 100" fill="#07090e">
                <rect width="100" height="100" fill="white"/>
                {/* Corner markers */}
                <rect x="10" y="10" width="25" height="25" fill="#07090e"/>
                <rect x="15" y="15" width="15" height="15" fill="white"/>
                <rect x="18" y="18" width="9" height="9" fill="#07090e"/>

                <rect x="65" y="10" width="25" height="25" fill="#07090e"/>
                <rect x="70" y="15" width="15" height="15" fill="white"/>
                <rect x="73" y="18" width="9" height="9" fill="#07090e"/>

                <rect x="10" y="65" width="25" height="25" fill="#07090e"/>
                <rect x="15" y="70" width="15" height="15" fill="white"/>
                <rect x="18" y="73" width="9" height="9" fill="#07090e"/>

                {/* Simulated Data blocks */}
                <rect x="42" y="15" width="6" height="18" fill="#07090e"/>
                <rect x="52" y="12" width="6" height="10" fill="#07090e"/>
                <rect x="42" y="42" width="16" height="16" fill="#10b981"/>
                <rect x="65" y="45" width="8" height="15" fill="#07090e"/>
                <rect x="80" y="55" width="10" height="10" fill="#07090e"/>
                <rect x="42" y="72" width="18" height="8" fill="#07090e"/>
                <rect x="70" y="75" width="15" height="15" fill="#07090e"/>
              </svg>
              <span style={{ display: 'block', fontSize: '8px', color: '#07090e', fontWeight: '800' }}>VERIFIED</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
