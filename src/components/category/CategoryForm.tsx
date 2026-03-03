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
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        {currentItem ? 'Editar Categoría' : 'Agregar Categoría'}
      </h3>

      <div className="form-group">
        <label htmlFor="name">Nombre de Categoría</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej: Ropa de Invierno"
          required
        />
        {errors.name && <span className="error" style={{ color: 'var(--error-color)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{errors.name[0]}</span>}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
          {currentItem ? 'Actualizar' : 'Guardar'}
        </button>
        {currentItem && (
          <button type="button" className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default CategoryForm;