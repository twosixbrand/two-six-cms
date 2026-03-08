import React, { useState, useEffect } from 'react';

const TypeClothingForm = ({ onSave, currentItem, onCancel }) => {
  const getInitialState = () => ({ id: '', name: '' });
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
      <h3>{currentItem ? 'Editar Tipo de Prenda' : 'Agregar Tipo de Prenda'}</h3>

      <div className="form-group">
        <label htmlFor="id">ID (2 caracteres)</label>
        <input
          id="id"
          name="id"
          type="text"
          value={formData.id}
          onChange={handleChange}
          placeholder="Ej: CM"
          required
          maxLength={2}
          disabled={!!currentItem}
        />
      </div>

      <div className="form-group">
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej: Camiseta"
          required
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }}>{currentItem ? 'Actualizar' : 'Crear'}</button>
        {currentItem && (
          <button type="button" className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default TypeClothingForm;