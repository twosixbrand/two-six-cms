import { handleResponse } from './apiUtils.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/master-design`;
const API_NAME = 'master-design';

export const getMasterDesigns = async () => {
  const response = await fetch(API_ENDPOINT);
  return handleResponse(response, API_NAME);
};

export const getMasterDesignById = async (id) => {
  const response = await fetch(`${API_ENDPOINT}/${id}`);
  return handleResponse(response, API_NAME);
};

export const createMasterDesign = async (designData) => {
  let body;
  let headers = {};

  if (designData.file) {
    const formData = new FormData();
    formData.append('description', designData.description || '');
    formData.append('manufactured_cost', designData.manufactured_cost);
    formData.append('id_clothing', designData.id_clothing);
    formData.append('id_collection', designData.id_collection);
    formData.append('file', designData.file);
    body = formData;
    // Don't set Content-Type header for FormData, browser does it with boundary
  } else {
    body = JSON.stringify({
      description: designData.description,
      manufactured_cost: parseFloat(designData.manufactured_cost),
      id_clothing: parseInt(designData.id_clothing, 10),
      id_collection: parseInt(designData.id_collection, 10),
    });
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: headers,
    body: body,
  });
  return handleResponse(response, API_NAME);
};

export const updateMasterDesign = async (id, designData) => {
  let body;
  let headers = {};

  if (designData.file) {
    const formData = new FormData();
    if (designData.description) formData.append('description', designData.description);
    if (designData.manufactured_cost) formData.append('manufactured_cost', designData.manufactured_cost);
    if (designData.id_clothing) formData.append('id_clothing', designData.id_clothing);
    if (designData.id_collection) formData.append('id_collection', designData.id_collection);
    formData.append('file', designData.file);
    body = formData;
  } else {
    body = JSON.stringify({
      description: designData.description,
      manufactured_cost: parseFloat(designData.manufactured_cost),
      id_clothing: parseInt(designData.id_clothing, 10),
      id_collection: parseInt(designData.id_collection, 10),
    });
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: headers,
    body: body,
  });
  return handleResponse(response, API_NAME);
};

export const deleteMasterDesign = async (id) => {
  const response = await fetch(`${API_ENDPOINT}/${id}`, { method: 'DELETE' });
  return handleResponse(response, API_NAME);
};