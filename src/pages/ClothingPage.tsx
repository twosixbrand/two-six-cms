import React, { useState, useEffect } from 'react';
import { FiLayers, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import ClothingList from '../components/clothing/ClothingList';
import ClothingForm from '../components/clothing/ClothingForm';
import * as clothingApi from '../services/clothingApi';
import * as typeClothingApi from '../services/typeClothingApi';
import * as categoryApi from '../services/categoryApi';
import { logError } from '../services/errorApi';

const ClothingPage = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [typeClothings, setTypeClothings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clothingData, typeClothingData, categoryData] = await Promise.all([
        clothingApi.getClothing(),
        typeClothingApi.getTypeClothings(),
        categoryApi.getCategories(),
      ]);
      setItems(clothingData);
      setTypeClothings(typeClothingData);
      setCategories(categoryData);
      setError('');
    } catch (err) {
      logError(err, '/clothing');
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
        await clothingApi.updateClothing(currentItem.id, itemData);
      } else {
        await clothingApi.createClothing(itemData);
      }
      fetchData();
      setCurrentItem(null);
    } catch (err) {
      logError(err, '/clothing');
      setError('Failed to save clothing item: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta prenda?")) return;
    try {
      await clothingApi.deleteClothing(id);
      fetchData();
    } catch (err) {
      logError(err, '/clothing');
      setError('Failed to delete clothing item.');
    }
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  const filteredItems = items.filter(item => {
    const term = searchTerm.toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(term);
    const idMatch = item.id?.toString().includes(term);
    const typeMatch = item.typeClothing?.name?.toLowerCase().includes(term);
    return nameMatch || idMatch || typeMatch;
  });

  return (
    <div className="page-container">
      <PageHeader title="Clothing Management" icon={<FiLayers />}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem', zIndex: 2 }} />
          <input
            type="text"
            placeholder="Buscar prenda por nombre, ref o tipo..."
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
        <div className="form-card" style={{ height: 'fit-content' }}>
          <ClothingForm
            onSave={handleSave}
            currentItem={currentItem}
            onCancel={handleCancel}
            typeClothings={typeClothings}
            categories={categories}
          />
        </div>
        <div className="list-card" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.3)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
              <p>Cargando prendas...</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5rem 2rem',
              background: 'var(--surface-color)',
              border: '2px dashed var(--border-color)',
              borderRadius: '20px',
              textAlign: 'center'
            }}>
              <FiSearch style={{ fontSize: '3rem', color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>No se encontraron prendas para "{searchTerm}"</p>
              <button
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => setSearchTerm('')}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <ClothingList items={filteredItems} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClothingPage;