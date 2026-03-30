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
  danger: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: '!' },
  warning: { color: '#d97706', bg: 'rgba(245, 158, 11, 0.1)', icon: '!' },
  info: { color: '#2563eb', bg: 'rgba(59, 130, 246, 0.1)', icon: 'i' },
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
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div
          style={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: '50%',
            backgroundColor: config.bg,
            color: config.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {config.icon}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '0.925rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary, #475569)',
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
