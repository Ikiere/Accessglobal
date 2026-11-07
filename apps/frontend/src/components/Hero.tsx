import React from 'react';
import { Product } from '../data/products';
import { IconArrowRight, IconShieldCheck, IconCart } from './icons';

interface HeroProps {
  flagshipProduct: Product;
  onExplore: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const Hero: React.FC<HeroProps> = ({
  flagshipProduct,
  onExplore,
  onSelectProduct,
  onAddToCart,
}) => {
  return (
    <section className="hero-section" style={{ paddingBlock: 'var(--space-12) var(--space-16)', backgroundColor: 'var(--color-bg)' }}>
      <div className="wrap">
        <div className="hero-grid" style={{ display: 'grid', gap: 'var(--space-10)', alignItems: 'center' }}>
          
          {/* Left Column: Editorial Value Proposition */}
          <div style={{ maxWidth: '620px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <span className="chip chip-accent">
                <IconShieldCheck size={14} />
                Verified Workshop Provenance
              </span>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', letterSpacing: '0.04em' }}>
                Pre-cleared Customs
              </span>
            </div>

            <h1 style={{ marginBottom: 'var(--space-6)', color: 'var(--color-ink)' }}>
              Curated goods from the world's finest workshops.
            </h1>

            <p style={{ fontSize: '1.125rem', color: 'var(--color-ink-muted)', lineHeight: '1.65', marginBottom: 'var(--space-8)' }}>
              Direct from verified makers in 28 countries. Zero intermediary markups, transparent material disclosures, and guaranteed door-to-door delivery.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-4)' }}>
              <button
                onClick={onExplore}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: 'var(--text-body)' }}
              >
                Explore Collection
                <IconArrowRight size={18} />
              </button>

              <a
                href="#standard"
                className="btn-outline"
                style={{ padding: '12px 20px', fontSize: 'var(--text-body)' }}
              >
                The AGM Standard
              </a>
            </div>

            {/* Micro Guarantees */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', marginTop: 'var(--space-10)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-line)' }}>
              <div>
                <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                  100%
                </span>
                <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>
                  Audited Origins
                </span>
              </div>
              <div style={{ width: '1px', backgroundColor: 'var(--color-line)' }} />
              <div>
                <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                  $0
                </span>
                <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>
                  Surprise Tariffs
                </span>
              </div>
              <div style={{ width: '1px', backgroundColor: 'var(--color-line)' }} />
              <div>
                <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                  30 Days
                </span>
                <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>
                  Inspection Window
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Flagship Workshop Showcase Card */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-line)',
                borderRadius: 'var(--radius-3)',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-subtle)', fontWeight: 600 }}>
                    Featured Maker · {flagshipProduct.makerOrigin}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '2px', color: 'var(--color-ink)' }}>
                    {flagshipProduct.name}
                  </h3>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>
                    By {flagshipProduct.maker}
                  </p>
                </div>
                <span className="chip chip-accent">
                  {flagshipProduct.badge}
                </span>
              </div>

              {/* Photo */}
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '16/10',
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-2)',
                  backgroundColor: 'var(--color-surface-sunken)',
                  marginBottom: 'var(--space-5)',
                  cursor: 'pointer',
                }}
                onClick={() => onSelectProduct(flagshipProduct)}
                title="Click to inspect specifications"
              >
                <img
                  src={flagshipProduct.image}
                  alt={flagshipProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              {/* Key Specs Breakdown Table */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--space-3)',
                  paddingBlock: 'var(--space-3)',
                  borderTop: '1px solid var(--color-line)',
                  borderBottom: '1px solid var(--color-line)',
                  marginBottom: 'var(--space-5)',
                }}
              >
                {flagshipProduct.specs.slice(0, 3).map((spec, i) => (
                  <div key={i}>
                    <span style={{ display: 'block', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-ink-subtle)' }}>
                      {spec.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-ink)' }}>
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)' }}>Landed Price</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.375rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                    ${flagshipProduct.price}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    onClick={() => onSelectProduct(flagshipProduct)}
                    className="btn-outline"
                    style={{ fontSize: 'var(--text-body-sm)', padding: '8px 14px' }}
                  >
                    Inspect
                  </button>
                  <button
                    onClick={() => onAddToCart(flagshipProduct)}
                    className="btn-primary"
                    style={{ fontSize: 'var(--text-body-sm)', padding: '8px 16px' }}
                  >
                    <IconCart size={16} />
                    Add to Order
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (min-width: 960px) {
          .hero-grid {
            grid-template-columns: 7fr 5fr !important;
          }
        }
      `}</style>
    </section>
  );
};
