import React, { useState, useEffect } from 'react';

const DesignClothingForm = ({ onSave, currentItem, onCancel, designs, colors, sizes }) => {
  const getInitialVariantState = () => ({
    id_size: '',
    quantity_produced: '',
    quantity_available: 0,
    quantity_sold: 0,
    quantity_on_consignment: 0,
    quantity_under_warranty: 0
  });

  const getInitialEditState = () => ({
    id_design: '',
    id_color: '',
    id_size: '',
    quantity_produced: 0,
    quantity_available: 0,
    quantity_sold: 0,
    quantity_on_consignment: 0,
    quantity_under_warranty: 0,
  });

  const [id_design, setIdDesign] = useState('');
  const [id_color, setIdColor] = useState('');
  const [variants, setVariants] = useState([getInitialVariantState()]);
  const [editFormData, setEditFormData] = useState(getInitialEditState());

  useEffect(() => {
    if (currentItem) {
      setEditFormData({
        id_design: currentItem.id_design || '',
        id_color: currentItem.id_color || '',
        id_size: currentItem.id_size || '',
        quantity_produced: currentItem.quantity_produced || 0,
        quantity_available: currentItem.quantity_available || 0,
        quantity_sold: currentItem.quantity_sold || 0,
        quantity_on_consignment: currentItem.quantity_on_consignment || 0,
        quantity_under_warranty: currentItem.quantity_under_warranty || 0
      });
      setIdDesign('');
      setIdColor('');
      setVariants([getInitialVariantState()]);
    } else {
      setEditFormData(getInitialEditState());
    }
  }, [currentItem]);

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const newVariants = [...variants];
    newVariants[index][name] = name.startsWith('quantity') ? parseInt(value, 10) || 0 : value;
    setVariants(newVariants);
  };

  const handleAddVariant = () => {
    setVariants([...variants, getInitialVariantState()]);
  };

  const handleRemoveVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentItem) {
      // Modo Edición
      const dataToSave = {
        ...editFormData,
        id_color: parseInt(editFormData.id_color, 10),
        id_size: parseInt(editFormData.id_size, 10),
        quantity_produced: parseInt(editFormData.quantity_produced, 10),
        quantity_available: parseInt(editFormData.quantity_available, 10),
        quantity_sold: parseInt(editFormData.quantity_sold, 10),
        quantity_on_consignment: parseInt(editFormData.quantity_on_consignment, 10),
        quantity_under_warranty: parseInt(editFormData.quantity_under_warranty, 10),
      };
      delete dataToSave.id_design; // No se debe enviar el id_design en la actualización
      onSave(dataToSave);
    } else {
      // Modo Creación Múltiple
      const dataToSave = variants.map(variant => {
        const produced = parseInt(variant.quantity_produced, 10) || 0;
        return {
          id_design: parseInt(id_design, 10),
          id_color: parseInt(id_color, 10),
          id_size: parseInt(variant.id_size, 10),
          quantity_produced: produced,
          quantity_available: produced, // Se replica el valor de produced
          quantity_sold: 0,
          quantity_on_consignment: 0,
          quantity_under_warranty: 0,
        };
      });
      onSave(dataToSave);
      setIdDesign('');
      setIdColor('');
      setVariants([getInitialVariantState()]);
    }
  };

  if (currentItem) {
    // Formulario de edición (sin cambios)
    return (
      <form onSubmit={handleSubmit}>
        <h3>Edit Design Clothing</h3>
        {/* Los campos del formulario de edición se mantienen igual */}
        <div className="form-group">
          <label>Design</label>
          <select name="id_design" value={editFormData.id_design} onChange={handleEditFormChange} required>
            <option value="">Select Design</option>
            {designs.map(d => <option key={d.id} value={d.id}>{d.reference} - {d.clothing?.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Color</label>
          <select name="id_color" value={editFormData.id_color} onChange={handleEditFormChange} required>
            <option value="">Select Color</option>
            {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Size</label>
          <select name="id_size" value={editFormData.id_size} onChange={handleEditFormChange} required>
            <option value="">Select Size</option>
            {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Quantity Produced</label><input type="number" name="quantity_produced" value={editFormData.quantity_produced} onChange={handleEditFormChange} required /></div>
        <div className="form-group"><label>Quantity Available</label><input type="number" name="quantity_available" value={editFormData.quantity_available} onChange={handleEditFormChange} required /></div>
        <div className="form-group"><label>Quantity Sold</label><input type="number" name="quantity_sold" value={editFormData.quantity_sold} onChange={handleEditFormChange} required /></div>
        <div className="form-group"><label>Quantity on Consignment</label><input type="number" name="quantity_on_consignment" value={editFormData.quantity_on_consignment} onChange={handleEditFormChange} required /></div>
        <div className="form-group"><label>Quantity under Warranty</label><input type="number" name="quantity_under_warranty" value={editFormData.quantity_under_warranty} onChange={handleEditFormChange} required /></div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}><button type="submit">Update</button><button type="button" onClick={onCancel}>Cancel</button></div>
      </form>
    );
  }

  // Nuevo formulario de creación múltiple
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3>Add Design Clothing Variants</h3>
      
      {/* --- SECCIÓN DE CAMPOS PRINCIPALES --- */}
      <div className="main-fields-section">
        <div className="form-group">
          <label>Design</label>
          <select name="id_design" value={id_design} onChange={(e) => setIdDesign(e.target.value)} required>
            <option value="">Select Design</option>
            {designs.map(d => <option key={d.id} value={d.id}>{d.reference} - {d.clothing?.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Color</label>
          <select name="id_color" value={id_color} onChange={(e) => setIdColor(e.target.value)} required>
            <option value="">Select Color</option>
            {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* --- SECCIÓN DE VARIANTES POR TALLA --- */}
      <div className="variants-section">
        <h4>Variants by Size</h4>
        {variants.map((variant, index) => (
          <div key={index} className="variant-card">
            <div className="form-group">
              <label>Size</label>
              <select name="id_size" value={variant.id_size} onChange={(e) => handleVariantChange(index, e)} required>
                <option value="">Select Size</option>
                {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity Produced</label>
              <input type="number" name="quantity_produced" value={variant.quantity_produced} onChange={(e) => handleVariantChange(index, e)} required />
            </div>
            {variants.length > 1 && <button type="button" onClick={() => handleRemoveVariant(index)} className="button-remove-variant">Remove Size</button>}
          </div>
        ))}
        <button type="button" onClick={handleAddVariant} className="button-add-variant">Add Size Variant</button>
      </div>

      <div className="form-actions">
        <button type="submit">Create Variants</button>
      </div>
    </form>
  );
};

export default DesignClothingForm;