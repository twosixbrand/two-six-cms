import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from './Modal';

describe('Modal', () => {
    it('renders nothing when closed', () => {
        const { container } = render(
            <Modal isOpen={false} onClose={vi.fn()} title="Test">
                <p>Content</p>
            </Modal>
        );
        expect(container.innerHTML).toBe('');
    });

    it('renders title and children when open', () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()} title="My Modal">
                <p>Body content</p>
            </Modal>
        );
        expect(screen.getByText('My Modal')).toBeInTheDocument();
        expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('renders footer when provided', () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()} title="T" footer={<button>Save</button>}>
                <p>B</p>
            </Modal>
        );
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={onClose} title="Close Me">
                <p>B</p>
            </Modal>
        );
        const closeBtn = screen.getByLabelText('Cerrar');
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalled();
    });
});
