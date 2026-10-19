import React, { useState, useMemo } from 'react';
import { Tenant, TenantStatus, TenantTier } from '../types';
import { SearchIcon, FilterIcon, RefreshIcon, EyeIcon, XIcon, CheckIcon } from './Icons';

interface TenantTableProps {
  tenants: Tenant[];
  onUpdateTenantStatus: (id: string, newStatus: TenantStatus) => void;
}

export const TenantTable: React.FC<TenantTableProps> = ({ tenants, onUpdateTenantStatus }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch =
        t.companyName.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.primaryContact.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesTier = tierFilter === 'ALL' || t.tier === tierFilter;

      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [tenants, search, statusFilter, tierFilter]);

  const handleToggleStatus = (tenant: Tenant) => {
    let nextStatus: TenantStatus = 'Active';
    if (tenant.status === 'Active') nextStatus = 'Suspended';
    else if (tenant.status === 'Suspended') nextStatus = 'Pending KYC';
    else if (tenant.status === 'Pending KYC') nextStatus = 'Active';

    onUpdateTenantStatus(tenant.id, nextStatus);
    setActionMessage(`Tenant ${tenant.companyName} status set to ${nextStatus}.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const getStatusBadge = (status: TenantStatus) => {
    switch (status) {
      case 'Active':
        return <span className="status-badge badge-active">Active</span>;
      case 'Pending KYC':
        return <span className="status-badge badge-pending">Pending KYC</span>;
      case 'Suspended':
        return <span className="status-badge badge-suspended">Suspended</span>;
    }
  };

  const getTierBadge = (tier: TenantTier) => {
    switch (tier) {
      case 'Enterprise':
        return <span className="tier-badge tier-enterprise">Enterprise</span>;
      case 'Growth':
        return <span className="tier-badge tier-growth">Growth</span>;
      case 'Starter':
        return <span className="tier-badge tier-starter">Starter</span>;
    }
  };

  return (
    <div className="admin-card table-card">
      <div className="table-header">
        <div>
          <h3 className="table-title">Institutional Tenant Directory</h3>
          <p className="table-subtitle">Verified accounts, treasury volume, and operational state</p>
        </div>

        {actionMessage && (
          <div className="action-notification font-mono">
            <CheckIcon size={14} />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls">
        <div className="control-search">
          <SearchIcon size={16} className="control-search-icon" />
          <input
            type="text"
            placeholder="Search tenant name, ID or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="control-input"
          />
        </div>

        <div className="control-filters">
          <div className="filter-item">
            <FilterIcon size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="control-select"
              aria-label="Filter by Status"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending KYC">Pending KYC</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="filter-item">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="control-select"
              aria-label="Filter by Tier"
            >
              <option value="ALL">All Tiers</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Growth">Growth</option>
              <option value="Starter">Starter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tenant & ID</th>
              <th>Jurisdiction</th>
              <th>Tier</th>
              <th>30d Settlement</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="table-row">
                  <td>
                    <div className="tenant-cell">
                      <span className="tenant-name">{tenant.companyName}</span>
                      <span className="tenant-id font-mono">{tenant.id}</span>
                    </div>
                  </td>
                  <td>
                    <span className="tenant-jurisdiction">{tenant.jurisdiction}</span>
                  </td>
                  <td>{getTierBadge(tenant.tier)}</td>
                  <td>
                    <span className="tenant-volume font-mono">
                      ${tenant.volume30d.toLocaleString()}
                    </span>
                  </td>
                  <td>{getStatusBadge(tenant.status)}</td>
                  <td>
                    <span className="tenant-date font-mono">{tenant.joinedAt}</span>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons">
                      <button
                        onClick={() => setSelectedTenant(tenant)}
                        className="btn-icon"
                        title="View Tenant Detail Dossier"
                        aria-label={`Inspect ${tenant.companyName}`}
                      >
                        <EyeIcon size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(tenant)}
                        className="btn-icon btn-icon-status"
                        title="Toggle Status (Active/Suspended/Pending)"
                        aria-label={`Change status for ${tenant.companyName}`}
                      >
                        <RefreshIcon size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="empty-state">
                  No institutional tenants found matching current criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span className="table-count">
          Showing {filteredTenants.length} of {tenants.length} tenants
        </span>
      </div>

      {/* Detail Modal */}
      {selectedTenant && (
        <div className="modal-backdrop" onClick={() => setSelectedTenant(null)}>
          <div className="modal-container admin-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTenant(null)}>
              <XIcon size={20} />
            </button>
            <div className="modal-header">
              <span className="status-badge badge-active">{selectedTenant.tier} Client</span>
              <h3 className="modal-title">{selectedTenant.companyName}</h3>
              <span className="tenant-id font-mono">{selectedTenant.id}</span>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Primary Executive Contact:</span>
                <span className="detail-val">{selectedTenant.primaryContact}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Regulated Jurisdiction:</span>
                <span className="detail-val">{selectedTenant.jurisdiction}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">30-Day Gross Volume:</span>
                <span className="detail-val font-mono">${selectedTenant.volume30d.toLocaleString()} USD</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Current Operational Status:</span>
                <span className="detail-val">{getStatusBadge(selectedTenant.status)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Provisioned:</span>
                <span className="detail-val font-mono">{selectedTenant.joinedAt}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">AML / OFAC Status:</span>
                <span className="detail-val text-success">Cleared (Zero Violations)</span>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '2rem' }}>
              <button onClick={() => setSelectedTenant(null)} className="btn btn-secondary">
                Close Dossier
              </button>
              <button
                onClick={() => {
                  handleToggleStatus(selectedTenant);
                  setSelectedTenant(null);
                }}
                className="btn btn-primary"
              >
                Toggle Account Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
