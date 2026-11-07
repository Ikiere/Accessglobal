import React, { useEffect, useState } from 'react';

interface SitePreloaderProps {
  /** Whether the underlying content has loaded */
  isLoaded: boolean;
  /** Minimum time to show preloader in ms (prevents flash of content) */
  minDuration?: number;
  /** Callback fired after fade-out transition finishes */
  onComplete?: () => void;
}

/**
 * Animated Site Preloader featuring the AccessGlobal signature monogram logo.
 * Allows the page content to load in the background before smoothly fading out.
 */
export const SitePreloader: React.FC<SitePreloaderProps> = ({
  isLoaded,
  minDuration = 800,
  onComplete,
}) => {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Enforce minimum aesthetic presentation time
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);
    return () => clearTimeout(timer);
  }, [minDuration]);

  // When both minimum time has passed and real data is loaded, initiate fade out
  useEffect(() => {
    if (minTimeElapsed && isLoaded) {
      setShouldFadeOut(true);
      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 450); // Matches the 400ms CSS transition + 50ms buffer
      return () => clearTimeout(fadeTimer);
    }
  }, [minTimeElapsed, isLoaded, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-label="Loading AccessGlobal"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#FBF8F3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        opacity: shouldFadeOut ? 0 : 1,
        transform: shouldFadeOut ? 'scale(1.02)' : 'scale(1)',
        pointerEvents: shouldFadeOut ? 'none' : 'auto',
        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes preloaderLogoDraw {
          0% {
            stroke-dashoffset: 100;
            fill-opacity: 0;
          }
          50% {
            stroke-dashoffset: 0;
            fill-opacity: 0.2;
          }
          100% {
            stroke-dashoffset: 0;
            fill-opacity: 1;
          }
        }
        @keyframes preloaderDotPulse {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
        @keyframes preloaderTileBreathe {
          0%, 100% {
            box-shadow: 0 10px 25px -5px rgba(18, 67, 48, 0.12), 0 0 0 1px rgba(18, 67, 48, 0.08);
          }
          50% {
            box-shadow: 0 16px 36px -4px rgba(18, 67, 48, 0.22), 0 0 0 2px rgba(18, 67, 48, 0.18);
          }
        }
        @keyframes preloaderTrackSweep {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(30%);
          }
          100% {
            transform: translateX(110%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .preloader-animated-tile,
          .preloader-path,
          .preloader-dot,
          .preloader-bar-fill {
            animation: none !important;
          }
        }
      `}</style>

      {/* Center Emblem Container */}
      <div
        className="preloader-animated-tile"
        style={{
          width: '76px',
          height: '76px',
          borderRadius: '18px',
          backgroundColor: '#124330',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: '1.5rem',
          animation: 'preloaderTileBreathe 2.4s ease-in-out infinite',
        }}
      >
        <svg
          width="52"
          height="52"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Animated Monogram Path */}
          <path
            className="preloader-path"
            d="M7 23L16 9L25 23H20L16 16.5L12 23H7Z"
            fill="#fbfaf8"
            stroke="#52b788"
            strokeWidth="0.75"
            strokeDasharray="100"
            style={{
              animation: 'preloaderLogoDraw 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          />
          {/* Animated Apex Dot */}
          <circle
            className="preloader-dot"
            cx="16"
            cy="11"
            r="1.5"
            fill="#fbfaf8"
            style={{
              transformOrigin: '16px 11px',
              animation: 'preloaderDotPulse 1.8s ease-in-out infinite',
            }}
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)',
            fontSize: '1.75rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#121516',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          AccessGlobal
        </h2>
        <p
          style={{
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#57625B',
            fontWeight: 600,
            margin: '0.35rem 0 0 0',
          }}
        >
          Direct From Independent Workshops
        </p>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '160px',
          height: '2.5px',
          backgroundColor: '#E5DAC9',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="preloader-bar-fill"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '60%',
            backgroundColor: '#124330',
            borderRadius: '9999px',
            animation: 'preloaderTrackSweep 1.6s cubic-bezier(0.65, 0, 0.35, 1) infinite',
          }}
        />
      </div>

      {/* Screen Reader Notice */}
      <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        Loading marketplace collection...
      </span>
    </div>
  );
};

export default SitePreloader;

