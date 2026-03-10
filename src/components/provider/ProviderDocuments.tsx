import React, { useState, useEffect, useRef } from 'react';
import { FiCheckCircle, FiCircle, FiUpload, FiEye, FiTrash2 } from 'react-icons/fi';
import * as providerApi from '../../services/providerApi';
import { logError } from '../../services/errorApi';
import './ProviderDocuments.css';

const DOCUMENT_TYPES = [
    { key: 'RUT', label: 'RUT', required: true },
    { key: 'CAMARA_COMERCIO', label: 'Cámara de Comercio', required: true },
    { key: 'CEDULA_REP_LEGAL', label: 'Cédula Representante Legal', required: true },
    { key: 'CERT_BANCARIO', label: 'Certificado Bancario', required: true },
    { key: 'OTROS', label: 'Otros Documentos', required: false },
];

const REQUIRED_TYPES = DOCUMENT_TYPES.filter(d => d.required).map(d => d.key);

export const getRegistrationStatus = (documents) => {
    if (!documents || documents.length === 0) return 'INCOMPLETO';
    const uploadedTypes = documents.map(d => d.document_type);
    const allRequired = REQUIRED_TYPES.every(t => uploadedTypes.includes(t));
    return allRequired ? 'COMPLETO' : 'INCOMPLETO';
};

const ProviderDocuments = ({ provider, onClose, onDocumentsChanged }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null); // which doc type is uploading
    const fileInputRefs = useRef({});

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = await providerApi.getDocuments(provider.id);
            setDocuments(data);
        } catch (err) {
            logError(err, '/provider/documents');
            console.error('Error fetching documents:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [provider.id]);

    const getDocForType = (type) => {
        return documents.find(d => d.document_type === type);
    };

    const handleUpload = async (file, documentType) => {
        if (!file) return;
        try {
            setUploading(documentType);
            await providerApi.uploadDocument(provider.id, file, documentType);
            await fetchDocuments();
            if (onDocumentsChanged) onDocumentsChanged();
        } catch (err) {
            logError(err, '/provider/documents');
            alert('Error al subir el documento: ' + err.message);
        } finally {
            setUploading(null);
        }
    };

    const handleDelete = async (docId, docType) => {
        if (!window.confirm('¿Eliminar este documento?')) return;
        try {
            await providerApi.deleteDocument(docId);
            await fetchDocuments();
            if (onDocumentsChanged) onDocumentsChanged();
        } catch (err) {
            logError(err, '/provider/documents');
            alert('Error al eliminar el documento.');
        }
    };

    const triggerFileInput = (type) => {
        if (fileInputRefs.current[type]) {
            fileInputRefs.current[type].value = '';
            fileInputRefs.current[type].click();
        }
    };

    const status = getRegistrationStatus(documents);
    const completedCount = REQUIRED_TYPES.filter(t => documents.some(d => d.document_type === t)).length;

    return (
        <div className="pd-overlay" onClick={onClose}>
            <div className="pd-modal" onClick={(e) => e.stopPropagation()}>

                <div className="pd-header">
                    <h3>Documentos — {provider.company_name}</h3>
                    <button className="pd-close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="pd-status-summary">
                    <span className={`pd-status-badge ${status.toLowerCase()}`}>
                        {status === 'COMPLETO' ? '✓ Registro Completo' : '⚠ Registro Incompleto'}
                    </span>
                    <span className="pd-status-text">
                        {completedCount}/{REQUIRED_TYPES.length} documentos requeridos
                    </span>
                </div>

                {loading ? (
                    <div className="pd-loading">Cargando documentos...</div>
                ) : (
                    <div className="pd-docs">
                        {DOCUMENT_TYPES.map((docType) => {
                            const existingDoc = getDocForType(docType.key);
                            const isUploading = uploading === docType.key;

                            return (
                                <div
                                    key={docType.key}
                                    className={`pd-doc-row ${existingDoc ? 'has-file' : ''}`}
                                >
                                    <div className="pd-doc-left">
                                        <span className={`pd-doc-icon ${existingDoc ? 'uploaded' : 'missing'}`}>
                                            {existingDoc ? <FiCheckCircle /> : <FiCircle />}
                                        </span>
                                        <div className="pd-doc-info">
                                            <span className="pd-doc-label">{docType.label}</span>
                                            <span className={`pd-doc-required ${docType.required ? 'required' : 'optional'}`}>
                                                {docType.required ? 'Obligatorio' : 'Opcional'}
                                            </span>
                                            {existingDoc && (
                                                <span className="pd-doc-filename" title={existingDoc.file_name}>
                                                    📄 {existingDoc.file_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pd-doc-actions">
                                        {/* Hidden file input */}
                                        <input
                                            type="file"
                                            className="pd-file-input"
                                            ref={(el) => { fileInputRefs.current[docType.key] = el; }}
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            onChange={(e) => handleUpload(e.target.files?.[0], docType.key)}
                                        />

                                        <button
                                            className="pd-action-btn pd-upload-btn"
                                            onClick={() => triggerFileInput(docType.key)}
                                            disabled={isUploading}
                                            title={existingDoc ? 'Reemplazar documento' : 'Subir documento'}
                                        >
                                            <FiUpload size={12} />
                                            {isUploading ? '...' : existingDoc ? 'Reemplazar' : 'Subir'}
                                        </button>

                                        {existingDoc && (
                                            <>
                                                <button
                                                    className="pd-action-btn pd-view-btn"
                                                    onClick={() => window.open(existingDoc.file_url, '_blank')}
                                                    title="Ver documento"
                                                >
                                                    <FiEye size={12} />
                                                </button>
                                                <button
                                                    className="pd-action-btn pd-delete-btn"
                                                    onClick={() => handleDelete(existingDoc.id, docType.key)}
                                                    title="Eliminar documento"
                                                >
                                                    <FiTrash2 size={12} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderDocuments;
