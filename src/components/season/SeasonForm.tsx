import React, { useState, useEffect } from 'react';

const SeasonForm = ({ onSave, currentItem, onCancel }) => {
  const getInitialState = () => ({ name: '', description: '' });
  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (currentItem) {
      setFormData({
        name: currentItem.name || '',
        description: currentItem.description || '',
      });
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
      <h3>{currentItem ? 'Editar Temporada' : 'Agregar Temporada'}</h3>
      {currentItem && (
        <div className="form-group">
          <label>ID</label>
          <input name="id" type="text" value={currentItem.id} readOnly disabled />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Nombre de la Temporada</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej: Invierno"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción (Opcional)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detalles sobre la temporada..."
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

export default SeasonForm;