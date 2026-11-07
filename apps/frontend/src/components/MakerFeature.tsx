import React from 'react';
import { IconArrowRight } from './icons';

interface MakerFeatureProps {
  onFilterMaker: (category: string) => void;
}

export const MakerFeature: React.FC<MakerFeatureProps> = ({ onFilterMaker }) => {
  return (
    <section style={{ paddingBlock: 'var(--space-16)', backgroundColor: 'var(--color-surface-sunken)', borderTop: '1px solid var(--color-line)', borderBottom: '1px solid var(--color-line)' }}>
      <div className="wrap">
        <div className="maker-grid" style={{ display: 'grid', gap: 'var(--space-12)', alignItems: 'center' }}>
          
          {/* Workshop Photo */}
          <div style={{ position: 'relative', borderRadius: 'var(--radius-3)', overflow: 'hidden', aspectRatio: '16/10', boxShadow: 'var(--shadow-card)' }}>
            <img
              src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&auto=format&fit=crop&q=80"
              alt="Nordic Motion Labs assembly floor in Helsinki"
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                backgroundColor: 'rgba(18, 21, 22, 0.85)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: 'var(--radius-1)',
                fontSize: 'var(--text-caption)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Helsinki Werk #04 · Assembly Floor
            </div>
          </div>

          {/* Workshop Story */}
          <div>
            <span style={{ fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-subtle)', fontWeight: 600 }}>
              Workshop in Focus
            </span>

            <h2 style={{ fontSize: 'var(--text-h2)', marginTop: '4px', marginBottom: 'var(--space-4)', color: 'var(--color-ink)' }}>
              Nordic Motion Labs — Helsinki, Finland
            </h2>

            <p style={{ fontSize: '1.0625rem', color: 'var(--color-ink-muted)', lineHeight: '1.65', marginBottom: 'var(--space-4)' }}>
              Founded in 2018 in Helsinki's industrial port district, Nordic Motion Labs builds commuter vehicles designed for brutal sub-zero winters and coastal salt spray. Every frame uses custom-butted 6061 alloy, robotic TIG welding, and internally routed weatherproof wiring.
            </p>

            <blockquote
              style={{
                borderLeft: '2px solid var(--color-accent)',
                paddingLeft: 'var(--space-4)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                color: 'var(--color-ink)',
                marginBottom: 'var(--space-6)',
                lineHeight: '1.4',
              }}
            >
              "We refuse to build disposable mobility. If a bolt or bearing cannot be serviced with a standard metric hex key in ten years, we redesign it."
            </blockquote>

            <button
              onClick={() => onFilterMaker('E-Bikes')}
              className="btn-outline"
              style={{ gap: 'var(--space-2)' }}
            >
              View Nordic Motion Labs Collection
              <IconArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .maker-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

