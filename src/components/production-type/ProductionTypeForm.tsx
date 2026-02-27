import React, { useState, useEffect } from 'react';

const ProductionTypeForm = ({ onSave, currentItem, onCancel }) => {
  const [item, setItem] = useState({ name: '', description: '' });

  useEffect(() => {
    if (currentItem) {
      setItem(currentItem);
    } else {
      setItem({ name: '', description: '' });
    }
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item);
    setItem({ name: '', description: '' }); // Reset form
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{currentItem ? 'Edit Production Type' : 'Add Production Type'}</h3>
      {currentItem && (
        <div className="form-group">
          <label>ID</label>
          <input name="id" type="text" value={(item as any).id} readOnly disabled />
        </div>
      )}
      <div className="form-group">
        <label>Name</label>
        <input name="name" type="text" value={item.name} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea name="description" value={item.description} onChange={handleChange} />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit">{currentItem ? 'Update' : 'Create'}</button>
        {currentItem && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
};

export default ProductionTypeForm;