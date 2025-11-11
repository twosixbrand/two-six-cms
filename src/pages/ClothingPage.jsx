import React, { useState, useEffect } from 'react';
import ClothingList from '../components/clothing/ClothingList';
import ClothingForm from '../components/clothing/ClothingForm';
import * as clothingApi from '../services/clothingApi';
import * as typeClothingApi from '../services/typeClothingApi';
import * as categoryApi from '../services/categoryApi';
import { logError } from '../services/errorApi';

const ClothingPage = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [typeClothings, setTypeClothings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clothingData, typeClothingData, categoryData] = await Promise.all([
        clothingApi.getClothing(),
        typeClothingApi.getTypeClothings(),
        categoryApi.getCategories(),
      ]);
      setItems(clothingData);
      setTypeClothings(typeClothingData);
      setCategories(categoryData);
      setError('');
    } catch (err) {
      logError(err, '/clothing');
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (itemData) => {
    try {
      if (currentItem) {
        await clothingApi.updateClothing(currentItem.id, itemData);
      } else {
        await clothingApi.createClothing(itemData);
      }
      fetchData();
      setCurrentItem(null);
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
      fetchData();
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
          <ClothingForm
            onSave={handleSave}
            currentItem={currentItem}
            onCancel={handleCancel}
            typeClothings={typeClothings}
            categories={categories}
          />
        </div>
        <div className="list-card">
          {loading ? (
            <p>Loading clothing...</p>
          ) : (
            <ClothingList items={items} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClothingPage;