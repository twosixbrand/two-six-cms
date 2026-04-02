import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'No hay datos',
  description,
  action,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        gap: '0.75rem',
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: '2.5rem',
            color: 'var(--text-secondary, #475569)',
            opacity: 0.5,
            marginBottom: '0.25rem',
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          margin: 0,
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--text-primary, #1e293b)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--text-secondary, #475569)',
            maxWidth: 400,
            lineHeight: 1.5,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: '0.75rem' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;
