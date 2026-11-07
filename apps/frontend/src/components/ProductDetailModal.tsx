import React, { useState, useEffect } from 'react';
import { Product } from '../data/products';
import { IconClose, IconCart, IconCheck, IconShieldCheck, IconTruck, IconPlus, IconMinus } from './icons';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setAddedNotice(false);

    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && product) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
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
          maxWidth: '920px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-overlay)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close product specification sheet"
          className="btn-subtle"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '8px',
            borderRadius: 'var(--radius-round)',
            zIndex: 10,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
          }}
        >
          <IconClose size={20} />
        </button>

        {/* Modal Content Grid */}
        <div className="product-modal-grid" style={{ display: 'grid', gap: 'var(--space-8)' }}>
          {/* Left: Image & Provenance Card */}
          <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-surface-sunken)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 'var(--radius-2)', overflow: 'hidden', backgroundColor: '#e8e6e1' }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {product.badge && (
                <span
                  className="chip chip-accent"
                  style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#ffffff' }}
                >
                  {product.badge}
                </span>
              )}
            </div>

            {/* Maker Verification Badge */}
            <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-2)', border: '1px solid var(--color-line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                <IconShieldCheck size={18} style={{ color: 'var(--color-accent)' }} />
                <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-ink)' }}>
                  Verified Producer
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>
                Produced by <strong>{product.maker}</strong> in <strong>{product.makerOrigin}</strong>. Inspected for material authenticity and ethical factory standards.
              </p>
            </div>

            {/* Logistics Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>
              <IconTruck size={16} style={{ color: 'var(--color-accent)' }} />
              <span>{product.leadTime}</span>
            </div>
          </div>

          {/* Right: Technical Specification Breakdown */}
          <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-subtle)', fontWeight: 600 }}>
              {product.category} · Spec Sheet
            </span>

            <h2 id="product-modal-title" style={{ fontSize: '1.75rem', fontWeight: 600, marginTop: '4px', marginBottom: 'var(--space-3)', color: 'var(--color-ink)' }}>
              {product.name}
            </h2>

            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', lineHeight: '1.6', marginBottom: 'var(--space-6)' }}>
              {product.description}
            </p>

            {/* Specifications Table */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h4 style={{ fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-subtle)', marginBottom: 'var(--space-2)' }}>
                Technical Specifications
              </h4>
              <div style={{ border: '1px solid var(--color-line)', borderRadius: 'var(--radius-2)', overflow: 'hidden' }}>
                {product.specs.map((spec, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      fontSize: 'var(--text-body-sm)',
                      backgroundColor: idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-sunken)',
                      borderBottom: idx === product.specs.length - 1 ? 'none' : '1px solid var(--color-line)',
                    }}
                  >
                    <span style={{ color: 'var(--color-ink-muted)' }}>{spec.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-ink)' }}>
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price & Quantity & Order Action */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-line)', paddingTop: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>
                    Guaranteed Landed Price
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                    <span className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                      ${product.price * quantity}
                    </span>
                    {quantity > 1 && (
                      <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>
                        (${product.price} each)
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--color-line-strong)',
                    borderRadius: 'var(--radius-2)',
                    backgroundColor: 'var(--color-surface-sunken)',
                  }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    style={{ padding: '6px 10px', color: 'var(--color-ink)' }}
                  >
                    <IconMinus size={14} />
                  </button>
                  <span className="tabular-nums" style={{ minWidth: '28px', textAlign: 'center', fontWeight: 600, fontSize: 'var(--text-body-sm)' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    style={{ padding: '6px 10px', color: 'var(--color-ink)' }}
                  >
                    <IconPlus size={14} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAdd}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: 'var(--text-body)',
                  gap: 'var(--space-2)',
                }}
              >
                {addedNotice ? (
                  <>
                    <IconCheck size={18} /> Added to Order!
                  </>
                ) : (
                  <>
                    <IconCart size={18} /> Add {quantity} to Order — ${product.price * quantity}
                  </>
                )}
              </button>

              <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', textAlign: 'center', marginTop: 'var(--space-3)' }}>
                30-day inspection period included. Free returns within 30 days of parcel arrival.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .product-modal-grid {
            grid-template-columns: 5fr 7fr !important;
          }
        }
      `}</style>
    </div>
  );
};

