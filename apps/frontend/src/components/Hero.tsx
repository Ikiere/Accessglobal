import React from 'react';
import { ArrowRightIcon, ShieldCheckIcon, ZapIcon, LockIcon } from './Icons';

interface HeroProps {
  onOpenModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenModal }) => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-pulse"></span>
            <span>Next-Gen Enterprise Liquidity & Access Protocol</span>
          </div>

          <h1 className="hero-title">
            Borderless Global Financial Access, Built for <span className="text-gradient">Scale</span>.
          </h1>

          <p className="hero-subtitle">
            AccessGlobal unifies cross-border clearing, multi-currency corporate accounts, and automated treasury settlements into a high-throughput API and enterprise platform.
          </p>

          <div className="hero-actions">
            <button onClick={onOpenModal} className="btn btn-primary btn-lg">
              Open Enterprise Account <ArrowRightIcon size={18} />
            </button>
            <a href="#rates" className="btn btn-secondary btn-lg">
              Estimate FX & Fees
            </a>
          </div>

          <div className="hero-trust">
            <div className="trust-item">
              <ShieldCheckIcon size={16} className="text-brand" />
              <span>SOC2 Type II Certified</span>
            </div>
            <div className="trust-item">
              <LockIcon size={16} className="text-brand" />
              <span>256-Bit Hardware Enclaves</span>
            </div>
            <div className="trust-item">
              <ZapIcon size={16} className="text-brand" />
              <span>Real-Time Settlement</span>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="hero-metrics-grid">
          <div className="metric-card glass-panel">
            <span className="metric-number">$4.85B+</span>
            <span className="metric-label">Annual Gross Volume</span>
            <span className="metric-sub text-success">↑ 28.4% YoY</span>
          </div>
          <div className="metric-card glass-panel">
            <span className="metric-number">142</span>
            <span className="metric-label">Direct Jurisdictions</span>
            <span className="metric-sub">50+ local currencies</span>
          </div>
          <div className="metric-card glass-panel">
            <span className="metric-number">99.995%</span>
            <span className="metric-label">System Availability</span>
            <span className="metric-sub text-success">Zero downtime Q3</span>
          </div>
          <div className="metric-card glass-panel">
            <span className="metric-number">&lt; 140ms</span>
            <span className="metric-label">Clearing Latency</span>
            <span className="metric-sub">Tier-1 liquidity hubs</span>
          </div>
        </div>
      </div>
    </section>
  );
};
