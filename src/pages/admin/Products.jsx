import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function Products({ products, setProducts }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>إدارة المنتجات</h2>
        <button style={{ backgroundColor: '#6366f1', color: 'white', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
          <Plus size={20} />
          إضافة منتج
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={20} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="ابحث عن منتج..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px' }}>
                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>المنتج</th>
                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>التصنيف</th>
                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>السعر الأساسي</th>
                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>خيارات متعددة</th>
                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600', textAlign: 'center' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={product.image} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span style={{ fontWeight: '500' }}>{product.title}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '500' }}>{product.category}</span>
                  </td>
                  <td style={{ padding: '16px', fontWeight: '500' }}>{product.price} MRU</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>
                    {product.options ? `${product.options.length} فئات` : 'لا يوجد'}
                  </td>
                  <td style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button style={{ padding: '8px', color: '#6366f1', backgroundColor: '#e0e7ff', borderRadius: '6px' }}>
                      <Edit2 size={16} />
                    </button>
                    <button style={{ padding: '8px', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
                      <Trash2 size={16} />
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
