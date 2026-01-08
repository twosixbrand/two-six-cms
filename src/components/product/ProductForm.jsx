import React, { useState, useEffect } from 'react';

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
  const [editFormData, setEditFormData] = useState(getInitialSharedState());
  // Estados para el formulario de creación múltiple
  const [sharedData, setSharedData] = useState(getInitialSharedState());
  const [variants, setVariants] = useState([getInitialVariantState()]);

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
        price: parseFloat(editFormData.price),
      };
      onSave(dataToSave);
    } else {
      // Lógica para guardar en modo creación múltiple
      const productsToCreate = variants
        .filter(v => v.id_clothing_size) // Solo procesar variantes con un diseño seleccionado
        .map(variant => ({
          ...sharedData,
          id_clothing_size: parseInt(variant.id_clothing_size, 10),
          price: parseFloat(sharedData.price),
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
        <h3>Edit Product</h3>
        <div className="form-group">
          <label>Clothing Variant</label>
          <select name="id_clothing_size" value={editFormData.id_clothing_size} onChange={handleEditChange} required disabled>
            <option value="">Select Clothing Variant</option>
            {clothingSizes.map(cs => (
              <option key={cs.id} value={cs.id}>{cs.clothingColor?.design?.clothing?.name} - {cs.clothingColor?.color?.name} - {cs.size?.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group"><label>Price</label><input type="number" step="0.01" name="price" value={editFormData.price} onChange={handleEditChange} required /></div>
        <div className="form-group"><label>Discount Percentage</label><input type="text" name="discount_percentage" value={editFormData.discount_percentage} onChange={handleEditChange} /></div>
        <div className="form-group"><label>Discount Price</label><input type="text" name="discount_price" value={editFormData.discount_price} onChange={handleEditChange} /></div>
        <div className="form-group"><label><input type="checkbox" name="active" checked={editFormData.active} onChange={handleEditChange} /> Active</label></div>
        <div className="form-group"><label><input type="checkbox" name="is_outlet" checked={editFormData.is_outlet} onChange={handleEditChange} /> Is Outlet</label></div>
        <button type="submit">Update</button>
        {currentItem && <button type="button" onClick={onCancel}>Cancel</button>}
      </form>
    );
  }

  // Renderiza el nuevo formulario de creación múltiple
  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Products</h3>
      {/* --- SECCIÓN DE DATOS COMUNES --- */}
      <div className="shared-fields-section" style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h4>Common Data</h4>
        <div className="form-group"><label>Price</label><input type="number" step="0.01" name="price" value={sharedData.price} onChange={handleSharedChange} required /></div>
        <div className="form-group"><label>Discount Percentage</label><input type="text" name="discount_percentage" value={sharedData.discount_percentage} onChange={handleSharedChange} /></div>
        <div className="form-group"><label>Discount Price</label><input type="text" name="discount_price" value={sharedData.discount_price} onChange={handleSharedChange} /></div>
        <div className="form-group"><label><input type="checkbox" name="active" checked={sharedData.active} onChange={handleSharedChange} /> Active</label></div>
        <div className="form-group"><label><input type="checkbox" name="is_outlet" checked={sharedData.is_outlet} onChange={handleSharedChange} /> Is Outlet</label></div>
      </div>

      {/* --- SECCIÓN DE VARIANTES (DISEÑOS) --- */}
      <div className="variants-section">
        <h4>Variants to Create</h4>
        {variants.map((variant, index) => (
          <div key={index} className="variant-card" style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', position: 'relative' }}>
            <div className="form-group">
              <label>Clothing Variant</label>
              <select name="id_clothing_size" value={variant.id_clothing_size} onChange={(e) => handleVariantChange(index, e)} required>
                <option value="">Select Clothing Variant</option>
                {clothingSizes
                  .filter(cs => !existingClothingSizeIds.has(cs.id))
                  .map(cs => (
                    <option key={cs.id} value={cs.id}>{cs.clothingColor?.design?.clothing?.name} - {cs.clothingColor?.color?.name} - {cs.size?.name}</option>
                  ))}
              </select>
            </div>
            {variants.length > 1 && <button type="button" onClick={() => handleRemoveVariant(index)} style={{ position: 'absolute', top: '10px', right: '10px' }}>Remove</button>}
          </div>
        ))}
        <button type="button" onClick={handleAddVariant}>Add Another Variant</button>
      </div>

      <button type="submit">Create Products</button>
    </form>
  );
};

export default ProductForm;