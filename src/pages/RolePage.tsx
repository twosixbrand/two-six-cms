import React, { useState, useEffect } from 'react';
import RoleList from '../components/role/RoleList';
import RoleForm from '../components/role/RoleForm';
import * as roleApi from '../services/roleApi';
import { logError } from '../services/errorApi';

const RolePage = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <h1>Role Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <RoleForm onSave={handleSave} currentItem={currentItem} onCancel={handleCancel} />
        </div>
        <div className="list-card">
          {loading ? <p>Loading...</p> : <RoleList items={items} onEdit={handleEdit} onDelete={handleDelete} />}
        </div>
      </div>
    </div>
  );
};

export default RolePage;