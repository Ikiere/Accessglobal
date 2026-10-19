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
    <div className={`mm ${isOpen ? 'on' : ''}`} id="mm">
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
              padding: '10px 0',
              fontSize: '1.2rem',
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
