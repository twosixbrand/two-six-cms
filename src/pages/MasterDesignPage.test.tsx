import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MasterDesignPage from './MasterDesignPage';
import * as masterDesignApi from '../services/masterDesignApi';
import * as clothingApi from '../services/clothingApi';
import * as collectionApi from '../services/collectionApi';
import * as tagApi from '../services/tagApi';
import Swal from 'sweetalert2';

vi.mock('../services/masterDesignApi');
vi.mock('../services/clothingApi');
vi.mock('../services/collectionApi');
vi.mock('../services/tagApi');
vi.mock('../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockClothings = [
  { id: 1, name: 'Camiseta' },
  { id: 2, name: 'Pantalón' }
];
const mockCollections = [{ id: 1, name: 'Summer 2023' }];
const mockTags = [{ id: 1, name: 'Algodón' }, { id: 2, name: 'Premium' }];

const mockDesigns = [
  {
    id: 101,
    reference: 'REF-001',
    manufactured_cost: 25000,
    id_clothing: 1,
    id_collection: 1,
    clothing: { name: 'Camiseta', gender: { name: 'Masculino' } },
    collection: { name: 'Summer 2023' },
    designTags: [{ id_tag: 1, tag: { name: 'Algodón' } }],
    designProviders: [{ provider: { id: 501, company_name: 'Provider A' } }],
    image_url: 'http://example.com/img.jpg',
    updatedAt: '2023-01-01T10:00:00Z',
  },
];

describe('MasterDesignPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (masterDesignApi.getMasterDesigns as any).mockResolvedValue(mockDesigns);
    (clothingApi.getClothing as any).mockResolvedValue(mockClothings);
    (collectionApi.getCollections as any).mockResolvedValue(mockCollections);
    (tagApi.getTags as any).mockResolvedValue(mockTags);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <MasterDesignPage />
      </BrowserRouter>,
    );

  it('renders list of master designs', async () => {
    renderPage();
    expect(await screen.findByText('REF-001')).toBeInTheDocument();
    expect(screen.getByText('Camiseta')).toBeInTheDocument();
    expect(screen.getByText('Summer 2023')).toBeInTheDocument();
    expect(screen.getByText('Algodón')).toBeInTheDocument();
  });

  it('filters by search term', async () => {
    renderPage();
    await screen.findByText('REF-001');
    
    const searchInput = screen.getByPlaceholderText(/Buscar por referencia/i);
    fireEvent.change(searchInput, { target: { value: 'Inexistente' } });
    
    await waitFor(() => {
      expect(screen.queryByText('REF-001')).not.toBeInTheDocument();
      expect(screen.getByText(/No hay diseños maestros registrados/i)).toBeInTheDocument();
    });
  });

  it('allows creating a new design', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('REF-001');
    
    await user.click(screen.getByRole('button', { name: /Crear Diseño/i }));
    
    const modal = await screen.findByRole('dialog');
    
    // Clothing 1 is already used in mockDesigns, so only Clothing 2 is available
    await user.selectOptions(within(modal).getByLabelText(/Prenda/i), '2');
    await user.selectOptions(within(modal).getByLabelText(/Coleccion/i), '1');
    await user.type(within(modal).getByLabelText(/Costo de Fabricacion/i), '30000');
    
    const tagSelect = within(modal).getByLabelText(/Etiquetas/i);
    await user.selectOptions(tagSelect, ['1', '2']);
    
    (masterDesignApi.createMasterDesign as any).mockResolvedValue({ success: true });
    await user.click(within(modal).getByRole('button', { name: /^Crear$/i }));
    
    await waitFor(() => {
      expect(masterDesignApi.createMasterDesign).toHaveBeenCalledWith(expect.objectContaining({
        id_clothing: '2',
        manufactured_cost: '30000',
        id_tags: ['1', '2']
      }));
    });
  });

  it('allows viewing providers', async () => {
    renderPage();
    await screen.findByText('REF-001');
    
    fireEvent.click(screen.getByLabelText(/Ver proveedores diseño REF-001/i));
    
    const modal = await screen.findByRole('dialog');
    expect(within(modal).getByText('Provider A')).toBeInTheDocument();
    
    const closeBtn = within(modal).getAllByRole('button', { name: /Cerrar/i }).find(btn => btn.textContent === 'Cerrar');
    if (closeBtn) fireEvent.click(closeBtn);
    
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('allows deleting a design', async () => {
    renderPage();
    await screen.findByText('REF-001');
    
    fireEvent.click(screen.getByLabelText(/Eliminar diseño REF-001/i));
    expect(Swal.fire).toHaveBeenCalled();
    
    (masterDesignApi.deleteMasterDesign as any).mockResolvedValue({ success: true });
    
    await waitFor(() => {
      expect(masterDesignApi.deleteMasterDesign).toHaveBeenCalledWith(101);
    });
  });

  it('handles API errors gracefully', async () => {
    (masterDesignApi.getMasterDesigns as any).mockRejectedValue(new Error('Load Error'));
    renderPage();
    expect(await screen.findByText(/Error al cargar datos/i)).toBeInTheDocument();
  });
});
