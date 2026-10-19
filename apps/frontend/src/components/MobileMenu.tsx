interface MobileMenuProps {
  isOpen: boolean;
  currentUser: string | null;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const MobileMenu = ({
  isOpen,
  currentUser,
  onClose,
  onOpenAuth,
}: MobileMenuProps) => {
  const handleLinkClick = () => {
    onClose();
  };

  const handleAuthClick = (mode: 'login' | 'signup') => {
    onClose();
    onOpenAuth(mode);
  };

  return (
    <div
      className={`mm ${isOpen ? 'on' : ''}`}
      id="mm"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <button
        className="x"
        aria-label="Close menu"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 'max(16px, env(safe-area-inset-top, 16px))',
          right: '18px',
          width: '42px',
          height: '42px',
        }}
      >
        ✕
      </button>

      <a href="#shop" onClick={handleLinkClick}>
        Categories
      </a>
      <a href="#products" onClick={handleLinkClick}>
        Trending
      </a>
      <a href="#deal" onClick={handleLinkClick}>
        Deals
      </a>
      <a href="#help" onClick={handleLinkClick}>
        Support
      </a>

      <div className="mb">
        {currentUser ? (
          <div
            style={{
              color: 'var(--sun)',
              fontWeight: 600,
              padding: '12px 0',
              fontSize: '1.15rem',
            }}
          >
            Logged in as {currentUser}
          </div>
        ) : (
          <>
            <button className="btn g" onClick={() => handleAuthClick('login')}>
              Log in
            </button>
            <button className="btn p" onClick={() => handleAuthClick('signup')}>
              Sign up
            </button>
          </>
        )}
      </div>
    </div>
  );
};
