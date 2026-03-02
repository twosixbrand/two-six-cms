import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global fetch mock to allow components and pages to fully render their internal states
// without hanging or throwing unhandled rejections during test runs.
if (!global.fetch) {
    global.fetch = vi.fn() as any;
}

beforeEach(() => {
    // Only apply default successful mock if the test hasn't already mocked it specifically
    if (!(global.fetch as any).mock?.calls !== undefined) {
        global.fetch = vi.fn().mockImplementation((url, options) => {
            return Promise.resolve({
                ok: true,
                status: 200,
                json: async () => {
                    if (options?.method === 'GET' || !options?.method) {
                        return [{ id: 1, name: 'Test Item 1' }, { id: 2, name: 'Test Item 2' }];
                    }
                    return { id: 1, success: true };
                },
                text: async () => 'Success',
            });
        }) as any;
    }
});
