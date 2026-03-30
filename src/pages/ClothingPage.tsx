import React, { useState, useEffect, useMemo } from 'react';
import { FiLayers, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../components/ui';
import * as clothingApi from '../services/clothingApi';
import * as typeClothingApi from '../services/typeClothingApi';
import * as categoryApi from '../services/categoryApi';
import { getGenders } from '../services/genderApi';
import { logError } from '../services/errorApi';

const ClothingPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [typeClothings, setTypeClothings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [genders, setGenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    id_gender: '',
    id_type_clothing: '',
    id_category: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clothingData, typeClothingData, categoryData, genderData] = await Promise.all([
        clothingApi.getClothing(),
        typeClothingApi.getTypeClothings(),
        categoryApi.getCategories(),
        getGenders(),
      ]);
      setItems(clothingData);
      setTypeClothings(typeClothingData);
      setCategories(categoryData);
      setGenders(genderData);
      setError('');
    } catch (err: any) {
      logError(err, '/clothing');
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
    return items.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(term);
      const idMatch = item.id?.toString().includes(term);
      const typeMatch = item.typeClothing?.name?.toLowerCase().includes(term);
      return nameMatch || idMatch || typeMatch;
    });
  }, [items, search]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({ name: '', id_gender: '', id_type_clothing: '', id_category: '' });
    setShowModal(true);
  };

  const openEditModal = (row: any) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      id_gender: row.id_gender || (row.gender ? row.gender.id : '') || '',
      id_type_clothing: row.id_type_clothing || '',
      id_category: row.id_category || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (['id_gender', 'id_category'].includes(name)) {
      setForm((prev) => ({ ...prev, [name]: parseInt(value) || '' }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        await clothingApi.updateClothing(editing.id, form);
      } else {
        await clothingApi.createClothing(form);
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      logError(err, '/clothing');
      setError('Error al guardar la prenda: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Eliminar Prenda',
      text: `¿Estás seguro de que deseas eliminar la prenda "${row.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await clothingApi.deleteClothing(row.id);
      fetchData();
    } catch (err: any) {
      logError(err, '/clothing');
      await Swal.fire({ title: 'Error', text: 'Error al eliminar la prenda.', icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const columns = [
    { key: 'id', header: 'Ref', width: '80px' },
    { key: 'name', header: 'Nombre' },
    {
      key: 'gender',
      header: 'Género',
      render: (_value: any, row: any) => row.gender?.name || 'N/A',
    },
    {
      key: 'typeClothing',
      header: 'Tipo',
      render: (_value: any, row: any) => row.typeClothing?.name || 'N/A',
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Prendas" icon={<FiLayers />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar prenda por nombre, ref o tipo..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Prenda</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando prendas..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay prendas registradas"
          actions={(row) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)}>Editar</Button>
              <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)}>Eliminar</Button>
            </>
          )}
        />
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Editar Prenda' : 'Crear Prenda'} size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="Nombre de Prenda" name="name" value={form.name} onChange={handleChange} required placeholder="Ej: Camiseta Básica" />
            <FormField
              label="Género"
              name="id_gender"
              type="select"
              value={form.id_gender}
              onChange={handleChange}
              required
              placeholder="Seleccione Género"
              options={genders.map((g: any) => ({ value: g.id, label: g.name }))}
            />
            <FormField
              label="Tipo de Prenda"
              name="id_type_clothing"
              type="select"
              value={form.id_type_clothing}
              onChange={handleChange}
              required
              placeholder="Seleccione Tipo"
              options={typeClothings.map((t: any) => ({ value: t.id, label: t.name }))}
            />
            <FormField
              label="Categoría"
              name="id_category"
              type="select"
              value={form.id_category}
              onChange={handleChange}
              required
              placeholder="Seleccione Categoría"
              options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
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

export default ClothingPage;
