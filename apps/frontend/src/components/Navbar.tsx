import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconMenu, IconSearch } from './icons';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onOpenSearch: () => void;
  currentUser: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  onOpenSearch,
  currentUser,
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
    <header className="site-header hairline-bottom" style={{ backgroundColor: 'var(--color-surface)', position: 'sticky', top: 0, zIndex: 40, width: '100%' }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <Link
            to="/"
            style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}
            aria-label="AccessGlobal Market Home"
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4375rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-ink)', lineHeight: 1.1 }}>
              AccessGlobal
            </span>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-subtle)', fontWeight: 600, marginTop: '2px' }}>
              Direct From Workshops
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" aria-label="Primary Navigation" style={{ display: 'none', gap: 'var(--space-6)', marginLeft: 'var(--space-4)' }}>
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
            {currentUser && (
              <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Action Controls: Search & Hamburger Only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
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

          {/* Mobile / Global Menu Toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="btn-subtle"
            aria-label="Open navigation menu"
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
        }
      `}</style>
    </header>
  );
};
