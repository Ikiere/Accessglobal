import React, { useEffect } from 'react';
import { IconClose } from './icons';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  userName?: string | null;
}

/**
 * Customized Confirmation Modal for Customer Sign Out
 * Features the signature AccessGlobal aesthetic with warm alabaster styling and clear security messaging.
 */
export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  userName,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-out-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        backgroundColor: 'rgba(18, 21, 22, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FBF8F3',
          border: '1px solid #E5DAC9',
          borderRadius: '16px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 20px 40px -15px rgba(18, 67, 48, 0.15)',
          padding: '28px 24px',
          position: 'relative',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="btn-subtle"
          style={{ position: 'absolute', top: '14px', right: '14px', padding: '6px' }}
        >
          <IconClose size={18} />
        </button>

        {/* Security Badge Icon */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            backgroundColor: '#124330',
            color: '#34D399',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 8px 16px -4px rgba(18, 67, 48, 0.2)',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        {/* Heading & Copy */}
        <h3
          id="sign-out-modal-title"
          style={{
            fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#121516',
            margin: '0 0 8px 0',
            lineHeight: 1.2,
          }}
        >
          Sign Out of AccessGlobal?
        </h3>
        <p
          style={{
            fontSize: '0.8125rem',
            color: '#57625B',
            lineHeight: 1.5,
            margin: '0 0 24px 0',
          }}
        >
          {userName
            ? `Goodbye for now, ${userName}. You will be signed out of your current session. Any items in your active bag will remain safe for your next visit.`
            : 'You are about to sign out of your current session. You can easily sign back in at any time.'}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5DAC9',
              color: '#57625B',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            Stay Signed In
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: '#124330',
              border: '1px solid #124330',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              boxShadow: '0 2px 4px rgba(18, 67, 48, 0.2)',
            }}
          >
            Confirm Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutConfirmModal;

