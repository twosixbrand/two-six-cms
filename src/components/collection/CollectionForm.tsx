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
      <h3>{currentItem ? 'Edit Collection' : 'Add Collection'}</h3>
      {currentItem && (
        <div className="form-group">
          <label>ID</label>
          <input name="id" type="text" value={item.id} readOnly disabled />
        </div>
      )}
      <input name="name" type="text" placeholder="Name" value={item.name} onChange={handleChange} required />
      <textarea name="description" placeholder="Description" value={item.description} onChange={handleChange} />
      
      <select name="seasonId" value={item.seasonId} onChange={handleChange} required>
        <option value="">Select Season</option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name}
          </option>
        ))}
      </select>

      <select name="yearProductionId" value={item.yearProductionId} onChange={handleChange} required>
        <option value="">Select Year</option>
        {years.map((year) => (
          <option key={year.id} value={year.id}>
            {year.name}
          </option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: '10px' }}>
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

export default CollectionForm;