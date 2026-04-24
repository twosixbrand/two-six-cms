import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
    it('renders nothing when closed', () => {
        const { container } = render(
            <ConfirmDialog isOpen={false} onConfirm={vi.fn()} onCancel={vi.fn()} title="Delete" message="Sure?" />
        );
        expect(container.innerHTML).toBe('');
    });

    it('renders title and message when open', () => {
        render(
            <ConfirmDialog isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} title="Delete Item" message="Are you sure?" />
        );
        expect(screen.getByText('Delete Item')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('renders default confirm/cancel text', () => {
        render(
            <ConfirmDialog isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} title="T" message="M" />
        );
        expect(screen.getByText('Confirmar')).toBeInTheDocument();
        expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button clicked', () => {
        const onConfirm = vi.fn();
        render(
            <ConfirmDialog isOpen={true} onConfirm={onConfirm} onCancel={vi.fn()} title="T" message="M" />
        );
        fireEvent.click(screen.getByText('Confirmar'));
        expect(onConfirm).toHaveBeenCalled();
    });

    it('calls onCancel when cancel button clicked', () => {
        const onCancel = vi.fn();
        render(
            <ConfirmDialog isOpen={true} onConfirm={vi.fn()} onCancel={onCancel} title="T" message="M" />
        );
        fireEvent.click(screen.getByText('Cancelar'));
        expect(onCancel).toHaveBeenCalled();
    });

    it('renders custom button text', () => {
        render(
            <ConfirmDialog isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} title="T" message="M" confirmText="Sí, eliminar" cancelText="No" />
        );
        expect(screen.getByText('Sí, eliminar')).toBeInTheDocument();
        expect(screen.getByText('No')).toBeInTheDocument();
    });
});
