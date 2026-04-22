import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline' | 'edit' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const isTouchDevice = typeof window !== 'undefined' && window.innerWidth < 640;

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '0.35rem 0.7rem', fontSize: '0.75rem', minHeight: isTouchDevice ? 44 : undefined },
  md: { padding: '0.5rem 1rem', fontSize: '0.8125rem', minHeight: 44 },
  lg: { padding: '0.65rem 1.5rem', fontSize: '0.875rem', minHeight: 44 },
};

// Nota: usamos longhand (borderWidth/borderStyle/borderColor) en vez del
// shorthand `border` para poder mutar sólo borderColor en hover sin que
// React nos advierta por mezclar shorthand y longhand en el mismo elemento.
const variantBaseStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: '#f0b429',
    color: '#0a0a0f',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#f0b429',
  },
  secondary: {
    background: 'transparent',
    color: '#f1f1f3',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#2a2a35',
  },
  destructive: {
    background: 'rgba(248, 113, 113, 0.1)',
    color: '#f87171',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  ghost: {
    background: 'transparent',
    color: '#a0a0b0',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  outline: {
    background: 'transparent',
    color: '#f0b429',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#2a2a35',
  },
  edit: {
    background: 'rgba(240, 180, 41, 0.1)',
    color: '#f0b429',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(240, 180, 41, 0.2)',
  },
  info: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#60a5fa',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(59, 130, 246, 0.2)',
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
      base.background = '#d99e1e';
      base.borderColor = '#d99e1e';
      base.boxShadow = '0 0 16px rgba(240, 180, 41, 0.25)';
    } else if (variant === 'secondary') {
      base.background = 'rgba(255, 255, 255, 0.05)';
      base.borderColor = '#3a3a48';
    } else if (variant === 'destructive') {
      base.background = '#f87171';
      base.color = '#ffffff';
      base.borderColor = '#f87171';
      base.boxShadow = '0 0 12px rgba(248, 113, 113, 0.3)';
    } else if (variant === 'ghost') {
      base.background = 'rgba(255, 255, 255, 0.06)';
      base.color = '#f1f1f3';
    } else if (variant === 'outline') {
      base.background = 'rgba(240, 180, 41, 0.08)';
      base.borderColor = 'rgba(240, 180, 41, 0.3)';
    } else if (variant === 'info') {
      base.background = '#3b82f6';
      base.color = '#ffffff';
      base.borderColor = '#3b82f6';
      base.boxShadow = '0 0 12px rgba(59, 130, 246, 0.3)';
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
