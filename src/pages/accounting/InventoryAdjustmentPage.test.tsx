import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InventoryAdjustmentPage from './InventoryAdjustmentPage';
import * as inventoryApi from '../../services/inventoryApi';
import Swal from 'sweetalert2';

// Mock the API
vi.mock('../../services/inventoryApi', () => ({
  getAdjustments: vi.fn(),
  createAdjustment: vi.fn(),
}));

// Mock Swal
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockAdjustments = [
  { id: 1, reason: 'MERMA', description: 'Producto dañado', items: [{}], status: 'PROCESSED', adjustment_date: '2024-05-01' }
];

describe('InventoryAdjustmentPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (inventoryApi.getAdjustments as any).mockResolvedValue(mockAdjustments);
  });

  it('renders correctly and loads data', async () => {
    render(<InventoryAdjustmentPage />);
    expect(screen.getByText('Ajustes de Inventario')).toBeInTheDocument();
    await waitFor(() => {
      expect(inventoryApi.getAdjustments).toHaveBeenCalled();
    });
    expect(screen.getByText('Producto dañado')).toBeInTheDocument();
  });

  it('opens and closes the modal', async () => {
    render(<InventoryAdjustmentPage />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument()); // Wait for spinner
    
    const openBtn = screen.getByText('Nuevo Ajuste');
    fireEvent.click(openBtn);
    
    expect(screen.getByText('Crear Ajuste de Inventario')).toBeInTheDocument();
    
    const cancelBtn = screen.getByText('Cancelar');
    fireEvent.click(cancelBtn);
    
    await waitFor(() => {
      expect(screen.queryByText('Crear Ajuste de Inventario')).not.toBeInTheDocument();
    });
  });

  it('allows adding and removing items in the form', async () => {
    render(<InventoryAdjustmentPage />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByText('Nuevo Ajuste'));
    await screen.findByText('Crear Ajuste de Inventario');

    // Initially 1 item
    expect(screen.getAllByPlaceholderText(/ID de Producto/i)).toHaveLength(1);

    const addBtn = screen.getByText('Añadir otro producto');
    fireEvent.click(addBtn);

    // Now 2 items
    expect(screen.getAllByPlaceholderText(/ID de Producto/i)).toHaveLength(2);
  });

  it('submits correctly', async () => {
    (inventoryApi.createAdjustment as any).mockResolvedValue({ success: true });
    render(<InventoryAdjustmentPage />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    
    act(() => {
      fireEvent.click(screen.getByText('Nuevo Ajuste'));
    });

    fireEvent.change(await screen.findByPlaceholderText(/ID de Producto/i), { target: { value: '123' } });
    fireEvent.change(await screen.findByPlaceholderText(/Cantidad/i), { target: { value: '5' } });
    fireEvent.change(await screen.findByPlaceholderText(/Ej: Influencer/i), { target: { value: 'Ajuste de prueba' } });

    act(() => {
      fireEvent.click(screen.getByText('Procesar Ajuste'));
    });

    await waitFor(() => {
      expect(inventoryApi.createAdjustment).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Ajuste de prueba',
        items: [{ clothingSizeId: 123, quantity: 5 }]
      }));
    });

    expect(Swal.fire).toHaveBeenCalledWith('Éxito', expect.any(String), 'success');
  });

  it('handles errors on submit', async () => {
    (inventoryApi.createAdjustment as any).mockRejectedValue(new Error('API Error'));
    render(<InventoryAdjustmentPage />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    
    act(() => {
      fireEvent.click(screen.getByText('Nuevo Ajuste'));
    });
    
    fireEvent.change(await screen.findByPlaceholderText(/ID de Producto/i), { target: { value: '123' } });
    
    act(() => {
      fireEvent.click(screen.getByText('Procesar Ajuste'));
    });

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith('Error', expect.any(String), 'error');
    });
  });
});
