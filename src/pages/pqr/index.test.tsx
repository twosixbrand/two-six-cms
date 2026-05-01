import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/pqr/pqr.service', () => ({
    PqrService: {
        getAllPqrs: vi.fn(),
        updatePqrStatus: vi.fn(),
    },
}));
vi.mock('sweetalert2', () => ({
    default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) },
}));
vi.mock('../../services/errorApi', () => ({ logError: vi.fn() }));

import PqrManagementPage from './index';
import { PqrService } from '../../services/pqr/pqr.service';
import Swal from 'sweetalert2';

const mockPqrs = [
    {
        id: 1, radicado: 'PQR-000001', customer_name: 'Juan', customer_id: '1234',
        type: 'Queja', status: 'Abierto', description: 'Producto defectuoso',
        createdAt: '2026-04-01T00:00:00Z', daysOpen: 5, slaStatus: 'A TIEMPO',
        customer_email: 'juan@test.com', observation: '', images: [],
    },
    {
        id: 2, radicado: 'PQR-000002', customer_name: 'Maria', customer_id: '5678',
        type: 'Reclamo', status: 'En Revisión', description: 'Talla incorrecta',
        createdAt: '2026-03-15T00:00:00Z', daysOpen: 20, slaStatus: 'EN RIESGO',
        customer_email: 'maria@test.com', observation: 'Se revisó',
        images: [{ id: 1, image_url: 'https://test.com/img.jpg' }],
    },
    {
        id: 3, radicado: 'PQR-000003', customer_name: 'Carlos', customer_id: '9012',
        type: 'Petición', status: 'Resuelto', description: 'Solicitud factura',
        createdAt: '2026-02-01T00:00:00Z', daysOpen: 0, slaStatus: 'VENCIDO',
        customer_email: 'carlos@test.com', observation: 'Resuelto OK', images: [],
    },
];

describe('PqrManagementPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (PqrService.getAllPqrs as any).mockResolvedValue(mockPqrs);
        (PqrService.updatePqrStatus as any).mockResolvedValue({});
    });

    const renderPage = () => render(
        <BrowserRouter><PqrManagementPage /></BrowserRouter>
    );

    it('renders page title', async () => {
        renderPage();
        expect(screen.getByText(/Gestión de Casos PQR/i)).toBeInTheDocument();
    });

    it('shows loading spinner initially', () => {
        (PqrService.getAllPqrs as any).mockImplementation(() => new Promise(() => {}));
        renderPage();
        expect(screen.getByText('Cargando Casos...')).toBeInTheDocument();
    });

    it('displays PQR cards after loading', async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('PQR-000001')).toBeInTheDocument();
            expect(screen.getByText('PQR-000002')).toBeInTheDocument();
            expect(screen.getByText('PQR-000003')).toBeInTheDocument();
        });
    });

    it('shows customer names on cards', async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('Juan')).toBeInTheDocument();
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });
    });

    it('shows days open badge for non-resolved PQRs', async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('5 días')).toBeInTheDocument();
            expect(screen.getByText('20 días')).toBeInTheDocument();
        });
    });

    it('shows error toast when API fails', async () => {
        (PqrService.getAllPqrs as any).mockRejectedValue(new Error('fail'));
        renderPage();
        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudieron cargar las PQRs', 'error');
        });
    });

    it('shows empty message when no PQRs exist', async () => {
        (PqrService.getAllPqrs as any).mockResolvedValue([]);
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('No hay PQRs radicadas en este momento.')).toBeInTheDocument();
        });
    });

    it('opens detail modal when card is clicked', async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('PQR-000001')).toBeInTheDocument();
        });

        await user.click(screen.getByText('PQR-000001'));
        await waitFor(() => {
            expect(screen.getByText('Producto defectuoso')).toBeInTheDocument();
            expect(screen.getByText('juan@test.com')).toBeInTheDocument();
        });
    });

    it('filters PQRs by search term', async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('PQR-000001')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/Buscar por radicado/i);
        fireEvent.change(searchInput, { target: { value: 'Maria' } });

        await waitFor(() => {
            expect(screen.queryByText('PQR-000001')).not.toBeInTheDocument();
            expect(screen.getByText('PQR-000002')).toBeInTheDocument();
        });
    });

    it('shows "no results" when search yields nothing', async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('PQR-000001')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/Buscar por radicado/i);
        fireEvent.change(searchInput, { target: { value: 'ZZZZZZZ' } });

        await waitFor(() => {
            expect(screen.getByText('No se encontraron resultados para la búsqueda.')).toBeInTheDocument();
        });
    });

    it('shows image evidence in modal for PQR with images', async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('PQR-000002')).toBeInTheDocument();
        });

        await user.click(screen.getByText('PQR-000002'));
        await waitFor(() => {
            expect(screen.getByText(/Evidencia/i)).toBeInTheDocument();
            expect(screen.getByAltText('Evidencia PQR')).toBeInTheDocument();
        });
    });

    it('calls updatePqrStatus when "Guardar Gestión" is clicked', async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('PQR-000001')).toBeInTheDocument();
        });

        await user.click(screen.getByText('PQR-000001'));
        await waitFor(() => {
            expect(screen.getByText('Guardar Gestión')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Guardar Gestión'));
        await waitFor(() => {
            expect(PqrService.updatePqrStatus).toHaveBeenCalledWith(1, 'Abierto', '');
        });
    });

    it('closes modal when "Cerrar" is clicked', async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('PQR-000001')).toBeInTheDocument();
        });

        await user.click(screen.getByText('PQR-000001'));
        await waitFor(() => {
            expect(screen.getByText('Cerrar')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Cerrar'));
        // After closing, the description should not be visible
        await waitFor(() => {
            expect(screen.queryByText('Producto defectuoso')).not.toBeInTheDocument();
        });
    });
});
