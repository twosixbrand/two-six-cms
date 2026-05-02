import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConsignmentPricePage from './ConsignmentPricePage';
import * as priceApi from '../../services/consignmentPriceApi';
import * as customerApi from '../../services/customerApi';
import * as productApi from '../../services/productApi';
import Swal from 'sweetalert2';

vi.mock('../../services/consignmentPriceApi');
vi.mock('../../services/customerApi');
vi.mock('../../services/productApi');
vi.mock('../../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockPrices = [
  {
    id: 1,
    id_customer: 1,
    id_product: 501,
    price: 85000,
    valid_from: '2026-01-01T00:00:00.000Z',
    valid_to: null,
    customer: { id: 1, name: 'Cliente A' },
    product: { id: 501, sku: 'SKU501', clothingSize: { id: 501, clothingColor: { design: { reference: 'REF1' }, color: { name: 'Negro' } }, size: { name: 'M' } } },
  },
];

const mockCustomers = [
  { id: 1, name: 'Cliente A', is_consignment_ally: true },
];

const mockProducts = [
  {
    id: 501,
    id_clothing_size: 501,
    sku: 'SKU501',
    clothingSize: { id: 501, clothingColor: { design: { reference: 'REF1' }, color: { name: 'Negro' } }, size: { name: 'M' } },
  },
  {
    id: 502,
    id_clothing_size: 502,
    sku: 'SKU502',
    clothingSize: { id: 502, clothingColor: { design: { reference: 'REF2' }, color: { name: 'Blanco' } }, size: { name: 'S' } },
  },
];

describe('ConsignmentPricePage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (priceApi.getConsignmentPrices as any).mockResolvedValue(mockPrices);
    (customerApi.getCustomers as any).mockResolvedValue(mockCustomers);
    (productApi.getProducts as any).mockResolvedValue(mockProducts);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentPricePage />
      </BrowserRouter>,
    );

  it('renders page header', async () => {
    renderPage();
    expect(await screen.findByText('Lista de Precios por Cliente')).toBeInTheDocument();
  });

  it('allows creating a price', async () => {
    (priceApi.bulkCreateConsignmentPrice as any).mockResolvedValue({ created_count: 1 });
    renderPage();
    await waitFor(() => expect(screen.queryByText(/Cargando/)).not.toBeInTheDocument());
    fireEvent.click(screen.getByText('Nuevo Precio'));
    
    fireEvent.change(screen.getByLabelText(/Cliente Aliado/i), { target: { value: '1' } });
    await waitFor(() => expect(screen.getByText('REF2 Blanco S')).toBeInTheDocument());
    fireEvent.click(screen.getByText('REF2 Blanco S'));
    
    fireEvent.change(screen.getByPlaceholderText('85000'), { target: { value: '90000' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear/i }));
    
    await waitFor(() => {
        expect(priceApi.bulkCreateConsignmentPrice).toHaveBeenCalled();
    });
  });
});
