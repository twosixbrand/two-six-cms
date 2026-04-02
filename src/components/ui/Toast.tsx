import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

const typeStyles: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: {
    bg: '#1a1a24',
    border: '#34d399',
    color: '#34d399',
    icon: '\u2713',
  },
  error: {
    bg: '#1a1a24',
    border: '#f87171',
    color: '#f87171',
    icon: '\u2715',
  },
  info: {
    bg: '#1a1a24',
    border: '#60a5fa',
    color: '#60a5fa',
    icon: 'i',
  },
};

const keyframes = `
  @keyframes ts-toast-in {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes ts-toast-out {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
  }
`;

const ToastItemComponent: React.FC<{ toast: ToastItem; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onRemove]);

  const style = typeStyles[toast.type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.65rem 1rem',
        backgroundColor: style.bg,
        borderLeft: `3px solid ${style.border}`,
        border: '1px solid #2a2a35',
        borderLeftColor: style.border,
        borderLeftWidth: 3,
        borderRadius: 10,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
        fontFamily: 'Inter, sans-serif',
        animation: exiting ? 'ts-toast-out 0.3s ease forwards' : 'ts-toast-in 0.25s ease',
        minWidth: 260,
        maxWidth: 380,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          minWidth: 24,
          borderRadius: '50%',
          backgroundColor: `${style.border}15`,
          color: style.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.7rem',
        }}
      >
        {style.icon}
      </div>
      <span style={{ flex: 1, fontSize: '0.8125rem', color: '#f1f1f3', lineHeight: 1.4 }}>
        {toast.message}
      </span>
      <button
        type="button"
        onClick={() => {
          setExiting(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          color: '#6b6b7b',
          fontSize: '0.75rem',
          lineHeight: 1,
          display: 'flex',
        }}
        aria-label="Cerrar"
      >
        &#x2715;
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: ToastContextValue = {
    success: useCallback((msg: string) => addToast(msg, 'success'), [addToast]),
    error: useCallback((msg: string) => addToast(msg, 'error'), [addToast]),
    info: useCallback((msg: string) => addToast(msg, 'info'), [addToast]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: ToastItem[]; onRemove: (id: number) => void }> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{keyframes}</style>
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItemComponent toast={t} onRemove={onRemove} />
          </div>
        ))}
      </div>
    </>
  );
};

export default ToastContainer;
