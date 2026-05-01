import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProviderDocuments, { getRegistrationStatus } from './ProviderDocuments';
import * as providerApi from '../../services/providerApi';

vi.mock('../../services/providerApi', () => ({
    getDocuments: vi.fn(),
    uploadDocument: vi.fn(),
    deleteDocument: vi.fn(),
}));

vi.mock('../../services/errorApi', () => ({
    logError: vi.fn(),
}));

const mockProvider = {
    id: 1,
    company_name: 'Proveedor de Telas S.A.S',
};

const mockDocsComplete = [
    { id: 10, document_type: 'RUT', file_name: 'rut.pdf', file_url: 'http://test/rut.pdf' },
    { id: 11, document_type: 'CAMARA_COMERCIO', file_name: 'cc.pdf', file_url: 'http://test/cc.pdf' },
    { id: 12, document_type: 'CEDULA_REP_LEGAL', file_name: 'cedula.pdf', file_url: 'http://test/cedula.pdf' },
    { id: 13, document_type: 'CERT_BANCARIO', file_name: 'banco.pdf', file_url: 'http://test/banco.pdf' },
];

const mockDocsIncomplete = [
    { id: 10, document_type: 'RUT', file_name: 'rut.pdf', file_url: 'http://test/rut.pdf' },
];

describe('ProviderDocuments Component', () => {
    const onClose = vi.fn();
    const onDocumentsChanged = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getRegistrationStatus utility', () => {
        it('returns INCOMPLETO for null/empty documents', () => {
            expect(getRegistrationStatus(null)).toBe('INCOMPLETO');
            expect(getRegistrationStatus([])).toBe('INCOMPLETO');
        });

        it('returns INCOMPLETO when required docs are missing', () => {
            expect(getRegistrationStatus(mockDocsIncomplete)).toBe('INCOMPLETO');
        });

        it('returns COMPLETO when all required docs exist', () => {
            expect(getRegistrationStatus(mockDocsComplete)).toBe('COMPLETO');
        });
    });

    describe('Modal Rendering', () => {
        it('renders modal header with provider name', async () => {
            (providerApi.getDocuments as any).mockResolvedValue([]);
            render(<ProviderDocuments provider={mockProvider} onClose={onClose} onDocumentsChanged={onDocumentsChanged} />);

            expect(screen.getByText('Documentos — Proveedor de Telas S.A.S')).toBeInTheDocument();
        });

        it('shows loading state initially', async () => {
            // Make the promise unresolved initially to catch the loading state
            let resolvePromise: any;
            (providerApi.getDocuments as any).mockImplementation(() => new Promise((resolve) => {
                resolvePromise = resolve;
            }));

            render(<ProviderDocuments provider={mockProvider} onClose={onClose} onDocumentsChanged={onDocumentsChanged} />);
            expect(screen.getByText('Cargando documentos...')).toBeInTheDocument();

            resolvePromise([]);
        });

        it('renders document rows after loading', async () => {
            (providerApi.getDocuments as any).mockResolvedValue(mockDocsIncomplete);
            render(<ProviderDocuments provider={mockProvider} onClose={onClose} onDocumentsChanged={onDocumentsChanged} />);

            await waitFor(() => {
                expect(screen.getByText('RUT')).toBeInTheDocument();
                expect(screen.getByText('Cámara de Comercio')).toBeInTheDocument();
                expect(screen.getByText('Cédula Representante Legal')).toBeInTheDocument();
                expect(screen.getByText('Certificado Bancario')).toBeInTheDocument();
                expect(screen.getByText('Otros Documentos')).toBeInTheDocument();
            });
        });

        it('shows correct status badge based on documents', async () => {
            (providerApi.getDocuments as any).mockResolvedValue(mockDocsComplete);
            render(<ProviderDocuments provider={mockProvider} onClose={onClose} onDocumentsChanged={onDocumentsChanged} />);

            await waitFor(() => {
                expect(screen.getByText('✓ Registro Completo')).toBeInTheDocument();
                expect(screen.getByText('4/4 documentos requeridos')).toBeInTheDocument();
            });
        });

        it('shows file name and action buttons for uploaded documents', async () => {
            (providerApi.getDocuments as any).mockResolvedValue(mockDocsIncomplete);
            render(<ProviderDocuments provider={mockProvider} onClose={onClose} onDocumentsChanged={onDocumentsChanged} />);

            await waitFor(() => {
                expect(screen.getByText('📄 rut.pdf')).toBeInTheDocument();
                // RUT should have view and delete buttons since it's uploaded
                const viewBtns = screen.getAllByTitle('Ver documento');
                expect(viewBtns).toHaveLength(1);
            });
        });
    });

    describe('Interactions', () => {
        it('calls onClose when close button is clicked', async () => {
            (providerApi.getDocuments as any).mockResolvedValue([]);
            render(<ProviderDocuments provider={mockProvider} onClose={onClose} onDocumentsChanged={onDocumentsChanged} />);

            await waitFor(() => {
                const closeBtn = screen.getByText('×');
                fireEvent.click(closeBtn);
                expect(onClose).toHaveBeenCalledTimes(1);
            });
        });

        it('calls delete API when delete button is clicked and confirmed', async () => {
            // Mock window.confirm to return true
            vi.spyOn(window, 'confirm').mockReturnValue(true);
            (providerApi.getDocuments as any).mockResolvedValue(mockDocsIncomplete);
            (providerApi.deleteDocument as any).mockResolvedValue({});

            render(<ProviderDocuments provider={mockProvider} onClose={onClose} onDocumentsChanged={onDocumentsChanged} />);

            await waitFor(async () => {
                const deleteBtns = screen.getAllByTitle('Eliminar documento');
                fireEvent.click(deleteBtns[0]);
                expect(providerApi.deleteDocument).toHaveBeenCalledWith(10);
            });
        });

        it('does NOT call delete API if confirm is cancelled', async () => {
            // Mock window.confirm to return false
            vi.spyOn(window, 'confirm').mockReturnValue(false);
            (providerApi.getDocuments as any).mockResolvedValue(mockDocsIncomplete);

            render(<ProviderDocuments provider={mockProvider} onClose={onClose} onDocumentsChanged={onDocumentsChanged} />);

            await waitFor(async () => {
                const deleteBtns = screen.getAllByTitle('Eliminar documento');
                fireEvent.click(deleteBtns[0]);
                expect(providerApi.deleteDocument).not.toHaveBeenCalled();
            });
        });
        
        it('opens document URL in new tab when view button is clicked', async () => {
            vi.spyOn(window, 'open').mockImplementation(() => null);
            (providerApi.getDocuments as any).mockResolvedValue(mockDocsIncomplete);
            
            render(<ProviderDocuments provider={mockProvider} onClose={onClose} onDocumentsChanged={onDocumentsChanged} />);
            
            await waitFor(() => {
                const viewBtns = screen.getAllByTitle('Ver documento');
                fireEvent.click(viewBtns[0]);
                expect(window.open).toHaveBeenCalledWith('http://test/rut.pdf', '_blank');
            });
        });
    });
});
