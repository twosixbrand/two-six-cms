import React, { useState, useEffect } from 'react';

const ClothingForm = ({ onSave, currentItem }) => {
  const [formData, setFormData] = useState({ id: '', name: '', size: '', color: '', stock: 0 });

  useEffect(() => {
    if (currentItem) {
      setFormData(currentItem);
    } else {
      setFormData({ id: '', name: '', size: '', color: '', stock: 0 });
    }
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ id: '', name: '', size: '', color: '', stock: 0 }); // Reset form
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{currentItem ? 'Edit' : 'Add'} Clothing</h3>
      <input
        name="id"
        value={formData.id}
        onChange={handleChange}
        placeholder="ID (2 characters)"
        required
        maxLength="2"
        disabled={!!currentItem} // Deshabilita el campo al editar
      />
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        required
      />
      {/* Agrega aquí los demás campos: size, color, stock, etc. */}
      <input
        name="stock"
        type="number"
        value={formData.stock}
        onChange={handleChange}
        placeholder="Stock"
      />
      <button type="submit">Save</button>
    </form>
  );
};

export default ClothingForm;