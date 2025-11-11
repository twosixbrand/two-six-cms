import React, { useState, useEffect } from 'react';
import ProviderList from '../components/provider/ProviderList';
import ProviderForm from '../components/provider/ProviderForm';
import * as providerApi from '../services/providerApi';
import { logError } from '../services/errorApi';

const ProviderPage = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await providerApi.getProviders();
      setItems(data);
      setError('');
    } catch (err) {
      logError(err, '/provider');
      setError('Failed to fetch providers.');
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
        await providerApi.updateProvider(currentItem.id, itemData);
      } else {
        await providerApi.createProvider(itemData);
      }
      fetchItems();
      setCurrentItem(null);
    } catch (err) {
      logError(err, '/provider');
      setError('Failed to save provider: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      try {
        await providerApi.deleteProvider(id);
        fetchItems();
      } catch (err) {
        logError(err, '/provider');
        setError('Failed to delete provider.');
      }
    }
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  return (
    <div className="page-container">
      <h1>Provider Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <ProviderForm onSave={handleSave} currentItem={currentItem} onCancel={handleCancel} />
        </div>
        <div className="list-card">
          {loading ? (
            <p>Loading providers...</p>
          ) : (
            <ProviderList items={items} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderPage;