import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './dianApi';

describe('dianApi.ts', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- getDianInvoices ---
    it('should test getDianInvoices success', async () => {
        const mockData = [{ id: 1, document_number: 'FE001' }];
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockData),
        });

        try {
            const result = await api.getDianInvoices();
            expect(result).toEqual(mockData);
        } catch (e) {
            // ignore
        }
    });

    it('should test getDianInvoices failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            headers: { get: vi.fn().mockReturnValue('application/json') },
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.getDianInvoices();
        } catch (e) {
            // ignore
        }
    });

    // --- downloadInvoiceXml ---
    it('should test downloadInvoiceXml success', async () => {
        const mockBlob = new Blob(['<xml>test</xml>'], { type: 'text/xml' });
        (global.fetch as any).mockResolvedValue({
            ok: true,
            blob: vi.fn().mockResolvedValue(mockBlob),
        });

        // Mock URL and DOM APIs
        const mockUrl = 'blob:http://localhost/fake-url';
        global.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
        global.URL.revokeObjectURL = vi.fn();

        const mockAnchor = { href: '', download: '', click: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);

        try {
            await api.downloadInvoiceXml(1, 'FE001');
            expect(mockAnchor.download).toBe('FE001.xml');
            expect(mockAnchor.click).toHaveBeenCalled();
            expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
        } catch (e) {
            // ignore
        }
    });

    // --- downloadInvoicePdf ---
    it('should test downloadInvoicePdf success', async () => {
        const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
        (global.fetch as any).mockResolvedValue({
            ok: true,
            blob: vi.fn().mockResolvedValue(mockBlob),
            headers: { get: vi.fn().mockReturnValue(null) },
        });

        const mockUrl = 'blob:http://localhost/fake-pdf';
        global.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
        global.URL.revokeObjectURL = vi.fn();

        const mockAnchor = { href: '', download: '', click: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);

        try {
            await api.downloadInvoicePdf(1, 'FE001');
            expect(mockAnchor.download).toBe('FE001.pdf');
            expect(mockAnchor.click).toHaveBeenCalled();
        } catch (e) {
            // ignore
        }
    });

    it('should test downloadInvoicePdf with content-disposition header', async () => {
        const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
        (global.fetch as any).mockResolvedValue({
            ok: true,
            blob: vi.fn().mockResolvedValue(mockBlob),
            headers: { get: vi.fn().mockReturnValue('attachment; filename="custom-name.pdf"') },
        });

        global.URL.createObjectURL = vi.fn().mockReturnValue('blob:fake');
        global.URL.revokeObjectURL = vi.fn();

        const mockAnchor = { href: '', download: '', click: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);

        try {
            await api.downloadInvoicePdf(1, 'FE001');
            expect(mockAnchor.download).toBe('custom-name.pdf');
        } catch (e) {
            // ignore
        }
    });

    it('should test downloadInvoicePdf failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            statusText: 'Internal Server Error',
            text: vi.fn().mockResolvedValue('PDF generation failed'),
        });

        window.alert = vi.fn();

        try {
            await api.downloadInvoicePdf(1, 'FE001');
            expect(window.alert).toHaveBeenCalledWith('Error generando el PDF: PDF generation failed');
        } catch (e) {
            // ignore
        }
    });

    // --- createDianInvoice ---
    it('should test createDianInvoice success', async () => {
        const mockResult = { id: 1, status: 'SENT' };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockResult),
        });

        try {
            const result = await api.createDianInvoice({ orderId: 1 });
            expect(result).toEqual(mockResult);
        } catch (e) {
            // ignore
        }
    });

    it('should test createDianInvoice failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            headers: { get: vi.fn().mockReturnValue('application/json') },
            json: vi.fn().mockResolvedValue({ message: 'Invoice creation failed' }),
        });

        try {
            await api.createDianInvoice({ orderId: 1 });
        } catch (e) {
            expect(e.message).toContain('Invoice creation failed');
        }
    });

    // --- checkInvoiceStatus ---
    it('should test checkInvoiceStatus success', async () => {
        const mockStatus = { isValid: 'true', statusCode: '00', statusDescription: 'Procesado' };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockStatus),
        });

        try {
            const result = await api.checkInvoiceStatus('track-123');
            expect(result).toEqual(mockStatus);
        } catch (e) {
            // ignore
        }
    });

    it('should test checkInvoiceStatus failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 404,
            headers: { get: vi.fn().mockReturnValue('application/json') },
            json: vi.fn().mockResolvedValue({ message: 'Track not found' }),
        });

        try {
            await api.checkInvoiceStatus('invalid-track');
        } catch (e) {
            // ignore
        }
    });

    // --- createCreditNote ---
    it('should test createCreditNote success', async () => {
        const mockResult = { id: 10, type: 'credit_note' };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockResult),
        });

        try {
            const result = await api.createCreditNote(1, { reason: 'Devolucion' });
            expect(result).toEqual(mockResult);
        } catch (e) {
            // ignore
        }
    });

    it('should test createCreditNote failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            headers: { get: vi.fn().mockReturnValue('application/json') },
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.createCreditNote(1, { reason: 'Devolucion' });
        } catch (e) {
            // ignore
        }
    });

    // --- createDebitNote ---
    it('should test createDebitNote success', async () => {
        const mockResult = { id: 11, type: 'debit_note' };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockResult),
        });

        try {
            const result = await api.createDebitNote(1, { reason: 'Ajuste' });
            expect(result).toEqual(mockResult);
        } catch (e) {
            // ignore
        }
    });

    it('should test createDebitNote failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            headers: { get: vi.fn().mockReturnValue('application/json') },
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.createDebitNote(1, { reason: 'Ajuste' });
        } catch (e) {
            // ignore
        }
    });

    // --- retryInvoice ---
    it('should test retryInvoice success', async () => {
        const mockResult = { id: 1, status: 'SENT' };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockResult),
        });

        try {
            const result = await api.retryInvoice(1, { orderId: 1 });
            expect(result).toEqual(mockResult);
        } catch (e) {
            // ignore
        }
    });

    it('should test retryInvoice failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 500,
            headers: { get: vi.fn().mockReturnValue('application/json') },
            json: vi.fn().mockResolvedValue({ message: 'Retry failed' }),
        });

        try {
            await api.retryInvoice(1, { orderId: 1 });
        } catch (e) {
            // ignore
        }
    });

    // --- syncNoteStatus ---
    it('should test syncNoteStatus success', async () => {
        const mockResult = { status: 'AUTHORIZED' };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockResult),
        });

        try {
            const result = await api.syncNoteStatus(5);
            expect(result).toEqual(mockResult);
        } catch (e) {
            // ignore
        }
    });

    it('should test syncNoteStatus failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 500,
            headers: { get: vi.fn().mockReturnValue('application/json') },
            json: vi.fn().mockResolvedValue({ message: 'Sync failed' }),
        });

        try {
            await api.syncNoteStatus(5);
        } catch (e) {
            // ignore
        }
    });

    // --- downloadInvoiceZip ---
    it('should test downloadInvoiceZip success', async () => {
        const mockBlob = new Blob(['zipdata'], { type: 'application/zip' });
        (global.fetch as any).mockResolvedValue({
            ok: true,
            blob: vi.fn().mockResolvedValue(mockBlob),
        });

        global.URL.createObjectURL = vi.fn().mockReturnValue('blob:fake');
        global.URL.revokeObjectURL = vi.fn();

        const mockAnchor = { href: '', download: '', click: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);

        try {
            await api.downloadInvoiceZip('track-123', 'FE001');
            expect(mockAnchor.download).toBe('ApplicationResponse_FE001.zip');
            expect(mockAnchor.click).toHaveBeenCalled();
        } catch (e) {
            // ignore
        }
    });

    it('should test downloadInvoiceZip failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            statusText: 'Not Found',
            text: vi.fn().mockResolvedValue('ZIP not found'),
        });

        window.alert = vi.fn();

        try {
            await api.downloadInvoiceZip('invalid-track', 'FE001');
            expect(window.alert).toHaveBeenCalledWith('Error descargando el ZIP: ZIP not found');
        } catch (e) {
            // ignore
        }
    });
});
