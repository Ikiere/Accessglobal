import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './styles/index.css';
import { catalogProducts, Product } from './data/products';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { MobileMenu } from './components/MobileMenu';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OrderReceiptModal, OrderDetails } from './components/OrderReceiptModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { ViewMode } from './components/CategorySelector';
import { SitePreloader } from './components/SitePreloader';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { DashboardPage } from './pages/DashboardPage';

function AppContent() {
  const navigate = useNavigate();

  // Products from Supabase (with catalogProducts fallback)
  const [products, setProducts] = useState<Product[]>(catalogProducts);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [productError, setProductError] = useState<string | null>(null);

  // Cart & Orders State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Auth State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Drawers & Notifications
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Layout View Mode (Editorial Grid vs Technical Spec Table)
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Fetch live products from Supabase / API Gateway
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      const liveProducts = await api.getProducts();
      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
      }
    } catch (err: any) {
      console.warn('[App] Could not fetch products from backend API, using initial catalog:', err);
      // Keep initial catalogProducts as resilient fallback
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Check if user is logged in
    const user = api.getCurrentUser();
    if (user && user.name) {
      setCurrentUser(user.name);
    }
  }, []);

  // Cart Actions
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setToastMessage(`Added "${product.name}" to your order.`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderComplete = (order: OrderDetails) => {
    setConfirmedOrder(order);
    try {
      const existing = JSON.parse(localStorage.getItem('agm_recent_orders') || '[]');
      localStorage.setItem('agm_recent_orders', JSON.stringify([order, ...existing]));
    } catch {}
    setToastMessage(`Order ${order.orderNumber} placed & bonded for customs clearance.`);
  };

  const handleAuthSuccess = (name: string, isSignUp: boolean) => {
    setCurrentUser(name);
    setToastMessage(
      isSignUp
        ? `Welcome to AccessGlobal, ${name}! Your account is active.`
        : `Signed in as ${name}.`
    );
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setToastMessage('Signed out of your account.');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const flagshipProduct = products[0] || catalogProducts[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Header Bar */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen(true)}
        onOpenSearch={() => navigate('/shop')}
        currentUser={currentUser}
      />

      {/* Main Multi-Page Route Outlet */}
      <main style={{ flex: 1, width: '100%', overflowX: 'clip' }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                products={products}
                flagshipProduct={flagshipProduct}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onAddToCart={handleAddToCart}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            }
          />
          <Route
            path="/shop"
            element={
              <ShopPage
                products={products}
                isLoading={isLoadingProducts}
                error={productError}
                onRefresh={fetchProducts}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onAddToCart={handleAddToCart}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                currentUser={currentUser}
                onOpenAuth={(mode) => {
                  setAuthMode(mode);
                  setAuthModalOpen(true);
                }}
                onLogout={handleLogout}
                onShowReceipt={(order) => setConfirmedOrder(order)}
                onShowToast={(msg) => setToastMessage(msg)}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer onShowToast={(msg) => setToastMessage(msg)} />

      {/* Slide-Over Mobile Menu (Holds Order Button & Sign In) */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        currentUser={currentUser}
        onClose={() => setMobileMenuOpen(false)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOrderComplete={handleOrderComplete}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      {/* Product Deep Spec Sheet Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p) => handleAddToCart(p)}
        />
      )}

      {/* Printable Bonded Invoice Modal */}
      {confirmedOrder && (
        <OrderReceiptModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
        />
      )}

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Status Toasts */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* Global Animated Site Preloader */}
      <SitePreloader isLoaded={!isLoadingProducts} minDuration={750} />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
