import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconMenu, IconSearch, IconCart, IconUser } from './icons';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onOpenSearch: () => void;
  currentUser: string | null;
  onOpenCart?: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onLogout?: () => void;
  cartCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  onOpenSearch,
  currentUser,
  onOpenCart,
  onOpenAuth,
  onLogout,
  cartCount = 0,
}) => {
  const location = useLocation();

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkStyle = (path: string) => ({
    fontSize: 'var(--text-body-sm)',
    fontWeight: isLinkActive(path) ? 600 : 500,
    color: isLinkActive(path) ? 'var(--color-accent)' : 'var(--color-ink-muted)',
    borderBottom: isLinkActive(path) ? '2px solid var(--color-accent)' : '2px solid transparent',
    paddingBlock: '6px',
    transition: 'color var(--duration-fast) var(--ease-out)',
  });

  return (
    <header
      className="site-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        width: '100%',
        backgroundColor: 'rgba(251, 248, 243, 0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-line)',
        boxShadow: '0 1px 3px rgba(18, 67, 48, 0.04)',
      }}
    >
      <div
        className="wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Left Section: Brand Logo & Desktop Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <Link
            to="/"
            style={{ textDecoration: 'none', color: 'inherit' }}
            aria-label="AccessGlobal Market Home"
          >
            <BrandLogo size={34} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="desktop-nav"
            aria-label="Primary Navigation"
            style={{ gap: 'var(--space-6)', marginLeft: 'var(--space-4)' }}
          >
            <Link to="/" style={navLinkStyle('/')}>
              Home
            </Link>
            <Link to="/shop" style={navLinkStyle('/shop')}>
              Shop
            </Link>
            <Link to="/about" style={navLinkStyle('/about')}>
              About
            </Link>
            <Link to="/contact" style={navLinkStyle('/contact')}>
              Contact
            </Link>
            <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
              Orders & Tracking
            </Link>
          </nav>
        </div>

        {/* Mobile-Only Action Controls (< 900px): Search & Hamburger Button */}
        <div className="mobile-actions" style={{ alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            onClick={onOpenSearch}
            className="btn-subtle"
            aria-label="Search Collection"
            style={{ padding: '8px 10px', color: 'var(--color-ink)' }}
            title="Search products"
          >
            <IconSearch size={20} />
          </button>

          <button
            onClick={onToggleMobileMenu}
            className="btn-subtle hamburger-btn"
            aria-label="Open navigation menu"
            style={{ padding: '8px', color: 'var(--color-ink)' }}
          >
            <IconMenu size={24} />
          </button>
        </div>

        {/* Desktop-Only Action Controls (≥ 900px Laptops & Desktops): Search, Sign In, View Order */}
        <div className="desktop-actions" style={{ alignItems: 'center', gap: 'var(--space-4)' }}>
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="btn-subtle"
            aria-label="Search Collection"
            style={{
              padding: '8px 12px',
              color: 'var(--color-ink)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'var(--text-body-sm)',
            }}
            title="Search collection"
          >
            <IconSearch size={18} />
            <span>Search</span>
          </button>

          {/* Sign In or User Account */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-2)',
                  border: '1px solid var(--color-line-strong)',
                  backgroundColor: 'transparent',
                }}
              >
                <IconUser size={16} />
                <span>Hi, {currentUser}</span>
              </Link>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="btn-subtle"
                  style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', padding: '6px 8px' }}
                  title="Sign out"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth?.('login')}
              className="btn-subtle"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                color: 'var(--color-ink)',
                border: '1px solid var(--color-line-strong)',
                borderRadius: 'var(--radius-2)',
                backgroundColor: 'transparent',
              }}
            >
              <IconUser size={16} />
              <span>Sign In</span>
            </button>
          )}

          {/* View Order Button */}
          <button
            onClick={onOpenCart}
            aria-label={`View Order (${cartCount} items)`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#124330',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: 'var(--radius-2)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              border: '1px solid #124330',
              transition: 'background-color var(--duration-fast) var(--ease-out)',
              cursor: 'pointer',
            }}
          >
            <IconCart size={18} />
            <span>View Order</span>
            {cartCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                  borderRadius: '9999px',
                  backgroundColor: '#34D399',
                  color: '#124330',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <style>{`
        /* Mobile styles: screens < 900px */
        .desktop-nav {
          display: none !important;
        }
        .desktop-actions {
          display: none !important;
        }
        .mobile-actions {
          display: flex !important;
        }
        .hamburger-btn {
          display: inline-flex !important;
        }

        /* Bigger screens / Laptops: screens >= 900px */
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-actions {
            display: flex !important;
          }
          .mobile-actions {
            display: none !important;
          }
          .hamburger-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
