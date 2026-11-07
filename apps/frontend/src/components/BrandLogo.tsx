import React from 'react';

interface BrandLogoProps {
  size?: number;
  iconOnly?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
}

/**
 * Official AccessGlobal Brand Logo
 * Features the signature workshop monogram mark from the site favicon alongside editorial typography.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 34,
  iconOnly = false,
  showSubtitle = true,
  subtitle = 'Direct From Workshops',
  className = '',
}) => {
  return (
    <div className={`brand-logo-container flex items-center gap-3 select-none ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* Official Geometric Monogram Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="brand-logo-mark shrink-0"
        style={{ flexShrink: 0, borderRadius: `${(size * 6) / 32}px`, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="6" fill="#124330" />
        <path d="M7 23L16 9L25 23H20L16 16.5L12 23H7Z" fill="#fbfaf8" />
        <circle cx="16" cy="11" r="1.5" fill="#fbfaf8" />
      </svg>

      {!iconOnly && (
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.15 }}>
          <span
            style={{
              fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)',
              fontSize: `${Math.max(1.15, (size * 1.35) / 32)}rem`,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-ink, #121516)',
            }}
          >
            AccessGlobal
          </span>
          {showSubtitle && (
            <span
              style={{
                fontSize: '0.6875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-ink-subtle, #57625B)',
                fontWeight: 600,
                marginTop: '2px',
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
