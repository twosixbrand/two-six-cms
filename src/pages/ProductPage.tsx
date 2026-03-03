import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiPackage, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import ProductList from '../components/product/ProductList.jsx';
import ProductForm from '../components/product/ProductForm.jsx';
import * as productApi from '../services/productApi.js';
import * as clothingSizeApi from '../services/clothingSizeApi.js';
import { logError } from '../services/errorApi.js';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [clothingSizes, setClothingSizes] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [productsData, clothingSizesData] = await Promise.all([
        productApi.getProducts(),
        clothingSizeApi.getClothingSizes(),
      ]);
      setProducts(productsData);
      setClothingSizes(clothingSizesData);
    } catch (err) {
      logError(err, '/product');
      setError('Failed to fetch data. ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    return products.filter(product => {
      const searchTermLower = searchTerm.toLowerCase();
      const fieldsToSearch = [
        product.name,
        product.description,
        product.sku,
        product.price.toString(),
        product.consecutive_number,
        product.discount_percentage,
        product.discount_price,
        product.clothingSize?.clothingColor?.design?.clothing?.name,
        product.clothingSize?.clothingColor?.color?.name,
        product.clothingSize?.size?.name,
        product.clothingSize?.clothingColor?.design?.collection?.name,
        product.clothingSize?.clothingColor?.design?.collection?.id_year_production,
      ];
      return fieldsToSearch.some(field =>
        field?.toLowerCase().includes(searchTermLower)
      );
    });
  }, [products, searchTerm]);

  const existingClothingSizeIds = useMemo(() =>
    new Set(products.map(p => p.id_clothing_size)),
    [products]
  );

  const handleSave = async (itemData) => {
    try {
      setError('');
      if (currentItem) {
        await productApi.updateProduct(currentItem.id, itemData);
      } else {
        if (Array.isArray(itemData)) {
          // Creación múltiple
          await Promise.all(itemData.map(item => productApi.createProduct(item)));
        } else {
          await productApi.createProduct(itemData);
        }
      }
      fetchData();
      setCurrentItem(null);
    } catch (err) {
      logError(err, '/product-save');
      setError('Failed to save product. ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setError('');
        await productApi.deleteProduct(id);
        fetchData();
      } catch (err) {
        logError(err, '/product-delete');
        setError('Failed to delete product. ' + err.message);
      }
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Product Management" icon={<FiPackage />}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem', zIndex: 2 }} />
          <input
            type="text"
            placeholder="Filter products..."
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
          <ProductForm
            onSave={handleSave}
            currentItem={currentItem}
            onCancel={handleCancel}
            clothingSizes={clothingSizes}
            existingClothingSizeIds={existingClothingSizeIds}
          />
        </div>
        <div className="list-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Products</h2>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ProductList
              items={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;