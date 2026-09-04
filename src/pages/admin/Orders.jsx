import React, { useState } from 'react';
import { Eye, CheckCircle, Clock, XCircle, Search, X, Copy, Check, FileSpreadsheet, Key, Tag, Save } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function Orders() {
  const { orders, updateOrderStatus, updateOrderDigitalCode, exportOrdersCSV, showToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editDigitalCode, setEditDigitalCode] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.phone && order.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setEditDigitalCode(order.digitalCode || '');
  };

  const handleSaveDigitalCode = () => {
    if (!selectedOrder) return;
    updateOrderDigitalCode(selectedOrder.id, editDigitalCode);
    setSelectedOrder(prev => ({ ...prev, digitalCode: editDigitalCode }));
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('تم النسخ بنجاح 📋');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': 
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }}>
            <CheckCircle size={14} /> مكتمل
          </span>
        );
      case 'cancelled': 
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }}>
            <XCircle size={14} /> ملغي
          </span>
        );
      case 'pending': 
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }}>
            <Clock size={14} /> قيد المعالجة
          </span>
        );
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>إدارة ومتابعة الطلبات</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>مراجعة التحويلات المالية وتأكيد تسليم الطلبات للعملاء</p>
        </div>

        <button
          type="button"
          onClick={exportOrdersCSV}
          className="btn btn-primary"
          style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', borderRadius: '10px' }}
        >
          <FileSpreadsheet size={18} />
          <span>تصدير الطلبات إلى Excel (CSV)</span>
        </button>
      </div>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
        {/* Filters and Search Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingRight: '40px', backgroundColor: '#0f172a' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'pending', label: 'قيد المعالجة' },
              { id: 'completed', label: 'المكتملة' },
              { id: 'cancelled', label: 'الملغية' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  backgroundColor: statusFilter === tab.id ? '#6366f1' : '#0f172a',
                  color: statusFilter === tab.id ? 'white' : '#94a3b8',
                  border: '1px solid #334155',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}>
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #334155' }}>رقم الطلب</th>
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #334155' }}>العميل</th>
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #334155' }}>وسيلة الدفع</th>
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #334155' }}>التاريخ</th>
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #334155' }}>الإجمالي</th>
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #334155' }}>الحالة</th>
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #334155', textAlign: 'center' }}>التفاصيل والإجراء</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    لا توجد طلبات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #334155', transition: 'background-color 0.15s' }}>
                    <td style={{ padding: '14px 20px', fontWeight: '700', color: '#818cf8' }}>{order.id}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ color: 'white', fontWeight: '600', display: 'block' }}>{order.customer}</span>
                      {order.phone && <span style={{ fontSize: '12px', color: '#94a3b8' }}>{order.phone}</span>}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#cbd5e1' }}>
                      {order.paymentMethod === 'bankily' ? 'بنكيلي' : order.paymentMethod === 'masrivi' ? 'مصرفي' : 'السداد'}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '13px' }}>{order.date}</td>
                    <td style={{ padding: '14px 20px', fontWeight: '700', color: '#34d399' }}>{order.total} MRU</td>
                    <td style={{ padding: '14px 20px' }}>{getStatusBadge(order.status)}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleOpenModal(order)}
                        style={{ 
                          padding: '8px 14px', 
                          color: '#818cf8', 
                          backgroundColor: 'rgba(99, 102, 241, 0.15)', 
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={16} />
                        <span>معاينة</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Action Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ padding: '28px', backgroundColor: '#1e293b', border: '1px solid #334155', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '14px' }}>
              <div>
                <h3 className="h2" style={{ fontSize: '18px', color: 'white' }}>
                  تفاصيل الطلب: {selectedOrder.id}
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>📅 تاريخ الإنشاء: {selectedOrder.date}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Customer & Payment Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '12px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>اسم العميل</span>
                <strong style={{ color: 'white', fontSize: '14px' }}>{selectedOrder.customer}</strong>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '12px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>رقم الهاتف للتواصل</span>
                <strong style={{ color: '#38bdf8', fontSize: '14px' }}>{selectedOrder.phone || 'غير مسجل'}</strong>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '12px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>طريقة الدفع</span>
                <strong style={{ color: 'white', fontSize: '14px' }}>
                  {selectedOrder.paymentMethod === 'bankily' ? 'بنكيلي (Bankily)' : selectedOrder.paymentMethod === 'masrivi' ? 'مصرفي (Masrivi)' : 'السداد (Sedad)'}
                </strong>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '12px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>المبلغ الإجمالي</span>
                <strong style={{ color: '#34d399', fontSize: '16px' }}>{selectedOrder.total} MRU</strong>
              </div>
            </div>

            {/* Coupon and Discount info if applied */}
            {(selectedOrder.couponCode || selectedOrder.discountAmount > 0) && (
              <div style={{ marginBottom: '14px', padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={16} color="#34d399" />
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>كوبون الخصم: <strong style={{ color: '#34d399' }}>{selectedOrder.couponCode || 'خصم ترويجي'}</strong></span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#34d399' }}>-{selectedOrder.discountAmount || 0} MRU</span>
              </div>
            )}

            {/* Digital Delivery Code Vault */}
            <div style={{ marginBottom: '16px', backgroundColor: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={14} /> كود التسليم الرقمي المسلّم للعميل (Digital Code / Key):
                </span>
                {selectedOrder.digitalCode && (
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>مسجل ومتاح للعميل</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="مثال: USDT-TXN-849102-TRC20 أو كود البطاقة"
                  value={editDigitalCode}
                  onChange={(e) => setEditDigitalCode(e.target.value)}
                  style={{ flex: 1, backgroundColor: '#1e293b', fontFamily: 'monospace', fontSize: '13px', color: '#34d399', fontWeight: 'bold' }}
                />
                <button
                  type="button"
                  onClick={handleSaveDigitalCode}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={15} />
                  <span>حفظ الكود</span>
                </button>
              </div>
            </div>

            {/* DIGITAL DELIVERY INFO HIGHLIGHT */}
            {selectedOrder.deliveryInfo && (
              <div style={{ marginBottom: '16px', backgroundColor: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  بيانات تسليم المنتجات الرقمية (Digital Delivery Data):
                </span>
                
                {selectedOrder.deliveryInfo.walletAddress && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#34d399', display: 'block' }}>عنوان محفظة الكريبتو:</span>
                      <code style={{ fontSize: '12px', color: 'white', fontFamily: 'monospace' }}>{selectedOrder.deliveryInfo.walletAddress}</code>
                    </div>
                    <button 
                      onClick={() => handleCopy(selectedOrder.deliveryInfo.walletAddress, 'wallet')} 
                      style={{ color: '#34d399', padding: '4px 8px', cursor: 'pointer' }}
                      title="نسخ العنوان"
                    >
                      {copiedKey === 'wallet' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                )}

                {selectedOrder.deliveryInfo.playerId && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#818cf8', display: 'block' }}>معرف اللاعب (Player ID):</span>
                      <code style={{ fontSize: '13px', color: 'white', fontWeight: 'bold' }}>{selectedOrder.deliveryInfo.playerId}</code>
                    </div>
                    <button 
                      onClick={() => handleCopy(selectedOrder.deliveryInfo.playerId, 'player')} 
                      style={{ color: '#818cf8', padding: '4px 8px', cursor: 'pointer' }}
                      title="نسخ المعرف"
                    >
                      {copiedKey === 'player' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                )}

                {selectedOrder.deliveryInfo.deliveryContact && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#fbbf24', display: 'block' }}>بيانات استلام الكود:</span>
                      <span style={{ fontSize: '13px', color: 'white' }}>{selectedOrder.deliveryInfo.deliveryContact}</span>
                    </div>
                    <button 
                      onClick={() => handleCopy(selectedOrder.deliveryInfo.deliveryContact, 'contact')} 
                      style={{ color: '#fbbf24', padding: '4px 8px', cursor: 'pointer' }}
                    >
                      {copiedKey === 'contact' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Receipt Image if available */}
            {selectedOrder.receiptImage && (
              <div style={{ marginBottom: '16px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  إثبات التحويل المالي (صورة الوصل):
                </span>
                <img 
                  src={selectedOrder.receiptImage} 
                  alt="Receipt" 
                  style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #334155' }} 
                />
              </div>
            )}

            {/* Items Breakdown */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>المنتجات المطلوبة:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedOrder.items && selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#0f172a', borderRadius: '8px', fontSize: '13px' }}>
                    <span>{item.title} (×{item.quantity})</span>
                    <span style={{ color: '#34d399', fontWeight: 'bold' }}>{(item.price * item.quantity).toFixed(2)} MRU</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Changer Actions */}
            <div style={{ borderTop: '1px solid #334155', paddingTop: '16px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '10px' }}>
                تحديث حالة الطلب:
              </span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'completed');
                    setSelectedOrder({ ...selectedOrder, status: 'completed' });
                  }}
                  className="btn"
                  style={{ 
                    flex: 1, 
                    backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                    border: '1px solid #10b981', 
                    color: '#34d399', 
                    padding: '10px',
                    gap: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  <CheckCircle size={16} />
                  <span>تأكيد الإكمال (مكتمل)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'pending');
                    setSelectedOrder({ ...selectedOrder, status: 'pending' });
                  }}
                  className="btn"
                  style={{ 
                    flex: 1, 
                    backgroundColor: 'rgba(245, 158, 11, 0.2)', 
                    border: '1px solid #f59e0b', 
                    color: '#fbbf24', 
                    padding: '10px',
                    gap: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  <Clock size={16} />
                  <span>قيد المراجعة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'cancelled');
                    setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
                  }}
                  className="btn"
                  style={{ 
                    flex: 1, 
                    backgroundColor: 'rgba(239, 68, 68, 0.2)', 
                    border: '1px solid #ef4444', 
                    color: '#f87171', 
                    padding: '10px',
                    gap: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  <XCircle size={16} />
                  <span>إلغاء الطلب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
