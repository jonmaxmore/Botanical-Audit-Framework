import React, { ReactNode, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal size variants
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Modal animation variants
 */
export type ModalAnimation = 'fade' | 'slide-up' | 'slide-down' | 'zoom' | 'none';

/**
 * Props for the BaseModal component
 */
export interface BaseModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: ReactNode;
  /** Modal content */
  children: ReactNode;
  /** Footer content (typically buttons) */
  footer?: ReactNode;
  /** Size of the modal */
  size?: ModalSize;
  /** Animation type */
  animation?: ModalAnimation;
  /** Whether clicking backdrop closes modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean;
  /** Whether to show close button (X) */
  showCloseButton?: boolean;
  /** Whether to show backdrop */
  showBackdrop?: boolean;
  /** Custom backdrop opacity (0-100) */
  backdropOpacity?: number;
  /** Whether to lock body scroll when open */
  lockScroll?: boolean;
  /** Whether modal is centered vertically */
  centered?: boolean;
  /** Whether to use focus trap */
  trapFocus?: boolean;
  /** Custom CSS classes for modal container */
  className?: string;
  /** Custom CSS classes for modal content */
  contentClassName?: string;
  /** Custom CSS classes for modal header */
  headerClassName?: string;
  /** Custom CSS classes for modal body */
  bodyClassName?: string;
  /** Custom CSS classes for modal footer */
  footerClassName?: string;
  /** Z-index for the modal */
  zIndex?: number;
  /** Callback when modal finishes opening animation */
  onOpen?: () => void;
  /** Callback when modal finishes closing animation */
  onClosed?: () => void;
}

/**
 * BaseModal - A flexible and accessible modal/dialog component
 * 
 * Features:
 * - Multiple sizes (sm, md, lg, xl, full)
 * - Various animation types
 * - Focus trap to keep tab navigation within modal
 * - Body scroll locking when open
 * - Backdrop click and Escape key to close
 * - Portal rendering for proper z-index stacking
 * - Full accessibility with ARIA attributes
 * - Customizable backdrop and close behavior
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <BaseModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="My Modal"
 *   size="md"
 * >
 *   <p>Modal content here</p>
 * </BaseModal>
 * ```
 */
export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  animation = 'fade',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  showBackdrop = true,
  backdropOpacity = 50,
  lockScroll = true,
  centered = true,
  trapFocus = true,
  className = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  zIndex = 1000,
  onOpen,
  onClosed,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const firstFocusableElement = useRef<HTMLElement | null>(null);
  const lastFocusableElement = useRef<HTMLElement | null>(null);

  /**
   * Get all focusable elements within the modal
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!modalRef.current) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(modalRef.current.querySelectorAll(focusableSelectors));
  }, []);

  /**
   * Handle focus trap
   */
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (!trapFocus) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    firstFocusableElement.current = focusableElements[0];
    lastFocusableElement.current = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement.current) {
        event.preventDefault();
        lastFocusableElement.current?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement.current) {
        event.preventDefault();
        firstFocusableElement.current?.focus();
      }
    }
  }, [trapFocus, getFocusableElements]);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeOnEscape) {
      onClose();
    } else if (event.key === 'Tab') {
      handleTabKey(event);
    }
  }, [closeOnEscape, onClose, handleTabKey]);

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  /**
   * Lock/unlock body scroll
   */
  useEffect(() => {
    if (isOpen && lockScroll) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, lockScroll]);

  /**
   * Add keyboard event listeners
   */
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  /**
   * Focus management
   */
  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element or modal itself
      setTimeout(() => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          modalRef.current?.focus();
        }
      }, 100);

      // Call onOpen callback
      onOpen?.();
    } else {
      // Restore focus to previously focused element
      previousActiveElement.current?.focus();
      
      // Call onClosed callback
      onClosed?.();
    }
  }, [isOpen, getFocusableElements, onOpen, onClosed]);

  /**
   * Get size classes
   */
  const getSizeClasses = (): string => {
    const sizeMap: Record<ModalSize, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4',
    };
    return sizeMap[size];
  };

  /**
   * Get animation classes
   */
  const getAnimationClasses = (): string => {
    if (animation === 'none') return '';

    const animationMap: Record<ModalAnimation, string> = {
      fade: isOpen ? 'animate-fade-in' : 'animate-fade-out',
      'slide-up': isOpen ? 'animate-slide-up' : 'animate-slide-down',
      'slide-down': isOpen ? 'animate-slide-down' : 'animate-slide-up',
      zoom: isOpen ? 'animate-zoom-in' : 'animate-zoom-out',
      none: '',
    };
    return animationMap[animation];
  };

  /**
   * Get backdrop opacity class
   */
  const getBackdropOpacity = (): string => {
    const opacity = Math.min(100, Math.max(0, backdropOpacity));
    return `bg-opacity-${opacity}`;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${getBackdropOpacity()}`}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Modal Container */}
      <div
        className={`flex min-h-full ${centered ? 'items-center' : 'items-start pt-20'} justify-center p-4`}
        onClick={handleBackdropClick}
      >
        {/* Modal Content */}
        <div
          ref={modalRef}
          className={`
            relative w-full ${getSizeClasses()} bg-white rounded-lg shadow-xl 
            transform transition-all duration-300 ${getAnimationClasses()}
            ${className}
          `}
          tabIndex={-1}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className={`flex items-center justify-between px-6 py-4 border-b ${headerClassName}`}>
              {title && (
                <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1"
                  aria-label="Close modal"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={`px-6 py-4 ${contentClassName} ${bodyClassName}`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg ${footerClassName}`}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render modal in a portal
  return createPortal(modalContent, document.body);
};

BaseModal.displayName = 'BaseModal';

export default BaseModal;
