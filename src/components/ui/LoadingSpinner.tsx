import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 64,
};

const borderWidthMap = {
  sm: 2,
  md: 3,
  lg: 4,
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const dim = sizeMap[size];
  const bw = borderWidthMap[size];

  const keyframes = `
    @keyframes ts-spinner-rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem' }}>
      <style>{keyframes}</style>
      <div
        style={{
          width: dim,
          height: dim,
          border: `${bw}px solid rgba(212, 175, 55, 0.15)`,
          borderTopColor: '#d4af37',
          borderRadius: '50%',
          animation: 'ts-spinner-rotate 0.8s linear infinite',
        }}
      />
      {text && (
        <span style={{ fontSize: size === 'sm' ? '0.75rem' : '0.875rem', color: 'var(--text-secondary, #475569)', fontFamily: 'Inter, sans-serif' }}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
