import { logError } from './errorApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINTCOSNULTA = `${API_BASE_URL}/products-admin`;
const ENDPOINT = `${API_BASE_URL}/products`;

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || 'Something went wrong');
  }
  if (response.status === 204) return null;
  return response.json();
};

export const getProducts = async () => {
  const response = await fetch(ENDPOINTCOSNULTA);
  return handleResponse(response);
};

export const createProduct = async (item) => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return handleResponse(response);
};

export const updateProduct = async (id, item) => {
  const response = await fetch(`${ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_design_clothing: item.id_design_clothing,
      name: item.name,
      description: item.description,
      sku: item.sku,
      price: item.price,
      consecutive_number: item.consecutive_number,
      image_url: item.image_url,
      active: item.active,
      is_outlet: item.is_outlet,
      discount_percentage: item.discount_percentage,
      discount_price: item.discount_price,
    }),
  });
  return handleResponse(response);
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete' }));
    throw new Error(error.message);
  }
  if (response.status === 204) {
    return null;
  }
  return handleResponse(response);
};