import React, { useState, useEffect } from 'react';
import ClothingList from '../components/clothing/ClothingList';
import ClothingForm from '../components/clothing/ClothingForm';
import * as clothingApi from '../services/clothingApi';
import { logError } from '../services/errorApi';

const ClothingPage = () => {
  const [clothing, setClothing] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [error, setError] = useState('');

  const fetchClothing = async () => {
    try {
      const data = await clothingApi.getClothing();
      setClothing(data);
    } catch (err) {
      logError(err, '/clothing');
      setError('Failed to fetch clothing items.');
    }
  };

  useEffect(() => {
    fetchClothing();
  }, []);

  const handleSave = async (itemData) => {
    try {
      // Prepara los datos que se enviarán al API
      const dataToSend = {
        id: itemData.id,
        name: itemData.name,
      };

      // Si currentItem existe, estamos editando. Si no, estamos creando.
      if (currentItem) {
        await clothingApi.updateClothing(itemData.id, dataToSend);
      } else {
        await clothingApi.createClothing(dataToSend);
      }
      fetchClothing(); // Refresh list
      setCurrentItem(null); // Clear form
    } catch (err) {
      logError(err, '/clothing');
      setError('Failed to save clothing item: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
  };

  const handleDelete = async (id) => {
    try {
      await clothingApi.deleteClothing(id);
      fetchClothing(); // Refresh list
    } catch (err) {
      logError(err, '/clothing');
      setError('Failed to delete clothing item.');
    }
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  return (
    <div className="page-container">
      <h1>Clothing Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <ClothingForm onSave={handleSave} currentItem={currentItem} onCancel={handleCancel} />
        </div>
        <div className="list-card">
          <ClothingList clothingItems={clothing} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default ClothingPage;