import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleResponse } from './apiUtils';
import * as errorApi from './errorApi';

describe('apiUtils - handleResponse', () => {
    beforeEach(() => {
        vi.spyOn(errorApi, 'logError').mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return null for a 204 No Content response', async () => {
        const mockResponse = {
            ok: true,
            status: 204,
        };

        const result = await handleResponse(mockResponse as any, 'TestApi');
        expect(result).toBeNull();
    });

    it('should return parsed JSON for a successful response', async () => {
        const mockData = { id: 1, name: 'Test' };
        const mockResponse = {
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockData),
        };

        const result = await handleResponse(mockResponse as any, 'TestApi');
        expect(result).toEqual(mockData);
        expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should throw an error and log it when response is not ok and content type is JSON', async () => {
        const errorData = { message: 'Custom API Error' };
        const mockResponse = {
            ok: false,
            status: 400,
            headers: {
                get: vi.fn().mockReturnValue('application/json'),
            },
            json: vi.fn().mockResolvedValue(errorData),
        };

        await expect(handleResponse(mockResponse as any, 'TestApi')).rejects.toThrow('Custom API Error');
        expect(errorApi.logError).toHaveBeenCalledWith(expect.any(Error), 'App: cms | Api: TestApi');
    });

    it('should throw fallback JSON string error if message is not present', async () => {
        const errorData = { someOtherField: 'Bad Request' };
        const mockResponse = {
            ok: false,
            status: 400,
            headers: {
                get: vi.fn().mockReturnValue('application/json'),
            },
            json: vi.fn().mockResolvedValue(errorData),
        };

        await expect(handleResponse(mockResponse as any, 'TestApi')).rejects.toThrow(JSON.stringify(errorData));
        expect(errorApi.logError).toHaveBeenCalledWith(expect.any(Error), 'App: cms | Api: TestApi');
    });

    it('should throw text error when content type is not JSON', async () => {
        const mockResponse = {
            ok: false,
            status: 500,
            headers: {
                get: vi.fn().mockReturnValue('text/plain'),
            },
            text: vi.fn().mockResolvedValue('Internal Server Error Text'),
        };

        await expect(handleResponse(mockResponse as any, 'TestApi')).rejects.toThrow('Internal Server Error Text');
        expect(errorApi.logError).toHaveBeenCalledWith(expect.any(Error), 'App: cms | Api: TestApi');
    });

    it('should fallback to status error message if parsing fails', async () => {
        const mockResponse = {
            ok: false,
            status: 404,
            headers: {
                get: vi.fn().mockReturnValue('text/plain'),
            },
            text: vi.fn().mockRejectedValue(new Error('Parse fail')),
        };

        await expect(handleResponse(mockResponse as any, 'TestApi')).rejects.toThrow('Request failed with status 404');
        expect(errorApi.logError).toHaveBeenCalledWith(expect.any(Error), 'App: cms | Api: TestApi');
    });

    it('should fallback to status error message if JSON parsing fails', async () => {
        const mockResponse = {
            ok: false,
            status: 422,
            headers: {
                get: vi.fn().mockReturnValue('application/json'),
            },
            json: vi.fn().mockRejectedValue(new Error('Parse fail')),
        };

        await expect(handleResponse(mockResponse as any, 'TestApi')).rejects.toThrow('{}');
        expect(errorApi.logError).toHaveBeenCalledWith(expect.any(Error), 'App: cms | Api: TestApi');
    });
});
