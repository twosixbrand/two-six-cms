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
    padding: '0.55rem 2.25rem 0.55rem 2.25rem',
    backgroundColor: '#1a1a24',
    border: focused ? '1px solid #f0b429' : '1px solid #2a2a35',
    borderRadius: 8,
    color: '#f1f1f3',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.8125rem',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    outline: 'none',
    boxShadow: focused ? '0 0 0 2px rgba(240, 180, 41, 0.15), 0 0 12px rgba(240, 180, 41, 0.08)' : 'none',
    height: '40px',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b6b7b',
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
    color: '#6b6b7b',
    borderRadius: '50%',
    transition: 'color 0.15s ease',
    fontSize: '0.8rem',
    fontWeight: 500,
    lineHeight: 1,
    width: 22,
    height: 22,
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
