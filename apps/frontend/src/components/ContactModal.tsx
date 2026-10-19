import React, { useState, useEffect } from 'react';
import { XIcon, CheckCircleIcon, ZapIcon } from './Icons';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNote?: string;
}

interface FormState {
  fullName: string;
  email: string;
  organization: string;
  monthlyVolume: string;
  note: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  organization?: string;
  monthlyVolume?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, initialNote = '' }) => {
  const [formData, setFormData] = useState<FormState>({
    fullName: '',
    email: '',
    organization: '',
    monthlyVolume: '$100k - $500k',
    note: initialNote,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  useEffect(() => {
    if (initialNote) {
      setFormData(prev => ({ ...prev, note: initialNote }));
    }
  }, [initialNote]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full legal name is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Corporate email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid corporate email address.';
    }
    if (!formData.organization.trim()) {
      newErrors.organization = 'Company or entity name is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate production API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setReferenceId(`AGX-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1200);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      organization: '',
      monthlyVolume: '$100k - $500k',
      note: '',
    });
    setErrors({});
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-container glass-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          className="modal-close"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close dialog"
        >
          <XIcon size={20} />
        </button>

        {!isSuccess ? (
          <div>
            <div className="modal-header">
              <span className="badge">Institutional Onboarding</span>
              <h2 id="modal-title" className="modal-title">Open an AccessGlobal Account</h2>
              <p className="modal-desc">
                Complete the application to schedule an institutional integration demo and KYC provisioning.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Alexandra Chen"
                  className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  disabled={isSubmitting}
                />
                {errors.fullName && <span id="fullName-error" className="error-text">{errors.fullName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Corporate Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@company.com"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    disabled={isSubmitting}
                  />
                  {errors.email && <span id="email-error" className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="organization" className="form-label">Company / Entity *</label>
                  <input
                    id="organization"
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Acme Global Corp"
                    className={`form-input ${errors.organization ? 'input-error' : ''}`}
                    aria-invalid={!!errors.organization}
                    aria-describedby={errors.organization ? 'org-error' : undefined}
                    disabled={isSubmitting}
                  />
                  {errors.organization && <span id="org-error" className="error-text">{errors.organization}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="monthlyVolume" className="form-label">Estimated Monthly Settlement Volume</label>
                <select
                  id="monthlyVolume"
                  value={formData.monthlyVolume}
                  onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                  className="form-input form-select"
                  disabled={isSubmitting}
                >
                  <option value="$10k - $100k">$10,000 – $100,000 / month</option>
                  <option value="$100k - $500k">$100,000 – $500,000 / month</option>
                  <option value="$500k - $2M">$500,000 – $2,000,000 / month</option>
                  <option value="$2M+">$2,000,000+ / month (Enterprise Tier)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="note" className="form-label">Integration Requirements / Initial Transfer Details</label>
                <textarea
                  id="note"
                  rows={3}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Specify targeted corridors, volume, or custom API requirements..."
                  className="form-input form-textarea"
                  disabled={isSubmitting}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <ZapIcon size={16} className="spin-icon" />
                      Securing Application...
                    </>
                  ) : (
                    'Submit Enterprise Application'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="success-view">
            <div className="success-icon-wrapper">
              <CheckCircleIcon size={48} className="text-success" />
            </div>
            <h2 className="modal-title">Application Submitted Successfully</h2>
            <p className="modal-desc">
              Your inquiry has been logged in our enterprise underwriting queue. A dedicated account director will review your submission and contact you within 2 business hours.
            </p>
            <div className="receipt-box">
              <span className="receipt-label">Application Reference:</span>
              <span className="receipt-code font-mono">{referenceId}</span>
            </div>
            <button onClick={handleReset} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
