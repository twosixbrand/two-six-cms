import React, { useState, useEffect, useMemo } from 'react';
import { FiArchive, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../components/ui';
import * as collectionApi from '../services/collectionApi';
import * as seasonApi from '../services/seasonApi';
import * as yearProductionApi from '../services/yearProductionApi';
import { logError } from '../services/errorApi';

const CollectionPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', seasonId: '', yearProductionId: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [collectionsData, seasonsData, yearsData] = await Promise.all([
        collectionApi.getCollections(),
        seasonApi.getSeasons(),
        yearProductionApi.getYearProductions(),
      ]);
      setItems(collectionsData);
      setSeasons(seasonsData);
      setYears(yearsData);
      setError('');
    } catch (err: any) {
      logError(err, '/collection');
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.season?.name?.toLowerCase().includes(term) ||
        item.yearProduction?.year?.toString().includes(term)
    );
  }, [items, search]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({ name: '', description: '', seasonId: '', yearProductionId: '' });
    setShowModal(true);
  };

  const openEditModal = (row: any) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      description: row.description || '',
      seasonId: row.seasonId || '',
      yearProductionId: row.yearProductionId || '',
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
      if (editing) {
        const dataToUpdate = {
          name: form.name,
          description: form.description,
          seasonId: form.seasonId,
          yearProductionId: form.yearProductionId,
        };
        await collectionApi.updateCollection(editing.id, dataToUpdate);
      } else {
        await collectionApi.createCollection(form);
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      logError(err, '/collection');
      setError('Error al guardar la colección: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Eliminar Colección',
      text: `¿Estás seguro de que deseas eliminar la colección "${row.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await collectionApi.deleteCollection(row.id);
      fetchData();
    } catch (err: any) {
      logError(err, '/collection');
      await Swal.fire({ title: 'Error', text: 'Error al eliminar la colección.', icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Nombre' },
    {
      key: 'season',
      header: 'Temporada',
      render: (_value: any, row: any) => row.season?.name || 'N/A',
    },
    {
      key: 'yearProduction',
      header: 'Año Producción',
      render: (_value: any, row: any) => row.yearProduction?.year || row.yearProduction?.name || 'N/A',
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Colecciones" icon={<FiArchive />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, temporada o año..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Colección</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando colecciones..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay colecciones registradas"
          actions={(row) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)}>Editar</Button>
              <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)}>Eliminar</Button>
            </>
          )}
        />
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Editar Colección' : 'Crear Colección'} size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="Nombre de la Colección" name="name" value={form.name} onChange={handleChange} required placeholder="Ej: Verano 2026" />
            <FormField label="Descripción" name="description" type="textarea" value={form.description} onChange={handleChange} placeholder="Breve descripción..." />
            <FormField
              label="Temporada"
              name="seasonId"
              type="select"
              value={form.seasonId}
              onChange={handleChange}
              required
              placeholder="Seleccione Temporada"
              options={seasons.map((s) => ({ value: s.id, label: s.name }))}
            />
            <FormField
              label="Año de Producción"
              name="yearProductionId"
              type="select"
              value={form.yearProductionId}
              onChange={handleChange}
              required
              placeholder="Seleccione Año"
              options={years.map((y) => ({ value: y.id, label: y.name }))}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>{editing ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CollectionPage;
