import React from 'react';
import { DashboardIcon, UsersIcon, SettingsIcon, ExternalLinkIcon } from './Icons';

export type AdminTab = 'overview' | 'tenants' | 'settings';

interface SidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  tenantCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, tenantCount }) => {
  return (
    <aside className="admin-sidebar" aria-label="Admin Navigation">
      <div className="sidebar-brand">
        <div className="brand-logo-admin">
          <span className="logo-dot"></span>
        </div>
        <div>
          <h1 className="brand-title-admin">Access<span className="brand-highlight">Global</span></h1>
          <span className="brand-sub-admin">Operations Console</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          onClick={() => onSelectTab('overview')}
          className={`nav-item ${currentTab === 'overview' ? 'nav-item-active' : ''}`}
          aria-current={currentTab === 'overview' ? 'page' : undefined}
        >
          <DashboardIcon size={18} />
          <span>Overview & KPIs</span>
        </button>

        <button
          onClick={() => onSelectTab('tenants')}
          className={`nav-item ${currentTab === 'tenants' ? 'nav-item-active' : ''}`}
          aria-current={currentTab === 'tenants' ? 'page' : undefined}
        >
          <UsersIcon size={18} />
          <span>Tenants & Accounts</span>
          <span className="nav-badge">{tenantCount}</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`nav-item ${currentTab === 'settings' ? 'nav-item-active' : ''}`}
          aria-current={currentTab === 'settings' ? 'page' : undefined}
        >
          <SettingsIcon size={18} />
          <span>System Settings</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="health-box">
          <span className="status-ping"></span>
          <div className="health-text">
            <span className="health-status">Vercel Deployment Ready</span>
            <span className="health-detail">apps/admin • Root Dir</span>
          </div>
        </div>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="portal-link-btn"
          title="Open AccessGlobal Public Frontend"
        >
          <span>Open Public Portal</span>
          <ExternalLinkIcon size={14} />
        </a>
      </div>
    </aside>
  );
};
