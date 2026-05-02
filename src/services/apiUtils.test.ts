import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleResponse } from './apiUtils';
import { logError } from './errorApi';

vi.mock('./errorApi', () => ({
  logError: vi.fn(),
}));

describe('apiUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns json on successful response', async () => {
    const mockData = { foo: 'bar' };
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => mockData,
    } as Response;

    const result = await handleResponse(mockResponse, 'testApi');
    expect(result).toEqual(mockData);
  });

  it('returns null on 204 status', async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      json: async () => ({}),
    } as Response;

    const result = await handleResponse(mockResponse, 'testApi');
    expect(result).toBeNull();
  });

  it('throws error and logs it on failure (json error)', async () => {
    const errorData = { message: 'Invalid request' };
    const mockResponse = {
      ok: false,
      status: 400,
      headers: {
        get: (name: string) => (name === 'content-type' ? 'application/json' : null),
      },
      json: async () => errorData,
    } as any;

    await expect(handleResponse(mockResponse, 'testApi')).rejects.toThrow('Invalid request');
    expect(logError).toHaveBeenCalledWith(expect.any(Error), 'App: cms | Api: testApi');
  });

  it('throws error and logs it on failure (text error)', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      headers: {
        get: (name: string) => (name === 'content-type' ? 'text/plain' : null),
      },
      text: async () => 'Internal Server Error',
    } as any;

    await expect(handleResponse(mockResponse, 'testApi')).rejects.toThrow('Internal Server Error');
    expect(logError).toHaveBeenCalled();
  });
});
