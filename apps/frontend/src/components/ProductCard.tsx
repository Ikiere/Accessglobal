import React from 'react';
import { Product } from '../data/products';
import { IconCart } from './icons';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
}) => {
  return (
    <article
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-line)',
        borderRadius: 'var(--radius-3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-subtle)',
        transition: 'border-color var(--duration-fast) var(--ease-out)',
      }}
    >
      {/* Product Image & Badges */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '4/3',
          backgroundColor: 'var(--color-surface-sunken)',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => onSelect(product)}
        title={`Inspect ${product.name}`}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--duration-base) var(--ease-out)',
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          {product.badge ? (
            <span
              className="chip chip-accent"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(4px)',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              {product.badge}
            </span>
          ) : <span />}

          <span
            className="chip"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: 'var(--color-ink-muted)',
              fontSize: '0.6875rem',
            }}
          >
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Workshop Provenance */}
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', fontWeight: 500 }}>
            {product.maker} · {product.makerOrigin}
          </span>
          <h3
            onClick={() => onSelect(product)}
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--color-ink)',
              marginTop: '2px',
              cursor: 'pointer',
            }}
          >
            {product.name}
          </h3>
        </div>

        {/* Primary Spec Callout */}
        <div
          style={{
            fontSize: 'var(--text-caption)',
            color: 'var(--color-ink-muted)',
            backgroundColor: 'var(--color-surface-sunken)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-1)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <strong style={{ color: 'var(--color-ink)' }}>{product.specs[0].label}:</strong> {product.specs[0].value}
        </div>

        {/* Bottom Actions & Price */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-line)' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--color-ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Landed Price
            </span>
            <span className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)' }}>
              ${product.price}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={() => onSelect(product)}
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: 'var(--text-body-sm)' }}
            >
              Specs
            </button>
            <button
              onClick={() => onAddToCart(product)}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: 'var(--text-body-sm)' }}
              title={`Add ${product.name} to order`}
            >
              <IconCart size={15} />
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

