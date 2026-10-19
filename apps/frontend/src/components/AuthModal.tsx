import { useState, useEffect, useRef } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (userName: string, isSignUp: boolean) => void;
}

export const AuthModal = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');

  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        if (mode === 'signup') {
          fullNameInputRef.current?.focus();
        } else {
          emailInputRef.current?.focus();
        }
      }, 350);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate password strength score: 0 to 4
  const passwordScore =
    (password.length >= 8 ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  const meterColors = ['#ff8da1', '#ff8da1', '#ffb21e', '#3ee6b0', '#3ee6b0'];
  const meterWidth = `${passwordScore * 25}%`;
  const meterColor = meterColors[passwordScore] || '#ff8da1';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = fullName.trim();
    const emailTrimmed = email.trim();

    if (mode === 'signup' && nameTrimmed.length < 2) {
      setError('Enter your full name.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailTrimmed)) {
      setError('Enter a valid email address, like you@email.com.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (mode === 'signup' && !agreeTerms) {
      setError('Accept the Terms and Privacy Policy to continue.');
      return;
    }

    const calculatedUser = (nameTrimmed || emailTrimmed.split('@')[0]).split(' ')[0];
    onSuccess(calculatedUser, mode === 'signup');

    // Reset fields
    setFullName('');
    setEmail('');
    setPassword('');
    setAgreeTerms(false);
    setError('');
  };

  const copy = {
    login: {
      title: 'Welcome back',
      lead: 'Log in to see your orders and saved items.',
      button: 'Log in',
      autoComplete: 'current-password',
    },
    signup: {
      title: 'Create your account',
      lead: 'Join free and get 10% off your first order.',
      button: 'Create account',
      autoComplete: 'new-password',
    },
  };

  return (
    <div
      className={`auth ${isOpen ? 'on' : ''}`}
      id="auth"
      data-m={mode}
      role="dialog"
      aria-modal="true"
      aria-labelledby="at"
    >
      <div className="as">
        <a
          href="#"
          className="logo"
          id="alogo"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          AGM<b>.</b>
        </a>
        <span className="float" style={{ right: '12%', top: '12%' }}>
          <img
            src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&auto=format&fit=crop&q=80"
            alt="Electric bike"
            loading="lazy"
          />
        </span>
        <span
          className="float"
          style={{ left: '12%', top: '40%', animationDelay: '-2s' }}
        >
          <img
            src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&auto=format&fit=crop&q=80"
            alt="Fashion clothes"
            loading="lazy"
          />
        </span>
        <span
          className="float"
          style={{ right: '18%', bottom: '14%', animationDelay: '-4s' }}
        >
          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80"
            alt="Sneakers"
            loading="lazy"
          />
        </span>
        <p>
          One account. <b>Every aisle</b> in the world.
        </p>
      </div>

      <div className="af">
        <button className="x" id="ax" aria-label="Close" onClick={onClose}>
          ✕
        </button>

        <div className="sw" role="tablist">
          <button
            role="tab"
            data-m="login"
            aria-selected={mode === 'login'}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            Log in
          </button>
          <button
            role="tab"
            data-m="signup"
            aria-selected={mode === 'signup'}
            onClick={() => {
              setMode('signup');
              setError('');
            }}
          >
            Sign up
          </button>
        </div>

        <h2 id="at">{copy[mode].title}</h2>
        <p className="lead" id="ap">
          {copy[mode].lead}
        </p>

        <form id="afm" noValidate onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="fn">
              Full name
              <input
                ref={fullNameInputRef}
                type="text"
                id="fn"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>
          )}

          <label>
            Email
            <input
              ref={emailInputRef}
              type="email"
              id="em"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <div className="pw">
              <input
                type={showPassword ? 'text' : 'password'}
                id="pw"
                autoComplete={copy[mode].autoComplete}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                id="eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {mode === 'signup' && (
            <div className="meter fn" id="meter">
              <i
                style={{
                  width: meterWidth,
                  background: meterColor,
                }}
              />
            </div>
          )}

          {mode === 'signup' && (
            <label className="chk fn">
              <input
                type="checkbox"
                id="tc"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              I agree to the Terms and Privacy Policy
            </label>
          )}

          <div className="err" id="err" role="alert">
            {error}
          </div>

          <button className="btn p full" id="sub" type="submit">
            {copy[mode].button}
          </button>
        </form>

        <div className="or">or continue with</div>
        <div className="soc">
          <button
            type="button"
            onClick={() => {
              onSuccess('Google User', false);
            }}
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => {
              onSuccess('Apple User', false);
            }}
          >
            Apple
          </button>
        </div>
      </div>
    </div>
  );
};
