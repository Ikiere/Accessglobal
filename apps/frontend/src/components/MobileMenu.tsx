interface MobileMenuProps {
  isOpen: boolean;
  currentUser: string | null;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export const MobileMenu = ({
  isOpen,
  currentUser,
  onClose,
  onOpenAuth,
  cartCount = 0,
  onOpenCart,
}: MobileMenuProps) => {
  const handleLinkClick = () => {
    onClose();
  };

  const handleAuthClick = (mode: 'login' | 'signup') => {
    onClose();
    onOpenAuth(mode);
  };

  const handleCartClick = () => {
    onClose();
    onOpenCart?.();
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

      {onOpenCart && (
        <button
          className="btn"
          onClick={handleCartClick}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'var(--paper)',
            justifyContent: 'center',
            margin: '14px 0 6px',
            padding: '14px 20px',
            fontWeight: 600,
          }}
        >
          View Cart ({cartCount})
        </button>
      )}

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
