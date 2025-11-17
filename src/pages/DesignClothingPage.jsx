import React, { useState, useEffect, useCallback } from 'react';
import DesignClothingList from '../components/design-clothing/DesignClothingList.jsx';
import DesignClothingForm from '../components/design-clothing/DesignClothingForm.jsx';
import * as designClothingApi from '../services/designClothingApi.js';
import * as masterDesignApi from '../services/masterDesignApi.js';
import * as colorApi from '../services/colorApi.js';
import * as sizeApi from '../services/sizeApi.js';
import { logError } from '../services/errorApi.js';

const DesignClothingPage = () => {
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
        designClothingApi.getDesignClothings(),
        masterDesignApi.getMasterDesigns(),
        colorApi.getColors(),
        sizeApi.getSizes(),
      ]);
      setItems(itemsData);
      setDesigns(designsData);
      setColors(colorsData);
      setSizes(sizesData);
    } catch (err) {
      logError(err, '/design-clothing');
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
      if (Array.isArray(itemData)) {
        // Creación múltiple
        await Promise.all(itemData.map(item => designClothingApi.createDesignClothing(item)));
      } else {
        // Creación o actualización única
        if (currentItem) {
          await designClothingApi.updateDesignClothing(currentItem.id, itemData);
        } else {
          await designClothingApi.createDesignClothing(itemData);
        }
      }
      fetchData();
      setCurrentItem(null);
    } catch (err) {
      logError(err, '/design-clothing-save');
      setError('Failed to save design clothing. ' + err.message);
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
        await designClothingApi.deleteDesignClothing(id);
        fetchData();
      } catch (err) {
        logError(err, '/design-clothing-delete');
        setError('Failed to delete design clothing. ' + err.message);
      }
    }
  };

  return (
    <div className="page-container">
      <h1>Design Clothing Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <DesignClothingForm
            onSave={handleSave}
            currentItem={currentItem}
            onCancel={handleCancel}
            designs={designs}
            colors={colors}
            sizes={sizes}
          />
        </div>
        <div className="list-card">
          <h2>Design Clothings</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <DesignClothingList
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

export default DesignClothingPage;