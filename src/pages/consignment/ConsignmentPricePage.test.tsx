import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
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

vi.mock('../../services/consignmentPriceApi', () => ({
  getConsignmentPrices: vi.fn(),
  createConsignmentPrice: vi.fn(),
  updateConsignmentPrice: vi.fn(),
  deleteConsignmentPrice: vi.fn(),
}));

vi.mock('../../services/customerApi', () => ({
  getCustomers: vi.fn(),
}));

vi.mock('../../services/productApi', () => ({
  getProducts: vi.fn(),
}));

vi.mock('../../services/errorApi', () => ({ logError: vi.fn() }));

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) },
}));

vi.mock('../../components/common/PageHeader', () => ({
  default: ({ title }: any) => <h1>{title}</h1>,
}));

vi.mock('../../components/ui', () => ({
  DataTable: ({ data, emptyMessage }: any) => (
    <div data-testid="data-table">
      {data.length === 0 ? emptyMessage : data.map((r: any) => <div key={r.id}>row-{r.id}</div>)}
    </div>
  ),
  Modal: ({ isOpen, children }: any) => (isOpen ? <div role="dialog">{children}</div> : null),
  FormField: ({ label }: any) => <label>{label}</label>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  SearchInput: () => <input data-testid="search" />,
  LoadingSpinner: ({ text }: any) => <div>{text}</div>,
}));

import ConsignmentPricePage from './ConsignmentPricePage';
import * as priceApi from '../../services/consignmentPriceApi';
import * as customerApi from '../../services/customerApi';
import * as productApi from '../../services/productApi';

describe('ConsignmentPricePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (priceApi.getConsignmentPrices as any).mockResolvedValue([
      {
        id: 1,
        id_customer: 1,
        id_product: 5,
        price: 50000,
        valid_from: '2026-01-01T00:00:00Z',
        valid_to: null,
        customer: { id: 1, name: 'Ally' },
        product: { id: 5, price: 60000, sku: 'SKU-1', clothingSize: {} },
      },
    ]);
    (customerApi.getCustomers as any).mockResolvedValue([
      { id: 1, name: 'Ally', is_consignment_ally: true },
    ]);
    (productApi.getProducts as any).mockResolvedValue([]);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentPricePage />
      </BrowserRouter>,
    );

  it('renders title', () => {
    renderPage();
    expect(screen.getByText('Lista de Precios por Cliente')).toBeInTheDocument();
  });

  it('calls getConsignmentPrices, getCustomers and getProducts on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(priceApi.getConsignmentPrices).toHaveBeenCalled();
      expect(customerApi.getCustomers).toHaveBeenCalled();
      expect(productApi.getProducts).toHaveBeenCalled();
    });
  });

  it('displays price rows after loading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('row-1')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (priceApi.getConsignmentPrices as any).mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Cargando precios...')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    (priceApi.getConsignmentPrices as any).mockRejectedValue(new Error('boom'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los precios de consignación.')).toBeInTheDocument();
    });
  });
});
