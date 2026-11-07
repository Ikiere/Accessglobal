import React from 'react';
import { IconGrid, IconList, IconSearch, IconClose } from './icons';

export type ViewMode = 'grid' | 'table';
export type SortOption = 'curated' | 'price-asc' | 'price-desc' | 'name-asc';

interface CategorySelectorProps {
  categories: { name: string; count: number }[];
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalFilteredCount: number;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortOption,
  onSortChange,
  totalFilteredCount,
}) => {
  return (
    <div style={{ marginBottom: 'var(--space-8)' }}>
      {/* Top Bar: Search, Sort and View Switcher */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-5)',
        }}
      >
        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-line-strong)',
            borderRadius: 'var(--radius-2)',
            padding: '6px 12px',
            width: 'min(360px, 100%)',
          }}
        >
          <IconSearch size={18} style={{ color: 'var(--color-ink-muted)' }} />
          <input
            type="text"
            placeholder="Search by product, workshop, or material..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: 'var(--text-body-sm)',
            }}
            aria-label="Search Collection"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="btn-subtle"
              style={{ padding: '2px', color: 'var(--color-ink-muted)' }}
              aria-label="Clear search query"
            >
              <IconClose size={16} />
            </button>
          )}
        </div>

        {/* Right Tools: Sort Selector + View Mode Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Result Count */}
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', marginRight: 'var(--space-2)' }}>
            <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
              {totalFilteredCount}
            </span> items found
          </span>

          {/* Sort Select */}
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort collection items"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-line-strong)',
              borderRadius: 'var(--radius-2)',
              padding: '6px 12px',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-ink)',
              cursor: 'pointer',
            }}
          >
            <option value="curated">Curated Order</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Alphabetical (A–Z)</option>
          </select>

          {/* View Mode Toggle: Grid vs Spec Table */}
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
              title="Editorial Grid Template"
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
              title="Technical Spec Table Template"
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

      {/* Aisle Category Filter Tabs */}
      <div
        role="tablist"
        aria-label="Aisle Categories"
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-2)',
          borderBottom: '1px solid var(--color-line)',
        }}
      >
        {categories.map((cat) => {
          const isActive = currentCategory === cat.name;
          return (
            <button
              key={cat.name}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectCategory(cat.name)}
              style={{
                padding: '8px 16px',
                fontSize: 'var(--text-body-sm)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                backgroundColor: isActive ? 'var(--color-surface)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--color-line-strong)' : 'transparent',
                borderRadius: 'var(--radius-2)',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                boxShadow: isActive ? 'var(--shadow-subtle)' : 'none',
              }}
            >
              <span>{cat.name}</span>
              <span
                className="tabular-nums"
                style={{
                  fontSize: '0.75rem',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-ink-subtle)',
                  fontWeight: 600,
                }}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

