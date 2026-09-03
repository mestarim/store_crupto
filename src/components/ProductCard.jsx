import React from 'react';
import { Plus } from 'lucide-react';

export default function ProductCard({ title, price, image, category, type = 'game', onClick }) {
  const badgeClass = `badge badge-${type}`;
  
  return (
    <div className="card animate-fade-in" onClick={onClick} style={{ cursor: 'pointer' }}>
      <img src={image} alt={title} className="card-img" loading="lazy" />
      <div className="card-content">
        <div style={{ marginBottom: '8px' }}>
          <span className={badgeClass}>{category}</span>
        </div>
        <h3 className="h3" style={{ marginBottom: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
            {price} MRU
          </span>
          <button className="btn btn-primary" style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
