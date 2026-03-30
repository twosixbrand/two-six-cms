import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const variantConfig: Record<string, { color: string; bg: string; icon: string }> = {
  danger: { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', icon: '!' },
  warning: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', icon: '!' },
  info: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', icon: 'i' },
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}) => {
  const config = variantConfig[variant] || variantConfig.danger;

  const footer = (
    <>
      <Button variant="ghost" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button
        variant={variant === 'danger' ? 'destructive' : 'primary'}
        onClick={onConfirm}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm" footer={footer}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div
          style={{
            width: 36,
            height: 36,
            minWidth: 36,
            borderRadius: '50%',
            backgroundColor: config.bg,
            color: config.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {config.icon}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: '#a0a0b0',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
