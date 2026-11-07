import React, { useEffect, useState } from "react";

interface SitePreloaderProps {
  /** Whether loading operation is complete */
  isLoaded?: boolean;
  /** Minimum time to show preloader in ms */
  minDuration?: number;
  /** Callback fired after fade-out transition finishes */
  onComplete?: () => void;
  /** Custom subtitle */
  subtitle?: string;
  /** Whether to occupy entire viewport or fill container */
  fullScreen?: boolean;
}

/**
 * Animated Site Preloader for AccessGlobal Admin Portal
 * Features the signature workshop monogram logo animated with luxury timing.
 */
export const SitePreloader: React.FC<SitePreloaderProps> = ({
  isLoaded = false,
  minDuration = 700,
  onComplete,
  subtitle = "Central Command & Operations Portal",
  fullScreen = true,
}) => {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);
    return () => clearTimeout(timer);
  }, [minDuration]);

  useEffect(() => {
    if (minTimeElapsed && isLoaded) {
      setShouldFadeOut(true);
      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 400);
      return () => clearTimeout(fadeTimer);
    }
  }, [minTimeElapsed, isLoaded, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-label="Loading AccessGlobal Admin Console"
      className={`${
        fullScreen ? "fixed inset-0 z-50" : "absolute inset-0 z-30"
      } bg-[#FBF8F3] flex flex-col items-center justify-center p-6 select-none transition-all duration-400 ease-out ${
        shouldFadeOut ? "opacity-0 scale-[1.02] pointer-events-none" : "opacity-100 scale-100 pointer-events-auto"
      }`}
    >
      <style>{`
        @keyframes adminLogoDraw {
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
        @keyframes adminDotPulse {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
        @keyframes adminTileBreathe {
          0%, 100% {
            box-shadow: 0 10px 25px -5px rgba(18, 67, 48, 0.12), 0 0 0 1px rgba(18, 67, 48, 0.08);
          }
          50% {
            box-shadow: 0 16px 36px -4px rgba(18, 67, 48, 0.22), 0 0 0 2px rgba(18, 67, 48, 0.18);
          }
        }
        @keyframes adminSweep {
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
          .admin-preloader-tile,
          .admin-preloader-path,
          .admin-preloader-dot,
          .admin-preloader-bar {
            animation: none !important;
          }
        }
      `}</style>

      {/* Center Emblem Container */}
      <div
        className="admin-preloader-tile w-18 h-18 rounded-2xl bg-[#124330] flex items-center justify-center mb-6 shadow-md border border-[#1A5B42]/50"
        style={{ animation: "adminTileBreathe 2.4s ease-in-out infinite" }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Animated Monogram Path */}
          <path
            className="admin-preloader-path"
            d="M7 23L16 9L25 23H20L16 16.5L12 23H7Z"
            fill="#fbfaf8"
            stroke="#52b788"
            strokeWidth="0.75"
            strokeDasharray="100"
            style={{
              animation: "adminLogoDraw 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          />
          {/* Animated Apex Dot */}
          <circle
            className="admin-preloader-dot"
            cx="16"
            cy="11"
            r="1.5"
            fill="#fbfaf8"
            style={{
              transformOrigin: "16px 11px",
              animation: "adminDotPulse 1.8s ease-in-out infinite",
            }}
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-[#121516] m-0 leading-tight">
          AccessGlobal
        </h2>
        <p className="text-[11px] font-mono uppercase tracking-widest text-[#57625B] font-semibold mt-1.5">
          {subtitle}
        </p>
      </div>

      {/* Progress Track */}
      <div className="w-40 h-[2.5px] bg-[#E5DAC9] rounded-full overflow-hidden relative">
        <div
          className="admin-preloader-bar absolute inset-y-0 w-3/5 bg-[#124330] rounded-full"
          style={{
            animation: "adminSweep 1.6s cubic-bezier(0.65, 0, 0.35, 1) infinite",
          }}
        />
      </div>

      {/* Accessibility Status Text */}
      <span className="sr-only">Initialising administrative security session...</span>
    </div>
  );
};

export default SitePreloader;
