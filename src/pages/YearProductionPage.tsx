import React, { useState, useEffect } from 'react';
import YearProductionList from '../components/year-production/YearProductionList';
import YearProductionForm from '../components/year-production/YearProductionForm';
import * as yearProductionApi from '../services/yearProductionApi';
import { logError } from '../services/errorApi';

const YearProductionPage = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await yearProductionApi.getYearProductions();
      setItems(data);
      setError('');
    } catch (err) {
      logError(err, '/year-production');
      setError('Failed to fetch year productions.');
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
        await yearProductionApi.updateYearProduction(currentItem.id, itemData);
      } else {
        await yearProductionApi.createYearProduction(itemData);
      }
      fetchItems();
      setCurrentItem(null);
    } catch (err) {
      logError(err, '/year-production');
      setError('Failed to save year production: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this year?')) {
      try {
        await yearProductionApi.deleteYearProduction(id);
        fetchItems();
      } catch (err) {
        logError(err, '/year-production');
        setError('Failed to delete year production.');
      }
    }
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  return (
    <div className="page-container">
      <h1>Year Production Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <YearProductionForm onSave={handleSave} currentItem={currentItem} onCancel={handleCancel} />
        </div>
        <div className="list-card">
          {loading ? (
            <p>Loading years...</p>
          ) : (
            <YearProductionList items={items} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default YearProductionPage;