import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
}) => {
  const [internal, setInternal] = useState(value);
  const [focused, setFocused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes
  useEffect(() => {
    setInternal(value);
  }, [value]);

  const debouncedOnChange = useCallback(
    (val: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onChange(val), 300);
    },
    [onChange],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInternal(v);
    debouncedOnChange(v);
  };

  const handleClear = () => {
    setInternal('');
    onChange('');
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.7rem 2.5rem 0.7rem 2.5rem',
    backgroundColor: focused ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: focused ? '1px solid #d4af37' : '1px solid rgba(0,0,0,0.08)',
    borderRadius: 12,
    color: 'var(--text-primary, #1e293b)',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: focused
      ? '0 0 0 3px rgba(212,175,55,0.15), inset 0 2px 4px rgba(0,0,0,0.01)'
      : 'inset 0 2px 4px rgba(0,0,0,0.02)',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-secondary, #475569)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  };

  const clearStyle: React.CSSProperties = {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary, #475569)',
    borderRadius: '50%',
    transition: 'color 0.2s ease',
    fontSize: '0.85rem',
    fontWeight: 700,
    lineHeight: 1,
    width: 24,
    height: 24,
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <input
        type="text"
        value={internal}
        onChange={handleChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={inputStyle}
      />
      {internal && (
        <button
          type="button"
          onClick={handleClear}
          style={clearStyle}
          aria-label="Limpiar busqueda"
        >
          &#x2715;
        </button>
      )}
    </div>
  );
};

export default SearchInput;
