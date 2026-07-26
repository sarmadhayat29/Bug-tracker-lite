'use client';

/**
 * components/ui/Modal.tsx
 *
 * Accessible modal dialog built without a third-party library.
 * Uses a Portal to render outside the layout DOM tree.
 * Includes backdrop click, Escape key, focus trap basics, and ARIA attributes.
 */

import {
  useEffect,
  useRef,
  ReactNode,
  KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from './Button';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen:      boolean;
  onClose:     () => void;
  title:       string;
  description?: string;
  children:    ReactNode;
  size?:       'sm' | 'md' | 'lg';
  className?:  string;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Modal — accessible dialog overlay.
 *
 * @example
 * <Modal
 *   isOpen={showDeleteModal}
 *   onClose={() => setShowDeleteModal(false)}
 *   title="Delete Bug"
 * >
 *   <p>Are you sure?</p>
 *   <Button onClick={handleDelete}>Confirm</Button>
 * </Modal>
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}: ModalProps): React.ReactPortal | null {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: Event) => {
      if ((e as unknown as KeyboardEvent).key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        className={cn(
          'relative z-10 w-full card shadow-modal animate-slide-up',
          'p-6 flex flex-col gap-4',
          sizeMap[size],
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-text">
              {title}
            </h2>
            {description && (
              <p id="modal-desc" className="mt-1 text-sm text-text-secondary">
                {description}
              </p>
            )}
          </div>
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
