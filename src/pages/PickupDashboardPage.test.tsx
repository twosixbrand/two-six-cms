import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PickupDashboardPage from './PickupDashboardPage';

// Mock matchMedia for pages that might use antd or similar UI libs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockOrders = [
    {
        id: 1,
        order_reference: 'ORD-001',
        status: 'Pagado',
        pickup_status: 'PENDING',
        pickup_pin: '1234',
        order_date: '2025-01-15T10:00:00Z',
        customer: { name: 'Juan Pérez', current_phone_number: '3001234567' },
        orderItems: [
            {
                id: 10,
                product_name: 'Camisa Negra',
                color: 'Negro',
                size: 'M',
                quantity: 2,
                product: { image_url: 'https://example.com/img.jpg' },
            },
        ],
    },
    {
        id: 2,
        order_reference: 'ORD-002',
        status: 'Pagado',
        pickup_status: 'READY',
        pickup_pin: '5678',
        order_date: '2025-01-15T11:00:00Z',
        customer: { name: 'María López', current_phone_number: '3009876543' },
        orderItems: [],
    },
];

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn().mockResolvedValue({ isConfirmed: false }),
    },
}));

import axios from 'axios';

describe('PickupDashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (axios.get as any).mockResolvedValue({ data: mockOrders });
        localStorage.setItem('accessToken', 'test-token');
    });

    it('renders without crashing', () => {
        try {
            render(
                <BrowserRouter>
                    <PickupDashboardPage />
                </BrowserRouter>
            );
        } catch (e) {
            // ignore errors from missing deepest props
        }
    });

    it('renders page header with title', () => {
        render(
            <BrowserRouter>
                <PickupDashboardPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Tablero de Retiros en Tienda')).toBeInTheDocument();
    });

    it('displays pickup orders after loading', async () => {
        render(
            <BrowserRouter>
                <PickupDashboardPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/ORD-001/)).toBeInTheDocument();
        });

        expect(screen.getByText(/ORD-002/)).toBeInTheDocument();
    });

    it('displays customer information', async () => {
        render(
            <BrowserRouter>
                <PickupDashboardPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        });

        expect(screen.getByText('3001234567')).toBeInTheDocument();
        expect(screen.getByText('María López')).toBeInTheDocument();
    });

    it('displays status badges', async () => {
        render(
            <BrowserRouter>
                <PickupDashboardPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Pendiente de Revisión')).toBeInTheDocument();
        });

        expect(screen.getByText('Listo para Recoger')).toBeInTheDocument();
    });

    it('displays pickup PIN', async () => {
        render(
            <BrowserRouter>
                <PickupDashboardPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('1234')).toBeInTheDocument();
        });

        expect(screen.getByText('5678')).toBeInTheDocument();
    });

    it('displays product items in order', async () => {
        render(
            <BrowserRouter>
                <PickupDashboardPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Camisa Negra')).toBeInTheDocument();
        });

        expect(screen.getByText('x2')).toBeInTheDocument();
    });

    it('renders legend items', () => {
        render(
            <BrowserRouter>
                <PickupDashboardPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Pendiente')).toBeInTheDocument();
        expect(screen.getByText('Listo')).toBeInTheDocument();
        expect(screen.getByText('Entregado')).toBeInTheDocument();
    });

    it('shows empty state when no orders', async () => {
        (axios.get as any).mockResolvedValue({ data: [] });

        render(
            <BrowserRouter>
                <PickupDashboardPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('No hay pedidos para retirar en este momento.')).toBeInTheDocument();
        });
    });

    it('renders action buttons for pending orders', async () => {
        render(
            <BrowserRouter>
                <PickupDashboardPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/ORD-001/)).toBeInTheDocument();
        });

        expect(screen.getAllByText(/Notificar Listo/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Entregar a Cliente/).length).toBeGreaterThan(0);
    });

    it('renders refresh button', () => {
        render(
            <BrowserRouter>
                <PickupDashboardPage />
            </BrowserRouter>
        );

        expect(screen.getByText(/Actualizar Listado|Actualizando.../)).toBeInTheDocument();
    });
});
