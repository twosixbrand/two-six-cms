import { handleResponse } from './apiUtils.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/clothing-color`;
const API_NAME = 'clothing-color';

export const getClothingColors = async () => {
  const response = await fetch(API_ENDPOINT);
  return handleResponse(response, API_NAME);
};

export const createClothingColor = async (item) => {
  const dataToSend = {
    ...item,
    id_color: parseInt(item.id_color, 10),
    id_design: parseInt(item.id_design, 10),
  };
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataToSend),
  });
  return handleResponse(response, API_NAME);
};

export const updateClothingColor = async (id, item) => {
  const dataToSend = {
    ...item,
    id_color: parseInt(item.id_color, 10),
    id_design: parseInt(item.id_design, 10),
  };
  const response = await fetch(`${API_ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataToSend),
  });
  return handleResponse(response, API_NAME);
};

export const deleteClothingColor = async (id) => {
  const response = await fetch(`${API_ENDPOINT}/${id}`, { method: 'DELETE' });
  // La respuesta de un DELETE exitoso a menudo no tiene cuerpo.
  return handleResponse(response, API_NAME);
};

export const createContextual = async (formData) => {
  const response = await fetch(`${API_ENDPOINT}/contextual`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response, API_NAME);
};