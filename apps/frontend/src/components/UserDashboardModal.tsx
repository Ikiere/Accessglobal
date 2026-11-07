import React, { useState, useEffect } from 'react';
import { OrderDetails } from './OrderReceiptModal';
import { IconClose, IconPrinter, IconUser } from './icons';

export interface UserShippingProfile {
  fullName: string;
  email: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

interface UserDashboardModalProps {
  isOpen: boolean;
  currentUser: string | null;
  orders: OrderDetails[];
  shippingProfile: UserShippingProfile;
  onUpdateShippingProfile: (profile: UserShippingProfile) => void;
  onViewInvoice: (order: OrderDetails) => void;
  onClose: () => void;
  onLogout: () => void;
  onShowToast: (message: string) => void;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  currentUser,
  orders,
  shippingProfile,
  onUpdateShippingProfile,
  onViewInvoice,
  onClose,
  onLogout,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'privacy'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'transit' | 'delivered'>('all');

  // Address edit state
  const [fullName, setFullName] = useState(shippingProfile.fullName);
  const [email, setEmail] = useState(shippingProfile.email);
  const [street, setStreet] = useState(shippingProfile.street);
  const [city, setCity] = useState(shippingProfile.city);
  const [country, setCountry] = useState(shippingProfile.country);
  const [postalCode, setPostalCode] = useState(shippingProfile.postalCode);

  useEffect(() => {
    setFullName(shippingProfile.fullName);
    setEmail(shippingProfile.email);
    setStreet(shippingProfile.street);
    setCity(shippingProfile.city);
    setCountry(shippingProfile.country);
    setPostalCode(shippingProfile.postalCode);
  }, [shippingProfile]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShippingProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      street: street.trim(),
      city: city.trim(),
      country,
      postalCode: postalCode.trim(),
    });
    onShowToast('Default delivery address saved.');
  };

  const handleExportData = () => {
    const dataBlob = new Blob(
      [
        JSON.stringify(
          {
            user: currentUser,
            shippingProfile,
            orders,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agm-data-${currentUser || 'user'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('DSAR personal records exported.');
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'transit') return o.orderNumber.endsWith('1') || o.orderNumber.endsWith('3') || o.orderNumber.endsWith('5') || o.orderNumber.endsWith('7') || o.orderNumber.endsWith('9');
    return !(o.orderNumber.endsWith('1') || o.orderNumber.endsWith('3') || o.orderNumber.endsWith('5') || o.orderNumber.endsWith('7') || o.orderNumber.endsWith('9'));
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        backgroundColor: 'rgba(18, 21, 22, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-3)',
          maxWidth: '960px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-overlay)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--color-line)',
            backgroundColor: 'var(--color-surface-sunken)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-round)',
                backgroundColor: 'var(--color-accent-soft)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconUser size={19} />
            </div>
            <div>
              <h2 id="dashboard-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                {currentUser ? `${currentUser}'s Account` : 'Customer Portal'}
              </h2>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
                AccessGlobal Direct Consignment Dashboard
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: 'var(--text-caption)' }}
            >
              Sign Out
            </button>
            <button onClick={onClose} aria-label="Close portal" className="btn-subtle" style={{ padding: '8px' }}>
              <IconClose size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          role="tablist"
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-6)',
            borderBottom: '1px solid var(--color-line)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <button
            role="tab"
            aria-selected={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            className="btn-subtle"
            style={{
              padding: '8px 16px',
              fontSize: 'var(--text-body-sm)',
              fontWeight: activeTab === 'orders' ? 600 : 500,
              color: activeTab === 'orders' ? 'var(--color-accent)' : 'var(--color-ink-muted)',
              borderBottom: activeTab === 'orders' ? '2px solid var(--color-accent)' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            Orders & Shipments ({orders.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'address'}
            onClick={() => setActiveTab('address')}
            className="btn-subtle"
            style={{
              padding: '8px 16px',
              fontSize: 'var(--text-body-sm)',
              fontWeight: activeTab === 'address' ? 600 : 500,
              color: activeTab === 'address' ? 'var(--color-accent)' : 'var(--color-ink-muted)',
              borderBottom: activeTab === 'address' ? '2px solid var(--color-accent)' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            Saved Delivery Address
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'privacy'}
            onClick={() => setActiveTab('privacy')}
            className="btn-subtle"
            style={{
              padding: '8px 16px',
              fontSize: 'var(--text-body-sm)',
              fontWeight: activeTab === 'privacy' ? 600 : 500,
              color: activeTab === 'privacy' ? 'var(--color-accent)' : 'var(--color-ink-muted)',
              borderBottom: activeTab === 'privacy' ? '2px solid var(--color-accent)' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            Account & Data Rights
          </button>
        </div>

        {/* Tab Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', backgroundColor: 'var(--color-bg)' }}>
          {activeTab === 'orders' ? (
            <div>
              {/* Filter Sub-bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <span style={{ fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-ink-subtle)', fontWeight: 600 }}>
                  Consignment History
                </span>
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                  <button
                    onClick={() => setOrderFilter('all')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-1)',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 500,
                      backgroundColor: orderFilter === 'all' ? 'var(--color-surface)' : 'transparent',
                      border: '1px solid',
                      borderColor: orderFilter === 'all' ? 'var(--color-line-strong)' : 'transparent',
                      color: 'var(--color-ink)',
                    }}
                  >
                    All ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderFilter('transit')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-1)',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 500,
                      backgroundColor: orderFilter === 'transit' ? 'var(--color-surface)' : 'transparent',
                      border: '1px solid',
                      borderColor: orderFilter === 'transit' ? 'var(--color-line-strong)' : 'transparent',
                      color: 'var(--color-ink)',
                    }}
                  >
                    In Transit
                  </button>
                  <button
                    onClick={() => setOrderFilter('delivered')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-1)',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 500,
                      backgroundColor: orderFilter === 'delivered' ? 'var(--color-surface)' : 'transparent',
                      border: '1px solid',
                      borderColor: orderFilter === 'delivered' ? 'var(--color-line-strong)' : 'transparent',
                      color: 'var(--color-ink)',
                    }}
                  >
                    Delivered
                  </button>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', paddingBlock: 'var(--space-16)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-2)', border: '1px solid var(--color-line)' }}>
                  <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-3)' }}>
                    No orders found in this category.
                  </p>
                  <button onClick={onClose} className="btn-primary">
                    Explore Curated Aisles
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  {filteredOrders.map((order) => {
                    const isDelivered = !order.orderNumber.endsWith('1') && !order.orderNumber.endsWith('3') && !order.orderNumber.endsWith('5') && !order.orderNumber.endsWith('7') && !order.orderNumber.endsWith('9');
                    return (
                      <div
                        key={order.orderNumber}
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-line)',
                          borderRadius: 'var(--radius-3)',
                          padding: 'var(--space-6)',
                          boxShadow: 'var(--shadow-subtle)',
                        }}
                      >
                        {/* Order Header */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', borderBottom: '1px solid var(--color-line)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                                {order.orderNumber}
                              </span>
                              <span
                                className="chip"
                                style={{
                                  backgroundColor: isDelivered ? 'var(--color-success-soft)' : 'var(--color-accent-soft)',
                                  color: isDelivered ? 'var(--color-success)' : 'var(--color-accent)',
                                  fontWeight: 600,
                                }}
                              >
                                {isDelivered ? 'Delivered & Inspected' : 'International Air Transit'}
                              </span>
                            </div>
                            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
                              Placed on {order.date} · Destination: {order.customerCountry}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--color-ink-subtle)', display: 'block' }}>
                                Landed Total
                              </span>
                              <span className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                                ${order.total}
                              </span>
                            </div>

                            <button
                              onClick={() => onViewInvoice(order)}
                              className="btn-outline"
                              style={{ padding: '6px 12px', fontSize: 'var(--text-body-sm)' }}
                            >
                              <IconPrinter size={16} />
                              Invoice
                            </button>
                          </div>
                        </div>

                        {/* 4-Stage Fulfillment Progress Bar */}
                        <div style={{ backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-2)', padding: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                          <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-ink-subtle)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                            Consignment Milestones
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)', textAlign: 'center' }}>
                            <div>
                              <div style={{ height: '4px', backgroundColor: 'var(--color-accent)', borderRadius: '2px', marginBottom: '6px' }} />
                              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink)' }}>1. Bonded</span>
                            </div>
                            <div>
                              <div style={{ height: '4px', backgroundColor: 'var(--color-accent)', borderRadius: '2px', marginBottom: '6px' }} />
                              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink)' }}>2. Customs Cleared</span>
                            </div>
                            <div>
                              <div style={{ height: '4px', backgroundColor: 'var(--color-accent)', borderRadius: '2px', marginBottom: '6px' }} />
                              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink)' }}>3. In Transit</span>
                            </div>
                            <div>
                              <div style={{ height: '4px', backgroundColor: isDelivered ? 'var(--color-success)' : 'rgba(18,21,22,0.1)', borderRadius: '2px', marginBottom: '6px' }} />
                              <span style={{ fontSize: '0.6875rem', fontWeight: isDelivered ? 600 : 400, color: isDelivered ? 'var(--color-success)' : 'var(--color-ink-subtle)' }}>
                                {isDelivered ? '4. Delivered' : '4. Pending'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Items in Order */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: 'var(--text-body-sm)',
                                paddingBlock: '4px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{item.name}</span>
                                <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
                                  ({item.maker})
                                </span>
                              </div>
                              <span className="tabular-nums" style={{ color: 'var(--color-ink-muted)' }}>
                                {item.quantity} × ${item.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'address' ? (
            /* Saved Delivery Address Form */
            <div style={{ maxWidth: '580px', backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-3)', border: '1px solid var(--color-line)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
                Default Customs Shipping Address
              </h3>
              <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-6)' }}>
                Saved details automatically populate at checkout, pre-clearing bonded air parcels with localized customs documentation.
              </p>

              <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--color-line-strong)',
                      borderRadius: 'var(--radius-1)',
                      fontSize: 'var(--text-body-sm)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                    Notification Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--color-line-strong)',
                      borderRadius: 'var(--radius-1)',
                      fontSize: 'var(--text-body-sm)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                    Street Address & Apartment / Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--color-line-strong)',
                      borderRadius: 'var(--radius-1)',
                      fontSize: 'var(--text-body-sm)',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                      City / Region
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--color-line-strong)',
                        borderRadius: 'var(--radius-1)',
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
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--color-line-strong)',
                        borderRadius: 'var(--radius-1)',
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
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--color-line-strong)',
                      borderRadius: 'var(--radius-1)',
                      fontSize: 'var(--text-body-sm)',
                      backgroundColor: 'var(--color-surface)',
                    }}
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Finland">Finland</option>
                    <option value="Canada">Canada</option>
                    <option value="Japan">Japan</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 'var(--space-2)', alignSelf: 'flex-start', padding: '10px 20px' }}>
                  Save Delivery Address
                </button>
              </form>
            </div>
          ) : (
            /* Account & Data Rights (DSAR) */
            <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-3)', border: '1px solid var(--color-line)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
                  GDPR & DSAR Data Portability
                </h3>
                <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
                  In accordance with our strict data minimization policy, you can download a full, unencrypted JSON ledger of all your customer profile records, order consignments, and addresses at any time.
                </p>
                <button onClick={handleExportData} className="btn-outline">
                  Download All My Records (.JSON)
                </button>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-3)', border: '1px solid var(--color-line)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
                  Communication Preferences
                </h3>
                <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)' }}>
                  Zero promotional tracking or cross-site surveillance cookies.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-body-sm)', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Real-time flight and customs clearance notifications (Email)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-body-sm)', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Fortnightly independent workshop releases and technical bulletins</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
