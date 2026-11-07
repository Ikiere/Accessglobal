import React, { useState, useEffect } from 'react';
import { IconClose, IconUser } from './icons';
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
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessNotice(null);
    setSandboxCode(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setName('');
      setEmail('');
      setPassword('');
      setOtpInput('');
      setShowPassword(false);
      setErrorMessage(null);
      setSuccessNotice(null);
      setSandboxCode(null);
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
    setErrorMessage(null);
    setSuccessNotice(null);

    if (mode === 'otp') {
      if (!otpInput.trim() || otpInput.trim().length < 6) {
        setErrorMessage('Please enter the 6-digit confirmation code from your email.');
        return;
      }

      setLoading(true);
      try {
        const res = await api.verifyOtp(email.trim(), otpInput.trim());
        onSuccess(res.user?.name || name || 'Customer', true);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Invalid or expired confirmation code.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const displayName = name.trim() || email.split('@')[0];
        const res = await api.register(displayName, email.trim(), password);
        if (res.requiresOtp) {
          setMode('otp');
          setResendCooldown(30);
          if (res.emailResult?.success) {
            setSuccessNotice(`A 6-digit confirmation code was sent to ${email.trim()}.`);
            setSandboxCode(null);
          } else if (res.emailResult?.sandboxCode) {
            setSandboxCode(res.emailResult.sandboxCode);
            setSuccessNotice(null);
          } else {
            setSuccessNotice(`A 6-digit verification code has been generated for ${email.trim()}.`);
          }
        } else {
          onSuccess(res.user?.name || displayName, true);
          onClose();
        }
      } else {
        const res = await api.login(email.trim(), password);
        onSuccess(res.user?.name || email.split('@')[0], false);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.resendOtp(email.trim(), name.trim());
      setResendCooldown(30);
      if (res.emailResult?.success) {
        setSuccessNotice('A new 6-digit verification code was dispatched to your inbox.');
        setSandboxCode(null);
      } else if (res.emailResult?.sandboxCode) {
        setSandboxCode(res.emailResult.sandboxCode);
        setSuccessNotice('A new verification code was generated.');
      } else {
        setSuccessNotice('A new 6-digit verification code was generated.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again.');
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
        zIndex: 90,
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
            {mode === 'otp'
              ? 'Verify Your Email'
              : mode === 'login'
              ? 'Sign in to AccessGlobal'
              : 'Create your buyer account'}
          </h2>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
            {mode === 'otp'
              ? `Enter the 6-digit security code dispatched to ${email}`
              : mode === 'login'
              ? 'Access your orders, saved delivery addresses, and tracking'
              : 'Direct-from-workshop ordering and pre-cleared customs clearance'}
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
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span>{errorMessage}</span>
            {(errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('registered')) && mode === 'signup' && (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMode('login');
                }}
                style={{
                  alignSelf: 'flex-start',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#124330',
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                Switch to Sign In →
              </button>
            )}
          </div>
        )}

        {/* Success Notice Banner */}
        {successNotice && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(18, 67, 48, 0.1)',
              border: '1px solid rgba(18, 67, 48, 0.25)',
              borderRadius: 'var(--radius-2)',
              color: '#124330',
              fontSize: 'var(--text-body-sm)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {successNotice}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {mode === 'otp' ? (
            <div>
              {sandboxCode && (
                <div
                  style={{
                    padding: '12px 14px',
                    backgroundColor: '#FBF8F3',
                    border: '1px solid #E5DAC9',
                    borderRadius: 'var(--radius-2)',
                    marginBottom: '14px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#124330', marginBottom: '4px' }}>
                    <span>Developer Sandbox Mode</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#57625B', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    Sandbox testing code for <strong>{email}</strong>:
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setOtpInput(sandboxCode)}
                      style={{
                        fontFamily: 'monospace, "IBM Plex Mono"',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#124330',
                        backgroundColor: '#E9F2ED',
                        border: '1px solid rgba(18,67,48,0.25)',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        letterSpacing: '3px',
                        cursor: 'pointer',
                      }}
                      title="Click to auto-fill code"
                    >
                      {sandboxCode}
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#124330', fontWeight: 600 }}>
                      ← Click to fill code
                    </span>
                  </div>
                </div>
              )}

              <label style={{ display: 'block', fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px', textAlign: 'center' }}>
                6-Digit Security Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 'var(--radius-2)',
                  border: '2px solid var(--color-accent)',
                  backgroundColor: 'var(--color-surface-sunken)',
                  color: 'var(--color-ink)',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  letterSpacing: '8px',
                  textAlign: 'center',
                  fontFamily: 'monospace, "IBM Plex Mono"',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="btn-subtle"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}
                >
                  ← Edit email
                </button>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleResendOtp}
                  style={{
                    fontSize: 'var(--text-body-sm)',
                    color: resendCooldown > 0 ? 'var(--color-ink-subtle)' : 'var(--color-accent)',
                    fontWeight: 600,
                    cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}

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
            {loading
              ? 'Verifying...'
              : mode === 'otp'
              ? 'Verify & Complete Registration'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account & Send Code'}
          </button>
        </form>

        {/* Switch Mode Footer */}
        {mode !== 'otp' && (
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
        )}
      </div>
    </div>
  );
};
