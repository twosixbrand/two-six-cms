import React, { useState, useEffect } from 'react'; 
import { categorySchema } from './category.schema';
import logger from '../../utils/logger';

const CategoryForm = ({ onSave, currentItem, onCancel }) => {
  const getInitialState = () => ({ name: '' });
  const [formData, setFormData] = useState<any>(getInitialState());
  const [errors, setErrors] = useState<any>({});

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
    try {
      categorySchema.parse(formData);
      logger.info({ formData }, 'Category validated successfully');
      onSave(formData);
    } catch (err: any) {
      const validationErrors = err.flatten().fieldErrors;
      setErrors(validationErrors);
      logger.error({ validationErrors }, 'Category validation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{currentItem ? 'Edit' : 'Add'} Category</h3>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        required
      />
      {errors.name && <span className="error">{errors.name[0]}</span>}
      <button type="submit">Save</button>
      {currentItem && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
};

export default CategoryForm;