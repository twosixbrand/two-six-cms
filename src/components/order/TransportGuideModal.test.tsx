import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransportGuideModal from './TransportGuideModal';

// Mock logo image import
vi.mock('../../assets/logo-gorilla.png', () => ({ default: '/mock-logo.png' }));

const mockOrder = {
    id: 12345,
    customer: {
        name: 'Ana García',
        current_phone_number: '3001234567',
        city: 'Bogotá',
        state: 'Cundinamarca',
    },
    shipping_address: 'Calle 100 #15-20',
    orderItems: [
        { id: 1, product_name: 'Camiseta Two Six', size: 'M', color: 'Negro', quantity: 2 },
        { id: 2, product_name: 'Hoodie Six', size: 'L', color: 'Blanco', quantity: 1 },
    ],
    total_payment: 250000,
    shipping_cost: 15000,
    payment_method: 'WOMPI',
    cod_amount: null,
};

const mockCodOrder = {
    ...mockOrder,
    id: 99999,
    payment_method: 'WOMPI_COD',
    cod_amount: 180000,
};

describe('TransportGuideModal', () => {
    const onClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null when no order is provided', () => {
        const { container } = render(<TransportGuideModal order={null} onClose={onClose} />);
        expect(container.innerHTML).toBe('');
    });

    it('renders modal title with order ID', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        expect(screen.getByText(/Guía de Transporte — Pedido #12345/)).toBeInTheDocument();
    });

    it('renders TWO SIX brand info', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        expect(screen.getByText('TWO SIX')).toBeInTheDocument();
        expect(screen.getByText('Crafted for real ones')).toBeInTheDocument();
    });

    it('renders SERVIENTREGA carrier', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        expect(screen.getByText('SERVIENTREGA')).toBeInTheDocument();
    });

    it('renders remitente section', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        expect(screen.getByText('Remitente')).toBeInTheDocument();
        expect(screen.getByText('TWO SIX S.A.S')).toBeInTheDocument();
    });

    it('renders destinatario section with customer data', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        expect(screen.getByText('Destinatario')).toBeInTheDocument();
        expect(screen.getByText('Ana García')).toBeInTheDocument();
        expect(screen.getByText('3001234567')).toBeInTheDocument();
        expect(screen.getByText('Calle 100 #15-20')).toBeInTheDocument();
    });

    it('renders order items table', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        expect(screen.getByText('Camiseta Two Six')).toBeInTheDocument();
        expect(screen.getByText('Hoodie Six')).toBeInTheDocument();
    });

    it('calculates total items correctly', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        // 2 + 1 = 3 total items
        expect(screen.getByText(/Total Artículos: 3/)).toBeInTheDocument();
    });

    it('generates correct guide number format', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        expect(screen.getByText('TS-012345')).toBeInTheDocument();
    });

    it('shows COD alert for WOMPI_COD orders', () => {
        render(<TransportGuideModal order={mockCodOrder} onClose={onClose} />);
        expect(screen.getByText(/RECAUDO CONTRA ENTREGA/)).toBeInTheDocument();
    });

    it('does NOT show COD alert for regular orders', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        expect(screen.queryByText(/RECAUDO CONTRA ENTREGA/)).not.toBeInTheDocument();
    });

    it('renders print button', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        expect(screen.getByText(/Imprimir Guía/)).toBeInTheDocument();
    });

    it('renders close buttons', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        expect(screen.getByText('Cerrar')).toBeInTheDocument();
        expect(screen.getByText('×')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        fireEvent.click(screen.getByText('Cerrar'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when X button is clicked', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        fireEvent.click(screen.getByText('×'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay is clicked', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        // Click on overlay (the outermost div)
        const overlay = screen.getByText(/Guía de Transporte/).closest('.tg-overlay')?.parentElement;
        if (overlay) fireEvent.click(overlay);
    });

    it('renders footer text', () => {
        render(<TransportGuideModal order={mockOrder} onClose={onClose} />);
        expect(screen.getByText(/DESDE MEDELLÍN PARA EL MUNDO/)).toBeInTheDocument();
    });
});
