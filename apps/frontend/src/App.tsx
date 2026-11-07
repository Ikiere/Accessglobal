import { useState, useMemo, useRef } from 'react';
import './styles/index.css';
import { catalogProducts, Product } from './data/products';
import { Navbar } from './components/Navbar';
import { MobileMenu } from './components/MobileMenu';
import { Hero } from './components/Hero';
import { CategorySelector, ViewMode, SortOption } from './components/CategorySelector';
import { ProductCard } from './components/ProductCard';
import { ProductSpecTable } from './components/ProductSpecTable';
import { ProductDetailModal } from './components/ProductDetailModal';
import { StandardSection } from './components/StandardSection';
import { MakerFeature } from './components/MakerFeature';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { OrderReceiptModal, OrderDetails } from './components/OrderReceiptModal';
import { UserDashboardModal, UserShippingProfile } from './components/UserDashboardModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

const initialSeedOrders: OrderDetails[] = [
  {
    orderNumber: 'AGM-942104',
    customerName: 'Henrik Lindqvist',
    customerEmail: 'henrik@nordicwork.fi',
    customerAddress: 'Mannerheimintie 14 B, Apt 3',
    customerCountry: 'Finland',
    items: [
      {
        id: 'agm-01',
        name: 'Volt X1 Commuter E-Bike',
        maker: 'Nordic Motion Labs · Helsinki, Finland',
        price: 1299,
        quantity: 1,
      },
    ],
    subtotal: 1299,
    discount: 130,
    total: 1169,
    date: 'Oct 28, 2026, 09:30 AM',
  },
  {
    orderNumber: 'AGM-829141',
    customerName: 'Henrik Lindqvist',
    customerEmail: 'henrik@nordicwork.fi',
    customerAddress: 'Mannerheimintie 14 B, Apt 3',
    customerCountry: 'Finland',
    items: [
      {
        id: 'agm-03',
        name: 'French Linen Belted Dress',
        maker: 'Atelier Saint-Florent · Normandy, France',
        price: 124,
        quantity: 1,
      },
      {
        id: 'agm-09',
        name: 'Oud Noir Extrait de Parfum 100ml',
        maker: 'Maison Al-Dahabi · Grasse, France',
        price: 110,
        quantity: 1,
      },
    ],
    subtotal: 234,
    discount: 0,
    total: 234,
    date: 'Nov 02, 2026, 04:15 PM',
  },
];

const initialShippingProfile: UserShippingProfile = {
  fullName: 'Henrik Lindqvist',
  email: 'henrik@nordicwork.fi',
  street: 'Mannerheimintie 14 B, Apt 3',
  city: 'Helsinki',
  country: 'Finland',
  postalCode: '00100',
};

export function App() {
  // Cart & Orders State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);
  const [orders, setOrders] = useState<OrderDetails[]>(initialSeedOrders);
  const [shippingProfile, setShippingProfile] = useState<UserShippingProfile>(initialShippingProfile);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>('Henrik');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Navigation & Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Catalog Filtering & View State
  const [currentCategory, setCurrentCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('curated');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Toast Feedback State
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
    }, 2800);
  };

  // Cart operations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + quantity,
        };
        return next;
      }
      return [...prev, { ...product, quantity }];
    });
    showToast(`${quantity}× ${product.name} added to order`);
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
        showToast(`${found.name} removed from order`);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    if (currentUser) {
      showToast(`Logged in as ${currentUser}`);
      return;
    }
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (name: string, isSignUp: boolean) => {
    setCurrentUser(name);
    setShippingProfile((prev) => ({ ...prev, fullName: name }));
    setAuthModalOpen(false);
    showToast(
      isSignUp
        ? `Welcome to AccessGlobal, ${name}. Code GLOBAL10 activated.`
        : `Welcome back, ${name}`
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Signed out of AccessGlobal.');
  };

  const handleOrderComplete = (order: OrderDetails) => {
    setOrders((prev) => [order, ...prev]);
    setConfirmedOrder(order);
  };

  const handleSelectCategory = (cat: string) => {
    setCurrentCategory(cat);
    const catalogEl = document.getElementById('collection');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenSearch = () => {
    const catalogEl = document.getElementById('collection');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Categories with counts
  const categoryOptions = useMemo(() => {
    const counts: Record<string, number> = {
      All: catalogProducts.length,
    };
    catalogProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    return [
      { name: 'All', count: counts['All'] },
      { name: 'E-Bikes', count: counts['E-Bikes'] || 0 },
      { name: 'Clothing', count: counts['Clothing'] || 0 },
      { name: 'Shoes', count: counts['Shoes'] || 0 },
      { name: 'Appliances', count: counts['Appliances'] || 0 },
      { name: 'Perfumes', count: counts['Perfumes'] || 0 },
      { name: 'Accessories', count: counts['Accessories'] || 0 },
    ];
  }, []);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let result = catalogProducts.filter((p) => {
      const matchesCategory = currentCategory === 'All' || p.category === currentCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.maker.toLowerCase().includes(q) ||
        p.makerOrigin.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.specs.some((s) => s.value.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });

    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [currentCategory, searchQuery, sortOption]);

  const flagshipProduct = catalogProducts[0];

  return (
    <>
      {/* Skip to Content Landmark */}
      <a href="#main-content" className="sr-only">
        Skip to main content
      </a>

      {/* Persistent Navigation */}
      <Navbar
        cartCount={cartCount}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onCartClick={() => setIsCartOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={handleOpenSearch}
      />

      {/* Mobile Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        currentUser={currentUser}
        onClose={() => setMobileMenuOpen(false)}
        onOpenAuth={handleOpenAuth}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Landmark */}
      <main id="main-content">
        {/* Editorial Hero */}
        <Hero
          flagshipProduct={flagshipProduct}
          onExplore={() => {
            const el = document.getElementById('collection');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
        />

        {/* Collection Section */}
        <section id="collection" style={{ paddingBlock: 'var(--space-12) var(--space-16)', backgroundColor: 'var(--color-bg)' }}>
          <div className="wrap">
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <span style={{ fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-subtle)', fontWeight: 600 }}>
                Aisle Directory
              </span>
              <h2 style={{ fontSize: 'var(--text-h2)', marginTop: '2px', color: 'var(--color-ink)' }}>
                The Collection
              </h2>
            </div>

            {/* Category Controls & Layout Switcher */}
            <CategorySelector
              categories={categoryOptions}
              currentCategory={currentCategory}
              onSelectCategory={setCurrentCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortOption={sortOption}
              onSortChange={setSortOption}
              totalFilteredCount={filteredProducts.length}
            />

            {/* Catalog Layouts */}
            {filteredProducts.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  paddingBlock: 'var(--space-16)',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-3)',
                  border: '1px solid var(--color-line)',
                }}
              >
                <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)' }}>
                  No workshop items matched your search query "{searchQuery}".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentCategory('All');
                  }}
                  className="btn-outline"
                >
                  Clear Filters & Show All
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Editorial Grid Template */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: 'var(--space-6)',
                }}
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                  />
                ))}
              </div>
            ) : (
              /* Technical Spec Table Template */
              <ProductSpecTable
                products={filteredProducts}
                onSelect={(p) => setSelectedProduct(p)}
                onAddToCart={(p) => handleAddToCart(p, 1)}
              />
            )}
          </div>
        </section>

        {/* Maker Feature: Helsinki Nordic Motion Labs */}
        <MakerFeature onFilterMaker={handleSelectCategory} />

        {/* The AGM Standard & Integrity Guarantee */}
        <StandardSection />
      </main>

      {/* Global Footer */}
      <Footer onShowToast={showToast} onSelectCategory={handleSelectCategory} />

      {/* Product Detail Modal / Spec Sheet */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
      />

      {/* Slide-over Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOrderComplete={handleOrderComplete}
        onShowToast={showToast}
      />

      {/* Customer User Dashboard Modal */}
      <UserDashboardModal
        isOpen={isDashboardOpen}
        currentUser={currentUser}
        orders={orders}
        shippingProfile={shippingProfile}
        onUpdateShippingProfile={(prof) => setShippingProfile(prof)}
        onViewInvoice={(ord) => setConfirmedOrder(ord)}
        onClose={() => setIsDashboardOpen(false)}
        onLogout={handleLogout}
        onShowToast={showToast}
      />

      {/* Printable Order Confirmation Receipt Modal */}
      <OrderReceiptModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Toast Announcements */}
      <Toast message={toastMessage} isVisible={toastVisible} />
    </>
  );
}

export default App;
