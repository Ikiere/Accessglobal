import React from 'react';
import { Product } from '../data/products';
import { IconCart } from './icons';

interface ProductSpecTableProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductSpecTable: React.FC<ProductSpecTableProps> = ({
  products,
  onSelect,
  onAddToCart,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-line)',
        borderRadius: 'var(--radius-3)',
        overflowX: 'auto',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 'var(--text-body-sm)',
          textAlign: 'left',
          minWidth: '780px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: 'var(--color-surface-sunken)', borderBottom: '1px solid var(--color-line)' }}>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-ink-muted)', fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Product & Workshop
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-ink-muted)', fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Aisle
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-ink-muted)', fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Primary Specifications
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-ink-muted)', fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Origin & Logistics
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-ink-muted)', fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
              Price
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-ink-muted)', fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
              Order
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              style={{
                borderBottom: '1px solid var(--color-line)',
                transition: 'background-color var(--duration-fast) var(--ease-out)',
              }}
            >
              {/* Product Info & Thumb */}
              <td style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-1)',
                      objectFit: 'cover',
                      backgroundColor: 'var(--color-surface-sunken)',
                    }}
                  />
                  <div>
                    <button
                      onClick={() => onSelect(product)}
                      style={{
                        textAlign: 'left',
                        fontWeight: 600,
                        color: 'var(--color-ink)',
                        display: 'block',
                      }}
                    >
                      {product.name}
                    </button>
                    <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>
                      {product.maker}
                    </span>
                  </div>
                </div>
              </td>

              {/* Aisle */}
              <td style={{ padding: '12px 16px' }}>
                <span className="chip" style={{ fontSize: '0.6875rem' }}>
                  {product.category}
                </span>
              </td>

              {/* Specifications */}
              <td style={{ padding: '12px 16px', maxWidth: '280px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {product.specs.slice(0, 2).map((s, idx) => (
                    <span key={idx} style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>
                      <strong style={{ color: 'var(--color-ink)' }}>{s.label}:</strong> {s.value}
                    </span>
                  ))}
                </div>
              </td>

              {/* Origin & Delivery */}
              <td style={{ padding: '12px 16px' }}>
                <span style={{ display: 'block', fontWeight: 500, color: 'var(--color-ink)' }}>
                  {product.makerOrigin}
                </span>
                <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-success)' }}>
                  {product.leadTime}
                </span>
              </td>

              {/* Price */}
              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                <span className="tabular-nums" style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                  ${product.price}
                </span>
              </td>

              {/* Actions */}
              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                  <button
                    onClick={() => onSelect(product)}
                    className="btn-outline"
                    style={{ padding: '6px 10px', fontSize: 'var(--text-body-sm)' }}
                  >
                    Specs
                  </button>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: 'var(--text-body-sm)' }}
                  >
                    <IconCart size={15} />
                    Add
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

