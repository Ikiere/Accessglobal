import React from 'react';
import { GlobeIcon, ExternalLinkIcon } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <div className="brand-icon">
                <GlobeIcon size={20} />
              </div>
              <span className="brand-text">Access<span className="brand-accent">Global</span></span>
            </div>
            <p className="footer-desc">
              High-throughput cross-border financial and multi-currency operations infrastructure for forward-thinking enterprises.
            </p>
            <div className="system-status">
              <span className="status-dot"></span>
              <span>All Global Rails Operational (Tier-1 Uptime)</span>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Solutions</h4>
            <ul className="footer-links">
              <li><a href="#rates">Live FX Calculator</a></li>
              <li><a href="#features">Virtual Accounts</a></li>
              <li><a href="#features">Treasury Clearing</a></li>
              <li><a href="#features">Developer API</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Apps & Portals</h4>
            <ul className="footer-links">
              <li><a href="#">Public Web Portal (Active)</a></li>
              <li>
                <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">
                  Admin Dashboard <ExternalLinkIcon size={12} />
                </a>
              </li>
              <li><a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel Deployment Ready</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Compliance</h4>
            <ul className="footer-links">
              <li><a href="#">Security & Encryption</a></li>
              <li><a href="#">AML / KYC Guidelines</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} AccessGlobal Technologies Inc. All rights reserved.</p>
          <div className="monorepo-tag">
            <span>AccessGlobal Monorepo</span>
            <span className="separator">•</span>
            <span>Frontend App (`apps/frontend`)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
