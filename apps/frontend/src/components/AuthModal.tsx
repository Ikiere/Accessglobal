import React, { useState, useEffect } from 'react';
import { IconClose, IconUser, IconShieldCheck } from './icons';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (name: string, isSignUp: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setName('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    const displayName = mode === 'signup' && name.trim() ? name.trim() : email.split('@')[0];
    onSuccess(displayName, mode === 'signup');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
        backgroundColor: 'rgba(18, 21, 22, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-3)',
          maxWidth: '440px',
          width: '100%',
          boxShadow: 'var(--shadow-overlay)',
          padding: 'var(--space-8)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="btn-subtle"
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px' }}
        >
          <IconClose size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-round)',
              backgroundColor: 'var(--color-accent-soft)',
              color: 'var(--color-accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-3)',
            }}
          >
            <IconUser size={22} />
          </div>
          <h2 id="auth-modal-title" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-ink)' }}>
            {mode === 'login' ? 'Sign in to AccessGlobal' : 'Create your buyer account'}
          </h2>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
            {mode === 'login'
              ? 'Access saved workshop orders and tracking'
              : 'Receive 10% off your first international shipment'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Henrik Lindqvist"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid var(--color-line-strong)',
                  borderRadius: 'var(--radius-1)',
                  fontSize: 'var(--text-body-sm)',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid var(--color-line-strong)',
                borderRadius: 'var(--radius-1)',
                fontSize: 'var(--text-body-sm)',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid var(--color-line-strong)',
                borderRadius: 'var(--radius-1)',
                fontSize: 'var(--text-body-sm)',
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: 'var(--text-body)', marginTop: 'var(--space-2)' }}
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Switch Mode */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-line)', fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
          {mode === 'login' ? (
            <>
              First time at AccessGlobal?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Sign in
              </button>
            </>
          )}
        </div>

        {/* Privacy Note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
          <IconShieldCheck size={14} style={{ color: 'var(--color-accent)' }} />
          <span>No spam. Only essential order and customs updates.</span>
        </div>
      </div>
    </div>
  );
};
