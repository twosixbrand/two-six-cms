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
  sm: 480,
  md: 640,
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
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const maxW = isMobile ? '95%' : (sizeMap[size] || 600);

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
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          animation: 'ts-modal-overlay-in 0.15s ease',
          padding: '1rem',
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: isMobile ? '95%' : '100%',
            maxWidth: maxW,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1a1a24',
            borderRadius: isMobile ? 12 : 16,
            border: '1px solid #2a2a35',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(240, 180, 41, 0.03)',
            animation: 'ts-modal-slide-in 0.2s ease',
            overflow: 'hidden',
            margin: isMobile ? 'auto' : undefined,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #2a2a35',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#f1f1f3',
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
                color: '#6b6b7b',
                borderRadius: 6,
                width: 30,
                height: 30,
                fontSize: '1rem',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.06)';
                (e.currentTarget as HTMLElement).style.color = '#f1f1f3';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'none';
                (e.currentTarget as HTMLElement).style.color = '#6b6b7b';
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
                borderTop: '1px solid #2a2a35',
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
