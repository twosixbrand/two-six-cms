import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'gold';
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, { bg: string; color: string }> = {
  success: { bg: '#0d3b2e', color: '#34d399' },
  warning: { bg: '#3b2f0a', color: '#fbbf24' },
  error: { bg: '#3b1515', color: '#f87171' },
  info: { bg: '#1a2744', color: '#60a5fa' },
  neutral: { bg: '#1f1f2a', color: '#a0a0b0' },
  gold: { bg: 'rgba(240, 180, 41, 0.12)', color: '#f0b429' },
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
