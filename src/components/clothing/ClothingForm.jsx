import React, { useState, useEffect } from 'react';
import { getGenders } from '../../services/genderApi';

const ClothingForm = ({ onSave, currentItem, onCancel, typeClothings, categories }) => {
  const [item, setItem] = useState({
    name: '',
    id_gender: '',
    id_type_clothing: '',
    id_category: '',
  });
  const [genders, setGenders] = useState([]);

  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const data = await getGenders();
        setGenders(data);
      } catch (error) {
        console.error("Failed to fetch genders", error);
      }
    };
    fetchGenders();
  }, []);

  useEffect(() => {
    if (currentItem) {
      setItem({
        name: currentItem.name || '',
        id_gender: currentItem.id_gender || (currentItem.gender ? currentItem.gender.id : '') || '',
        id_type_clothing: currentItem.id_type_clothing || '',
        id_category: currentItem.id_category || '',
      });
    } else {
      setItem({ name: '', id_gender: '', id_type_clothing: '', id_category: '' });
    }
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle integer conversion for IDs
    if (['id_gender', 'id_category'].includes(name)) {
      setItem({ ...item, [name]: parseInt(value) || '' });
    } else {
      setItem({ ...item, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item);
    setItem({ name: '', id_gender: '', id_type_clothing: '', id_category: '' }); // Reset form
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

      <select
        name="id_gender"
        value={item.id_gender}
        onChange={handleChange}
        required
      >
        <option value="">Select Gender</option>
        {genders.map((gender) => (
          <option key={gender.id} value={gender.id}>
            {gender.name}
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