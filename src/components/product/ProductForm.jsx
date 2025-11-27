import React, { useState, useEffect } from 'react';

const ProductForm = ({ onSave, currentItem, onCancel, designClothings }) => {
  const getInitialState = () => ({
    id_design_clothing: '',
  // Estado para campos compartidos en modo de creación múltiple
  const getInitialSharedState = () => ({
    price: 0,
    image_url: '',
    active: true,
    is_outlet: false,
    discount_percentage: 0,
    discount_price: 0,
  });

  const [formData, setFormData] = useState(getInitialState());
  // Estado para una variante de diseño de prenda
  const getInitialVariantState = () => ({
    id_design_clothing: '',
    image_url: '',
  });

  // Estado para el formulario de edición
  const [editFormData, setEditFormData] = useState(getInitialSharedState());
  // Estados para el formulario de creación múltiple
  const [sharedData, setSharedData] = useState(getInitialSharedState());
  const [variants, setVariants] = useState([getInitialVariantState()]);

  useEffect(() => {
    if (currentItem) {
      setFormData({
      // Si estamos editando, usamos el estado del formulario de edición
      setEditFormData({
        id_design_clothing: currentItem.id_design_clothing || '',
        price: currentItem.price || 0,
        image_url: currentItem.image_url || '',
        active: currentItem.active ?? true,
        is_outlet: currentItem.is_outlet || false,
        discount_percentage: currentItem.discount_percentage || 0,
        discount_price: currentItem.discount_price || 0,
      });
    } else {
      setFormData(getInitialState());
      // Si estamos creando, reseteamos los formularios de creación
      setSharedData(getInitialSharedState());
      setVariants([getInitialVariantState()]);
    }
  }, [currentItem]);

  const handleChange = (e) => {
  // --- Handlers para el modo de creación múltiple ---
  const handleSharedChange = (e) => {
    const { name, value } = e.target;
    const { type, checked } = e.target;
    setFormData(prev => ({
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
    const dataToSave = {
      ...formData,
      id_design_clothing: parseInt(formData.id_design_clothing, 10),
      price: parseFloat(formData.price),
      active: !!formData.active,
      is_outlet: !!formData.is_outlet,
      discount_percentage: formData.discount_percentage,
      discount_price: formData.discount_price,
    };
    onSave(dataToSave);
    setFormData(getInitialState());
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
        .filter(v => v.id_design_clothing) // Solo procesar variantes con un diseño seleccionado
        .map(variant => ({
          ...sharedData,
          id_design_clothing: parseInt(variant.id_design_clothing, 10),
          image_url: variant.image_url,
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
          <label>Design Clothing</label>
          <select name="id_design_clothing" value={editFormData.id_design_clothing} onChange={handleEditChange} required disabled>
            <option value="">Select Design Clothing</option>
            {designClothings.map(dc => (
              <option key={dc.id} value={dc.id}>{dc.design?.clothing?.name} - {dc.color?.name} - {dc.size?.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group"><label>Price</label><input type="number" step="0.01" name="price" value={editFormData.price} onChange={handleEditChange} required /></div>
        <div className="form-group"><label>Image URL</label><input type="text" name="image_url" value={editFormData.image_url} onChange={handleEditChange} /></div>
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
      <h3>{currentItem ? 'Edit Product' : 'Add Product'}</h3>
      <div className="form-group">
        <label>Design Clothing</label>
        <select name="id_design_clothing" value={formData.id_design_clothing} onChange={handleChange} required disabled={!!currentItem}>
          <option value="">Select Design Clothing</option>
          {designClothings.map(dc => (
            <option key={dc.id} value={dc.id}>
              {dc.design?.clothing?.name} - {dc.color?.name} - {dc.size?.name}
            </option>
          ))}
        </select>
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
      <div className="form-group">
        <label>Price</label>
        <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />

      {/* --- SECCIÓN DE VARIANTES (DISEÑOS) --- */}
      <div className="variants-section">
        <h4>Designs to Create</h4>
        {variants.map((variant, index) => (
          <div key={index} className="variant-card" style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', position: 'relative' }}>
            <div className="form-group">
              <label>Design Clothing</label>
              <select name="id_design_clothing" value={variant.id_design_clothing} onChange={(e) => handleVariantChange(index, e)} required>
                <option value="">Select Design Clothing</option>
                {designClothings.map(dc => <option key={dc.id} value={dc.id}>{dc.design?.clothing?.name} - {dc.color?.name} - {dc.size?.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input type="text" name="image_url" value={variant.image_url} onChange={(e) => handleVariantChange(index, e)} />
            </div>
            {variants.length > 1 && <button type="button" onClick={() => handleRemoveVariant(index)} style={{ position: 'absolute', top: '10px', right: '10px' }}>Remove</button>}
          </div>
        ))}
        <button type="button" onClick={handleAddVariant}>Add Another Design</button>
      </div>
      <div className="form-group">
        <label>Image URL</label>
        <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Discount Percentage</label>
        <input type="text" name="discount_percentage" value={formData.discount_percentage} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Discount Price</label>
        <input type="text" name="discount_price" value={formData.discount_price} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label><input type="checkbox" name="active" checked={formData.active} onChange={handleChange} /> Active</label>
      </div>
      <div className="form-group">
        <label><input type="checkbox" name="is_outlet" checked={formData.is_outlet} onChange={handleChange} /> Is Outlet</label>
      </div>
      <button type="submit">{currentItem ? 'Update' : 'Create'}</button>
      {currentItem && <button type="button" onClick={onCancel}>Cancel</button>}

      <button type="submit">Create Products</button>
    </form>
  );
};

export default ProductForm;