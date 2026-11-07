import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../data/products';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { ProductSpecTable } from '../components/ProductSpecTable';
import { ViewMode } from '../components/CategorySelector';
import { MakerFeature } from '../components/MakerFeature';
import { StandardSection } from '../components/StandardSection';
import { IconArrowRight, IconGrid, IconList } from '../components/icons';

interface HomePageProps {
  products: Product[];
  flagshipProduct: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  flagshipProduct,
  onSelectProduct,
  onAddToCart,
  viewMode,
  onViewModeChange,
}) => {
  // Show top 6 curated products on the homepage
  const featuredProducts = products.slice(0, 6);

  return (
    <div>
      {/* Editorial Hero */}
      <Hero
        flagshipProduct={flagshipProduct}
        onExplore={() => {
          const el = document.getElementById('featured-collection');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectProduct={onSelectProduct}
        onAddToCart={onAddToCart}
      />

      {/* Featured Collection Section */}
      <section id="featured-collection" style={{ paddingBlock: 'var(--space-12) var(--space-16)', borderTop: '1px solid var(--color-line)' }}>
        <div className="wrap">
          {/* Section Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <div>
              <span className="chip chip-accent" style={{ marginBottom: 'var(--space-2)' }}>
                Featured Curations
              </span>
              <h2 style={{ fontSize: 'var(--text-h2)', color: 'var(--color-ink)' }}>
                Hand-Picked from Verified Makers
              </h2>
              <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
                A preview of our direct-from-workshop collection. Every product is built with honest materials.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                role="group"
                aria-label="Layout view template"
                style={{
                  display: 'inline-flex',
                  backgroundColor: 'var(--color-surface-sunken)',
                  padding: '2px',
                  borderRadius: 'var(--radius-2)',
                  border: '1px solid var(--color-line)',
                }}
              >
                <button
                  onClick={() => onViewModeChange('grid')}
                  aria-pressed={viewMode === 'grid'}
                  title="Grid View"
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-1)',
                    backgroundColor: viewMode === 'grid' ? 'var(--color-surface)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--color-ink)' : 'var(--color-ink-subtle)',
                    boxShadow: viewMode === 'grid' ? 'var(--shadow-subtle)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IconGrid size={18} />
                </button>
                <button
                  onClick={() => onViewModeChange('table')}
                  aria-pressed={viewMode === 'table'}
                  title="Table View"
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-1)',
                    backgroundColor: viewMode === 'table' ? 'var(--color-surface)' : 'transparent',
                    color: viewMode === 'table' ? 'var(--color-ink)' : 'var(--color-ink-subtle)',
                    boxShadow: viewMode === 'table' ? 'var(--shadow-subtle)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IconList size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Product Cards or Spec Table */}
          {viewMode === 'grid' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
                gap: 'var(--space-6)',
                marginBottom: 'var(--space-12)',
              }}
            >
              {featuredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          ) : (
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <ProductSpecTable
                products={featuredProducts}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            </div>
          )}

          {/* "See More in Shop" Button */}
          <div style={{ textAlign: 'center', paddingBlock: 'var(--space-4)' }}>
            <Link
              to="/shop"
              className="btn-primary"
              style={{
                padding: '14px 32px',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span>See More in Shop</span>
              <IconArrowRight size={18} />
            </Link>
            <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', marginTop: 'var(--space-2)' }}>
              Explore the full catalog with search, filters, and specifications.
            </p>
          </div>
        </div>
      </section>

      {/* Maker Story and Provenance Feature */}
      <MakerFeature
        onFilterMaker={() => {}}
      />

      {/* Standards & Guarantees Section */}
      <StandardSection />
    </div>
  );
};
