import React, { useState, useEffect, useCallback } from 'react';
import DesignProviderList from '../components/design-provider/DesignProviderList.jsx';
import DesignProviderForm from '../components/design-provider/DesignProviderForm.jsx';
import * as designProviderApi from '../services/designProviderApi.js';
import * as masterDesignApi from '../services/masterDesignApi.js';
import * as providerApi from '../services/providerApi.js';
import { logError } from '../services/errorApi.js';

const DesignProviderPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [masterDesigns, setMasterDesigns] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [assignmentsData, designsData, providersData] = await Promise.all([
        designProviderApi.getDesignProviders(),
        masterDesignApi.getMasterDesigns(),
        providerApi.getProviders(),
      ]);
      setAssignments(assignmentsData);
      setMasterDesigns(designsData);
      setProviders(providersData);
    } catch (err) {
      logError(err, '/design-provider');
      setError('Failed to fetch data. ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (assignmentData) => {
    try {
      await designProviderApi.createDesignProvider(assignmentData);
      fetchData(); // Refresh the list
    } catch (err) {
      logError(err, '/design-provider-save');
      setError('Failed to assign provider. ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await designProviderApi.deleteDesignProvider(id);
        fetchData(); // Refresh the list
      } catch (err) {
        logError(err, '/design-provider-delete');
        setError('Failed to delete assignment. ' + err.message);
      }
    }
  };

  return (
    <div className="page-container">
      <h1>Design Provider Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <DesignProviderForm
            onSave={handleSave}
            masterDesigns={masterDesigns}
            providers={providers}
          />
        </div>
        <div className="list-card">
          <h2>Current Assignments</h2>
          {loading ? (
            <p>Loading assignments...</p>
          ) : (
            <DesignProviderList
              items={assignments}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignProviderPage;