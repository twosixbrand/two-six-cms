import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PqrService } from './pqr.service';

describe('PqrService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const mockResponse = (data: any, ok = true) => {
    return Promise.resolve({
      ok,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      status: ok ? 200 : 500
    });
  };

  it('getAllPqrs should fetch from correct endpoint', async () => {
    const mockPqrs = [{ id: 1, subject: 'Test' }];
    (global.fetch as any).mockResolvedValue(mockResponse(mockPqrs));

    const result = await PqrService.getAllPqrs();
    expect(result).toEqual(mockPqrs);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/pqr'));
  });

  it('getPqrById should fetch from correct endpoint', async () => {
    const mockPqr = { id: 1, subject: 'Test' };
    (global.fetch as any).mockResolvedValue(mockResponse(mockPqr));

    const result = await PqrService.getPqrById(1);
    expect(result).toEqual(mockPqr);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/pqr/1'));
  });

  it('updatePqrStatus should call PATCH with correct body', async () => {
    (global.fetch as any).mockResolvedValue(mockResponse({ success: true }));

    await PqrService.updatePqrStatus(1, 'CLOSED', 'Done');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/pqr/1/status'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'CLOSED', observation: 'Done' })
      })
    );
  });

  it('handles network errors', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network Error'));
    await expect(PqrService.getAllPqrs()).rejects.toThrow('Network Error');
    expect(console.error).toHaveBeenCalled();
  });
});
