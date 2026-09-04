import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Clock, Package, ArrowLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { products, orders } = useStore();

  const totalSales = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  const stats = [
    { title: 'إجمالي المبيعات المؤكدة', value: `${totalSales.toLocaleString()} MRU`, icon: DollarSign, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    { title: 'الطلبات قيد المراجعة', value: pendingCount, icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    { title: 'الطلبات المكتملة', value: completedCount, icon: ShoppingBag, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' },
    { title: 'المنتجات النشطة في المتجر', value: products.length, icon: Package, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  ];

  const chartData = [
    { day: 'السبت', sales: 1200 },
    { day: 'الأحد', sales: 2400 },
    { day: 'الإثنين', sales: 1800 },
    { day: 'الثلاثاء', sales: 3200 },
    { day: 'الأربعاء', sales: 2800 },
    { day: 'الخميس', sales: 4100 },
    { day: 'اليوم', sales: Math.max(1500, Math.round(totalSales)) },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>نظرة عامة وإحصائيات المتجر</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>متابعة فورية للمبيعات وحالة الطلبات ومخزون المنتجات</p>
        </div>

        <Link to="/admin/products" className="btn btn-primary" style={{ gap: '8px', padding: '10px 18px' }}>
          <Package size={18} />
          <span>إدارة المنتجات</span>
        </Link>
      </div>
      
      {/* Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {stats.map((stat, i) => (
          <div 
            key={i} 
            style={{ 
              backgroundColor: '#1e293b', 
              padding: '20px', 
              borderRadius: '16px', 
              border: '1px solid #334155', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>{stat.title}</p>
              <p style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>{stat.value}</p>
            </div>
            <div style={{ backgroundColor: stat.bg, color: stat.color, padding: '12px', borderRadius: '14px' }}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px', color: 'white' }}>
          حركة المبيعات خلال الأسبوع (MRU)
        </h3>
        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: 'white' }} />
              <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'white' }}>أحدث الطلبات الواردة</h3>
          <Link to="/admin/orders" style={{ fontSize: '13px', color: '#6366f1', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>عرض كافة الطلبات</span>
            <ArrowLeft size={16} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '12px' }}>رقم الطلب</th>
                <th style={{ padding: '12px' }}>العميل</th>
                <th style={{ padding: '12px' }}>وسيلة الدفع</th>
                <th style={{ padding: '12px' }}>المبلغ</th>
                <th style={{ padding: '12px' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 4).map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#818cf8' }}>{order.id}</td>
                  <td style={{ padding: '12px', color: 'white' }}>{order.customer}</td>
                  <td style={{ padding: '12px', color: '#cbd5e1' }}>
                    {order.paymentMethod === 'bankily' ? 'بنكيلي' : order.paymentMethod === 'masrivi' ? 'مصرفي' : 'السداد'}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#34d399' }}>{order.total} MRU</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '3px 10px', 
                      borderRadius: '999px', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      backgroundColor: order.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: order.status === 'completed' ? '#34d399' : '#fbbf24'
                    }}>
                      {order.status === 'completed' ? 'مكتمل' : 'قيد المعالجة'}
                    </span>
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
