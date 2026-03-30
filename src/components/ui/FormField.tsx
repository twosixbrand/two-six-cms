import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'number' | 'password' | 'tel' | 'date' | 'select' | 'textarea';
  value: any;
  onChange: (e: any) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  disabled?: boolean;
  rows?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  options = [],
  disabled = false,
  rows = 4,
}) => {
  const [focused, setFocused] = React.useState(false);

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary, #475569)',
    marginBottom: '0.3rem',
    display: 'block',
    fontFamily: 'Inter, sans-serif',
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem 1rem',
    backgroundColor: focused ? 'rgba(255,255,255,0.8)' : disabled ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: error
      ? '1px solid #ef4444'
      : focused
        ? '1px solid #d4af37'
        : '1px solid rgba(0,0,0,0.08)',
    borderRadius: 12,
    color: disabled ? 'var(--text-secondary, #475569)' : 'var(--text-primary, #1e293b)',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: focused
      ? error
        ? '0 0 0 3px rgba(239,68,68,0.15)'
        : '0 0 0 3px rgba(212,175,55,0.15), inset 0 2px 4px rgba(0,0,0,0.01)'
      : 'inset 0 2px 4px rgba(0,0,0,0.02)',
    cursor: disabled ? 'not-allowed' : undefined,
    boxSizing: 'border-box' as const,
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '0.3rem',
    fontFamily: 'Inter, sans-serif',
  };

  const focusProps = {
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };

  let input: React.ReactNode;

  if (type === 'select') {
    input = (
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={inputBase}
        {...focusProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  } else if (type === 'textarea') {
    input = (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        style={{ ...inputBase, resize: 'vertical' }}
        {...focusProps}
      />
    );
  } else {
    input = (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        style={inputBase}
        {...focusProps}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <label htmlFor={name} style={labelStyle}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      {input}
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
};

export default FormField;
