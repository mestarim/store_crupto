import React, { useState } from 'react';
import { Calculator, ArrowLeftRight, TrendingUp } from 'lucide-react';

export default function CryptoCalculator() {
  const [cryptoType, setCryptoType] = useState('USDT');
  const [amount, setAmount] = useState('100');

  // Rates in MRU (approximate Mauritanian market exchange rates)
  const rates = {
    USDT: 40.5,     // 1 USDT = 40.5 MRU
    BTC: 2650000.0, // 1 BTC = 2,650,000 MRU
    ETH: 145000.0   // 1 ETH = 145,000 MRU
  };

  const parsedAmount = parseFloat(amount) || 0;
  const totalMRU = (parsedAmount * rates[cryptoType]).toLocaleString('ar-MR', {
    maximumFractionDigits: 2
  });

  return (
    <div className="card glass-panel" style={{ padding: '20px', marginBottom: '32px', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: 'var(--radius-sm)', color: 'var(--accent)' }}>
            <Calculator size={20} />
          </div>
          <div>
            <h3 className="h3" style={{ fontSize: '15px' }}>حاسبة أسعار الكريبتو المباشرة</h3>
            <span className="text-xs text-muted">تحويل فوري بالأوقية الموريتانية (MRU)</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontSize: '12px', fontWeight: 'bold' }}>
          <TrendingUp size={14} />
          <span>سعر السوق اليوم</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {['USDT', 'BTC', 'ETH'].map((coin) => (
          <button
            key={coin}
            type="button"
            onClick={() => setCryptoType(coin)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${cryptoType === coin ? 'var(--primary)' : 'var(--border-color)'}`,
              backgroundColor: cryptoType === coin ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-dark)',
              color: cryptoType === coin ? 'var(--primary)' : 'var(--text-main)',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>{coin}</span>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>
              {rates[coin].toLocaleString()} MRU
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 180px', position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            الكمية المطلوبة ({cryptoType})
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input"
            style={{ fontWeight: 'bold', fontSize: '16px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', color: 'var(--primary)' }}>
          <ArrowLeftRight size={20} />
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            المبلغ المقابل بالأوقية
          </label>
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: 'var(--bg-dark)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent)',
            fontSize: '18px',
            fontWeight: '800',
            textAlign: 'left',
            direction: 'ltr'
          }}>
            {totalMRU} MRU
          </div>
        </div>
      </div>
    </div>
  );
}
