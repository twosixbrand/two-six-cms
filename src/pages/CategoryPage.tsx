import React, { useState, useEffect, useMemo } from 'react';
import { FiFolder, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import CategoryList from '../components/category/CategoryList';
import CategoryForm from '../components/category/CategoryForm';
import * as categoryApi from '../services/categoryApi';
import { logError } from '../services/errorApi';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    const lowerTerm = searchTerm.toLowerCase();
    return categories.filter(category =>
      category.name?.toLowerCase().includes(lowerTerm)
    );
  }, [categories, searchTerm]);

  const handleSave = async (itemData) => {
    try {
      if (currentItem) {
        await categoryApi.updateCategory(currentItem.id, itemData);
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
      <PageHeader title="Category Management" icon={<FiFolder />}>
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
          <CategoryForm onSave={handleSave} currentItem={currentItem} onCancel={handleCancel} />
        </div>
        <div className="list-card">
          <CategoryList categories={filteredCategories} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;