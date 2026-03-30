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
  sm: { padding: '0.35rem 0.7rem', fontSize: '0.75rem' },
  md: { padding: '0.5rem 1rem', fontSize: '0.8125rem' },
  lg: { padding: '0.65rem 1.5rem', fontSize: '0.875rem' },
};

const variantBaseStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: '#d4af37',
    color: '#ffffff',
    border: '1px solid #d4af37',
  },
  secondary: {
    background: '#ffffff',
    color: '#111827',
    border: '1px solid #e5e7eb',
  },
  destructive: {
    background: 'transparent',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  ghost: {
    background: 'transparent',
    color: '#6b7280',
    border: '1px solid transparent',
  },
  outline: {
    background: 'transparent',
    color: '#d4af37',
    border: '1px solid #e5e7eb',
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
    gap: '0.5rem',
    borderRadius: 8,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    outline: 'none',
    whiteSpace: 'nowrap',
    opacity: disabled ? 0.5 : 1,
    ...sizeStyles[size],
    ...variantBaseStyles[variant],
  };

  if (hovered && !disabled && !loading) {
    if (variant === 'primary') {
      base.background = '#b8960f';
      base.borderColor = '#b8960f';
    } else if (variant === 'secondary') {
      base.background = '#f9fafb';
      base.borderColor = '#d1d5db';
    } else if (variant === 'destructive') {
      base.background = '#ef4444';
      base.color = '#ffffff';
      base.borderColor = '#ef4444';
    } else if (variant === 'ghost') {
      base.background = '#f3f4f6';
      base.color = '#111827';
    } else if (variant === 'outline') {
      base.background = '#f9fafb';
      base.borderColor = '#d1d5db';
    }
  }

  const spinnerSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

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
          icon && <span style={{ display: 'inline-flex', fontSize: '1em' }}>{icon}</span>
        )}
        {children}
      </button>
    </>
  );
};

export default Button;
