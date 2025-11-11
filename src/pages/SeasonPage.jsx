import React, { useState, useEffect } from 'react';
import SeasonList from '../components/season/SeasonList';
import SeasonForm from '../components/season/SeasonForm';
import * as seasonApi from '../services/seasonApi';
import { logError } from '../services/errorApi';

const SeasonPage = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await seasonApi.getSeasons();
      setItems(data);
      setError('');
    } catch (err) {
      logError(err, '/season');
      setError('Failed to fetch seasons.');
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
        await seasonApi.updateSeason(currentItem.id, itemData);
      } else {
        await seasonApi.createSeason(itemData);
      }
      fetchItems();
      setCurrentItem(null);
    } catch (err) {
      logError(err, '/season');
      setError('Failed to save season: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this season?')) {
      try {
        await seasonApi.deleteSeason(id);
        fetchItems();
      } catch (err) {
        logError(err, '/season');
        setError('Failed to delete season.');
      }
    }
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  return (
    <div className="page-container">
      <h1>Season Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <SeasonForm onSave={handleSave} currentItem={currentItem} onCancel={handleCancel} />
        </div>
        <div className="list-card">
          {loading ? (
            <p>Loading seasons...</p>
          ) : (
            <SeasonList items={items} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SeasonPage;