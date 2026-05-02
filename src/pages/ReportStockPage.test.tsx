import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportStockPage from './ReportStockPage';
import * as clothingSizeApi from '../services/clothingSizeApi';

vi.mock('../services/clothingSizeApi');
vi.mock('../services/errorApi');

const mockInventory = [
  {
    id: 1,
    quantity_available: 10,
    quantity_produced: 20,
    quantity_sold: 10,
    clothingColor: {
      design: {
        reference: 'REF-001',
        clothing: { name: 'Camiseta' }
      },
      color: { name: 'Rojo' }
    },
    size: { name: 'M' }
  },
  {
    id: 2,
    quantity_available: 5,
    quantity_produced: 10,
    quantity_sold: 5,
    clothingColor: {
      design: {
        reference: 'REF-002',
        clothing: { name: 'Pantalón' }
      },
      color: { name: 'Azul' }
    },
    size: { name: 'L' }
  }
];

describe('ReportStockPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (clothingSizeApi.getClothingSizes as any).mockResolvedValue(mockInventory);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ReportStockPage />
      </BrowserRouter>,
    );

  it('renders stock report with KPI cards', async () => {
    renderPage();
    
    // Check KPIs using class selector to avoid ambiguity
    await waitFor(() => {
      const kpis = document.querySelectorAll('.kpi-value');
      expect(kpis[0].textContent).toBe('15'); // Total available
      expect(kpis[1].textContent).toBe('2');  // Total designs
      expect(kpis[2].textContent).toBe('2');  // Total variants
    });
  });

  it('renders data tables correctly', async () => {
    renderPage();
    await screen.findAllByText('REF-001'); // Wait for any occurrence
    
    // Design Summary Table (Specific search)
    expect(screen.getAllByText('Camiseta')).toHaveLength(2); // One in each table
    expect(screen.getAllByText('Pantalón')).toHaveLength(2);
    
    // Variant Detail Table
    expect(screen.getByText('Rojo / M')).toBeInTheDocument();
    expect(screen.getByText('Azul / L')).toBeInTheDocument();
  });

  it('filters report by search term', async () => {
    renderPage();
    await screen.findAllByText('REF-001');
    
    const searchInput = screen.getByPlaceholderText(/Buscar por referencia/i);
    fireEvent.change(searchInput, { target: { value: 'Camiseta' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Pantalón')).not.toBeInTheDocument();
      expect(screen.getAllByText('Camiseta')).not.toHaveLength(0);
    });
    
    // Search by color
    fireEvent.change(searchInput, { target: { value: 'Azul' } });
    await waitFor(() => {
      expect(screen.queryByText('Camiseta')).not.toBeInTheDocument();
      expect(screen.getAllByText('Pantalón')).not.toHaveLength(0);
    });
  });

  it('handles empty inventory gracefully', async () => {
    (clothingSizeApi.getClothingSizes as any).mockResolvedValue([]);
    renderPage();
    
    await waitFor(() => {
      const kpis = document.querySelectorAll('.kpi-value');
      expect(kpis[0].textContent).toBe('0');
    });
    // Check DataTable empty message
    expect(screen.getAllByText(/No hay datos disponibles/i)).not.toHaveLength(0);
  });

  it('handles API errors', async () => {
    (clothingSizeApi.getClothingSizes as any).mockRejectedValue(new Error('Fetch Error'));
    renderPage();
    
    expect(await screen.findByText(/Error al obtener datos/i)).toBeInTheDocument();
  });
});
