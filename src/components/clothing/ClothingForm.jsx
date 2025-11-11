import React, { useState, useEffect } from 'react';

const GENDERS = ['MASCULINO', 'FEMENINO', 'UNISEX'];

const ClothingForm = ({ onSave, currentItem, onCancel, typeClothings, categories }) => {
  const [item, setItem] = useState({
    name: '',
    gender: '',
    id_type_clothing: '',
    id_category: '',
  });

  useEffect(() => {
    if (currentItem) {
      setItem({
        name: currentItem.name || '',
        gender: currentItem.gender || '',
        id_type_clothing: currentItem.id_type_clothing || '',
        id_category: currentItem.id_category || '',
      });
    } else {
      setItem({ name: '', gender: '', id_type_clothing: '', id_category: '' });
    }
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item);
    setItem({ name: '', gender: '', id_type_clothing: '', id_category: '' }); // Reset form
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{currentItem ? 'Edit Clothing' : 'Add Clothing'}</h3>
      {currentItem && (
        <div className="form-group">
          <label>ID</label>
          <input name="id" type="text" value={currentItem.id} readOnly disabled />
        </div>
      )}
      <input
        name="name"
        type="text"
        placeholder="Name"
        value={item.name}
        onChange={handleChange}
        required
      />
      <select name="gender" value={item.gender} onChange={handleChange} required>
        <option value="">Select Gender</option>
        {GENDERS.map((gender) => (
          <option key={gender} value={gender}>
            {gender}
          </option>
        ))}
      </select>
      <select name="id_type_clothing" value={item.id_type_clothing} onChange={handleChange} required>
        <option value="">Select Type</option>
        {typeClothings.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
      <select name="id_category" value={item.id_category} onChange={handleChange} required>
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
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

export default ClothingForm;