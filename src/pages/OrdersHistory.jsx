import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Clock, CheckCircle, XCircle, Search, ChevronDown, ChevronUp, Package, Key, Copy, Check, FileText } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

function StatusBadge({ status }) {
  const config = {
    completed: { label: 'تم التنفيذ', icon: CheckCircle, className: 'status-completed' },
    cancelled: { label: 'ملغي', icon: XCircle, className: 'status-cancelled' },
    pending: { label: 'قيد المعالجة', icon: Clock, className: 'status-pending' },
  };
  const { label, icon: Icon, className } = config[status] || config.pending;
  return (
    <span className={`status-badge ${className}`}>
      <Icon size={13} />
      {label}
    </span>
  );
}

const paymentLabels = {
  bankily: 'بنكيلي',
  masrivi: 'مصرفي',
  sedad: 'السداد',
};

export default function OrdersHistory() {
  const { orders, showToast } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  const filteredOrders = orders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      (o.phone && o.phone.includes(q)) || 
      (o.id && o.id.toLowerCase().includes(q)) ||
      (o.customer && o.customer.toLowerCase().includes(q))
    );
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="container animate-fade-in" style={{ padding: '24px 16px', paddingBottom: '90px' }} dir="rtl">
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="h1" style={{ fontSize: '22px', marginBottom: '6px' }}>طلباتي</h1>
        <p className="text-sm text-muted">متابعة حالة طلباتك وتفاصيل التسليم</p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'إجمالي', value: orders.length, color: 'var(--primary)', bg: 'rgba(99,102,241,0.1)' },
          { label: 'قيد التنفيذ', value: pendingCount, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
          { label: 'مكتمل', value: completedCount, color: 'var(--accent)', bg: 'rgba(16,185,129,0.1)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ 
            padding: '14px 10px', textAlign: 'center',
            background: stat.bg, border: 'none'
          }}>
            <div style={{ fontSize: '22px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={17} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
        <input 
          type="text"
          placeholder="ابحث برقم الطلب أو الهاتف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ paddingRight: '42px' }}
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ 
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(99,102,241,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <ShoppingBag size={36} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>لا توجد طلبات</h3>
          <p className="text-sm text-muted">
            {searchQuery ? 'لا توجد نتائج مطابقة لبحثك' : 'قم بأول عملية شراء وستظهر هنا فوراً'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredOrders.map((order, idx) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div 
                key={order.id} 
                className="card"
                style={{ animation: `fadeIn 0.3s ease ${idx * 0.05}s both` }}
              >
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  style={{ 
                    padding: '16px 18px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '14px' }}>
                        {order.id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{order.customer}</span>
                      <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span>
                      <span>📅 {order.date}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '17px', fontWeight: '900', color: 'var(--accent)' }}>
                        {order.total}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>MRU</div>
                    </div>
                    <div style={{ color: 'var(--text-subtle)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ 
                    borderTop: '1px solid var(--border-color)', 
                    padding: '16px 18px',
                    background: 'rgba(0,0,0,0.2)',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '6px',
                      marginBottom: '12px', fontSize: '13px', color: 'var(--text-muted)'
                    }}>
                      <Package size={14} />
                      <span>المنتجات المشتراة:</span>
                    </div>
                    
                    {order.items && order.items.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 14px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '13px'
                          }}>
                            <span style={{ flex: 1 }}>{item.title} <span style={{ color: 'var(--text-subtle)' }}>×{item.quantity}</span></span>
                            <span style={{ fontWeight: '800', color: 'var(--accent)', flexShrink: 0 }}>
                              {(item.price * item.quantity).toFixed(2)} MRU
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* Digital Code Delivery (If Completed) */}
                    {order.digitalCode && (
                      <div style={{
                        padding: '12px 14px', 
                        backgroundColor: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.3)', 
                        borderRadius: '12px',
                        marginBottom: '14px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Key size={16} color="#10b981" />
                          <div>
                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '800', display: 'block' }}>
                              كود الاستلام الرقمي المعتمد
                            </span>
                            <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '900', color: '#38bdf8' }}>
                              {order.digitalCode}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(order.digitalCode);
                            setCopiedOrderId(order.id);
                            if (showToast) showToast('تم نسخ كود الاستلام 📋');
                            setTimeout(() => setCopiedOrderId(null), 2000);
                          }}
                          className="btn"
                          style={{
                            padding: '6px 12px', fontSize: '12px', 
                            backgroundColor: '#07090e', border: '1px solid #10b981', 
                            color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          {copiedOrderId === order.id ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedOrderId === order.id ? 'تم النسخ' : 'نسخ الكود'}</span>
                        </button>
                      </div>
                    )}

                    {/* Footer with Payment and Invoice Button */}
                    <div style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px dashed rgba(255,255,255,0.08)',
                      fontSize: '13px', color: 'var(--text-muted)',
                      flexWrap: 'wrap', gap: '10px'
                    }}>
                      <div>
                        <span>طريقة الدفع: </span>
                        <strong style={{ color: 'var(--text-main)' }}>
                          {paymentLabels[order.paymentMethod] || order.paymentMethod}
                        </strong>
                        {order.phone && <span style={{ marginRight: '10px' }}>📞 {order.phone}</span>}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderForInvoice(order);
                        }}
                        className="btn"
                        style={{
                          padding: '6px 14px', fontSize: '12px',
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--text-main)',
                          display: 'flex', alignItems: 'center', gap: '5px'
                        }}
                      >
                        <FileText size={14} color="var(--primary)" />
                        <span>عرض الفاتورة (QR)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedOrderForInvoice && (
        <InvoiceModal 
          order={selectedOrderForInvoice} 
          onClose={() => setSelectedOrderForInvoice(null)} 
        />
      )}
    </div>
  );
}
