import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Modal Component
 * Base modal dialog with accessible backdrop, Escape key handling,
 * scroll locking, focus management, and responsive presentation.
 * Sourced from Section 8 of Frontend Guide.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showCloseButton = false,
  maxWidth = 'max-w-md',
}) {
  const previousActiveElementRef = useRef(null);
  const modalBoxRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Handle escape key, body scroll lock, and initial focus only when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Save current active element to restore focus when modal closes
    previousActiveElementRef.current = document.activeElement;

    // Lock page background scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the modal box or first focusable element inside it on open
    const timer = setTimeout(() => {
      const focusable = modalBoxRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) {
        focusable.focus();
      } else {
        modalBoxRef.current?.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      // Return focus to previous trigger
      if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === 'function'
      ) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle backdrop click: closes only when clicking the backdrop container itself
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCloseRef.current?.();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={handleBackdropClick}
      aria-hidden="false"
    >
      <div
        ref={modalBoxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-border p-6 text-left transform transition-all duration-200 animate-in zoom-in-95 motion-reduce:animate-none ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={() => onCloseRef.current?.()}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-text hover:text-text-main hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
