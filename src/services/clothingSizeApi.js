import { handleResponse } from './apiUtils.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/clothing-size`;
const API_NAME = 'clothing-size';

export const getClothingSizes = async () => {
    const response = await fetch(API_ENDPOINT);
    return handleResponse(response, API_NAME);
};

export const createClothingSize = async (item) => {
    const dataToSend = {
        ...item,
        id_clothing_color: parseInt(item.id_clothing_color, 10),
        id_size: parseInt(item.id_size, 10),
        quantity_produced: parseInt(item.quantity_produced, 10),
        quantity_available: parseInt(item.quantity_available, 10),
        quantity_sold: parseInt(item.quantity_sold, 10),
        quantity_on_consignment: parseInt(item.quantity_on_consignment, 10),
        quantity_under_warranty: parseInt(item.quantity_under_warranty, 10),
        quantity_minimum_alert: parseInt(item.quantity_minimum_alert, 10) || null,
    };
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
    });
    return handleResponse(response, API_NAME);
};

export const updateClothingSize = async (id, item) => {
    const dataToSend = {
        ...item,
        id_clothing_color: parseInt(item.id_clothing_color, 10),
        id_size: parseInt(item.id_size, 10),
        quantity_produced: parseInt(item.quantity_produced, 10),
        quantity_available: parseInt(item.quantity_available, 10),
        quantity_sold: parseInt(item.quantity_sold, 10),
        quantity_on_consignment: parseInt(item.quantity_on_consignment, 10),
        quantity_under_warranty: parseInt(item.quantity_under_warranty, 10),
        quantity_minimum_alert: parseInt(item.quantity_minimum_alert, 10) || null,
    };
    const response = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
    });
    return handleResponse(response, API_NAME);
};

export const deleteClothingSize = async (id) => {
    const response = await fetch(`${API_ENDPOINT}/${id}`, { method: 'DELETE' });
    return handleResponse(response, API_NAME);
};
