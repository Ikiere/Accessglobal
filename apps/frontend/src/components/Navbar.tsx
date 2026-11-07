import React from 'react';
import { IconCart, IconUser, IconMenu, IconSearch } from './icons';

interface NavbarProps {
  cartCount: number;
  currentUser: string | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenDashboard: () => void;
  onCartClick: () => void;
  onToggleMobileMenu: () => void;
  onSelectCategory: (category: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  currentUser,
  onOpenAuth,
  onOpenDashboard,
  onCartClick,
  onToggleMobileMenu,
  onSelectCategory,
  onOpenSearch,
}) => {
  return (
    <header className="site-header hairline-bottom" style={{ backgroundColor: 'var(--color-surface)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <button
            onClick={() => onSelectCategory('All')}
            style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}
            aria-label="AccessGlobal Market Home"
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-ink)', lineHeight: 1 }}>
              AccessGlobal
            </span>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-subtle)', fontWeight: 600, marginTop: '2px' }}>
              Curated Market
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Primary Aisles" style={{ display: 'none', gap: 'var(--space-5)', marginLeft: 'var(--space-4)' }}>
            <button
              onClick={() => onSelectCategory('E-Bikes')}
              className="btn-subtle"
              style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}
            >
              E-Bikes
            </button>
            <button
              onClick={() => onSelectCategory('Clothing')}
              className="btn-subtle"
              style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}
            >
              Apparel
            </button>
            <button
              onClick={() => onSelectCategory('Shoes')}
              className="btn-subtle"
              style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}
            >
              Footwear
            </button>
            <button
              onClick={() => onSelectCategory('Appliances')}
              className="btn-subtle"
              style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}
            >
              Living & Kitchen
            </button>
            <button
              onClick={() => onSelectCategory('Perfumes')}
              className="btn-subtle"
              style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}
            >
              Fragrances
            </button>
            <a
              href="#standard"
              className="btn-subtle"
              style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}
            >
              The Standard
            </a>
          </nav>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="btn-subtle"
            aria-label="Search Collection"
            style={{ padding: '8px 10px', color: 'var(--color-ink)' }}
            title="Search products"
          >
            <IconSearch size={19} />
          </button>

          {/* User Account / Auth / Dashboard */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button
                onClick={onOpenDashboard}
                className="chip chip-accent"
                title="Manage account, view shipments & invoices"
                style={{
                  cursor: 'pointer',
                  maxWidth: '160px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  padding: '6px 12px',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <IconUser size={15} />
                <span>{currentUser}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="btn-subtle"
              style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}
            >
              Sign In
            </button>
          )}

          {/* Cart Trigger Button */}
          <button
            onClick={onCartClick}
            className="btn-primary"
            aria-label={`View order, ${cartCount} items`}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-2)',
              position: 'relative',
              gap: 'var(--space-2)',
            }}
          >
            <IconCart size={18} />
            <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>Order</span>
            <span
              className="tabular-nums"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: 'var(--radius-round)',
                minWidth: '20px',
                textAlign: 'center',
              }}
            >
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={onToggleMobileMenu}
            className="mobile-nav-toggle btn-subtle"
            aria-label="Toggle navigation menu"
            style={{ display: 'inline-flex', padding: '8px', color: 'var(--color-ink)' }}
          >
            <IconMenu size={22} />
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-nav-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
