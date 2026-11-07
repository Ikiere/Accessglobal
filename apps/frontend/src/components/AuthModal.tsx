import React, { useState, useEffect } from 'react';
import { IconClose, IconUser, IconShieldCheck } from './icons';
import { api } from '../services/api';

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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setName('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setErrorMessage(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const displayName = name.trim() || email.split('@')[0];
        const res = await api.register(displayName, email.trim(), password);
        onSuccess(res.user?.name || displayName, true);
      } else {
        const res = await api.login(email.trim(), password);
        onSuccess(res.user?.name || email.split('@')[0], false);
      }
      onClose();
    } catch (err: any) {
      // If backend is not reached yet or throws error, provide actionable message
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
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
              : 'Save customs profiles and receive bonded consignment tracking'}
          </p>
        </div>

        {/* Error Feedback Banner */}
        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-2)',
              color: '#dc2626',
              fontSize: 'var(--text-body-sm)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Henrik Lindqvist"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-2)',
                  border: '1px solid var(--color-line-strong)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-ink)',
                  fontSize: 'var(--text-body-sm)',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-2)',
                border: '1px solid var(--color-line-strong)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-ink)',
                fontSize: 'var(--text-body-sm)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-ink)' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn-subtle"
                style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-2)',
                border: '1px solid var(--color-line-strong)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-ink)',
                fontSize: 'var(--text-body-sm)',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 'var(--text-body)',
              marginTop: 'var(--space-2)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Authenticating with Supabase...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Create one
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Sign in
              </button>
            </span>
          )}
        </div>

        {/* Security Reassurance */}
        <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', fontSize: '0.6875rem', color: 'var(--color-ink-subtle)' }}>
          <IconShieldCheck size={14} />
          <span>Encrypted with AES-256 · Direct Supabase Security Engine</span>
        </div>
      </div>
    </div>
  );
};
