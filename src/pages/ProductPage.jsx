import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ProductList from '../components/product/ProductList.jsx';
import ProductForm from '../components/product/ProductForm.jsx';
import * as productApi from '../services/productApi.js';
import * as designClothingApi from '../services/designClothingApi.js';
import { logError } from '../services/errorApi.js';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [designClothings, setDesignClothings] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [productsData, designClothingsData] = await Promise.all([
        productApi.getProducts(),
        designClothingApi.getDesignClothings(),
      ]);
      setProducts(productsData);
      setDesignClothings(designClothingsData);
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
        product.clothing_name,
        product.color_name,
        product.size_name,
        product.collection_name,
        product.year_production,
      ];
      return fieldsToSearch.some(field =>
        field?.toLowerCase().includes(searchTermLower)
      );
    });
  }, [products, searchTerm]);

  const handleSave = async (itemData) => {
    try {
      setError('');
      if (currentItem) {
        await productApi.updateProduct(currentItem.id, itemData);
      } else {
        await productApi.createProduct(itemData);
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
      <h1>Product Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <ProductForm
            onSave={handleSave}
            currentItem={currentItem}
            onCancel={handleCancel}
            designClothings={designClothings}
          />
        </div>
        <div className="list-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Products</h2>
            <input type="text" placeholder="Filter products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '250px' }} />
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