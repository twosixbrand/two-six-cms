import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeMap = {
  sm: 20,
  md: 32,
  lg: 48,
};

const borderWidthMap = {
  sm: 2,
  md: 2.5,
  lg: 3,
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '1rem' }}>
      <style>{keyframes}</style>
      <div
        style={{
          width: dim,
          height: dim,
          border: `${bw}px solid #2a2a35`,
          borderTopColor: '#f0b429',
          borderRadius: '50%',
          animation: 'ts-spinner-rotate 0.7s linear infinite',
        }}
      />
      {text && (
        <span style={{ fontSize: size === 'sm' ? '0.72rem' : '0.8125rem', color: '#a0a0b0', fontFamily: 'Inter, sans-serif' }}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
