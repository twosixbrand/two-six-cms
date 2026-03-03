import React, { useState, useEffect, useMemo } from 'react';
import { FiShield, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import RoleList from '../components/role/RoleList';
import RoleForm from '../components/role/RoleForm';
import * as roleApi from '../services/roleApi';
import { logError } from '../services/errorApi';

const RolePage = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await roleApi.getRoles();
      setItems(data);
      setError('');
    } catch (err) {
      logError(err, '/role');
      setError('Failed to fetch roles.');
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
      item.name?.toLowerCase().includes(lowerTerm)
    );
  }, [items, searchTerm]);

  const handleSave = async (itemData) => {
    try {
      if (currentItem) {
        await roleApi.updateRole(currentItem.id, itemData);
      } else {
        await roleApi.createRole(itemData);
      }
      fetchItems();
      setCurrentItem(null);
    } catch (err) {
      logError(err, '/role');
      setError('Failed to save role.');
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
  };

  const handleDelete = async (id) => {
    try {
      await roleApi.deleteRole(id);
      fetchItems();
    } catch (err) {
      logError(err, '/role');
      setError('Failed to delete role.');
    }
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  return (
    <div className="page-container">
      <PageHeader title="Role Management" icon={<FiShield />}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem', zIndex: 2 }} />
          <input
            type="text"
            placeholder="Search by name..."
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
          <RoleForm onSave={handleSave} currentItem={currentItem} onCancel={handleCancel} />
        </div>
        <div className="list-card">
          {loading ? <p>Loading...</p> : <RoleList items={filteredItems} onEdit={handleEdit} onDelete={handleDelete} />}
        </div>
      </div>
    </div>
  );
};

export default RolePage;