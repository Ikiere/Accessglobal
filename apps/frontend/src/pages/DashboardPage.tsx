import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrderDetails } from '../components/OrderReceiptModal';
import { IconUser, IconPrinter } from '../components/icons';
import { UserShippingProfile } from '../components/UserDashboardModal';

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

  const [shippingProfile, setShippingProfile] = useState<UserShippingProfile>({
    fullName: currentUser || 'Verified Consignee',
    email: 'client@accessglobal.market',
    street: '72 Industrial Way, Suite 400',
    city: 'New York',
    country: 'United States',
    postalCode: '10013',
  });

  const [savedOrders, setSavedOrders] = useState<OrderDetails[]>([
    {
      orderNumber: 'AGM-984210',
      customerName: currentUser || 'Verified Consignee',
      customerEmail: 'client@accessglobal.market',
      customerAddress: '72 Industrial Way, Suite 400, New York, NY 10013',
      customerCountry: 'United States',
      items: [
        {
          id: 'agm-01',
          name: 'Volt X1 Commuter E-Bike',
          maker: 'Nordic Motion Labs (Helsinki)',
          price: 1299,
          quantity: 1,
        },
      ],
      subtotal: 1299,
      discount: 0,
      total: 1299,
      date: 'Nov 07, 2026, 10:30 AM',
    },
    {
      orderNumber: 'AGM-781932',
      customerName: currentUser || 'Verified Consignee',
      customerEmail: 'client@accessglobal.market',
      customerAddress: '72 Industrial Way, Suite 400, New York, NY 10013',
      customerCountry: 'United States',
      items: [
        {
          id: 'agm-06',
          name: 'Precision Burr Coffee Grinder',
          maker: 'Mahlwerk Precision (Stuttgart)',
          price: 245,
          quantity: 1,
        },
      ],
      subtotal: 245,
      discount: 0,
      total: 245,
      date: 'Nov 02, 2026, 04:15 PM',
    },
  ]);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('agm_shipping_profile');
      if (storedProfile) {
        setShippingProfile(JSON.parse(storedProfile));
      }

      const storedOrders = localStorage.getItem('agm_recent_orders');
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedOrders(parsed);
        }
      }
    } catch {}
  }, []);

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

  return (
    <div style={{ paddingBlock: 'var(--space-10) var(--space-20)', backgroundColor: 'var(--color-bg)' }}>
      <div className="wrap">
        {/* Header Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span className="chip chip-accent">
                <IconUser size={14} />
                Client Account Portal
              </span>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
                AES-256 Vault Protected
              </span>
            </div>
            <h1 style={{ fontSize: 'var(--text-h1)', color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
              My Orders & Account
            </h1>
            <p style={{ fontSize: '1.0625rem', color: 'var(--color-ink-muted)' }}>
              Manage your international consignments, pre-cleared customs addresses, and bonded invoices.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link to="/shop" className="btn-outline">
              Continue Shopping
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

        {/* 2-Column Responsive Dashboard Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'flex-start',
          }}
        >
          {/* Left Column: Active Orders & Consignments */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                Active Consignments ({savedOrders.length})
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {savedOrders.map((ord, idx) => (
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
                      <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>Date</span>
                      <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink)' }}>{ord.date}</span>
                    </div>
                  </div>

                  {/* 4-Stage Consignment Progress Bar */}
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, color: 'var(--color-ink-subtle)', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--color-accent)' }}>1. Bonded</span>
                      <span style={{ color: 'var(--color-accent)' }}>2. Customs Cleared</span>
                      <span style={{ color: idx === 0 ? 'var(--color-accent)' : 'var(--color-ink-subtle)' }}>3. Air Freight</span>
                      <span style={{ color: idx === 1 ? 'var(--color-accent)' : 'var(--color-ink-subtle)' }}>4. Delivered</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: idx === 0 ? '75%' : '100%',
                          height: '100%',
                          backgroundColor: 'var(--color-accent)',
                          borderRadius: '3px',
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
              ))}
            </div>
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
                      Postal / ZIP Code
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
                        fontFamily: 'var(--font-mono)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                    Destination Country
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
                    <option value="United States">United States (Domestic Bonded)</option>
                    <option value="United Kingdom">United Kingdom (HMRC Bonded)</option>
                    <option value="Canada">Canada (CBSA Pre-cleared)</option>
                    <option value="Germany">Germany (EU Free Circulation)</option>
                    <option value="Japan">Japan (Tokyo Port Transit)</option>
                    <option value="France">France (EU Free Circulation)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ marginTop: 'var(--space-2)', padding: '10px 16px' }}
                >
                  Save Shipping Address
                </button>
              </form>
            </div>

            {/* GDPR / DSAR Data Portability */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-line)',
                borderRadius: 'var(--radius-3)',
                padding: 'var(--space-6)',
              }}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
                Account Data & GDPR Records
              </h3>
              <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)', lineHeight: '1.6' }}>
                Download an export of all recorded account details, shipping addresses, and bonded consignment receipts in machine-readable JSON format.
              </p>
              <button
                onClick={handleExportData}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Export Profile & Order Data (JSON)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
