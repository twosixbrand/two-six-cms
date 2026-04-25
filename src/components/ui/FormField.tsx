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
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#a0a0b0',
    marginBottom: '0.3rem',
    display: 'block',
    fontFamily: 'Inter, sans-serif',
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '0.55rem 0.75rem',
    backgroundColor: disabled ? '#12121a' : '#1a1a24',
    border: error
      ? '1px solid #f87171'
      : focused
        ? '1px solid #f0b429'
        : '1px solid #2a2a35',
    borderRadius: 8,
    color: disabled ? '#6b6b7b' : '#f1f1f3',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    outline: 'none',
    boxShadow: focused
      ? error
        ? '0 0 0 2px rgba(248, 113, 113, 0.15)'
        : '0 0 0 2px rgba(240, 180, 41, 0.15), 0 0 12px rgba(240, 180, 41, 0.08)'
      : 'none',
    cursor: disabled ? 'not-allowed' : undefined,
    boxSizing: 'border-box' as const,
    height: type !== 'textarea' ? '40px' : undefined,
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#f87171',
    marginTop: '0.25rem',
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
        id={name}
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
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        style={{ ...inputBase, resize: 'vertical', minHeight: '80px' }}
        {...focusProps}
      />
    );
  } else if (type === 'date') {
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Strip everything except digits and dashes
      const digits = raw.replace(/[^0-9]/g, '');

      // Build formatted value: YYYY-MM-DD from raw digits
      let formatted = '';
      for (let i = 0; i < digits.length && i < 8; i++) {
        if (i === 4 || i === 6) formatted += '-';
        formatted += digits[i];
      }

      // Emit a synthetic event-like object so callers work the same way
      onChange({ target: { name, value: formatted } } as any);
    };

    input = (
      <input
        id={name}
        type="text"
        name={name}
        value={value}
        onChange={handleDateChange}
        disabled={disabled}
        placeholder={placeholder || 'YYYY-MM-DD'}
        pattern="\d{4}-\d{2}-\d{2}"
        maxLength={10}
        inputMode="numeric"
        style={inputBase}
        {...focusProps}
      />
    );
  } else {
    input = (
      <input
        id={name}
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
        {required && <span style={{ color: '#f87171', marginLeft: 2 }}>*</span>}
      </label>
      {input}
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
};

export default FormField;
