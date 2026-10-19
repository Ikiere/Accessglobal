import { useState } from 'react';
import './styles/index.css';
import './App.css';
import { Sidebar, AdminTab } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { AnalyticsChart } from './components/AnalyticsChart';
import { TenantTable } from './components/TenantTable';
import { SystemSettings } from './components/SystemSettings';
import {
  INITIAL_METRICS,
  INITIAL_DAILY_VOLUME,
  INITIAL_TENANTS,
  INITIAL_SYSTEM_CONFIG,
} from './data/mockData';
import { TenantStatus, SystemConfig } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_SYSTEM_CONFIG);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleUpdateTenantStatus = (id: string, newStatus: TenantStatus) => {
    setTenants(prev =>
      prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const getTabTitle = () => {
    switch (currentTab) {
      case 'overview':
        return 'Executive Overview & Liquidity Operations';
      case 'tenants':
        return 'Institutional Tenants & Accounts';
      case 'settings':
        return 'System Configuration & Security Controls';
    }
  };

  return (
    <div className="admin-shell">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        tenantCount={tenants.length}
      />

      <div className="admin-main">
        <Header
          title={getTabTitle()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notificationCount={2}
          onNotificationClick={() => setNotificationsOpen(!notificationsOpen)}
        />

        <main className="admin-content">
          {notificationsOpen && (
            <div className="notification-banner">
              <span>
                <strong>System Notice:</strong> 2 OFAC screening approvals pending review for Vanguard Media Group.
              </span>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="btn-icon"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          {currentTab === 'overview' && (
            <>
              <MetricsCards metrics={INITIAL_METRICS} />
              <AnalyticsChart data={INITIAL_DAILY_VOLUME} />
              <TenantTable
                tenants={tenants}
                onUpdateTenantStatus={handleUpdateTenantStatus}
              />
            </>
          )}

          {currentTab === 'tenants' && (
            <TenantTable
              tenants={tenants}
              onUpdateTenantStatus={handleUpdateTenantStatus}
            />
          )}

          {currentTab === 'settings' && (
            <SystemSettings
              initialConfig={systemConfig}
              onSaveConfig={(cfg) => setSystemConfig(cfg)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
