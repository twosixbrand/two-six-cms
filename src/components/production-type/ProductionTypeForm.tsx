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
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        {currentItem ? 'Editar Tipo de Producción' : 'Agregar Tipo de Producción'}
      </h3>
      {currentItem && (
        <div className="form-group">
          <label htmlFor="id">ID</label>
          <input id="id" name="id" type="text" value={(item as any).id} readOnly disabled />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Nombre</label>
        <input id="name" name="name" type="text" value={item.name} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <textarea id="description" name="description" value={item.description} onChange={handleChange} />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
          {currentItem ? 'Actualizar' : 'Crear'}
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

export default ProductionTypeForm;