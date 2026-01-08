import React, { useState, useEffect, useCallback } from 'react';
import ClothingColorList from '../components/clothing-color/ClothingColorList.jsx';
import ClothingColorForm from '../components/clothing-color/ClothingColorForm.jsx';
import * as clothingColorApi from '../services/clothingColorApi.js';
import * as masterDesignApi from '../services/masterDesignApi.js';
import * as colorApi from '../services/colorApi.js';
import * as sizeApi from '../services/sizeApi.js';
import { logError } from '../services/errorApi.js';

const ClothingColorPage = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [itemsData, designsData, colorsData, sizesData] = await Promise.all([
        clothingColorApi.getClothingColors(),
        masterDesignApi.getMasterDesigns(),
        colorApi.getColors(),
        sizeApi.getSizes(),
      ]);
      setItems(itemsData);
      setDesigns(designsData);
      setColors(colorsData);
      setSizes(sizesData);
    } catch (err) {
      logError(err, '/clothing-color');
      setError('Failed to fetch data. ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (itemData) => {
    try {
      setError('');
      if (itemData instanceof FormData) {
        await clothingColorApi.createContextual(itemData);
      } else if (Array.isArray(itemData)) {
        // Creación múltiple
        await Promise.all(itemData.map(item => clothingColorApi.createClothingColor(item)));
      } else {
        // Creación o actualización única
        if (currentItem) {
          await clothingColorApi.updateClothingColor(currentItem.id, itemData);
        } else {
          await clothingColorApi.createClothingColor(itemData);
        }
      }
      fetchData();
      setCurrentItem(null);
    } catch (err) {
      logError(err, '/clothing-color-save');
      setError('Failed to save clothing color. ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setError('');
        await clothingColorApi.deleteClothingColor(id);
        fetchData();
      } catch (err) {
        logError(err, '/clothing-color-delete');
        setError('Failed to delete clothing color. ' + err.message);
      }
    }
  };

  return (
    <div className="page-container">
      <h1>Clothing Color Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <ClothingColorForm
            onSave={handleSave}
            currentItem={currentItem}
            onCancel={handleCancel}
            designs={designs}
            colors={colors}
            sizes={sizes}
          />
        </div>
        <div className="list-card">
          <h2>Clothing Colors</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ClothingColorList
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClothingColorPage;