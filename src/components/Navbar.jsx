import React from 'react';
import { ShoppingCart, Search, Menu } from 'lucide-react';

export default function Navbar({ onCartClick }) {
  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between" style={{ width: '100%' }}>
        <div className="flex items-center gap-2">
          <Menu size={24} className="text-muted" style={{ display: 'none' /* Show on mobile maybe, but BottomNav is better */ }} />
          <h1 className="h2" style={{ background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            DigiStore
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button aria-label="Search">
            <Search size={22} className="text-muted" />
          </button>
          <button aria-label="Cart" onClick={onCartClick} style={{ position: 'relative' }}>
            <ShoppingCart size={22} className="text-main" />
            <span style={{ position: 'absolute', top: -5, right: -8, backgroundColor: 'var(--primary)', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: 'var(--radius-full)' }}>
              2
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
