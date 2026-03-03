import React, { useState, useEffect, useMemo } from 'react';
import { FiArchive, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import CollectionList from '../components/collection/CollectionList';
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
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const lowerTerm = searchTerm.toLowerCase();
    return items.filter(item =>
      item.name?.toLowerCase().includes(lowerTerm) ||
      item.season?.name?.toLowerCase().includes(lowerTerm) ||
      item.yearProduction?.year?.toString().includes(lowerTerm)
    );
  }, [items, searchTerm]);

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
      <PageHeader title="Collection Management" icon={<FiArchive />}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem', zIndex: 2 }} />
          <input
            type="text"
            placeholder="Search by name, season or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem 0.8rem 3.2rem',
              borderRadius: '50px',
              background: 'var(--surface-color)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              color: 'var(--text-primary)',
              transition: 'all 0.3s ease',
              fontSize: '0.95rem'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-color)';
              e.target.style.boxShadow = '0 4px 20px rgba(212,175,55,0.15)';
              e.target.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
            }}
          />
        </div>
      </PageHeader>
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
            <CollectionList items={filteredItems} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;