import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const sizeMap: Record<string, number> = {
  sm: 400,
  md: 600,
  lg: 800,
  xl: 1000,
};

const keyframes = `
  @keyframes ts-modal-overlay-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes ts-modal-slide-in {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const maxW = sizeMap[size] || 600;

  return (
    <>
      <style>{keyframes}</style>
      <div
        onClick={handleOverlayClick}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          animation: 'ts-modal-overlay-in 0.15s ease',
          padding: '1rem',
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: '100%',
            maxWidth: maxW,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
            animation: 'ts-modal-slide-in 0.2s ease',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#111827',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                borderRadius: 6,
                width: 30,
                height: 30,
                fontSize: '1rem',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#f3f4f6';
                (e.currentTarget as HTMLElement).style.color = '#111827';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'none';
                (e.currentTarget as HTMLElement).style.color = '#9ca3af';
              }}
              aria-label="Cerrar"
            >
              &#x2715;
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              padding: '1.5rem',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
