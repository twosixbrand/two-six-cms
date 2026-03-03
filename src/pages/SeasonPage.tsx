import React, { useState, useEffect, useMemo } from 'react';
import { FiCloud, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import SeasonList from '../components/season/SeasonList';
import SeasonForm from '../components/season/SeasonForm';
import * as seasonApi from '../services/seasonApi';
import { logError } from '../services/errorApi';

const SeasonPage = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const lowerTerm = searchTerm.toLowerCase();
    return items.filter(item =>
      item.name?.toLowerCase().includes(lowerTerm) ||
      item.description?.toLowerCase().includes(lowerTerm)
    );
  }, [items, searchTerm]);

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
      <PageHeader title="Season Management" icon={<FiCloud />}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem', zIndex: 2 }} />
          <input
            type="text"
            placeholder="Search by season or description..."
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
          <SeasonForm onSave={handleSave} currentItem={currentItem} onCancel={handleCancel} />
        </div>
        <div className="list-card">
          {loading ? (
            <p>Loading seasons...</p>
          ) : (
            <SeasonList items={filteredItems} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SeasonPage;