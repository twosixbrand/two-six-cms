import React, { useState, useEffect } from 'react';
import CategoryList from '../components/category/CategoryList';
import CategoryForm from '../components/category/CategoryForm';
import * as categoryApi from '../services/categoryApi';
import { logError } from '../services/errorApi';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (err) {
      logError(err, '/category');
      setError('Failed to fetch categories.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (itemData) => {
    try {
      if (currentItem) {
        await categoryApi.updateCategory(itemData.code_cat, itemData);
      } else {
        await categoryApi.createCategory(itemData);
      }
      fetchCategories();
      setCurrentItem(null);
    } catch (err) {
      logError(err, '/category');
      setError('Failed to save category: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
  };

  const handleDelete = async (id) => {
    try {
      await categoryApi.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      logError(err, '/category');
      setError('Failed to delete category.');
    }
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  return (
    <div className="page-container">
      <h1>Category Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <CategoryForm onSave={handleSave} currentItem={currentItem} onCancel={handleCancel} />
        </div>
        <div className="list-card">
          <CategoryList categories={categories} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;