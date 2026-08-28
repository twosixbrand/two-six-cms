import { handleResponse } from './apiUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3050/api';

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_DIAN_API_KEY || 'TwoSixAdminKey123!',
});

export const getActiveProducts = async () => {
    // Reutilizamos el endpoint de productos de admin que trae tallas y stock
    const response = await fetch(`${API_URL}/products-admin`, {
        method: 'GET',
        headers: authHeaders(),
    });
    const data = await handleResponse(response, 'getActiveProducts');
    console.log("getActiveProducts DATA:", data[0]);
    // Filtramos localmente para mostrar solo los que tienen stock
    return data.filter((p: any) => p.active && p.quantity_available > 0);
};

export const savePosSale = async (data: any) => {
    const response = await fetch(`${API_URL}/v1/pos-sales`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'savePosSale');
};

export const getPosSales = async () => {
    const response = await fetch(`${API_URL}/v1/pos-sales`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getPosSales');
};

export const invoicePosSale = async (id: number) => {
    const response = await fetch(`${API_URL}/v1/pos-sales/${id}/invoice`, {
        method: 'POST',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'invoicePosSale');
};
