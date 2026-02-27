import React, { useState, useEffect } from 'react';
import CollectionList from '../components/collection/CollectionList.jsx';
import CollectionForm from '../components/collection/CollectionForm';
import * as collectionApi from '../services/collectionApi';
import * as seasonApi from '../services/seasonApi';
import * as yearProductionApi from '../services/yearProductionApi';
import { logError } from '../services/errorApi';

const CollectionPage = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [collectionsData, seasonsData, yearsData] = await Promise.all([
        collectionApi.getCollections(),
        seasonApi.getSeasons(),
        yearProductionApi.getYearProductions(),
      ]);
      setItems(collectionsData);
      setSeasons(seasonsData);
      setYears(yearsData);
      setError('');
    } catch (err) {
      logError(err, '/collection');
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
        // Asegurarse de enviar solo los campos necesarios para la actualización
        const dataToUpdate = {
          name: itemData.name,
          description: itemData.description,
          seasonId: itemData.seasonId,
          yearProductionId: itemData.yearProductionId,
        };
        await collectionApi.updateCollection(currentItem.id, dataToUpdate);
      } else {
        await collectionApi.createCollection(itemData);
      }
      fetchData();
      setCurrentItem(null);
    } catch (err) {
      logError(err, '/collection');
      setError('Failed to save collection: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await collectionApi.deleteCollection(id);
        fetchData();
      } catch (err) {
        logError(err, '/collection');
        setError('Failed to delete collection.');
      }
    }
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  return (
    <div className="page-container">
      <h1>Collection Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <CollectionForm
            onSave={handleSave}
            currentItem={currentItem}
            onCancel={handleCancel}
            seasons={seasons}
            years={years}
          />
        </div>
        <div className="list-card">
          {loading ? (
            <p>Loading collections...</p>
          ) : (
            <CollectionList items={items} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;