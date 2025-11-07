import React, { useState, useEffect } from 'react';
import '../styles/MasterDesign.css';
import MasterDesignList from '../components/master-design/MasterDesignList';
import MasterDesignForm from '../components/master-design/MasterDesignForm';
import * as masterDesignApi from '../services/masterDesignApi';
import * as providerApi from '../services/providerApi';
import * as clothingApi from '../services/clothingApi';
import * as collectionApi from '../services/collectionApi';
import * as yearProductionApi from '../services/yearProductionApi';
import { logError } from '../services/errorApi';

const MasterDesignPage = () => {
  const [designs, setDesigns] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [error, setError] = useState('');

  // Estados para los datos de los selects del formulario
  const [providers, setProviders] = useState([]);
  const [clothings, setClothings] = useState([]);
  const [collections, setCollections] = useState([]);
  const [years, setYears] = useState([]);

  const fetchData = async () => {
    try {
      const [designsData, providersData, clothingsData, collectionsData, yearsData] = await Promise.all([
        masterDesignApi.getMasterDesigns(),
        providerApi.getProviders(),
        clothingApi.getClothing(),
        collectionApi.getCollections(),
        yearProductionApi.getYearProductions(),
      ]);
      setDesigns(designsData);
      setProviders(providersData);
      setClothings(clothingsData);
      setCollections(collectionsData);
      setYears(yearsData);
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
    setCurrentItem(item);
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

  return (
    <div className="master-design-container">
      <h1>Master Design Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="master-design-content">
        <MasterDesignForm
          onSubmit={handleSave}
          initialData={currentItem || {}}
          providers={providers}
          clothings={clothings}
          collections={collections}
          years={years}
        />
        <MasterDesignList designs={designs} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default MasterDesignPage;