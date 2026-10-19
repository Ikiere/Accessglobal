import React, { useState } from 'react';
import { SystemConfig } from '../types';
import { CheckIcon, RefreshIcon } from './Icons';

interface SystemSettingsProps {
  initialConfig: SystemConfig;
  onSaveConfig: (cfg: SystemConfig) => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ initialConfig, onSaveConfig }) => {
  const [config, setConfig] = useState<SystemConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{ retryLimit?: string; rateLimit?: string }>({});

  const handleToggle = (key: keyof Pick<SystemConfig, 'maintenanceMode' | 'bypassInstantSettlement' | 'automatedOFAC'>) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validate = (): boolean => {
    const errs: { retryLimit?: string; rateLimit?: string } = {};
    if (config.retryLimit < 1 || config.retryLimit > 10) {
      errs.retryLimit = 'Webhook retry limit must be between 1 and 10.';
    }
    if (config.rateLimitPerSec < 50 || config.rateLimitPerSec > 50000) {
      errs.rateLimit = 'Rate limit must be between 50 and 50,000 req/sec.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      onSaveConfig(config);
      setTimeout(() => setSaveSuccess(false), 3500);
    }, 800);
  };

  return (
    <div className="admin-card settings-card">
      <div className="settings-header">
        <div>
          <h3 className="settings-title">Core Settlement Engine & Infrastructure Settings</h3>
          <p className="settings-subtitle">Manage security thresholds, webhook policies, and platform operational state.</p>
        </div>

        {saveSuccess && (
          <div className="save-banner">
            <CheckIcon size={16} />
            <span>Platform configuration synchronized successfully.</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="settings-form">
        <div className="toggle-list">
          {/* Maintenance Mode */}
          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-title">Emergency Maintenance Mode</span>
              <span className="toggle-desc">
                When enabled, incoming public API calls and transfers are queued with HTTP 503 response.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.maintenanceMode}
              onClick={() => handleToggle('maintenanceMode')}
              className={`switch-btn ${config.maintenanceMode ? 'switch-active switch-danger' : ''}`}
            >
              <span className="switch-thumb"></span>
            </button>
          </div>

          {/* Instant Settlement Bypass */}
          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-title">Instant Clearing FastTrack</span>
              <span className="toggle-desc">
                Route verified low-risk domestic transactions through real-time RTP & SEPA-Instant rails.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={!config.bypassInstantSettlement}
              onClick={() => handleToggle('bypassInstantSettlement')}
              className={`switch-btn ${!config.bypassInstantSettlement ? 'switch-active' : ''}`}
            >
              <span className="switch-thumb"></span>
            </button>
          </div>

          {/* Automated OFAC / PEP Screening */}
          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-title">Continuous OFAC & Sanctions Intelligence</span>
              <span className="toggle-desc">
                Perform automated real-time compliance screening before every ledger movement.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.automatedOFAC}
              onClick={() => handleToggle('automatedOFAC')}
              className={`switch-btn ${config.automatedOFAC ? 'switch-active' : ''}`}
            >
              <span className="switch-thumb"></span>
            </button>
          </div>
        </div>

        <div className="settings-divider"></div>

        {/* Numeric Configuration */}
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="retryLimit" className="form-label">
              Webhook Delivery Max Retries (Exponential Backoff)
            </label>
            <input
              id="retryLimit"
              type="number"
              min="1"
              max="10"
              value={config.retryLimit}
              onChange={(e) => setConfig({ ...config, retryLimit: parseInt(e.target.value) || 1 })}
              className={`control-input ${errors.retryLimit ? 'input-error' : ''}`}
            />
            {errors.retryLimit && <span className="error-text">{errors.retryLimit}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="rateLimit" className="form-label">
              Default API Rate Limit (requests / second / tenant)
            </label>
            <input
              id="rateLimit"
              type="number"
              min="50"
              max="50000"
              step="50"
              value={config.rateLimitPerSec}
              onChange={(e) => setConfig({ ...config, rateLimitPerSec: parseInt(e.target.value) || 100 })}
              className={`control-input ${errors.rateLimit ? 'input-error' : ''}`}
            />
            {errors.rateLimit && <span className="error-text">{errors.rateLimit}</span>}
          </div>
        </div>

        <div className="settings-actions">
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary"
          >
            {isSaving ? (
              <>
                <RefreshIcon size={16} className="spin-icon" />
                Committing to Cluster...
              </>
            ) : (
              'Save Platform Configuration'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
