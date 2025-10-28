import React, { useState, useEffect } from 'react';
import TypeClothingList from '../components/type-clothing/TypeClothingList';
import TypeClothingForm from '../components/type-clothing/TypeClothingForm';
import * as typeClothingApi from '../services/typeClothingApi';
import { logError } from '../services/errorApi';

const TypeClothingPage = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await typeClothingApi.getTypeClothings();
      setItems(data);
      setError('');
    } catch (err) {
      logError(err, '/type-clothing');
      setError('Failed to fetch type clothing items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (itemData) => {
    try {
      if (currentItem) {
        await typeClothingApi.updateTypeClothing(itemData.code, itemData);
      } else {
        await typeClothingApi.createTypeClothing(itemData);
      }
      fetchItems();
      setCurrentItem(null);
    } catch (err) {
      logError(err, '/type-clothing');
      setError('Failed to save type clothing item.');
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
  };

  const handleDelete = async (id) => {
    try {
      await typeClothingApi.deleteTypeClothing(id);
      fetchItems();
    } catch (err) {
      logError(err, '/type-clothing');
      setError('Failed to delete type clothing item.');
    }
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  return (
    <div className="page-container">
      <h1>Type Clothing Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <TypeClothingForm onSave={handleSave} currentItem={currentItem} onCancel={handleCancel} />
        </div>
        <div className="list-card">
          {loading ? <p>Loading...</p> : <TypeClothingList items={items} onEdit={handleEdit} onDelete={handleDelete} />}
        </div>
      </div>
    </div>
  );
};

export default TypeClothingPage;