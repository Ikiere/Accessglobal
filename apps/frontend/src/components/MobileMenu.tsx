import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconClose, IconCart, IconUser } from './icons';

interface MobileMenuProps {
  isOpen: boolean;
  currentUser: string | null;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  currentUser,
  onClose,
  onOpenAuth,
  onLogout,
  cartCount,
  onOpenCart,
}) => {
  const navigate = useNavigate();

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

  const handleNav = (path: string) => {
    navigate(path);
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
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>AccessGlobal</span>
            <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>Direct From Verified Workshops</p>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="btn-subtle" style={{ padding: '8px' }}>
            <IconClose size={20} />
          </button>
        </div>

        {/* Primary Pages Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-subtle)', fontWeight: 600, paddingBottom: '4px' }}>
            Pages
          </span>
          <button onClick={() => handleNav('/')} className="btn-subtle" style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: 'var(--text-body)' }}>
            Home
          </button>
          <button onClick={() => handleNav('/shop')} className="btn-subtle" style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: 'var(--text-body)', fontWeight: 600, color: 'var(--color-accent)' }}>
            Shop All Products
          </button>
          <button onClick={() => handleNav('/about')} className="btn-subtle" style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: 'var(--text-body)' }}>
            About Our Workshops
          </button>
          <button onClick={() => handleNav('/contact')} className="btn-subtle" style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: 'var(--text-body)' }}>
            Contact Us
          </button>
          {currentUser && (
            <button onClick={() => handleNav('/dashboard')} className="btn-subtle" style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: 'var(--text-body)' }}>
              My Orders & Dashboard
            </button>
          )}
        </nav>

        {/* Footer Actions: Order Button & Account Controls */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-line)', paddingTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Order / Cart Trigger */}
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
            <span className="tabular-nums" style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.22)', padding: '2px 8px', borderRadius: 'var(--radius-round)', fontSize: '0.75rem', fontWeight: 600 }}>
              {cartCount} items
            </span>
          </button>

          {/* User Sign In / Register / Profile */}
          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ padding: '6px 8px', fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconUser size={14} /> Signed in as <strong style={{ color: 'var(--color-ink)' }}>{currentUser}</strong>
              </div>
              <button
                onClick={() => handleNav('/dashboard')}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="btn-subtle"
                style={{ width: '100%', justifyContent: 'center', color: 'var(--color-ink-muted)', fontSize: 'var(--text-caption)' }}
              >
                Sign Out
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
