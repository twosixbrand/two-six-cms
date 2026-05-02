import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClothingColorPage from './ClothingColorPage';
import * as clothingColorApi from '../services/clothingColorApi';
import * as masterDesignApi from '../services/masterDesignApi';
import * as colorApi from '../services/colorApi';
import * as sizeApi from '../services/sizeApi';
import * as genderApi from '../services/genderApi';
import Swal from 'sweetalert2';

vi.mock('../services/clothingColorApi');
vi.mock('../services/masterDesignApi');
vi.mock('../services/colorApi');
vi.mock('../services/sizeApi');
vi.mock('../services/genderApi');
vi.mock('../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockDesigns = [
  { id: 1, reference: 'REF-001', clothing: { name: 'Camiseta' }, collection: { name: 'Summer' } },
];
const mockColors = [
  { id: 10, name: 'Negro', hex: '#000000' },
];
const mockSizes = [
  { id: 20, name: 'M' },
];
const mockGenders = [
  { id: 1, name: 'Unisex' },
];
const mockItems = [
  {
    id: 50,
    id_design: 1,
    id_color: 10,
    design: mockDesigns[0],
    color: mockColors[0],
    slug: 'camiseta-negra',
    seo_h1: 'Camiseta Negra H1',
  },
];

describe('ClothingColorPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (clothingColorApi.getClothingColors as any).mockResolvedValue(mockItems);
    (masterDesignApi.getMasterDesigns as any).mockResolvedValue(mockDesigns);
    (colorApi.getColors as any).mockResolvedValue(mockColors);
    (sizeApi.getSizes as any).mockResolvedValue(mockSizes);
    (genderApi.getGenders as any).mockResolvedValue(mockGenders);
    
    // Mock window.location
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' };
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ClothingColorPage />
      </BrowserRouter>,
    );

  it('renders list of clothing colors', async () => {
    renderPage();
    expect(await screen.findByText('REF-001')).toBeInTheDocument();
    expect(screen.getByText('Camiseta')).toBeInTheDocument();
    expect(screen.getByText('Negro')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument(); // SEO mark
  });

  it('filters by search term', async () => {
    renderPage();
    await screen.findByText('REF-001');
    
    const searchInput = screen.getByPlaceholderText(/Buscar por referencia/i);
    fireEvent.change(searchInput, { target: { value: 'Inexistente' } });
    
    await waitFor(() => {
      expect(screen.queryByText('REF-001')).not.toBeInTheDocument();
      expect(screen.getByText(/No hay colores de prendas registrados/i)).toBeInTheDocument();
    });
  });

  it('allows editing a version and its SEO fields', async () => {
    renderPage();
    await screen.findByText('REF-001');
    
    fireEvent.click(screen.getByLabelText(/Editar version 50/i));
    
    const modal = await screen.findByRole('dialog');
    const h1Input = within(modal).getByPlaceholderText(/Ej: Camiseta Essentials - Edición Femenina/i);
    fireEvent.change(h1Input, { target: { value: 'Nuevo H1' } });
    
    (clothingColorApi.updateClothingColor as any).mockResolvedValue({ success: true });
    fireEvent.click(within(modal).getByRole('button', { name: /Actualizar/i }));
    
    await waitFor(() => {
      expect(clothingColorApi.updateClothingColor).toHaveBeenCalledWith(50, expect.objectContaining({
        seo_h1: 'Nuevo H1'
      }));
    });
  });

  it('allows creating a new version with contextual size selection', async () => {
    renderPage();
    await screen.findByText('REF-001');
    
    fireEvent.click(screen.getByRole('button', { name: /Crear Versiones/i }));
    
    const modal = await screen.findByRole('dialog');
    
    // Select Design
    fireEvent.change(within(modal).getByLabelText(/Diseno/i), { target: { value: '1' } });
    // Select Color
    fireEvent.change(within(modal).getByLabelText(/Color/i), { target: { value: '10' } });
    
    // Check size M - Use getByRole for exact checkbox match
    const checkboxM = within(modal).getByRole('checkbox', { name: /^M$/i });
    fireEvent.click(checkboxM);
    
    // Fill quantity
    const qtyInput = within(modal).getByLabelText(/Cant\./i);
    fireEvent.change(qtyInput, { target: { value: '100' } });
    
    (clothingColorApi.createContextual as any).mockResolvedValue({ 
      clothingColor: { id: 60 } 
    });
    
    // The submit button is the second "Crear Versiones" button
    const submitBtn = within(modal).getByRole('button', { name: /^Crear Versiones$/i });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(clothingColorApi.createContextual).toHaveBeenCalledWith(expect.objectContaining({
        id_design: '1',
        id_color: '10',
        sizes: expect.stringContaining('"quantity_produced":100')
      }));
    });
    
    // Check Swal interaction for images
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      title: '¡Color creado!'
    }));
  });

  it('allows deleting a version', async () => {
    renderPage();
    await screen.findByText('REF-001');
    
    fireEvent.click(screen.getByLabelText(/Eliminar version 50/i));
    expect(Swal.fire).toHaveBeenCalled();
    
    (clothingColorApi.deleteClothingColor as any).mockResolvedValue({ success: true });
    
    await waitFor(() => {
      expect(clothingColorApi.deleteClothingColor).toHaveBeenCalledWith(50);
    });
  });

  it('handles API errors gracefully', async () => {
    (clothingColorApi.getClothingColors as any).mockRejectedValue(new Error('Load Error'));
    renderPage();
    expect(await screen.findByText(/Error al cargar datos/i)).toBeInTheDocument();
  });
});
