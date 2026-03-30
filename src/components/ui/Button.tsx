import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '0.4rem 0.8rem', fontSize: '0.75rem' },
  md: { padding: '0.7rem 1.4rem', fontSize: '0.85rem' },
  lg: { padding: '0.9rem 2rem', fontSize: '0.95rem' },
};

const variantBaseStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #d4af37 0%, #f5d76e 50%, #d4af37 100%)',
    backgroundSize: '200% auto',
    color: '#0f172a',
    border: '1px solid rgba(184, 134, 11, 0.3)',
    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
  },
  secondary: {
    background: 'var(--menu-bg, #0f172a)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  destructive: {
    background: 'rgba(239, 68, 68, 0.05)',
    color: '#ef4444',
    border: '1.5px solid rgba(239, 68, 68, 0.2)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary, #475569)',
    border: '1px solid transparent',
  },
  outline: {
    background: 'transparent',
    color: 'var(--primary-color, #d4af37)',
    border: '1.5px solid rgba(212, 175, 55, 0.3)',
  },
};

const spinnerKeyframes = `
  @keyframes ts-btn-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  onClick,
  disabled = false,
  type = 'button',
}) => {
  const [hovered, setHovered] = React.useState(false);

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
    borderRadius: 12,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    whiteSpace: 'nowrap',
    opacity: disabled ? 0.5 : 1,
    ...sizeStyles[size],
    ...variantBaseStyles[variant],
  };

  // Hover overrides
  if (hovered && !disabled && !loading) {
    if (variant === 'primary') {
      base.backgroundPosition = 'right center';
      base.transform = 'translateY(-2px)';
      base.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
    } else if (variant === 'secondary') {
      base.background = '#1e293b';
      base.transform = 'translateY(-1px)';
    } else if (variant === 'destructive') {
      base.background = '#ef4444';
      base.color = '#ffffff';
      base.borderColor = '#ef4444';
      base.boxShadow = '0 5px 15px rgba(239, 68, 68, 0.3)';
    } else if (variant === 'ghost') {
      base.background = 'rgba(212, 175, 55, 0.1)';
      base.color = 'var(--primary-color, #d4af37)';
    } else if (variant === 'outline') {
      base.background = 'rgba(212, 175, 55, 0.08)';
      base.borderColor = '#d4af37';
      base.transform = 'translateY(-1px)';
    }
  }

  const spinnerSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  return (
    <>
      <style>{spinnerKeyframes}</style>
      <button
        type={type as 'button' | 'submit'}
        style={base}
        onClick={disabled || loading ? undefined : onClick}
        disabled={disabled || loading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {loading ? (
          <div
            style={{
              width: spinnerSize,
              height: spinnerSize,
              border: `2px solid currentColor`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'ts-btn-spin 0.7s linear infinite',
            }}
          />
        ) : (
          icon && <span style={{ display: 'inline-flex', fontSize: '1.1em' }}>{icon}</span>
        )}
        {children}
      </button>
    </>
  );
};

export default Button;
