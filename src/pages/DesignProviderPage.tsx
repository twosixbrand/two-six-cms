import React, { useState, useEffect, useCallback } from 'react';
import { FiBriefcase, FiPlus, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../components/ui';
import * as designProviderApi from '../services/designProviderApi';
import * as masterDesignApi from '../services/masterDesignApi';
import * as providerApi from '../services/providerApi';
import { logError } from '../services/errorApi';

const DesignProviderPage = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [masterDesigns, setMasterDesigns] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id_master_design: '', id_provider: '' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [assignmentsData, designsData, providersData] = await Promise.all([
        designProviderApi.getDesignProviders(),
        masterDesignApi.getMasterDesigns(),
        providerApi.getProviders(),
      ]);
      setAssignments(assignmentsData);
      setMasterDesigns(designsData);
      setProviders(providersData);
    } catch (err: any) {
      logError(err, '/design-provider');
      setError('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAssignments = React.useMemo(() => {
    if (!search) return assignments;
    const term = search.toLowerCase();
    return assignments.filter(
      (item) =>
        item.masterDesign?.reference?.toLowerCase().includes(term) ||
        item.provider?.company_name?.toLowerCase().includes(term)
    );
  }, [assignments, search]);

  const openCreateModal = () => {
    setForm({ id_master_design: '', id_provider: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_master_design || !form.id_provider) return;
    try {
      setSaving(true);
      setError('');
      await designProviderApi.createDesignProvider(form);
      closeModal();
      fetchData();
    } catch (err: any) {
      setError('Error al asignar proveedor: ' + err.message);
      logError(err, '/design-provider-save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Eliminar Asignacion',
      text: `¿Estas seguro de que deseas eliminar la asignacion del proveedor "${row.provider?.company_name}" al  "${row.masterDesign?.reference}"?`,
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
      await designProviderApi.deleteDesignProvider(row.id);
      fetchData();
    } catch (err: any) {
      setError('Error al eliminar asignacion: ' + err.message);
      logError(err, '/design-provider-delete');
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '70px' },
    {
      key: 'masterDesign',
      header: 'Diseño (Referencia)',
      render: (_: any, row: any) => row.masterDesign?.reference || 'N/A',
    },
    {
      key: 'provider',
      header: 'Proveedor',
      render: (_: any, row: any) => row.provider?.company_name || 'N/A',
    },
  ];

  const designOptions = masterDesigns.map((d) => ({ value: d.id, label: d.reference }));
  const providerOptions = providers.map((p) => ({ value: p.id, label: p.company_name }));

  return (
    <div className="page-container">
      <PageHeader title="Asignacion Diseño-Proveedor" icon={<FiBriefcase />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por referencia o proveedor..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Asignar Proveedor</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando asignaciones..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredAssignments}
          emptyMessage="No hay asignaciones registradas"
          actions={(row) => (
            <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)}>Eliminar</Button>
          )}
        />
      )}

      <Modal isOpen={showModal} onClose={closeModal} title="Asignar Proveedor a Diseño" size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField
              label="Master Design"
              name="id_master_design"
              type="select"
              value={form.id_master_design}
              onChange={handleChange}
              required
              placeholder="Seleccione Diseno"
              options={designOptions}
            />
            <FormField
              label="Proveedor"
              name="id_provider"
              type="select"
              value={form.id_provider}
              onChange={handleChange}
              required
              placeholder="Seleccione Proveedor"
              options={providerOptions}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>Asignar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DesignProviderPage;
