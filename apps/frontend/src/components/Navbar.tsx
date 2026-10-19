import React, { useState } from 'react';
import { GlobeIcon, MenuIcon, XIcon, ExternalLinkIcon } from './Icons';

interface NavbarProps {
  onOpenModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="navbar-wrapper">
      <div className="container">
        <nav className="navbar" aria-label="Main Navigation">
          <a href="#" className="nav-brand">
            <div className="brand-icon">
              <GlobeIcon size={22} />
            </div>
            <span className="brand-text">Access<span className="brand-accent">Global</span></span>
            <span className="badge">v2.4</span>
          </a>

          <div className="nav-links-desktop">
            <a href="#rates" className="nav-link">Rates & FX</a>
            <a href="#features" className="nav-link">Solutions</a>
            <a href="#compliance" className="nav-link">Compliance</a>
            <a href="#infrastructure" className="nav-link">Infrastructure</a>
          </div>

          <div className="nav-actions-desktop">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              title="Open Admin Dashboard application"
            >
              Admin Dashboard <ExternalLinkIcon size={14} />
            </a>
            <button
              onClick={onOpenModal}
              className="btn btn-primary btn-sm"
            >
              Get Started
            </button>
          </div>

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <div className="mobile-drawer-content">
            <a href="#rates" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Rates & FX</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Solutions</a>
            <a href="#compliance" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Compliance</a>
            <a href="#infrastructure" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Infrastructure</a>
            <div className="mobile-actions">
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Admin Dashboard <ExternalLinkIcon size={16} />
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenModal();
                }}
                className="btn btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
