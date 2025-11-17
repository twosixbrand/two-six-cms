import React, { useState, useEffect } from 'react';

const ProductForm = ({ onSave, currentItem, onCancel, designClothings }) => {
  const getInitialState = () => ({
    id_design_clothing: '',
    name: '',
    description: '',
    sku: '',
    price: 0,
    consecutive_number: '',
    image_url: '',
    active: true,
    is_outlet: false,
    discount_percentage: '',
    discount_price: '',
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (currentItem) {
      setFormData({
        id_design_clothing: currentItem.id_design_clothing || '',
        name: currentItem.name || '',
        description: currentItem.description || '',
        sku: currentItem.sku || '',
        price: currentItem.price || 0,
        consecutive_number: currentItem.consecutive_number || '',
        image_url: currentItem.image_url || '',
        active: currentItem.active ?? true,
        is_outlet: currentItem.is_outlet || false,
        discount_percentage: currentItem.discount_percentage || '',
        discount_price: currentItem.discount_price || '',
      });
    } else {
      setFormData(getInitialState());
    }
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const { type, checked } = e.target;
    setFormData(prev => ({
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
  };

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
      </div>
      <div className="form-group">
        <label>Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>SKU</label>
        <input type="text" name="sku" value={formData.sku} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Price</label>
        <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Consecutive Number</label>
        <input type="text" name="consecutive_number" value={formData.consecutive_number} onChange={handleChange} />
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
    </form>
  );
};

export default ProductForm;