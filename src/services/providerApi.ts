const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/provider`;
const DOC_ENDPOINT = `${API_BASE_URL}/provider-document`;

// ============ Provider CRUD ============

export const getProviders = async () => {
  const response = await fetch(API_ENDPOINT);
  if (!response.ok) {
    throw new Error('Failed to fetch providers');
  }
  return response.json();
};

export const createProvider = async (itemData) => {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create provider');
  }
  return response.json();
};

export const updateProvider = async (id, itemData) => {
  const response = await fetch(`${API_ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update provider');
  }
  return response.json();
};

export const deleteProvider = async (id) => {
  const response = await fetch(`${API_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete provider');
  }
};

// ============ Provider Documents ============

export const getDocuments = async (providerId) => {
  const response = await fetch(`${DOC_ENDPOINT}/${providerId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  return response.json();
};

export const uploadDocument = async (providerId, file, documentType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);

  const response = await fetch(`${DOC_ENDPOINT}/upload/${providerId}`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(errorData.message || 'Failed to upload document');
  }
  return response.json();
};

export const deleteDocument = async (id) => {
  const response = await fetch(`${DOC_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete document');
  }
  return response.json();
};