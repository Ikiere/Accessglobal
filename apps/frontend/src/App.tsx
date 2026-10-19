import { useState, useEffect, useRef } from 'react';
import './App.css';
import { SvgDefs } from './components/SvgDefs';
import { CursorGlow } from './components/CursorGlow';
import { Navbar } from './components/Navbar';
import { MobileMenu } from './components/MobileMenu';
import { AuthModal } from './components/AuthModal';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { BentoCategories } from './components/BentoCategories';
import { ProductGrid } from './components/ProductGrid';
import { StatsSection } from './components/StatsSection';
import { PromoDeal } from './components/PromoDeal';
import { TrustSection } from './components/TrustSection';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

export function App() {
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartBump, setCartBump] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('All');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const toastTimerRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    if (currentUser) {
      showToast(`You are already logged in as ${currentUser}`);
      return;
    }
    setMobileMenuOpen(false);
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthModalOpen(false);
  };

  const handleAuthSuccess = (name: string, isSignUp: boolean) => {
    setCurrentUser(name);
    setAuthModalOpen(false);
    showToast(
      isSignUp
        ? `Welcome to AGM, ${name}. Your 10% code is on its way.`
        : `Welcome back, ${name}`
    );
  };

  const handleAddToCart = (productName: string) => {
    setCartCount((prev) => prev + 1);
    setCartBump(false);
    // Trigger restart of CSS bump animation
    window.requestAnimationFrame(() => {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 400);
    });
    showToast(`${productName} added to cart`);
  };

  const handleCartClick = () => {
    showToast(
      cartCount > 0
        ? `${cartCount} item${cartCount > 1 ? 's' : ''} in your cart`
        : 'Your cart is empty. Add something from Trending.'
    );
  };

  const handleSelectCategory = (category: string) => {
    setCurrentCategory(category);
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#login') {
      handleOpenAuth('login');
    } else if (hash === '#signup') {
      handleOpenAuth('signup');
    }

    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <CursorGlow />
      <SvgDefs />

      <Navbar
        cartCount={cartCount}
        cartBump={cartBump}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onCartClick={handleCartClick}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      <MobileMenu
        isOpen={mobileMenuOpen}
        currentUser={currentUser}
        onClose={() => setMobileMenuOpen(false)}
        onOpenAuth={handleOpenAuth}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={handleCloseAuth}
        onSuccess={handleAuthSuccess}
      />

      <main>
        <Hero />
        <Marquee />
        <BentoCategories onSelectCategory={handleSelectCategory} />

        <section className="sec" id="products">
          <div className="wrap">
            <h2>
              Trending <em>this week</em>
            </h2>

            <ProductGrid
              currentCategory={currentCategory}
              onSelectCategory={handleSelectCategory}
              onAddToCart={handleAddToCart}
            />

            <StatsSection />
            <PromoDeal onSelectCategory={handleSelectCategory} />
            <TrustSection />
          </div>
        </section>
      </main>

      <Footer
        onShowToast={showToast}
        onSelectCategory={handleSelectCategory}
      />

      <Toast message={toastMessage} isVisible={toastVisible} />
    </>
  );
}

export default App;
