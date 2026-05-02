import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FacebookFeedPage from './FacebookFeedPage';

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

const mockProducts = [
  {
    id: 1,
    sku: 'TS-001-BL-M',
    price: 50000,
    discount_price: 45000,
    active: true,
    quantity_available: 10,
    slug: 'camiseta-negra-m',
    color_name: 'Negro',
    size_name: 'M',
    design_reference: 'CAM-001',
    design_description: 'Camiseta de algodón premium',
    clothing_name: 'Camiseta',
    gender_name: 'Masculino',
    type_clothing_name: 'Camiseta',
    image_url: 'http://example.com/img1.jpg',
    additional_images: []
  },
  {
    id: 2,
    sku: 'TS-002-WH-L',
    price: 60000,
    discount_price: null,
    active: true,
    quantity_available: 5,
    slug: 'camiseta-blanca-l',
    color_name: 'Blanco',
    size_name: 'L',
    design_reference: 'CAM-002',
    design_description: 'Otra camiseta',
    clothing_name: 'Camiseta Blanca',
    gender_name: 'Femenino',
    type_clothing_name: 'Camiseta',
    image_url: 'http://example.com/img2.jpg',
    additional_images: []
  },
  {
    id: 3,
    sku: 'TS-003-RD-S',
    price: 0,
    discount_price: null,
    active: true,
    quantity_available: 0,
    slug: null,
    color_name: null,
    size_name: 'S',
    design_reference: 'CAM-003',
    design_description: null,
    clothing_name: 'Camiseta Roja',
    gender_name: 'Unisex',
    type_clothing_name: 'Camiseta',
    image_url: null,
    additional_images: []
  }
];

describe('FacebookFeedPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    }));
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <FacebookFeedPage />
      </BrowserRouter>,
    );

  it('renders stats and product list', async () => {
    renderPage();
    await screen.findByText(/Meta Commerce Manager Feed/i);
    
    const totalValue = screen.getByTestId('stat-total');
    expect(totalValue.textContent).toBe('3');
    
    expect(screen.getByText('Camiseta - Negro - M')).toBeInTheDocument();
  });

  it('filters products by search term', async () => {
    renderPage();
    await screen.findByText('Camiseta - Negro - M');
    
    const searchInput = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(searchInput, { target: { value: 'Blanca' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Camiseta - Negro - M')).not.toBeInTheDocument();
      expect(screen.getByText('Camiseta Blanca - Blanco - L')).toBeInTheDocument();
    });
  });

  it('displays validation status correctly', async () => {
    renderPage();
    await screen.findByText('Camiseta - Negro - M');
    
    const okBadges = screen.getAllByText(/Ok/i);
    expect(okBadges.length).toBeGreaterThan(0);
  });

  it('opens product detail sidebar on click', async () => {
    renderPage();
    const productRow = await screen.findByText('Camiseta - Negro - M');
    fireEvent.click(productRow);
    
    await screen.findByText('Detalle Facebook');
    // SKU appears in both table and sidebar
    const skuElements = screen.getAllByText('TS-001-BL-M');
    expect(skuElements.length).toBeGreaterThan(1);
  });

  it('shows issues in detail sidebar', async () => {
    renderPage();
    const productRow = await screen.findByText('Camiseta Roja - S');
    fireEvent.click(productRow);
    
    await screen.findByText(/Problemas detectados/i);
    expect(screen.getByText(/Sin imagen principal/i)).toBeInTheDocument();
  });

  it('copies feed URL to clipboard', async () => {
    renderPage();
    const copyBtn = screen.getByLabelText(/Copiar Feed URL/i);
    fireEvent.click(copyBtn);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(await screen.findByText(/Copiado!/i)).toBeInTheDocument();
  });

  it('refreshes catalog', async () => {
    renderPage();
    await screen.findByText('Camiseta - Negro - M');
    
    const refreshBtn = screen.getByLabelText(/Refrescar Catálogo/i);
    fireEvent.click(refreshBtn);
    
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('handles API errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    }));
    renderPage();
    expect(await screen.findByText(/HTTP 500/i)).toBeInTheDocument();
  });
});
