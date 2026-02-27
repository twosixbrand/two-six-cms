import { handleResponse } from './apiUtils.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/stock`;
const API_NAME = 'stock';

export const getStocks = async () => {
    const response = await fetch(ENDPOINT);
    return handleResponse(response, API_NAME);
};

export const createStock = async (item) => {
    // Convertir a números
    const dataToSend = {
        id_design_clothing: parseInt(item.id_design_clothing, 10),
        current_quantity: parseInt(item.current_quantity, 10),
        available_quantity: parseInt(item.available_quantity, 10),
        sold_quantity: parseInt(item.sold_quantity, 10),
        consignment_quantity: parseInt(item.consignment_quantity, 10),
    };

    const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
    });
    return handleResponse(response, API_NAME);
};

export const updateStock = async (id, item) => {
    const dataToSend = {
        current_quantity: parseInt(item.current_quantity, 10),
        available_quantity: parseInt(item.available_quantity, 10),
        sold_quantity: parseInt(item.sold_quantity, 10),
        consignment_quantity: parseInt(item.consignment_quantity, 10),
    };

    const response = await fetch(`${ENDPOINT}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
    });
    return handleResponse(response, API_NAME);
};

export const deleteStock = async (id) => {
    const response = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
    return handleResponse(response, API_NAME);
};
