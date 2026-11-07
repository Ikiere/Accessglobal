import React, { useState, useMemo } from 'react';
import { Product } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { ProductSpecTable } from '../components/ProductSpecTable';
import { CategorySelector, ViewMode, SortOption } from '../components/CategorySelector';
import { IconChevronLeft, IconChevronRight, IconRefresh } from '../components/icons';

interface ShopPageProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ITEMS_PER_PAGE = 6;

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  isLoading,
  error,
  onRefresh,
  onSelectProduct,
  onAddToCart,
  viewMode,
  onViewModeChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('curated');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Compute categories with counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    return [
      { name: 'All', count: counts['All'] || 0 },
      { name: 'E-Bikes', count: counts['E-Bikes'] || 0 },
      { name: 'Clothing', count: counts['Clothing'] || 0 },
      { name: 'Shoes', count: counts['Shoes'] || 0 },
      { name: 'Appliances', count: counts['Appliances'] || 0 },
      { name: 'Perfumes', count: counts['Perfumes'] || 0 },
      { name: 'Accessories', count: counts['Accessories'] || 0 },
    ];
  }, [products]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.maker.toLowerCase().includes(q) ||
          p.makerOrigin.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sort products
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'curated':
      default:
        // maintain original order
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortOption]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div style={{ paddingBlock: 'var(--space-10) var(--space-16)', backgroundColor: 'var(--color-bg)' }}>
      <div className="wrap">
        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <span className="chip chip-accent" style={{ marginBottom: 'var(--space-2)' }}>
            Workshop Catalog
          </span>
          <h1 style={{ fontSize: 'var(--text-h1)', color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
            Shop Direct from Verified Makers
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--color-ink-muted)', maxWidth: '640px' }}>
            Every item ships directly from its maker workshop. All customs duties, taxes, and international delivery fees are included upfront.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-3)', border: '1px solid var(--color-line)', marginBottom: 'var(--space-8)' }}>
            <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>
              Loading products directly from Supabase database...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-3)', border: '1px solid var(--color-line)', marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <strong style={{ color: 'var(--color-ink)', display: 'block' }}>Could not refresh from database</strong>
              <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>{error}</span>
            </div>
            <button onClick={onRefresh} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconRefresh size={16} /> Retry
            </button>
          </div>
        )}

        {/* Filters, Search & View Switcher */}
        <CategorySelector
          categories={categoriesWithCounts}
          currentCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalFilteredCount={filteredProducts.length}
        />

        {/* Product Catalog Display */}
        {paginatedProducts.length > 0 ? (
          viewMode === 'grid' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
                gap: 'var(--space-6)',
                marginBottom: 'var(--space-10)',
              }}
            >
              {paginatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          ) : (
            <div style={{ marginBottom: 'var(--space-10)' }}>
              <ProductSpecTable
                products={paginatedProducts}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            </div>
          )
        ) : (
          /* Empty Search Results State */
          <div
            style={{
              padding: 'var(--space-16) var(--space-6)',
              textAlign: 'center',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-3)',
              border: '1px solid var(--color-line)',
              marginBottom: 'var(--space-10)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
              No products found
            </h3>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-6)' }}>
              We could not find any products matching your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setCurrentPage(1);
              }}
              className="btn-outline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredProducts.length > ITEMS_PER_PAGE && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid var(--color-line)',
            }}
          >
            {/* Pagination Range Text */}
            <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
              Showing <strong style={{ color: 'var(--color-ink)' }}>{startIndex + 1}</strong> to{' '}
              <strong style={{ color: 'var(--color-ink)' }}>{endIndex}</strong> of{' '}
              <strong style={{ color: 'var(--color-ink)' }}>{filteredProducts.length}</strong> products
            </span>

            {/* Page Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="btn-outline"
                style={{
                  padding: '8px 12px',
                  opacity: safeCurrentPage === 1 ? 0.4 : 1,
                  cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                aria-label="Previous page"
              >
                <IconChevronLeft size={16} />
                <span>Previous</span>
              </button>

              {/* Numbered Pills */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    minWidth: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-2)',
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: safeCurrentPage === pageNum ? 700 : 500,
                    backgroundColor: safeCurrentPage === pageNum ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: safeCurrentPage === pageNum ? 'var(--color-accent-ink)' : 'var(--color-ink)',
                    border: '1px solid var(--color-line-strong)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={safeCurrentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="btn-outline"
                style={{
                  padding: '8px 12px',
                  opacity: safeCurrentPage === totalPages ? 0.4 : 1,
                  cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                aria-label="Next page"
              >
                <span>Next</span>
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

