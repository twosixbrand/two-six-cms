import React, { useState, useEffect, useCallback } from 'react';
import ProductionTypeList from '../components/production-type/ProductionTypeList.jsx';
import ProductionTypeForm from '../components/production-type/ProductionTypeForm.jsx';
import * as productionTypeApi from '../services/productionTypeApi.js';
import { logError } from '../services/errorApi.js';

const ProductionTypePage = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      setError('');
      const data = await productionTypeApi.getProductionTypes();
      setItems(data);
    } catch (err) {
      setError('Failed to fetch production types.');
      logError(err, '/production-type');
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSave = async (itemData) => {
    try {
      setError('');
      if (currentItem) {
        await productionTypeApi.updateProductionType(currentItem.id, itemData);
      } else {
        await productionTypeApi.createProductionType(itemData);
      }
      fetchItems();
      setCurrentItem(null);
    } catch (err) {
      setError(`Failed to save production type: ${err.message}`);
      logError(err, '/production-type-save');
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
        await productionTypeApi.deleteProductionType(id);
        fetchItems();
      } catch (err) {
        setError('Failed to delete production type.');
        logError(err, '/production-type-delete');
      }
    }
  };

  return (
    <div className="page-container">
      <h1>Production Type Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <ProductionTypeForm
            onSave={handleSave}
            currentItem={currentItem}
            onCancel={handleCancel}
          />
        </div>
        <div className="list-card">
          <h2>Production Types</h2>
          {items.length > 0 ? (
            <ProductionTypeList
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <p>No production types found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionTypePage;