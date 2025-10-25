import React, { useState, useEffect } from 'react'; 

const CategoryForm = ({ onSave, currentItem, onCancel }) => {
  const getInitialState = () => ({ code_cat: '', name: '', description: '' });
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
      <h3>{currentItem ? 'Edit' : 'Add'} Category</h3>
      <input
        name="code_cat"
        value={formData.code_cat}
        onChange={handleChange}
        placeholder="Code (2 characters)"
        required
        maxLength="2"
        disabled={!!currentItem}
      />
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        required
      />
      <textarea
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
        placeholder="Description"
      />
      <button type="submit">Save</button>
      {currentItem && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
};

export default CategoryForm;