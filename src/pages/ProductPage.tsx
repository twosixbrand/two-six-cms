import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiPackage, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner, StatusBadge } from '../components/ui';
import * as productApi from '../services/productApi';
import * as clothingSizeApi from '../services/clothingSizeApi';
import { logError } from '../services/errorApi';

const ProductPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [clothingSizes, setClothingSizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    id_clothing_size: '',
    price: 0,
    active: true,
    is_outlet: false,
    discount_percentage: 0,
    discount_price: 0,
  });

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sharedData, setSharedData] = useState({ price: 0, active: true, is_outlet: false, discount_percentage: 0, discount_price: 0 });
  const [variants, setVariants] = useState<{ id_clothing_size: string }[]>([{ id_clothing_size: '' }]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [productsData, clothingSizesData] = await Promise.all([
        productApi.getProducts(),
        clothingSizeApi.getClothingSizes(),
      ]);
      setProducts(productsData);
      setClothingSizes(clothingSizesData);
    } catch (err: any) {
      logError(err, '/product');
      setError('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const existingClothingSizeIds = useMemo(() => new Set(products.map((p) => p.id_clothing_size)), [products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (search) {
      const term = search.toLowerCase();
      result = products.filter((p) => {
        const fields = [
          p.name, p.description, p.sku, p.price?.toString(), p.consecutive_number,
          p.clothingSize?.clothingColor?.design?.clothing?.name,
          p.clothingSize?.clothingColor?.color?.name,
          p.clothingSize?.size?.name,
          p.clothingSize?.clothingColor?.design?.collection?.name,
        ];
        return fields.some((f) => f?.toLowerCase().includes(term));
      });
    }
    const sizeOrder: Record<string, number> = { XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6 };
    return [...result].sort((a, b) => {
      const refA = a.clothingSize?.clothingColor?.design?.reference || '';
      const refB = b.clothingSize?.clothingColor?.design?.reference || '';
      const refComp = refA.localeCompare(refB, undefined, { numeric: true, sensitivity: 'base' });
      if (refComp !== 0) return refComp;
      const sA = a.clothingSize?.size?.name || '';
      const sB = b.clothingSize?.size?.name || '';
      return (sizeOrder[sA.toUpperCase()] || 99) - (sizeOrder[sB.toUpperCase()] || 99);
    });
  }, [products, search]);

  // Edit
  const openEditModal = (row: any) => {
    setEditing(row);
    setEditForm({
      id_clothing_size: row.id_clothing_size || '',
      price: row.price || 0,
      active: row.active ?? true,
      is_outlet: row.is_outlet || false,
      discount_percentage: row.discount_percentage || 0,
      discount_price: row.discount_price || 0,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditing(null);
  };

  const handleEditChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      setSaving(true);
      setError('');
      await productApi.updateProduct(editing.id, { ...editForm, price: Number(editForm.price) });
      closeEditModal();
      fetchData();
    } catch (err: any) {
      setError('Error al actualizar el producto: ' + err.message);
      logError(err, '/product-update');
    } finally {
      setSaving(false);
    }
  };

  // Create
  const openCreateModal = () => {
    setSharedData({ price: 0, active: true, is_outlet: false, discount_percentage: 0, discount_price: 0 });
    setVariants([{ id_clothing_size: '' }]);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleSharedChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setSharedData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVariantChange = (index: number, e: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [e.target.name]: e.target.value };
    setVariants(newVariants);
  };

  const addVariant = () => setVariants([...variants, { id_clothing_size: '' }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productsToCreate = variants
      .filter((v) => v.id_clothing_size)
      .map((v) => ({
        ...sharedData,
        id_clothing_size: Number(v.id_clothing_size),
        price: Number(sharedData.price),
      }));
    if (productsToCreate.length === 0) return;
    try {
      setSaving(true);
      setError('');
      await Promise.all(productsToCreate.map((item) => productApi.createProduct(item)));
      closeCreateModal();
      fetchData();
    } catch (err: any) {
      setError('Error al crear productos: ' + err.message);
      logError(err, '/product-create');
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Eliminar Producto',
      text: `¿Estas seguro de que deseas eliminar el producto "${row.sku}"? Esta accion no se puede deshacer.`,
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
      await productApi.deleteProduct(row.id);
      fetchData();
    } catch (err: any) {
      setError('Error al eliminar producto: ' + err.message);
      logError(err, '/product-delete');
    }
  };

  // Available clothing sizes for create (exclude already used)
  const availableClothingSizes = clothingSizes.filter((cs) => !existingClothingSizeIds.has(cs.id));

  const csLabel = (cs: any) =>
    `${cs.clothingColor?.design?.clothing?.name || '?'} - ${cs.clothingColor?.color?.name || '?'} - ${cs.size?.name || '?'}`;

  const columns = [
    { key: 'sku', header: 'SKU', width: '100px' },
    {
      key: 'image_url',
      header: 'Img',
      width: '60px',
      render: (value: any, row: any) =>
        value ? (
          <img src={value} alt={row.clothing_name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiPackage size={16} opacity={0.3} />
          </div>
        ),
    },
    { key: 'clothing_name', header: 'Prenda' },
    { key: 'color_name', header: 'Color' },
    { key: 'size_name', header: 'Talla', width: '70px' },
    {
      key: 'price',
      header: 'Precio',
      align: 'right' as const,
      render: (value: any) => `$${parseFloat(value).toLocaleString()}`,
    },
    {
      key: 'collection_name',
      header: 'Coleccion',
      render: (value: any, row: any) => `${value || 'N/A'} (${row.year_production || 'N/A'})`,
    },
    {
      key: 'active',
      header: 'Estado',
      render: (value: any, row: any) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <StatusBadge status={value ? 'Activo' : 'Inactivo'} variant={value ? 'success' : 'error'} size="sm" />
          {row.is_outlet && <StatusBadge status="Outlet" variant="gold" size="sm" />}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Administrar Productos" icon={<FiPackage />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar productos..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Productos</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando productos..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredProducts}
          emptyMessage="No hay productos registrados"
          actions={(row) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)}>Editar</Button>
              <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)}>Eliminar</Button>
            </>
          )}
        />
      )}

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={closeEditModal} title="Editar Producto" size="md">
        <form onSubmit={handleEditSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField
              label="Variante de Prenda"
              name="id_clothing_size"
              type="select"
              value={editForm.id_clothing_size}
              onChange={handleEditChange}
              disabled
              options={clothingSizes.map((cs) => ({ value: cs.id, label: csLabel(cs) }))}
            />
            <FormField label="Precio BASE" name="price" type="number" value={editForm.price} onChange={handleEditChange} required />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <FormField label="% Descuento" name="discount_percentage" type="number" value={editForm.discount_percentage} onChange={handleEditChange} />
              </div>
              <div style={{ flex: 1 }}>
                <FormField label="Precio Descuento" name="discount_price" type="number" value={editForm.discount_price} onChange={handleEditChange} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" name="active" checked={editForm.active} onChange={handleEditChange} /> Activo
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" name="is_outlet" checked={editForm.is_outlet} onChange={handleEditChange} /> Es Outlet
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeEditModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>Actualizar</Button>
          </div>
        </form>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={closeCreateModal} title="Crear Productos" size="lg">
        <form onSubmit={handleCreateSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Shared fields */}
            <div style={{ border: '1px solid #2a2a35', padding: '1.25rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
              <h4 style={{ margin: '0 0 1rem', color: '#f0b429', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>Datos Comunes</h4>
              <FormField label="Precio BASE" name="price" type="number" value={sharedData.price} onChange={handleSharedChange} required />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <FormField label="% Descuento" name="discount_percentage" type="number" value={sharedData.discount_percentage} onChange={handleSharedChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <FormField label="Precio Descuento" name="discount_price" type="number" value={sharedData.discount_price} onChange={handleSharedChange} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" name="active" checked={sharedData.active} onChange={handleSharedChange} /> Activo
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" name="is_outlet" checked={sharedData.is_outlet} onChange={handleSharedChange} /> Es Outlet
                </label>
              </div>
            </div>

            {/* Variants */}
            <h4 style={{ margin: '0.5rem 0 0', color: '#f0b429', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>Variantes a Crear</h4>
            {variants.map((variant, index) => {
              const currentSelectedIds = variants.map((v) => parseInt(v.id_clothing_size, 10)).filter((id) => !isNaN(id));
              return (
                <div key={index} style={{ border: '1px solid #2a2a35', padding: '1rem', borderRadius: 12, background: '#2a2a35', position: 'relative' }}>
                  <FormField
                    label={`Variante ${index + 1}`}
                    name="id_clothing_size"
                    type="select"
                    value={variant.id_clothing_size}
                    onChange={(e: any) => handleVariantChange(index, e)}
                    required
                    placeholder="Seleccione Variante"
                    options={availableClothingSizes
                      .filter((cs) => {
                        const isCurrentSelection = parseInt(variant.id_clothing_size, 10) === cs.id;
                        const isSelectedElsewhere = currentSelectedIds.includes(cs.id);
                        return isCurrentSelection || !isSelectedElsewhere;
                      })
                      .map((cs) => ({ value: cs.id, label: csLabel(cs) }))}
                  />
                  {variants.length > 1 && (
                    <Button variant="destructive" size="sm" onClick={() => removeVariant(index)}>Remover</Button>
                  )}
                </div>
              );
            })}
            <Button variant="outline" size="sm" onClick={addVariant}>+ Agregar Otra Variante</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeCreateModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>Crear Productos</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductPage;
