import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconCheck, IconArrowRight } from './icons';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onShowToast?: (message: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onShowToast }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [currency, setCurrency] = useState('USD');

  const notify = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setSubscribed(true);
      notify('Subscribed to Workshop Dispatch. Code GLOBAL10 emailed.');
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 3500);
    } else {
      notify('Please provide a valid email address.');
    }
  };

  return (
    <footer style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-line)', paddingBlock: 'var(--space-16) var(--space-8)' }}>
      <div className="wrap">
        <div className="footer-grid" style={{ display: 'grid', gap: 'var(--space-12)', marginBottom: 'var(--space-16)' }}>
          
          {/* Brand & Newsletter Column */}
          <div style={{ maxWidth: '420px' }}>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <BrandLogo size={32} showSubtitle={false} />
            </div>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', lineHeight: '1.6', marginBottom: 'var(--space-6)' }}>
              Connecting independent workshops in 28 countries directly with global buyers. Pre-bonded customs clearance, ethical manufacturing disclosures, and localized door-to-door transit.
            </p>

            {/* Newsletter Dispatch */}
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="newsletter-email" style={{ fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-subtle)', fontWeight: 600 }}>
                Workshop Dispatch
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="Your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid var(--color-line-strong)',
                    borderRadius: 'var(--radius-1)',
                    fontSize: 'var(--text-body-sm)',
                    backgroundColor: 'var(--color-surface-sunken)',
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: 'var(--text-body-sm)' }}
                >
                  {subscribed ? <IconCheck size={16} /> : <IconArrowRight size={16} />}
                </button>
              </div>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
                Fortnightly dispatch on workshop materials and logistics. No spam.
              </span>
            </form>
          </div>

          {/* Directory Links Columns */}
          <div className="footer-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-8)' }}>
            {/* Aisles */}
            <div>
              <span style={{ fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-subtle)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-3)' }}>
                Pages
              </span>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
                <li>
                  <Link to="/" className="btn-subtle" style={{ padding: 0 }}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="btn-subtle" style={{ padding: 0 }}>
                    Shop All Products
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="btn-subtle" style={{ padding: 0 }}>
                    About Our Workshops
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="btn-subtle" style={{ padding: 0 }}>
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="btn-subtle" style={{ padding: 0 }}>
                    My Consignments & Orders
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform */}
            <div>
              <span style={{ fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-subtle)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-3)' }}>
                Integrity
              </span>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
                <li><Link to="/about" className="btn-subtle" style={{ padding: 0 }}>The AGM Standard</Link></li>
                <li><Link to="/about" className="btn-subtle" style={{ padding: 0 }}>Customs Clearance</Link></li>
                <li><Link to="/about" className="btn-subtle" style={{ padding: 0 }}>Workshop Vetting</Link></li>
                <li><Link to="/about" className="btn-subtle" style={{ padding: 0 }}>30-Day Inspection</Link></li>
                <li><Link to="/about" className="btn-subtle" style={{ padding: 0 }}>Carbon Offset</Link></li>
              </ul>
            </div>

            {/* Compliance */}
            <div>
              <span style={{ fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-subtle)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-3)' }}>
                Compliance
              </span>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
                <li><button type="button" className="btn-subtle" style={{ padding: 0 }} onClick={() => notify('Privacy policy: Data minimization enforced')}>Privacy Policy</button></li>
                <li><button type="button" className="btn-subtle" style={{ padding: 0 }} onClick={() => notify('Terms of service: Transparent bonded purchase')}>Terms of Trade</button></li>
                <li><button type="button" className="btn-subtle" style={{ padding: 0 }} onClick={() => notify('DSAR portal: Export or erase records anytime')}>DSAR & Data Rights</button></li>
                <li><button type="button" className="btn-subtle" style={{ padding: 0 }} onClick={() => notify('Cookie status: Zero tracking cookies in use')}>Cookie Preferences</button></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Utility Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-line)', fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
          <div>
            © {new Date().getFullYear()} AccessGlobal Market Inc. All rights reserved. Produced under the megacraftui standard.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span>Settlement Currency:</span>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  notify(`Display currency updated to ${e.target.value}`);
                }}
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-1)',
                  border: '1px solid var(--color-line-strong)',
                  backgroundColor: 'var(--color-surface)',
                  fontSize: 'var(--text-caption)',
                }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .footer-grid {
            grid-template-columns: 5fr 7fr !important;
          }
        }
        @media (max-width: 640px) {
          .footer-links-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
};
