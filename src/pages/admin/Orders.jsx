import React from 'react';
import { Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function Orders() {
  const { orders } = useStore();

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '500' }}><CheckCircle size={14} /> مكتمل</span>;
      case 'pending': return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fef9c3', color: '#854d0e', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '500' }}><Clock size={14} /> قيد المعالجة</span>;
      case 'cancelled': return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '500' }}><XCircle size={14} /> ملغي</span>;
      default: return null;
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>إدارة الطلبات</h2>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px' }}>
                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>رقم الطلب</th>
                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>العميل</th>
                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>التاريخ</th>
                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>الإجمالي</th>
                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>الحالة</th>
                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600', textAlign: 'center' }}>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px', fontWeight: '600', color: '#0f172a' }}>{order.id}</td>
                  <td style={{ padding: '16px', fontWeight: '500' }}>{order.customer}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{order.date}</td>
                  <td style={{ padding: '16px', fontWeight: '600' }}>{order.total} MRU</td>
                  <td style={{ padding: '16px' }}>{getStatusBadge(order.status)}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button style={{ padding: '8px', color: '#64748b', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
