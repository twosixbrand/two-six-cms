import React, { useState, useEffect } from 'react';

const TypeClothingForm = ({ onSave, currentItem, onCancel }) => {
  const getInitialState = () => ({ code: '', name: '' });
  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (currentItem) {
      setFormData(currentItem);
    } else {
      setFormData(getInitialState());
    }
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{currentItem ? 'Edit' : 'Add'} Type Clothing</h3>
      <input
        name="code"
        value={formData.code}
        onChange={handleChange}
        placeholder="Code (1 character)"
        required
        maxLength="1"
        disabled={!!currentItem}
      />
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        required
      />
      <button type="submit">Save</button>
      {currentItem && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
};

export default TypeClothingForm;