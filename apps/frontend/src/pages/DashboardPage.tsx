import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrderDetails } from '../components/OrderReceiptModal';
import { IconUser, IconPrinter, IconSearch, IconCheck } from '../components/icons';
import { UserShippingProfile } from '../components/UserDashboardModal';
import { api } from '../services/api';

interface DashboardPageProps {
  currentUser: string | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onShowReceipt: (order: OrderDetails) => void;
  onShowToast: (message: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onShowReceipt,
  onShowToast,
}) => {
  const navigate = useNavigate();

  // Active customer auth profile
  const authUser = api.getCurrentUser();

  const [shippingProfile, setShippingProfile] = useState<UserShippingProfile>({
    fullName: authUser?.name || currentUser || 'Verified Consignee',
    email: authUser?.email || 'client@accessglobalmarket.com',
    street: '72 Industrial Way, Suite 400',
    city: 'New York',
    country: 'United States',
    postalCode: '10013',
  });

  // Dynamic orders state from Supabase database
  const [savedOrders, setSavedOrders] = useState<OrderDetails[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);

  // Live Consignment Tracking Search state
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<OrderDetails | null>(null);
  const [isSearchingTracking, setIsSearchingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Fetch authenticated customer's live orders from Supabase
  const loadCustomerOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const user = api.getCurrentUser();
      const orders = await api.getOrders(user?.email);
      setSavedOrders(orders);
    } catch (err) {
      console.warn('[DashboardPage] Failed to fetch orders from Supabase:', err);
      setSavedOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadCustomerOrders();

    const user = api.getCurrentUser();
    if (user) {
      setShippingProfile((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
      }));
    }

    try {
      const storedProfile = localStorage.getItem('agm_shipping_profile');
      if (storedProfile) {
        setShippingProfile(JSON.parse(storedProfile));
      }
    } catch {}
  }, [currentUser]);

  // Handle Instant Consignment Tracking lookup
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackingQuery.trim();
    if (!query) return;

    setIsSearchingTracking(true);
    setTrackingError(null);
    setTrackedOrder(null);

    try {
      const found = await api.trackOrder(query);
      if (found) {
        setTrackedOrder(found);
      } else {
        setTrackingError(`No consignment found matching "${query}". Please verify your Order Reference (e.g. AGM-39489C34) or customer email.`);
      }
    } catch {
      setTrackingError('Unable to query consignment records. Please try again.');
    } finally {
      setIsSearchingTracking(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('agm_shipping_profile', JSON.stringify(shippingProfile));
      onShowToast('Customs shipping address saved & synchronized with checkout.');
    } catch {
      onShowToast('Could not save shipping profile.');
    }
  };

  const handleExportData = () => {
    const exportBundle = {
      exportTimestamp: new Date().toISOString(),
      accountUser: currentUser,
      authUser,
      shippingProfile,
      orderHistory: savedOrders,
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AccessGlobal-DataExport-${currentUser || 'Account'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Data archive downloaded successfully.');
  };

  // Helper: map order status to progress percentage and stage
  const getProgressInfo = (status?: string) => {
    const s = (status || 'Processing').trim();
    if (s === 'Delivered') {
      return { percent: 100, label: 'Delivered', stage: 4, color: '#059669', badgeBg: 'rgba(5, 150, 105, 0.12)', badgeColor: '#059669' };
    }
    if (s === 'Cancelled') {
      return { percent: 0, label: 'Cancelled', stage: 0, color: '#dc2626', badgeBg: 'rgba(239, 68, 68, 0.12)', badgeColor: '#dc2626' };
    }
    if (s === 'Pending') {
      return { percent: 35, label: 'Bonded & Queued with Makers', stage: 1, color: '#d97706', badgeBg: 'rgba(217, 119, 6, 0.12)', badgeColor: '#d97706' };
    }
    // Default: 'Processing'
    return { percent: 65, label: 'Bonded & Customs Cleared', stage: 2, color: '#124330', badgeBg: 'rgba(18, 67, 48, 0.12)', badgeColor: '#124330' };
  };

  return (
    <div style={{ paddingBlock: 'var(--space-10) var(--space-20)', backgroundColor: 'var(--color-bg)' }}>
      <div className="wrap">
        {/* Header Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span className="chip chip-accent">
                <IconUser size={14} />
                Client Account Portal
              </span>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
                Bonded Global Transit Hub
              </span>
            </div>
            <h1 style={{ fontSize: 'var(--text-h1)', color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
              {currentUser ? `Welcome back, ${currentUser}` : 'Orders & Consignment Tracking'}
            </h1>
            <p style={{ fontSize: '1.0625rem', color: 'var(--color-ink-muted)' }}>
              Track real-time customs clearance, air freight transit, and itemized workshop manifests.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link to="/shop" className="btn-outline">
              Explore Catalog
            </Link>
            {currentUser ? (
              <button
                onClick={() => {
                  onLogout();
                  navigate('/');
                }}
                className="btn-subtle"
                style={{ color: 'var(--color-ink-muted)', fontSize: 'var(--text-body-sm)' }}
              >
                Sign Out
              </button>
            ) : (
              <button onClick={() => onOpenAuth('login')} className="btn-primary">
                Sign In to Account
              </button>
            )}
          </div>
        </div>

        {/* Instant Consignment & Customs Tracking Search Widget */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-line-strong)',
            borderRadius: 'var(--radius-3)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <IconSearch size={18} color="var(--color-accent)" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
              Instant Consignment & Tracking Lookup
            </h2>
          </div>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)' }}>
            Enter your Order Reference Number (e.g. <code>AGM-39489C34</code>) or Customer Email to check live bonded transit status.
          </p>

          <form onSubmit={handleTrackSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <input
              type="text"
              placeholder="e.g. AGM-39489C34 or name@example.com"
              value={trackingQuery}
              onChange={(e) => setTrackingQuery(e.target.value)}
              style={{
                flex: '1 1 280px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-2)',
                border: '1px solid var(--color-line-strong)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-ink)',
                fontSize: 'var(--text-body)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isSearchingTracking || !trackingQuery.trim()}
              className="btn-primary"
              style={{ padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <IconSearch size={16} />
              {isSearchingTracking ? 'Searching Transit Records...' : 'Track Consignment'}
            </button>
          </form>

          {/* Tracking Search Feedback Error */}
          {trackingError && (
            <div
              style={{
                marginTop: 'var(--space-4)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-2)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#dc2626',
                fontSize: 'var(--text-body-sm)',
              }}
            >
              {trackingError}
            </div>
          )}

          {/* Tracked Consignment Result Card */}
          {trackedOrder && (
            <div
              style={{
                marginTop: 'var(--space-6)',
                borderTop: '1px solid var(--color-line)',
                paddingTop: 'var(--space-6)',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>Verified Consignment</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', color: 'var(--color-ink)' }}>
                    {trackedOrder.orderNumber}
                  </strong>
                </div>
                <div>
                  {(() => {
                    const info = getProgressInfo(trackedOrder.status);
                    return (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          backgroundColor: info.badgeBg,
                          color: info.badgeColor,
                        }}
                      >
                        {info.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* 4-Stage Progress Timeline */}
              {(() => {
                const info = getProgressInfo(trackedOrder.status);
                return (
                  <div style={{ marginBottom: 'var(--space-6)', backgroundColor: 'var(--color-surface-sunken)', padding: '16px', borderRadius: 'var(--radius-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, color: 'var(--color-ink-subtle)', marginBottom: '8px' }}>
                      <span style={{ color: info.stage >= 1 ? 'var(--color-accent)' : 'inherit' }}>1. Bonded</span>
                      <span style={{ color: info.stage >= 2 ? 'var(--color-accent)' : 'inherit' }}>2. Customs Cleared</span>
                      <span style={{ color: info.stage >= 3 ? 'var(--color-accent)' : 'inherit' }}>3. Air Freight Transit</span>
                      <span style={{ color: info.stage >= 4 ? 'var(--color-accent)' : 'inherit' }}>4. Delivered</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-line)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${info.percent}%`,
                          height: '100%',
                          backgroundColor: info.color,
                          borderRadius: '4px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Destination & Manifest Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-sm)' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>Consignee</span>
                  <strong style={{ color: 'var(--color-ink)' }}>{trackedOrder.customerName}</strong>
                  <span style={{ display: 'block', color: 'var(--color-ink-muted)', fontSize: '0.75rem' }}>{trackedOrder.customerEmail}</span>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>Destination Address</span>
                  <span style={{ color: 'var(--color-ink)' }}>{trackedOrder.customerAddress}, {trackedOrder.customerCountry}</span>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>Consignment Date</span>
                  <span style={{ color: 'var(--color-ink)' }}>{trackedOrder.date}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>Total Bonded Value</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', color: 'var(--color-ink)' }}>
                    ${trackedOrder.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              {/* Manifest Items List */}
              <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {trackedOrder.items.map((it) => (
                  <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-body-sm)' }}>
                    <div>
                      <strong style={{ color: 'var(--color-ink)' }}>{it.name}</strong>
                      <span style={{ display: 'block', fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
                        Workshop: {it.maker} · Qty: {it.quantity}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-ink)' }}>
                      ${(it.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => onShowReceipt(trackedOrder)}
                  className="btn-outline"
                  style={{ padding: '8px 14px', fontSize: 'var(--text-body-sm)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <IconPrinter size={16} /> Print Bonded Invoice
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Responsive Dashboard Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'flex-start',
          }}
        >
          {/* Left Column: Active Consignments & Orders */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                My Consignment History ({savedOrders.length})
              </h2>
              <button
                onClick={loadCustomerOrders}
                className="btn-subtle"
                style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}
                title="Refresh orders from database"
              >
                Refresh Records
              </button>
            </div>

            {isLoadingOrders ? (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-line)',
                  borderRadius: 'var(--radius-3)',
                  padding: 'var(--space-10)',
                  textAlign: 'center',
                  color: 'var(--color-ink-muted)',
                }}
              >
                Loading bonded consignment records from Supabase...
              </div>
            ) : savedOrders.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-line)',
                  borderRadius: 'var(--radius-3)',
                  padding: 'var(--space-10)',
                  textAlign: 'center',
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-surface-sunken)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)', color: 'var(--color-ink-subtle)' }}>
                  <IconCheck size={24} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
                  No consignments registered yet
                </h3>
                <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-6)', maxWidth: '400px', marginInline: 'auto' }}>
                  {currentUser
                    ? 'Orders you place on AccessGlobal are automatically saved and tracked here under pre-cleared international customs.'
                    : 'Sign in to access your saved order history, or enter your Order Reference above.'}
                </p>
                <Link to="/shop" className="btn-primary" style={{ padding: '10px 24px' }}>
                  Shop Verified Workshops
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {savedOrders.map((ord) => {
                  const info = getProgressInfo(ord.status);
                  return (
                    <div
                      key={ord.orderNumber}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-line)',
                        borderRadius: 'var(--radius-3)',
                        padding: 'var(--space-6)',
                        boxShadow: 'var(--shadow-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-line)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <div>
                          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>Bonded Consignment ID</span>
                          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-ink)' }}>
                            {ord.orderNumber}
                          </strong>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: info.badgeBg,
                              color: info.badgeColor,
                              marginBottom: '4px',
                            }}
                          >
                            {info.label}
                          </span>
                          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>{ord.date}</span>
                        </div>
                      </div>

                      {/* 4-Stage Consignment Progress Bar */}
                      <div style={{ marginBottom: 'var(--space-6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, color: 'var(--color-ink-subtle)', marginBottom: '6px' }}>
                          <span style={{ color: info.stage >= 1 ? 'var(--color-accent)' : 'inherit' }}>1. Bonded</span>
                          <span style={{ color: info.stage >= 2 ? 'var(--color-accent)' : 'inherit' }}>2. Customs Cleared</span>
                          <span style={{ color: info.stage >= 3 ? 'var(--color-accent)' : 'inherit' }}>3. Air Freight</span>
                          <span style={{ color: info.stage >= 4 ? 'var(--color-accent)' : 'inherit' }}>4. Delivered</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${info.percent}%`,
                              height: '100%',
                              backgroundColor: info.color,
                              borderRadius: '3px',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      </div>

                      {/* Consignment Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                        {ord.items.map((it) => (
                          <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-body-sm)' }}>
                            <div>
                              <strong style={{ color: 'var(--color-ink)' }}>{it.name}</strong>
                              <span style={{ display: 'block', fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
                                {it.maker} · Qty: {it.quantity}
                              </span>
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-ink)' }}>
                              ${(it.price * it.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer & Printable Invoice Action */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-line)', paddingTop: 'var(--space-4)' }}>
                        <div>
                          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>Total Landed</span>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                            ${ord.total.toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => onShowReceipt(ord)}
                          className="btn-outline"
                          style={{ padding: '8px 14px', fontSize: 'var(--text-body-sm)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <IconPrinter size={16} /> Print Bonded Invoice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Saved Shipping Address & Data Privacy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Saved Customs Address Card */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-line)',
                borderRadius: 'var(--radius-3)',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
                Saved Customs Shipping Profile
              </h2>
              <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)' }}>
                This pre-cleared address automatically applies to future orders for fast customs dispatch.
              </p>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                    Full Recipient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingProfile.fullName}
                    onChange={(e) => setShippingProfile({ ...shippingProfile, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-2)',
                      border: '1px solid var(--color-line-strong)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-ink)',
                      fontSize: 'var(--text-body-sm)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                    Customs Clearance Notification Email
                  </label>
                  <input
                    type="email"
                    required
                    value={shippingProfile.email}
                    onChange={(e) => setShippingProfile({ ...shippingProfile, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-2)',
                      border: '1px solid var(--color-line-strong)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-ink)',
                      fontSize: 'var(--text-body-sm)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                    Street Address & Suite
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingProfile.street}
                    onChange={(e) => setShippingProfile({ ...shippingProfile, street: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-2)',
                      border: '1px solid var(--color-line-strong)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-ink)',
                      fontSize: 'var(--text-body-sm)',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingProfile.city}
                      onChange={(e) => setShippingProfile({ ...shippingProfile, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-2)',
                        border: '1px solid var(--color-line-strong)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-ink)',
                        fontSize: 'var(--text-body-sm)',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingProfile.postalCode}
                      onChange={(e) => setShippingProfile({ ...shippingProfile, postalCode: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-2)',
                        border: '1px solid var(--color-line-strong)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-ink)',
                        fontSize: 'var(--text-body-sm)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                    Country
                  </label>
                  <select
                    value={shippingProfile.country}
                    onChange={(e) => setShippingProfile({ ...shippingProfile, country: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-2)',
                      border: '1px solid var(--color-line-strong)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-ink)',
                      fontSize: 'var(--text-body-sm)',
                    }}
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Nigeria">Nigeria</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 'var(--space-2)' }}>
                  Save Delivery Profile
                </button>
              </form>
            </div>

            {/* Privacy & DSAR Data Portability */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-line)',
                borderRadius: 'var(--radius-3)',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
                Account Data & Privacy (GDPR / CCPA)
              </h2>
              <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)' }}>
                Download an unencrypted, structured JSON archive of all personal records, delivery profiles, and bonded consignment manifests.
              </p>
              <button
                type="button"
                onClick={handleExportData}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Export Complete Data Archive
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
