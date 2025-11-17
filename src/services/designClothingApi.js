import { handleResponse } from './apiUtils.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/design-clothing`;
const API_NAME = 'design-clothing';

export const getDesignClothings = async () => {
  const response = await fetch(ENDPOINT);
  return handleResponse(response, API_NAME);
};

export const createDesignClothing = async (item) => {
  const dataToSend = {
    ...item,
    id_color: parseInt(item.id_color, 10),
    id_size: parseInt(item.id_size, 10),
    id_design: parseInt(item.id_design, 10),
    quantity_produced: parseInt(item.quantity_produced, 10),
    quantity_available: parseInt(item.quantity_available, 10),
    quantity_sold: parseInt(item.quantity_sold, 10),
    quantity_on_consignment: parseInt(item.quantity_on_consignment, 10),
    quantity_under_warranty: parseInt(item.quantity_under_warranty, 10),
  };
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataToSend),
  });
  return handleResponse(response, API_NAME);
};

export const updateDesignClothing = async (id, item) => {
  const dataToSend = {
    ...item,
    id_color: parseInt(item.id_color, 10),
    id_size: parseInt(item.id_size, 10),
    id_design: parseInt(item.id_design, 10),
    quantity_produced: parseInt(item.quantity_produced, 10),
    quantity_available: parseInt(item.quantity_available, 10),
    quantity_sold: parseInt(item.quantity_sold, 10),
    quantity_on_consignment: parseInt(item.quantity_on_consignment, 10),
    quantity_under_warranty: parseInt(item.quantity_under_warranty, 10),
  };
  const response = await fetch(`${ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataToSend),
  });
  return handleResponse(response, API_NAME);
};

export const deleteDesignClothing = async (id) => {
  const response = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
  // La respuesta de un DELETE exitoso a menudo no tiene cuerpo.
  return handleResponse(response, API_NAME);
};