import React from "react";

interface BrandLogoProps {
  size?: number;
  iconOnly?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
  invertText?: boolean;
}

/**
 * Official AccessGlobal Brand Logo for Admin Operations Console
 * Renders the authentic site icon geometric monogram and typography.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 32,
  iconOnly = false,
  showSubtitle = true,
  subtitle = "Admin Console",
  className = "",
  invertText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official Geometric Monogram Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        style={{ borderRadius: `${(size * 6) / 32}px`, overflow: "hidden" }}
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="6" fill="#124330" />
        <path d="M7 23L16 9L25 23H20L16 16.5L12 23H7Z" fill="#fbfaf8" />
        <circle cx="16" cy="11" r="1.5" fill="#fbfaf8" />
      </svg>

      {!iconOnly && (
        <div className="flex flex-col text-left leading-tight">
          <span
            className={`font-serif text-lg font-bold tracking-tight ${
              invertText ? "text-white" : "text-[#124330] dark:text-white"
            }`}
          >
            AccessGlobal
          </span>
          {showSubtitle && (
            <span
              className={`text-[10px] uppercase font-mono font-semibold tracking-wider ${
                invertText ? "text-gray-300" : "text-[#57625B] dark:text-gray-400"
              }`}
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

