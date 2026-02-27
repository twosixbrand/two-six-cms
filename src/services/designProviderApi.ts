import { logError } from './errorApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/design-provider`;

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || 'Something went wrong');
  }
  if (response.status === 204) return null;
  return response.json();
};

export const getDesignProviders = async () => {
  const response = await fetch(ENDPOINT);
  return handleResponse(response);
};

export const createDesignProvider = async (item) => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return handleResponse(response);
};

export const deleteDesignProvider = async (id) => {
  const response = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
  return handleResponse(response);
};