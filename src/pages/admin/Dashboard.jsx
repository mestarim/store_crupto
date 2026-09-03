import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, Activity } from 'lucide-react';

const data = [
  { name: '1 أغسطس', sales: 4000 },
  { name: '2 أغسطس', sales: 3000 },
  { name: '3 أغسطس', sales: 2000 },
  { name: '4 أغسطس', sales: 2780 },
  { name: '5 أغسطس', sales: 1890 },
  { name: '6 أغسطس', sales: 2390 },
  { name: '7 أغسطس', sales: 3490 },
];

export default function Dashboard() {
  const stats = [
    { title: 'إجمالي المبيعات', value: '45,231 MRU', icon: DollarSign, color: '#10b981' },
    { title: 'الطلبات الجديدة', value: '+350', icon: ShoppingBag, color: '#6366f1' },
    { title: 'العملاء', value: '1,203', icon: Users, color: '#f59e0b' },
    { title: 'معدل التحويل', value: '3.2%', icon: Activity, color: '#ec4899' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>نظرة عامة</h2>
      
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>{stat.title}</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stat.value}</p>
            </div>
            <div style={{ backgroundColor: `${stat.color}15`, color: stat.color, padding: '12px', borderRadius: '12px' }}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '400px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>المبيعات خلال 7 أيام</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <Tooltip />
            <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
