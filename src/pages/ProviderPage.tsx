import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiTruck, FiPlus, FiEdit2, FiTrash2, FiPaperclip, FiUpload, FiEye, FiCheckCircle, FiCircle } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner, StatusBadge } from '../components/ui';
import * as providerApi from '../services/providerApi';
import { logError } from '../services/errorApi';

// Document types for provider registration
const DOCUMENT_TYPES = [
  { key: 'RUT', label: 'RUT', required: true },
  { key: 'CAMARA_COMERCIO', label: 'Camara de Comercio', required: true },
  { key: 'CEDULA_REP_LEGAL', label: 'Cedula Representante Legal', required: true },
  { key: 'CERT_BANCARIO', label: 'Certificado Bancario', required: true },
  { key: 'OTROS', label: 'Otros Documentos', required: false },
];
const REQUIRED_TYPES = DOCUMENT_TYPES.filter((d) => d.required).map((d) => d.key);

const getRegistrationStatus = (documents: any[]) => {
  if (!documents || documents.length === 0) return 'INCOMPLETO';
  const uploadedTypes = documents.map((d: any) => d.document_type);
  return REQUIRED_TYPES.every((t) => uploadedTypes.includes(t)) ? 'COMPLETO' : 'INCOMPLETO';
};

const ProviderPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: '', company_name: '', email: '', phone: '', account_number: '', account_type: '', bank_name: '' });

  // Document modal state
  const [showDocModal, setShowDocModal] = useState(false);
  const [docProvider, setDocProvider] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await providerApi.getProviders();
      setItems(data);
    } catch (err: any) {
      setError('Error al cargar los proveedores.');
      logError(err, '/provider');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(
      (item) =>
        item.company_name?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.phone?.toLowerCase().includes(term)
    );
  }, [items, search]);

  // Provider CRUD
  const openCreateModal = () => {
    setEditing(null);
    setForm({ id: '', company_name: '', email: '', phone: '', account_number: '', account_type: '', bank_name: '' });
    setShowModal(true);
  };

  const openEditModal = (row: any) => {
    setEditing(row);
    setForm({
      id: row.id || '',
      company_name: row.company_name || '',
      email: row.email || '',
      phone: row.phone || '',
      account_number: row.account_number || '',
      account_type: row.account_type || '',
      bank_name: row.bank_name || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      if (editing) {
        await providerApi.updateProvider(editing.id, form);
      } else {
        await providerApi.createProvider(form);
      }
      closeModal();
      fetchItems();
    } catch (err: any) {
      const action = editing ? 'actualizar' : 'crear';
      setError(`Error al ${action} el proveedor: ${err.message}`);
      logError(err, `/provider-${action}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Eliminar Proveedor',
      text: `¿Estas seguro de que deseas eliminar al proveedor "${row.company_name}"? Esta accion no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      setError('');
      await providerApi.deleteProvider(row.id);
      fetchItems();
    } catch (err: any) {
      setError('Error al eliminar el proveedor: ' + err.message);
      logError(err, '/provider-delete');
    }
  };

  // Document management
  const openDocModal = async (row: any) => {
    setDocProvider(row);
    setShowDocModal(true);
    try {
      setLoadingDocs(true);
      const data = await providerApi.getDocuments(row.id);
      setDocuments(data);
    } catch (err: any) {
      logError(err, '/provider/documents');
    } finally {
      setLoadingDocs(false);
    }
  };

  const closeDocModal = () => {
    setShowDocModal(false);
    setDocProvider(null);
    setDocuments([]);
  };

  const getDocForType = (type: string) => documents.find((d: any) => d.document_type === type);

  const handleUploadDoc = async (file: File, documentType: string) => {
    if (!file || !docProvider) return;
    try {
      setUploading(documentType);
      await providerApi.uploadDocument(docProvider.id, file, documentType);
      const data = await providerApi.getDocuments(docProvider.id);
      setDocuments(data);
      fetchItems(); // refresh registration status
    } catch (err: any) {
      logError(err, '/provider/documents');
      setError('Error al subir el documento: ' + err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    try {
      await providerApi.deleteDocument(docId);
      const data = await providerApi.getDocuments(docProvider.id);
      setDocuments(data);
      fetchItems();
    } catch (err: any) {
      logError(err, '/provider/documents');
      setError('Error al eliminar el documento.');
    }
  };

  const triggerFileInput = (type: string) => {
    const ref = fileInputRefs.current[type];
    if (ref) {
      ref.value = '';
      ref.click();
    }
  };

  const columns = [
    { key: 'id', header: 'NIT', width: '120px' },
    { key: 'company_name', header: 'Empresa' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Telefono' },
    { key: 'bank_name', header: 'Banco' },
    {
      key: 'documents',
      header: 'Registro',
      render: (value: any) => {
        const status = getRegistrationStatus(value);
        return <StatusBadge status={status === 'COMPLETO' ? 'Completo' : 'Incompleto'} variant={status === 'COMPLETO' ? 'success' : 'warning'} size="sm" />;
      },
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Administrar Proveedores" icon={<FiTruck />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, email o telefono..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Proveedor</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando proveedores..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay proveedores registrados"
          actions={(row) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiPaperclip />} onClick={() => openDocModal(row)}>Docs</Button>
              <Button variant="edit" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)} />
              <Button variant="destructive" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)} />
            </>
          )}
        />
      )}

      {/* Create/Edit Provider Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Editar Proveedor' : 'Crear Proveedor'} size="lg">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="NIT / Documento" name="id" value={form.id} onChange={handleChange} required disabled={!!editing} placeholder="Ej: 900123456" />
            <FormField label="Nombre de Empresa" name="company_name" value={form.company_name} onChange={handleChange} required placeholder="Ej: Telas Premium SAS" />
            <FormField label="Correo Electronico" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="contacto@empresa.com" />
            <FormField label="Telefono" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="Ej: 3001234567" />
            <FormField label="Numero de Cuenta" name="account_number" value={form.account_number} onChange={handleChange} required placeholder="Ej: 1234567890" />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <FormField label="Tipo de Cuenta" name="account_type" value={form.account_type} onChange={handleChange} required placeholder="Ej: Ahorros" />
              </div>
              <div style={{ flex: 1 }}>
                <FormField label="Banco" name="bank_name" value={form.bank_name} onChange={handleChange} required placeholder="Ej: Bancolombia" />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>{editing ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      {/* Documents Modal */}
      <Modal isOpen={showDocModal} onClose={closeDocModal} title={`Documentos — ${docProvider?.company_name || ''}`} size="lg">
        {loadingDocs ? (
          <LoadingSpinner text="Cargando documentos..." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <StatusBadge
                status={getRegistrationStatus(documents) === 'COMPLETO' ? 'Registro Completo' : 'Registro Incompleto'}
                variant={getRegistrationStatus(documents) === 'COMPLETO' ? 'success' : 'warning'}
              />
              <span style={{ fontSize: '0.8rem', color: '#a0a0b0' }}>
                {REQUIRED_TYPES.filter((t) => documents.some((d: any) => d.document_type === t)).length}/{REQUIRED_TYPES.length} requeridos
              </span>
            </div>
            {DOCUMENT_TYPES.map((docType) => {
              const existingDoc = getDocForType(docType.key);
              const isUploading = uploading === docType.key;
              return (
                <div
                  key={docType.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderRadius: 8,
                    backgroundColor: existingDoc ? 'rgba(34, 197, 94, 0.05)' : 'rgba(0,0,0,0.02)',
                    border: existingDoc ? '1px solid rgba(34, 197, 94, 0.15)' : '1px solid #2a2a35',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {existingDoc ? <FiCheckCircle color="#16a34a" /> : <FiCircle color="#94a3b8" />}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{docType.label}</div>
                      <div style={{ fontSize: '0.7rem', color: docType.required ? '#d97706' : '#64748b' }}>
                        {docType.required ? 'Obligatorio' : 'Opcional'}
                      </div>
                      {existingDoc && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{existingDoc.file_name}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      ref={(el) => { fileInputRefs.current[docType.key] = el; }}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadDoc(file, docType.key);
                      }}
                    />
                    <Button variant="outline" size="sm" icon={<FiUpload />} onClick={() => triggerFileInput(docType.key)} loading={isUploading}>
                      {existingDoc ? 'Reemplazar' : 'Subir'}
                    </Button>
                    {existingDoc && (
                      <>
                        <Button variant="info" size="sm" icon={<FiEye />} onClick={() => window.open(existingDoc.file_url, '_blank')}>Ver</Button>
                        <Button variant="destructive" size="sm" icon={<FiTrash2 />} onClick={() => handleDeleteDoc(existingDoc.id)} />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProviderPage;
