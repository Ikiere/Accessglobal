interface NavbarProps {
  cartCount: number;
  cartBump: boolean;
  currentUser: string | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onCartClick: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Navbar = ({
  cartCount,
  cartBump,
  currentUser,
  onOpenAuth,
  onCartClick,
  mobileMenuOpen,
  onToggleMobileMenu,
}: NavbarProps) => {
  return (
    <nav>
      <a href="#" className="logo">
        AGM<b>.</b>
      </a>
      <ul>
        <li>
          <a href="#shop">Categories</a>
        </li>
        <li>
          <a href="#products">Trending</a>
        </li>
        <li>
          <a href="#deal">Deals</a>
        </li>
        <li>
          <a href="#help">Support</a>
        </li>
      </ul>
      <div className="nr">
        {currentUser ? (
          <button
            className="lnk"
            id="lnk"
            onClick={() => onOpenAuth('login')}
            style={{ fontWeight: 600, color: 'var(--sun)' }}
          >
            Hi, {currentUser}
          </button>
        ) : (
          <>
            <button
              className="lnk"
              data-auth="login"
              id="lnk"
              onClick={() => onOpenAuth('login')}
            >
              Log in
            </button>
            <button
              className="su"
              data-auth="signup"
              id="su"
              onClick={() => onOpenAuth('signup')}
            >
              Sign up
            </button>
          </>
        )}
        <button
          className={`cart ${cartBump ? 'bump' : ''}`}
          id="cart"
          aria-label="Open cart"
          onClick={onCartClick}
        >
          Cart (<span id="count">{cartCount}</span>)
        </button>
        <button
          className="burger"
          id="burger"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mm"
          onClick={onToggleMobileMenu}
        >
          <i />
          <i />
        </button>
      </div>
    </nav>
  );
};
