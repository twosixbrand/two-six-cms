import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ── Global: window.matchMedia mock ──────────────────────────
// Many components use matchMedia for responsive logic. This prevents
// "matchMedia is not a function" errors across all test files.
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
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

// ── Global: scrollTo mock ───────────────────────────────────
window.scrollTo = vi.fn() as any;

// ── Global: fetch mock ──────────────────────────────────────
// Provides a default successful response so components that call fetch
// on mount don't hang or throw unhandled rejections.
if (!global.fetch) {
    global.fetch = vi.fn() as any;
}

beforeEach(() => {
    // Only apply default successful mock if the test hasn't already mocked it specifically
    if (!(global.fetch as any).mock?.calls !== undefined) {
        global.fetch = vi.fn().mockImplementation((_url: string, options?: any) => {
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
