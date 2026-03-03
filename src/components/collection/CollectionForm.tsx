import React, { useState, useEffect } from 'react';

const CollectionForm = ({ onSave, currentItem, onCancel, seasons, years }) => {
  const [item, setItem] = useState({
    id: '',
    name: '',
    description: '',
    seasonId: '',
    yearProductionId: '',
  });

  useEffect(() => {
    if (currentItem) {
      setItem({
        id: currentItem.id,
        name: currentItem.name,
        description: currentItem.description || '',
        seasonId: currentItem.seasonId,
        yearProductionId: currentItem.yearProductionId,
      });
    } else {
      setItem({ id: '', name: '', description: '', seasonId: '', yearProductionId: '' });
    }
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item);
    setItem({ id: '', name: '', description: '', seasonId: '', yearProductionId: '' }); // Reset form
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        {currentItem ? 'Editar Colección' : 'Agregar Colección'}
      </h3>
      {currentItem && (
        <div className="form-group">
          <label htmlFor="id">ID</label>
          <input id="id" name="id" type="text" value={item.id} readOnly disabled />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Nombre de la Colección</label>
        <input id="name" name="name" type="text" placeholder="Ej: Verano 2026" value={item.name} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <textarea id="description" name="description" placeholder="Breve descripción..." value={item.description} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="seasonId">Temporada</label>
        <select id="seasonId" name="seasonId" value={item.seasonId} onChange={handleChange} required>
          <option value="">Seleccione Temporada</option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="yearProductionId">Año de Producción</label>
        <select id="yearProductionId" name="yearProductionId" value={item.yearProductionId} onChange={handleChange} required>
          <option value="">Seleccione Año</option>
          {years.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name}
            </option>
          ))}
        </select>
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

export default CollectionForm;