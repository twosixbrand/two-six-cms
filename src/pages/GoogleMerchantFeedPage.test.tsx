import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GoogleMerchantFeedPage from './GoogleMerchantFeedPage';

// Mock fetch
global.fetch = vi.fn();

const mockProducts = [
  {
    id: 1,
    sku: 'TS-001-M-AZ',
    price: 85000,
    discount_price: null,
    discount_percentage: null,
    active: true,
    quantity_available: 10,
    slug: 'camiseta-polo-azul',
    color_name: 'Azul',
    size_name: 'M',
    design_reference: 'REF-001',
    design_description: 'Camiseta Polo de alta calidad.',
    clothing_name: 'Camiseta Polo',
    gender_name: 'Masculino',
    type_clothing_name: 'polo',
    category_name: 'Camisetas',
    image_url: 'http://test.com/img1.jpg',
    additional_images: ['http://test.com/img2.jpg']
  },
  {
    id: 2,
    sku: 'TS-002-S-RO',
    price: 45000,
    discount_price: 35000,
    discount_percentage: 22,
    active: true,
    quantity_available: 0,
    slug: null, // Test fallback
    color_name: 'Rojo',
    size_name: 'S',
    design_reference: null, // Test warning
    design_description: null, // Test warning
    clothing_name: 'Camiseta Básica',
    gender_name: 'Femenino',
    type_clothing_name: 'camiseta',
    category_name: 'Camisetas',
    image_url: null, // Test error
    additional_images: []
  }
];

describe('GoogleMerchantFeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    });
    
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('renders and fetches feed data correctly', async () => {
    render(<GoogleMerchantFeedPage />);

    expect(screen.getByText(/Cargando productos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('TS-001-M-AZ')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Productos')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('filters products by search term', async () => {
    render(<GoogleMerchantFeedPage />);
    await waitFor(() => screen.getByText('TS-001-M-AZ'));

    const searchInput = screen.getByPlaceholderText(/Buscar por nombre/i);
    fireEvent.change(searchInput, { target: { value: 'TS-002' } });

    await waitFor(() => {
      expect(screen.getByText('TS-002-S-RO')).toBeInTheDocument();
      expect(screen.queryByText('TS-001-M-AZ')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('opens product detail panel when a row is clicked', async () => {
    render(<GoogleMerchantFeedPage />);
    await waitFor(() => screen.getByText('TS-001-M-AZ'));

    const row = screen.getByText('TS-001-M-AZ').closest('tr')!;
    fireEvent.click(row);

    expect(screen.getByText('Detalle del Producto')).toBeInTheDocument();
    expect(screen.getAllByText('Camiseta Polo - Azul - M').length).toBeGreaterThan(1);
    expect(screen.getByText(/image_link/i)).toBeInTheDocument();
  });

  it('handles feed URL copy to clipboard', async () => {
    render(<GoogleMerchantFeedPage />);
    
    const copyBtn = screen.getByText('Copiar');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://twosixweb.com/api/catalog/google-feed');
    expect(await screen.findByText('Copiado!')).toBeInTheDocument();
  });

  it('displays validation errors in the summary', async () => {
    render(<GoogleMerchantFeedPage />);
    await waitFor(() => screen.getByText('TS-001-M-AZ'));

    // Check for the presence of the error text parts
    expect(screen.getAllByText(/errores/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/impiden que ciertos productos aparezcan/i)).toBeInTheDocument();
  });

  it('handles refresh correctly', async () => {
    render(<GoogleMerchantFeedPage />);
    await waitFor(() => screen.getByText('TS-001-M-AZ'));

    const refreshBtn = screen.getByText(/Refrescar/i);
    fireEvent.click(refreshBtn);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
