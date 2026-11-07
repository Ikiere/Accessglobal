import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible?: boolean;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible = true, onClose }) => {
  useEffect(() => {
    if (message && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(16px)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out)',
        backgroundColor: 'var(--color-ink)',
        color: '#ffffff',
        padding: '10px 20px',
        borderRadius: 'var(--radius-2)',
        boxShadow: 'var(--shadow-overlay)',
        fontSize: 'var(--text-body-sm)',
        fontWeight: 500,
        zIndex: 100,
        maxWidth: '90vw',
        textAlign: 'center',
      }}
    >
      {message}
    </div>
  );
};
