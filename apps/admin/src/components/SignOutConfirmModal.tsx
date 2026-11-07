import React, { useEffect } from "react";
import { HiOutlineArrowRightOnRectangle, HiOutlineXMark } from "react-icons/hi2";

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  adminName?: string;
}

/**
 * Customized Confirmation Modal for Admin Console Sign Out
 * Features the British racing green & warm alabaster design standard.
 */
export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  adminName,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-sign-out-title"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FBF8F3] border border-[#E5DAC9] rounded-2xl p-7 max-w-sm w-full shadow-2xl relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#57625B] hover:text-[#124330] hover:bg-[#E5DAC9]/30 transition-colors"
        >
          <HiOutlineXMark className="text-lg" />
        </button>

        {/* Brand Icon */}
        <div className="w-13 h-13 rounded-2xl bg-[#124330] text-[#34D399] flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#1A5B42]">
          <HiOutlineArrowRightOnRectangle className="text-2xl" />
        </div>

        {/* Heading */}
        <h3
          id="admin-sign-out-title"
          className="font-serif text-xl font-bold tracking-tight text-[#121516] mb-1.5"
        >
          End Admin Session?
        </h3>
        <p className="text-xs text-[#57625B] leading-relaxed mb-6">
          {adminName ? `Signing out as ${adminName}. ` : ""}
          Your encrypted administrative credentials and JWT token will be securely purged from this workstation.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#57625B] hover:text-[#121516] bg-white border border-[#E5DAC9] transition-colors"
          >
            Stay Signed In
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#124330] hover:bg-[#1A5B42] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            Sign Out Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutConfirmModal;

