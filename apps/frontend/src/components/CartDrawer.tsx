import React, { useState, useEffect } from 'react';
import { Product } from '../data/products';
import { IconClose, IconTrash, IconPlus, IconMinus, IconShieldCheck, IconArrowRight } from './icons';
import { OrderDetails } from './OrderReceiptModal';
import { api } from '../services/api';

export interface CartItem extends Product {
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOrderComplete: (order: OrderDetails) => void;
  onShowToast: (message: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderComplete,
  onShowToast,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCountry, setCustomerCountry] = useState('United States');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'transfer'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const user = api.getCurrentUser();
      if (user) {
        if (!customerName && user.name) setCustomerName(user.name);
        if (!customerEmail && user.email) setCustomerEmail(user.email);
      }
      try {
        const storedProfile = localStorage.getItem('agm_shipping_profile');
        if (storedProfile) {
          const prof = JSON.parse(storedProfile);
          if (prof.fullName && !customerName) setCustomerName(prof.fullName);
          if (prof.email && !customerEmail) setCustomerEmail(prof.email);
          if (prof.street && !customerAddress) setCustomerAddress(`${prof.street}, ${prof.city} ${prof.postalCode}`);
          if (prof.country) setCustomerCountry(prof.country);
        }
      } catch {}
    } else {
      document.body.style.overflow = '';
      setStep('cart');
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

  const rawSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);
  const freeShippingThreshold = 150;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - rawSubtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'GLOBAL10') {
      setDiscountPercent(10);
      onShowToast('Promo code applied: 10% discount activated!');
    } else {
      onShowToast('Invalid promo code. Try GLOBAL10');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !customerAddress.trim()) {
      onShowToast('Please provide your complete name, email, and shipping address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Post order to backend / Supabase
      const result = await api.createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        total: finalTotal,
        items: items.map((i) => ({
          productId: i.id,
          title: i.name,
          maker: i.maker,
          price: i.price,
          quantity: i.quantity,
          imageUrl: i.image,
        })),
        paymentMethod: paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'apple' ? 'Apple Pay' : 'Bank Transfer',
        shippingAddress: `${customerAddress.trim()}, ${customerCountry}`,
      });

      setIsSubmitting(false);
      onClearCart();
      onClose();
      onOrderComplete(result.order);
    } catch (err: any) {
      console.warn('[CartDrawer] Backend order recording warning (falling back to local receipt):', err);
      const fallbackOrder: OrderDetails = {
        orderNumber: `AGM-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerAddress: customerAddress.trim(),
        customerCountry,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          maker: i.maker,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal: rawSubtotal,
        discount: discountAmount,
        total: finalTotal,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setIsSubmitting(false);
      onClearCart();
      onClose();
      onOrderComplete(fallbackOrder);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        backgroundColor: 'rgba(18, 21, 22, 0.55)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(480px, 94vw)',
          height: '100%',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-overlay)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--color-line)',
          }}
        >
          <div>
            <h2 id="drawer-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)' }}>
              {step === 'cart' ? 'Your Order' : 'Landed Checkout'}
            </h2>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
              {items.length} {items.length === 1 ? 'item' : 'items'} in order
            </span>
          </div>

          <button onClick={onClose} aria-label="Close order drawer" className="btn-subtle" style={{ padding: '8px' }}>
            <IconClose size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 && (
          <div style={{ padding: 'var(--space-3) var(--space-6)', backgroundColor: 'var(--color-surface-sunken)', borderBottom: '1px solid var(--color-line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)', marginBottom: '4px' }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>
                {remainingForFreeShipping === 0
                  ? 'Free International Shipping Unlocked!'
                  : `Add $${remainingForFreeShipping} for Free International Shipping`}
              </span>
              <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                ${rawSubtotal} / ${freeShippingThreshold}
              </span>
            </div>
            <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(18, 21, 22, 0.08)', borderRadius: 'var(--radius-round)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (rawSubtotal / freeShippingThreshold) * 100)}%`,
                  backgroundColor: 'var(--color-accent)',
                  transition: 'width var(--duration-base) var(--ease-out)',
                }}
              />
            </div>
          </div>
        )}

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingBlock: 'var(--space-16)' }}>
              <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)' }}>
                Your order is currently empty.
              </p>
              <button onClick={onClose} className="btn-outline">
                Browse Curated Aisles
              </button>
            </div>
          ) : step === 'cart' ? (
            /* Step 1: Cart Items List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: 'var(--space-3)',
                    paddingBottom: 'var(--space-4)',
                    borderBottom: '1px solid var(--color-line)',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: 'var(--radius-1)',
                      objectFit: 'cover',
                      backgroundColor: 'var(--color-surface-sunken)',
                    }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-ink)' }}>
                          {item.name}
                        </h4>
                        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
                          {item.maker}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="btn-subtle"
                        style={{ padding: '4px', color: 'var(--color-ink-subtle)' }}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Quantity Controls */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--color-line-strong)',
                          borderRadius: 'var(--radius-1)',
                          backgroundColor: 'var(--color-surface-sunken)',
                        }}
                      >
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                          style={{ padding: '3px 8px' }}
                        >
                          <IconMinus size={12} />
                        </button>
                        <span className="tabular-nums" style={{ minWidth: '24px', textAlign: 'center', fontSize: 'var(--text-caption)', fontWeight: 600 }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                          style={{ padding: '3px 8px' }}
                        >
                          <IconPlus size={12} />
                        </button>
                      </div>

                      <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-ink)', fontSize: 'var(--text-body-sm)' }}>
                        ${item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <input
                  type="text"
                  placeholder="Promo code (e.g. GLOBAL10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid var(--color-line-strong)',
                    borderRadius: 'var(--radius-1)',
                    backgroundColor: 'var(--color-surface-sunken)',
                    fontSize: 'var(--text-body-sm)',
                  }}
                />
                <button type="submit" className="btn-outline" style={{ padding: '8px 14px' }}>
                  Apply
                </button>
              </form>
            </div>
          ) : (
            /* Step 2: Shipping & Payment Form */
            <form id="checkout-form" onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Henrik Lindqvist"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
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
                  Contact Email (for tracked receipt)
                </label>
                <input
                  type="email"
                  required
                  placeholder="henrik@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
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
                  Delivery Street Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mannerheimintie 14 B, Apt 3"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
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
                  Destination Country
                </label>
                <select
                  value={customerCountry}
                  onChange={(e) => setCustomerCountry(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-line-strong)',
                    borderRadius: 'var(--radius-1)',
                    fontSize: 'var(--text-body-sm)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  <option value="United States">United States (USD)</option>
                  <option value="United Kingdom">United Kingdom (GBP)</option>
                  <option value="Germany">Germany (EUR)</option>
                  <option value="Finland">Finland (EUR)</option>
                  <option value="Canada">Canada (CAD)</option>
                  <option value="Japan">Japan (JPY)</option>
                  <option value="Australia">Australia (AUD)</option>
                </select>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
                  Pre-Authorized Payment Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      padding: '8px',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-1)',
                      border: '1px solid',
                      borderColor: paymentMethod === 'card' ? 'var(--color-accent)' : 'var(--color-line-strong)',
                      backgroundColor: paymentMethod === 'card' ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                      color: paymentMethod === 'card' ? 'var(--color-accent)' : 'var(--color-ink)',
                    }}
                  >
                    Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple')}
                    style={{
                      padding: '8px',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-1)',
                      border: '1px solid',
                      borderColor: paymentMethod === 'apple' ? 'var(--color-accent)' : 'var(--color-line-strong)',
                      backgroundColor: paymentMethod === 'apple' ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                      color: paymentMethod === 'apple' ? 'var(--color-accent)' : 'var(--color-ink)',
                    }}
                  >
                    Apple Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    style={{
                      padding: '8px',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-1)',
                      border: '1px solid',
                      borderColor: paymentMethod === 'transfer' ? 'var(--color-accent)' : 'var(--color-line-strong)',
                      backgroundColor: paymentMethod === 'transfer' ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                      color: paymentMethod === 'transfer' ? 'var(--color-accent)' : 'var(--color-ink)',
                    }}
                  >
                    Direct Wire
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface-sunken)', padding: '10px 12px', borderRadius: 'var(--radius-1)', fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)', display: 'flex', gap: '8px' }}>
                <IconShieldCheck size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                <span>
                  Encrypted TLS 1.3 transaction. Customs tariffs are pre-cleared with no postal collect surcharges.
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer Totals & Checkout Button */}
        {items.length > 0 && (
          <div style={{ padding: 'var(--space-6)', borderTop: '1px solid var(--color-line)', backgroundColor: 'var(--color-surface-raised)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: '4px' }}>
              <span>Subtotal</span>
              <span className="tabular-nums">${rawSubtotal}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-body-sm)', color: 'var(--color-success)', marginBottom: '4px' }}>
                <span>Promo Discount ({discountPercent}%)</span>
                <span className="tabular-nums">-${discountAmount}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: '8px' }}>
              <span>Landed Duties & Customs</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>Included (Pre-bonded)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-line)', marginBottom: 'var(--space-4)' }}>
              <span>Landed Total</span>
              <span className="tabular-nums">${finalTotal}</span>
            </div>

            {step === 'cart' ? (
              <button
                onClick={() => setStep('checkout')}
                className="btn-primary"
                style={{ width: '100%', padding: '12px 20px', fontSize: 'var(--text-body)', justifyContent: 'center' }}
              >
                Proceed to Landed Checkout
                <IconArrowRight size={18} />
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="btn-outline"
                  style={{ padding: '12px 16px' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px 20px', fontSize: 'var(--text-body)', justifyContent: 'center' }}
                >
                  {isSubmitting ? 'Securing Bond...' : `Place Landed Order · $${finalTotal}`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
