import { logError } from './errorApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/order`;

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Something went wrong');
    }
    if (response.status === 204) return null;
    return response.json();
};

export const getOrders = async () => {
    const response = await fetch(ENDPOINT);
    return handleResponse(response);
};

export const getOrder = async (id) => {
    const response = await fetch(`${ENDPOINT}/${id}`);
    return handleResponse(response);
};

export const createOrder = async (item) => {
    const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    return handleResponse(response);
};

export const updateOrder = async (id, item) => {
    const response = await fetch(`${ENDPOINT}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    return handleResponse(response);
};

export const deleteOrder = async (id) => {
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
