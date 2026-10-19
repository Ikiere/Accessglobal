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
import { CartDrawer, CartItem } from './components/CartDrawer';
import { Product } from './components/ProductGrid';

export function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartBump, setCartBump] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('All');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const toastTimerRef = useRef<number | null>(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === product.id);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: copy[existingIdx].quantity + 1,
        };
        return copy;
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    setCartBump(false);
    // Trigger restart of CSS bump animation
    window.requestAnimationFrame(() => {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 400);
    });
    showToast(`${product.name} added to cart`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found) {
        showToast(`${found.name} removed from cart`);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
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
        cartCount={cartCount}
        onOpenCart={handleCartClick}
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

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onShowToast={showToast}
      />

      <Toast message={toastMessage} isVisible={toastVisible} />
    </>
  );
}

export default App;
