import React from 'react';
import { GlobeIcon, ShieldCheckIcon, ZapIcon, LayersIcon, LockIcon, RefreshIcon } from './Icons';

export const Features: React.FC = () => {
  const capabilities = [
    {
      icon: <GlobeIcon size={24} />,
      title: 'Global Multi-Currency IBANs',
      description: 'Issue virtual accounts and dedicated local account numbers in 30+ jurisdictions instantly for automated domestic and international collections.',
    },
    {
      icon: <ZapIcon size={24} />,
      title: 'Automated Treasury Routing',
      description: 'Algorithmic routing minimizes FX slippage and optimizes settlement corridors through tier-1 banking rails and liquidity networks.',
    },
    {
      icon: <LayersIcon size={24} />,
      title: 'Developer REST & Webhooks',
      description: 'Production-ready SDKs, idempotent webhooks, and sandbox testing environments engineered for 99.999% platform reliability.',
    },
    {
      icon: <ShieldCheckIcon size={24} />,
      title: 'Continuous Compliance & AML',
      description: 'Automated screening against global OFAC, sanction lists, and PEP databases with sub-second real-time risk intelligence.',
    },
    {
      icon: <LockIcon size={24} />,
      title: 'Hardware-Enforced Security',
      description: 'Keys and transaction authorization managed inside HSM hardware security modules with mandatory multi-party approvals.',
    },
    {
      icon: <RefreshIcon size={24} />,
      title: 'Zero-Reconciliation Accounting',
      description: 'Real-time ledger synchronization and automated statement generation formatted for NetSuite, SAP, and Xero ERP systems.',
    },
  ];

  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header">
          <span className="badge">Platform Capabilities</span>
          <h2 className="section-title">Institutional Architecture for Modern Finance</h2>
          <p className="section-subtitle">
            Engineered from first principles to remove friction from enterprise treasury and cross-border settlement.
          </p>
        </div>

        <div className="features-grid">
          {capabilities.map((item, index) => (
            <div key={index} className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                {item.icon}
              </div>
              <h3 className="feature-title">{item.title}</h3>
              <p className="feature-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
