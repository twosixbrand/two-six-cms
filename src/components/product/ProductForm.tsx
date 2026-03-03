import React, { useState, useEffect, useRef } from 'react';

const ProductForm = ({ onSave, currentItem, onCancel, clothingSizes, existingClothingSizeIds }) => {
  // Estado para campos compartidos en modo de creación múltiple
  const getInitialSharedState = () => ({
    price: 0,
    active: true,
    is_outlet: false,
    discount_percentage: 0,
    discount_price: 0,
  });

  // Estado para una variante de diseño de prenda
  const getInitialVariantState = () => ({
    id_clothing_size: '',
  });

  // Estado para el formulario de edición
  const [editFormData, setEditFormData] = useState<any>(getInitialSharedState());
  // Estados para el formulario de creación múltiple
  const [sharedData, setSharedData] = useState<any>(getInitialSharedState());
  const [variants, setVariants] = useState<any[]>([getInitialVariantState()]);
  const priceInputRef = useRef(null);

  useEffect(() => {
    if (currentItem) {
      // Si estamos editando, usamos el estado del formulario de edición
      setEditFormData({
        id_clothing_size: currentItem.id_clothing_size || '',
        price: currentItem.price || 0,
        active: currentItem.active ?? true,
        is_outlet: currentItem.is_outlet || false,
        discount_percentage: currentItem.discount_percentage || 0,
        discount_price: currentItem.discount_price || 0,
      });
    } else {
      // Si estamos creando, reseteamos los formularios de creación
      setSharedData(getInitialSharedState());
      setVariants([getInitialVariantState()]);
    }

    if (currentItem && priceInputRef.current) {
      priceInputRef.current.focus();
    }
  }, [currentItem]);

  // --- Handlers para el modo de creación múltiple ---
  const handleSharedChange = (e) => {
    const { name, value } = e.target;
    const { type, checked } = e.target;
    setSharedData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const newVariants = [...variants];
    newVariants[index][name] = value;
    setVariants(newVariants);
  };

  const handleAddVariant = () => {
    setVariants([...variants, getInitialVariantState()]);
  };

  const handleRemoveVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  // --- Handler para el modo de edición ---
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentItem) {
      // Lógica para guardar en modo edición
      const dataToSave = {
        ...editFormData,
        price: Number(editFormData.price),
      };
      onSave(dataToSave);
    } else {
      // Lógica para guardar en modo creación múltiple
      const productsToCreate = variants
        .filter(v => v.id_clothing_size) // Solo procesar variantes con un diseño seleccionado
        .map(variant => ({
          ...sharedData,
          id_clothing_size: Number(variant.id_clothing_size),
          price: Number(sharedData.price),
        }));

      if (productsToCreate.length > 0) {
        onSave(productsToCreate);
        setSharedData(getInitialSharedState());
        setVariants([getInitialVariantState()]);
      }
    }
  };

  // Renderiza el formulario de edición si hay un `currentItem`
  if (currentItem) {
    return (
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
          Editar Producto
        </h3>
        <div className="form-group">
          <label htmlFor="id_clothing_size">Variante de Prenda</label>
          <select name="id_clothing_size" value={editFormData.id_clothing_size} onChange={handleEditChange} required disabled>
            <option value="">Select Clothing Variant</option>
            {clothingSizes.map(cs => (
              <option key={cs.id} value={cs.id}>{cs.clothingColor?.design?.clothing?.name} - {cs.clothingColor?.color?.name} - {cs.size?.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group"><label htmlFor="price">Precio BASE</label><input type="number" step="0.01" id="price" name="price" value={editFormData.price} onChange={handleEditChange} required ref={priceInputRef} /></div>
        <div className="form-group"><label htmlFor="discount_percentage">Porcentaje Descuento</label><input type="text" id="discount_percentage" name="discount_percentage" value={editFormData.discount_percentage} onChange={handleEditChange} /></div>
        <div className="form-group"><label htmlFor="discount_price">Precio Descuento</label><input type="text" id="discount_price" name="discount_price" value={editFormData.discount_price} onChange={handleEditChange} /></div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <input type="checkbox" id="active" name="active" checked={editFormData.active} onChange={handleEditChange} style={{ width: 'auto' }} />
            <label htmlFor="active" style={{ marginBottom: 0 }}>Activo</label>
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <input type="checkbox" id="is_outlet" name="is_outlet" checked={editFormData.is_outlet} onChange={handleEditChange} style={{ width: 'auto' }} />
            <label htmlFor="is_outlet" style={{ marginBottom: 0 }}>Es Outlet</label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1 }}>Actualizar</button>
          {currentItem && <button type="button" className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>Cancelar</button>}
        </div>
      </form>
    );
  }

  // Renderiza el nuevo formulario de creación múltiple
  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        Agregar Productos
      </h3>
      {/* --- SECCIÓN DE DATOS COMUNES --- */}
      <div className="shared-fields-section" style={{ border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <h4 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--primary-color)' }}>Datos Comunes</h4>
        <div className="form-group"><label htmlFor="shared_price">Precio BASE</label><input type="number" step="0.01" id="shared_price" name="price" value={sharedData.price} onChange={handleSharedChange} required /></div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}><label htmlFor="shared_discount_percentage">Porcentaje Descuento</label><input type="text" id="shared_discount_percentage" name="discount_percentage" value={sharedData.discount_percentage} onChange={handleSharedChange} /></div>
          <div className="form-group" style={{ flex: 1 }}><label htmlFor="shared_discount_price">Precio Descuento</label><input type="text" id="shared_discount_price" name="discount_price" value={sharedData.discount_price} onChange={handleSharedChange} /></div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <input type="checkbox" id="shared_active" name="active" checked={sharedData.active} onChange={handleSharedChange} style={{ width: 'auto' }} />
            <label htmlFor="shared_active" style={{ marginBottom: 0 }}>Activo</label>
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <input type="checkbox" id="shared_is_outlet" name="is_outlet" checked={sharedData.is_outlet} onChange={handleSharedChange} style={{ width: 'auto' }} />
            <label htmlFor="shared_is_outlet" style={{ marginBottom: 0 }}>Es Outlet</label>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE VARIANTES (DISEÑOS) --- */}
      <div className="variants-section">
        <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Variantes a Crear</h4>
        {variants.map((variant, index) => {
          const currentSelectedIds = variants
            .map(v => parseInt(v.id_clothing_size, 10))
            .filter(id => !isNaN(id));

          return (
            <div key={index} className="variant-card" style={{ border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.4)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', position: 'relative' }}>
              <div className="form-group">
                <label htmlFor={`variant_${index}`}>Variante de Prenda</label>
                <select id={`variant_${index}`} name="id_clothing_size" value={variant.id_clothing_size} onChange={(e) => handleVariantChange(index, e)} required>
                  <option value="">Seleccione Variante</option>
                  {clothingSizes
                    .filter(cs => !existingClothingSizeIds.has(cs.id))
                    .filter(cs => {
                      const isSelectedCurrent = parseInt(variant.id_clothing_size, 10) === cs.id;
                      const isSelectedAnywhere = currentSelectedIds.includes(cs.id);
                      return isSelectedCurrent || !isSelectedAnywhere;
                    })
                    .map(cs => (
                      <option key={cs.id} value={cs.id}>{cs.clothingColor?.design?.clothing?.name} - {cs.clothingColor?.color?.name} - {cs.size?.name}</option>
                    ))}
                </select>
              </div>
              {variants.length > 1 && (
                <button type="button" className="btn-destructive" onClick={() => handleRemoveVariant(index)} style={{ position: 'absolute', top: '15px', right: '15px', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                  Remover
                </button>
              )}
            </div>
          );
        })}

        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', flexDirection: 'column' }}>
          <button type="button" className="btn-secondary" onClick={handleAddVariant} style={{ alignSelf: 'flex-start' }}>+ Agregar Otra Variante</button>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            Crear Productos
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;