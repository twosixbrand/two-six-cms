import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as inventoryApi from './inventoryApi';
import * as apiUtils from './apiUtils';

// Mock fetch
global.fetch = vi.fn();

// Mock handleResponse
vi.mock('./apiUtils', () => ({
  handleResponse: vi.fn((resp) => resp.json()),
}));

describe('inventoryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createAdjustment calls correct endpoint', async () => {
    const mockData = { id: 1 };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const payload = { type: 'IN', reason: 'Test' };
    const result = await inventoryApi.createAdjustment(payload);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/inventory/adjustments'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
    expect(result).toEqual(mockData);
  });

  it('getAdjustments calls correct endpoint', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await inventoryApi.getAdjustments();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/inventory/adjustments'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('getKardex calls correct endpoint with id', async () => {
    await inventoryApi.getKardex(123);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/inventory/kardex/123'),
      expect.any(Object)
    );
  });

  it('getKardexAll calls correct endpoint with filters', async () => {
    const filters = { startDate: '2024-01-01', search: 'blue' };
    await inventoryApi.getKardexAll(filters);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/inventory/kardex?startDate=2024-01-01&search=blue'),
      expect.any(Object)
    );
  });
});
