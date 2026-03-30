import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'gold';
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, { bg: string; color: string }> = {
  success: { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669' },
  warning: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706' },
  error: { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' },
  info: { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' },
  neutral: { bg: '#f3f4f6', color: '#6b7280' },
  gold: { bg: 'rgba(212, 175, 55, 0.1)', color: '#b8960f' },
};

const statusVariantMap: Record<string, string> = {
  pagado: 'success',
  entregado: 'success',
  activo: 'success',
  posted: 'success',
  authorized: 'success',
  paid: 'success',
  reconciled: 'success',
  completado: 'success',
  pendiente: 'warning',
  draft: 'warning',
  pending: 'warning',
  partial: 'warning',
  'en proceso': 'warning',
  rechazado: 'error',
  cancelado: 'error',
  voided: 'error',
  rejected: 'error',
  enviado: 'info',
  sent: 'info',
  'en camino': 'info',
};

function detectVariant(status: string): string {
  const key = status.toLowerCase().trim();
  return statusVariantMap[key] || 'neutral';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant, size = 'md' }) => {
  const resolvedVariant = variant || detectVariant(status);
  const styles = variantStyles[resolvedVariant] || variantStyles.neutral;
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: isSmall ? '0.1rem 0.45rem' : '0.2rem 0.6rem',
        fontSize: isSmall ? '0.68rem' : '0.72rem',
        fontWeight: 500,
        fontFamily: 'Inter, sans-serif',
        borderRadius: 20,
        backgroundColor: styles.bg,
        color: styles.color,
        whiteSpace: 'nowrap',
        lineHeight: 1.5,
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
