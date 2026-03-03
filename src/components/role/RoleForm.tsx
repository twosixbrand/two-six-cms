import React, { useState, useEffect } from 'react';

const RoleForm = ({ onSave, currentItem, onCancel }) => {
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
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        {currentItem ? 'Editar Rol' : 'Agregar Rol'}
      </h3>

      <div className="form-group">
        <label htmlFor="name">Nombre del Rol</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej: Admin"
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
          placeholder="Breve descripción del rol..."
        />
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

export default RoleForm;