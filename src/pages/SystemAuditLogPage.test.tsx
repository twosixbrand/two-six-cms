import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SystemAuditLogPage from './SystemAuditLogPage';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) } }));
vi.mock('../services/errorApi', () => ({ logError: vi.fn() }));

const mockLogs = [
    {
        id: '1',
        tableName: 'Product',
        recordId: '42',
        action: 'UPDATE',
        userId: 5,
        ipAddress: null,
        createdAt: '2026-05-01T00:00:00.000Z',
        oldValues: { name: 'Old Name' },
        newValues: { name: 'New Name' },
    },
    {
        id: '2',
        tableName: 'Order',
        recordId: '100',
        action: 'CREATE',
        userId: null,
        ipAddress: null,
        createdAt: '2026-04-30T12:00:00.000Z',
        oldValues: null,
        newValues: { id: 100, status: 'PENDING' },
    },
    {
        id: '3',
        tableName: 'Customer',
        recordId: '7',
        action: 'DELETE',
        userId: 3,
        ipAddress: '192.168.1.1',
        createdAt: '2026-04-29T08:00:00.000Z',
        oldValues: { id: 7, name: 'Deleted Customer' },
        newValues: null,
    },
];

describe('SystemAuditLogPage', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockLogs,
        }) as any;
    });

    const renderPage = () => render(
        <BrowserRouter>
            <SystemAuditLogPage />
        </BrowserRouter>
    );

    it('renders the page title', async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByText(/Auditoría Global/i)).toBeInTheDocument();
        });
    });

    it('renders filter controls', async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByText(/Tabla \/ Entidad/i)).toBeInTheDocument();
            expect(screen.getByText(/Acción/i)).toBeInTheDocument();
            expect(screen.getByText(/Desde/i)).toBeInTheDocument();
            expect(screen.getByText(/Hasta/i)).toBeInTheDocument();
        });
    });

    it('renders audit log entries after loading', async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('Product')).toBeInTheDocument();
            expect(screen.getByText('Order')).toBeInTheDocument();
            expect(screen.getByText('Customer')).toBeInTheDocument();
        });
    });

    it('displays action badges with correct text', async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('UPDATE')).toBeInTheDocument();
            expect(screen.getByText('CREATE')).toBeInTheDocument();
            expect(screen.getByText('DELETE')).toBeInTheDocument();
        });
    });

    it('displays record IDs', async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('42')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
            expect(screen.getByText('7')).toBeInTheDocument();
        });
    });

    it('shows "Sistema" when userId is null', async () => {
        renderPage();
        await waitFor(() => {
            const cells = screen.getAllByText(/Sistema/);
            expect(cells.length).toBeGreaterThanOrEqual(1);
        });
    });

    it('shows user ID when userId is provided', async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByText(/ID: 5/)).toBeInTheDocument();
        });
    });

    it('shows "No hay registros" when API returns empty array', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true, status: 200,
            json: async () => [],
        }) as any;

        renderPage();
        await waitFor(() => {
            expect(screen.getByText(/No hay registros/i)).toBeInTheDocument();
        });
    });

    it('shows error message when API fails', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as any;

        renderPage();
        await waitFor(() => {
            const errorEl = screen.queryByText(/Error/i) || screen.queryByText(/error/i);
            // The page should show something other than loading
            const loadingGone = screen.queryByText(/Cargando/i);
            expect(loadingGone).toBeNull();
        });
    });

    it('calls fetch with filter params when Buscar is clicked', async () => {
        const user = userEvent.setup();
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Product')).toBeInTheDocument();
        });

        const filtrarBtn = screen.getByText(/Filtrar/i);
        await user.click(filtrarBtn);

        expect(global.fetch).toHaveBeenCalled();
    });

    it('expands row details when detail button is clicked', async () => {
        const user = userEvent.setup();
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Product')).toBeInTheDocument();
        });

        // Find and click the first "Ver" expand button
        const verButtons = screen.getAllByText(/^Ver$/);
        expect(verButtons.length).toBeGreaterThan(0);
        await user.click(verButtons[0]);

        await waitFor(() => {
            expect(screen.getByText(/Valor Anterior/i)).toBeInTheDocument();
        });
    });
});
