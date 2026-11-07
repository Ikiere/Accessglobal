import React, { useEffect } from 'react';
import { IconClose, IconCart, IconShieldCheck } from './icons';

interface MobileMenuProps {
  isOpen: boolean;
  currentUser: string | null;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenDashboard: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onSelectCategory: (category: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  currentUser,
  onClose,
  onOpenAuth,
  onOpenDashboard,
  cartCount,
  onOpenCart,
  onSelectCategory,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCategoryClick = (category: string) => {
    onSelectCategory(category);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(18, 21, 22, 0.45)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(360px, 86vw)',
          height: '100%',
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-overlay)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>AccessGlobal</span>
            <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>Curated Workshop Index</p>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="btn-subtle" style={{ padding: '8px' }}>
            <IconClose size={20} />
          </button>
        </div>

        {/* Aisles List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-subtle)', fontWeight: 600, paddingBottom: '4px' }}>
            Aisles
          </span>
          <button onClick={() => handleCategoryClick('All')} className="btn-subtle" style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: 'var(--text-body)' }}>
            All Aisles
          </button>
          <button onClick={() => handleCategoryClick('E-Bikes')} className="btn-subtle" style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: 'var(--text-body)' }}>
            E-Bikes & Mobility
          </button>
          <button onClick={() => handleCategoryClick('Clothing')} className="btn-subtle" style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: 'var(--text-body)' }}>
            Crafted Apparel
          </button>
          <button onClick={() => handleCategoryClick('Shoes')} className="btn-subtle" style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: 'var(--text-body)' }}>
            Bench-Made Footwear
          </button>
          <button onClick={() => handleCategoryClick('Appliances')} className="btn-subtle" style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: 'var(--text-body)' }}>
            Living & Appliances
          </button>
          <button onClick={() => handleCategoryClick('Perfumes')} className="btn-subtle" style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: 'var(--text-body)' }}>
            Artisanal Fragrances
          </button>
          <a href="#standard" onClick={onClose} className="btn-subtle" style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: 'var(--text-body)', color: 'var(--color-accent)' }}>
            <IconShieldCheck size={18} />
            The AGM Standard
          </a>
        </nav>

        {/* Footer Actions */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-line)', paddingTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <button
            onClick={() => {
              onClose();
              onOpenCart();
            }}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'space-between', padding: '12px 16px' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconCart size={18} /> View Order
            </span>
            <span className="tabular-nums chip-accent" style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.2)' }}>
              {cartCount} items
            </span>
          </button>

          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ padding: '6px 8px', fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>
                Logged in as <strong style={{ color: 'var(--color-ink)' }}>{currentUser}</strong>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenDashboard();
                }}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Customer Dashboard & Orders
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth('login');
                }}
                className="btn-outline"
                style={{ width: '100%' }}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth('signup');
                }}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
