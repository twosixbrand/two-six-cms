import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'gold';
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, { bg: string; color: string; border: string }> = {
  success: { bg: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: 'rgba(34, 197, 94, 0.25)' },
  warning: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: 'rgba(245, 158, 11, 0.25)' },
  error: { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: 'rgba(239, 68, 68, 0.25)' },
  info: { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: 'rgba(59, 130, 246, 0.25)' },
  neutral: { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', border: 'rgba(100, 116, 139, 0.25)' },
  gold: { bg: 'rgba(212, 175, 55, 0.12)', color: '#b8860b', border: 'rgba(212, 175, 55, 0.3)' },
};

const statusVariantMap: Record<string, string> = {
  // Success
  pagado: 'success',
  entregado: 'success',
  activo: 'success',
  posted: 'success',
  authorized: 'success',
  paid: 'success',
  reconciled: 'success',
  completado: 'success',
  // Warning
  pendiente: 'warning',
  draft: 'warning',
  pending: 'warning',
  partial: 'warning',
  'en proceso': 'warning',
  // Error
  rechazado: 'error',
  cancelado: 'error',
  voided: 'error',
  rejected: 'error',
  // Info
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
        padding: isSmall ? '0.15rem 0.5rem' : '0.25rem 0.75rem',
        fontSize: isSmall ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        borderRadius: 20,
        backgroundColor: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.5,
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
