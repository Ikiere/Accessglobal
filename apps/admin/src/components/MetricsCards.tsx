import React from 'react';
import { DollarIcon, UsersIcon, TrendingUpIcon, ShieldAlertIcon } from './Icons';
import { MetricSummary } from '../types';

interface MetricsCardsProps {
  metrics: MetricSummary[];
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const getIcon = (idx: number) => {
    switch (idx) {
      case 0: return <DollarIcon size={20} />;
      case 1: return <UsersIcon size={20} />;
      case 2: return <TrendingUpIcon size={20} />;
      default: return <ShieldAlertIcon size={20} />;
    }
  };

  return (
    <div className="metrics-grid">
      {metrics.map((m, idx) => (
        <div key={idx} className="admin-card metric-item">
          <div className="metric-header">
            <span className="metric-title">{m.label}</span>
            <div className={`metric-icon-wrap metric-icon-${idx}`}>
              {getIcon(idx)}
            </div>
          </div>

          <div className="metric-value-row">
            <span className="metric-main-value font-mono">{m.value}</span>
            <span className={`metric-badge ${m.isPositive ? 'badge-success' : 'badge-warning'}`}>
              {m.change}
            </span>
          </div>

          <span className="metric-sublabel">{m.sublabel}</span>
        </div>
      ))}
    </div>
  );
};
