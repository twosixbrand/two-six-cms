import React, { useState, useEffect, useMemo } from 'react';
import { FiPenTool, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
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
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredDesigns = useMemo(() => {
    let result = designs;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = designs.filter(design =>
        design.reference?.toLowerCase().includes(lowerTerm) ||
        design.clothing?.name?.toLowerCase().includes(lowerTerm) ||
        design.collection?.name?.toLowerCase().includes(lowerTerm) ||
        design.clothing?.gender?.name?.toLowerCase().includes(lowerTerm)
      );
    }

    return [...result].sort((a, b) => {
      const colA = a.collection?.name || '';
      const colB = b.collection?.name || '';
      const colComp = colA.localeCompare(colB, undefined, { sensitivity: 'base' });
      if (colComp !== 0) return colComp;

      const genA = a.clothing?.gender?.name || '';
      const genB = b.clothing?.gender?.name || '';
      return genA.localeCompare(genB, undefined, { sensitivity: 'base' });
    });
  }, [designs, searchTerm]);

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
      <PageHeader title="Master Design Management" icon={<FiPenTool />}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem', zIndex: 2 }} />
          <input
            type="text"
            placeholder="Search by ref, clothing or collection..."
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
          onCancel={() => setCurrentItem(null)}
          initialData={currentItem || {}}
          clothings={clothings}
          collections={collections}
          designs={designs}
        />
        <MasterDesignList
          designs={filteredDesigns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewProviders={handleViewProviders} // Pasamos la nueva función
        />
      </div>
    </div>
  );
};

export default MasterDesignPage;