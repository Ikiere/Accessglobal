import { useState, useEffect } from 'react';
import { Product } from './ProductGrid';

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
  onShowToast: (message: string) => void;
}

export const CartDrawer = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onShowToast,
}: CartDrawerProps) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCountry, setCustomerCountry] = useState('United States');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'google'>('card');
  const [orderNumber, setOrderNumber] = useState('');

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Reset step back to 'cart' after drawer closes
      const timer = setTimeout(() => {
        if (step === 'success') {
          setStep('cart');
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleStartCheckout = () => {
    setStep('checkout');
  };

  const handleBackToCart = () => {
    setStep('cart');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !customerAddress.trim()) {
      onShowToast('Please fill in your shipping details.');
      return;
    }

    setIsSubmitting(true);
    // Simulate real order placement
    setTimeout(() => {
      const generatedOrder = `AGM-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(generatedOrder);
      setIsSubmitting(false);
      setStep('success');
      onClearCart();
      onShowToast(`Order placed successfully! #${generatedOrder}`);
    }, 1000);
  };

  const handleContinueShopping = () => {
    onClose();
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`cart-drawer-wrapper ${isOpen ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
    >
      <div className="cart-backdrop" onClick={onClose} />

      <aside className="cart-drawer">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <h3>
              {step === 'cart'
                ? 'Your Cart'
                : step === 'checkout'
                ? 'Checkout'
                : 'Order Confirmed'}
            </h3>
            {step === 'cart' && totalItemsCount > 0 && (
              <span className="cart-count-badge">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button className="cart-close-btn" aria-label="Close cart" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Free Shipping Announcement Banner */}
        {step !== 'success' && (
          <div className="cart-shipping-banner">
            <svg className="ic" viewBox="0 0 24 24">
              <use href="#i-truck" />
            </svg>
            <span>
              <strong>Free express delivery</strong> included to 90+ countries
            </span>
          </div>
        )}

        {/* Step 1: Cart Items View */}
        {step === 'cart' && (
          <>
            {items.length === 0 ? (
              <div className="cart-empty-state">
                <div className="cart-empty-icon">
                  <svg className="ic" viewBox="0 0 24 24">
                    <use href="#i-gift" />
                  </svg>
                </div>
                <h4>Your cart is empty</h4>
                <p>Explore trending collections and add your favorite items.</p>
                <button className="btn p" onClick={handleContinueShopping}>
                  Shop Trending Now
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-img" style={{ background: item.bg }}>
                        <img src={item.image} alt={item.name} loading="lazy" />
                      </div>
                      <div className="cart-item-details">
                        <div className="cart-item-top">
                          <span className="cart-item-category">{item.category}</span>
                          <button
                            className="cart-item-remove"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => onRemoveItem(item.id)}
                          >
                            ✕
                          </button>
                        </div>
                        <h5 className="cart-item-name">{item.name}</h5>
                        <div className="cart-item-bottom">
                          <span className="cart-item-price">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                          <div className="cart-qty-control">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => onUpdateQuantity(item.id, -1)}
                            >
                              -
                            </button>
                            <span className="cart-qty-value">{item.quantity}</span>
                            <button
                              aria-label="Increase quantity"
                              onClick={() => onUpdateQuantity(item.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer summary */}
                <div className="cart-footer">
                  <div className="cart-summary-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>Shipping</span>
                    <span style={{ color: 'var(--mint)', fontWeight: 600 }}>FREE</span>
                  </div>
                  <div className="cart-summary-row total">
                    <span>Total</span>
                    <span className="total-amount">${subtotal.toLocaleString()}</span>
                  </div>
                  <button className="btn p cart-checkout-btn" onClick={handleStartCheckout}>
                    Proceed to Checkout (${subtotal.toLocaleString()})
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Step 2: Checkout Form View */}
        {step === 'checkout' && (
          <form className="cart-checkout-form" onSubmit={handlePlaceOrder}>
            <button
              type="button"
              className="cart-back-btn"
              onClick={handleBackToCart}
            >
              ← Back to items ({totalItemsCount})
            </button>

            <div className="checkout-section">
              <h5>Shipping Address</h5>
              <label>
                Full Name
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </label>
              <label>
                Email Address
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </label>
              <label>
                Delivery Address
                <input
                  type="text"
                  required
                  placeholder="Street, City, Postal Code"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </label>
              <label>
                Country
                <select
                  value={customerCountry}
                  onChange={(e) => setCustomerCountry(e.target.value)}
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="Other">Other (90+ Supported)</option>
                </select>
              </label>
            </div>

            <div className="checkout-section">
              <h5>Payment Method</h5>
              <div className="checkout-payment-opts">
                <button
                  type="button"
                  className={paymentMethod === 'card' ? 'active' : ''}
                  onClick={() => setPaymentMethod('card')}
                >
                  Credit / Debit Card
                </button>
                <button
                  type="button"
                  className={paymentMethod === 'apple' ? 'active' : ''}
                  onClick={() => setPaymentMethod('apple')}
                >
                  Apple Pay
                </button>
                <button
                  type="button"
                  className={paymentMethod === 'google' ? 'active' : ''}
                  onClick={() => setPaymentMethod('google')}
                >
                  Google Pay
                </button>
              </div>
            </div>

            <div className="cart-footer">
              <div className="cart-summary-row total">
                <span>Total to pay</span>
                <span className="total-amount">${subtotal.toLocaleString()}</span>
              </div>
              <button
                type="submit"
                className="btn p cart-checkout-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing Order...' : `Place Order ($${subtotal.toLocaleString()})`}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success Confirmation View */}
        {step === 'success' && (
          <div className="cart-success-view">
            <div className="cart-success-badge">✓</div>
            <h4>Order Confirmed!</h4>
            <p className="order-num">
              Order Reference: <strong>#{orderNumber}</strong>
            </p>
            <p className="order-desc">
              Thank you for shopping at AGM. We have sent a confirmation email with your
              tracking link. Average delivery time: 48 hours.
            </p>

            <div className="order-details-card">
              <div className="order-row">
                <span>Recipient:</span>
                <strong>{customerName}</strong>
              </div>
              <div className="order-row">
                <span>Country:</span>
                <strong>{customerCountry}</strong>
              </div>
              <div className="order-row">
                <span>Shipping:</span>
                <strong style={{ color: 'var(--mint)' }}>Tracked Express (FREE)</strong>
              </div>
            </div>

            <button className="btn p cart-checkout-btn" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
