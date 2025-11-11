import React, { useState, useEffect } from 'react';

const YearProductionForm = ({ onSave, currentItem, onCancel }) => {
  const [item, setItem] = useState({ id: '', name: '', description: '' });

  useEffect(() => {
    if (currentItem) {
      setItem(currentItem);
    } else {
      setItem({ id: '', name: '', description: '' });
    }
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item);
    setItem({ id: '', name: '', description: '' }); // Reset form
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{currentItem ? 'Edit Year' : 'Add Year'}</h3>
      <input
        name="id"
        type="text"
        placeholder="ID (e.g., 24)"
        value={item.id}
        onChange={handleChange}
        maxLength="2"
        required
        disabled={!!currentItem}
      />
      <input
        name="name"
        type="text"
        placeholder="Name (e.g., 2024)"
        value={item.name}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={item.description || ''}
        onChange={handleChange}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit">{currentItem ? 'Update' : 'Create'}</button>
        {currentItem && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default YearProductionForm;