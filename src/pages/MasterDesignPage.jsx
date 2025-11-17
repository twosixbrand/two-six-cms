import React, { useState, useEffect } from 'react';
import '../styles/MasterDesign.css';
import MasterDesignList from '../components/master-design/MasterDesignList';
import MasterDesignForm from '../components/master-design/MasterDesignForm';
import * as masterDesignApi from '../services/masterDesignApi';
import * as clothingApi from '../services/clothingApi';
import * as collectionApi from '../services/collectionApi';
import { logError } from '../services/errorApi';

const MasterDesignPage = () => {
  const [designs, setDesigns] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [error, setError] = useState('');
  
  // Estados para los datos de los selects del formulario
  const [clothings, setClothings] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedProvidersDetail, setSelectedProvidersDetail] = useState(null); // Nuevo estado para detalles de proveedores

  const fetchData = async () => {
    try {
      const [designsData, clothingsData, collectionsData] = await Promise.all([
        masterDesignApi.getMasterDesigns(),
        clothingApi.getClothing(),
        collectionApi.getCollections(),
      ]);
      setDesigns(designsData);
      setClothings(clothingsData);
      setCollections(collectionsData);
    } catch (err) {
      logError(err, '/master-design');
      setError('Failed to fetch data.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (itemData) => {
    try {
      if (currentItem) {
        await masterDesignApi.updateMasterDesign(currentItem.id, itemData);
      } else {
        await masterDesignApi.createMasterDesign(itemData);
      }
      fetchData();
      setCurrentItem(null);
    } catch (err) {
      logError(err, '/master-design');
      setError('Failed to save design: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem({ ...item }); // Asegurarse de pasar el objeto completo
  };

  const handleDelete = async (id) => {
    try {
      await masterDesignApi.deleteMasterDesign(id);
      fetchData();
    } catch (err) {
      logError(err, '/master-design');
      setError('Failed to delete design.');
    }
  };

  const handleViewProviders = (design) => {
    setSelectedProvidersDetail(design.designProviders);
  };

  const closeProvidersDetail = () => {
    setSelectedProvidersDetail(null);
  };

  return (
    <div className="master-design-container">
      <h1>Master Design Management</h1>
      {error && <p className="error-message">{error}</p>}
      {selectedProvidersDetail && (
        <div className="providers-detail-modal">
          <h2>Proveedores del Diseño</h2>
          <ul>{selectedProvidersDetail.map(dp => <li key={dp.provider.id}>{dp.provider.company_name} ({dp.provider.id})</li>)}</ul>
          <button onClick={closeProvidersDetail}>Cerrar</button>
        </div>
      )}
      <div className="master-design-content">
        <MasterDesignForm
          onSubmit={handleSave}
          initialData={currentItem || {}}
          clothings={clothings}
          collections={collections}
        />
        <MasterDesignList
          designs={designs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewProviders={handleViewProviders} // Pasamos la nueva función
        />
      </div>
    </div>
  );
};

export default MasterDesignPage;