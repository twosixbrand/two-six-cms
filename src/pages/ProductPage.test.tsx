import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductPage from './ProductPage';
import * as productApi from '../services/productApi';
import * as clothingSizeApi from '../services/clothingSizeApi';
import Swal from 'sweetalert2';

vi.mock('../services/productApi');
vi.mock('../services/clothingSizeApi');
vi.mock('../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockClothingSizes = [
  {
    id: 1,
    clothingColor: {
      color: { name: 'Azul' },
      design: { clothing: { name: 'Camiseta' } },
    },
    size: { name: 'M' },
  },
  {
    id: 2,
    clothingColor: {
      color: { name: 'Rojo' },
      design: { clothing: { name: 'Pantalón' } },
    },
    size: { name: 'L' },
  },
];

const mockProducts = [
  {
    id: 101,
    sku: 'TS-001',
    name: 'Camiseta Azul M',
    price: 50000,
    active: true,
    is_outlet: false,
    clothing_name: 'Camiseta',
    color_name: 'Azul',
    size_name: 'M',
    id_clothing_size: 1,
  },
];

describe('ProductPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (productApi.getProducts as any).mockResolvedValue(mockProducts);
    (clothingSizeApi.getClothingSizes as any).mockResolvedValue(mockClothingSizes);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ProductPage />
      </BrowserRouter>,
    );

  it('renders products table', async () => {
    renderPage();
    expect(await screen.findByText('TS-001')).toBeInTheDocument();
    expect(screen.getByText('Camiseta')).toBeInTheDocument();
    expect(screen.getByText('Azul')).toBeInTheDocument();
  });

  it('filters products by search term', async () => {
    renderPage();
    await screen.findByText('TS-001');
    
    const searchInput = screen.getByPlaceholderText(/Buscar productos/i);
    fireEvent.change(searchInput, { target: { value: 'Inexistente' } });
    
    await waitFor(() => {
      expect(screen.queryByText('TS-001')).not.toBeInTheDocument();
      expect(screen.getByText(/No hay productos registrados/i)).toBeInTheDocument();
    });
  });

  it('allows editing a product', async () => {
    renderPage();
    await screen.findByText('TS-001');
    
    const editBtn = screen.getByLabelText(/Editar producto TS-001/i);
    fireEvent.click(editBtn);
    
    const modal = await screen.findByRole('dialog');
    const priceInput = within(modal).getByLabelText(/Precio BASE/i);
    fireEvent.change(priceInput, { target: { value: '60000' } });
    
    (productApi.updateProduct as any).mockResolvedValue({ success: true });
    fireEvent.click(within(modal).getByRole('button', { name: /Actualizar/i }));
    
    await waitFor(() => {
      expect(productApi.updateProduct).toHaveBeenCalledWith(101, expect.objectContaining({ price: 60000 }));
    });
  });

  it('allows creating new products with variants', async () => {
    renderPage();
    await screen.findByText('TS-001');
    
    fireEvent.click(screen.getByRole('button', { name: /^Crear Productos$/i }));
    
    const modal = await screen.findByRole('dialog');
    expect(within(modal).getByText(/Datos Comunes/i)).toBeInTheDocument();
    
    fireEvent.change(within(modal).getByLabelText(/Precio BASE/i), { target: { value: '45000' } });
    
    const variantSelect = within(modal).getByLabelText(/Variante 1/i);
    fireEvent.change(variantSelect, { target: { value: '2' } });
    
    (productApi.createProduct as any).mockResolvedValue({ success: true });
    
    // Find the submit button inside the modal specifically
    const submitBtn = within(modal).getByRole('button', { name: /^Crear Productos$/i });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(productApi.createProduct).toHaveBeenCalledWith(expect.objectContaining({
        id_clothing_size: 2,
        price: 45000,
      }));
    });
  });

  it('allows deleting a product', async () => {
    renderPage();
    await screen.findByText('TS-001');
    
    const deleteBtn = screen.getByLabelText(/Eliminar producto TS-001/i);
    fireEvent.click(deleteBtn);
    
    expect(Swal.fire).toHaveBeenCalled();
    
    (productApi.deleteProduct as any).mockResolvedValue({ success: true });
    
    await waitFor(() => {
      expect(productApi.deleteProduct).toHaveBeenCalledWith(101);
    });
  });

  it('handles API errors on load', async () => {
    (productApi.getProducts as any).mockRejectedValue(new Error('Load Error'));
    renderPage();
    expect(await screen.findByText(/Error al cargar datos/i)).toBeInTheDocument();
  });
});
