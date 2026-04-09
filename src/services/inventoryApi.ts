import { handleResponse } from './apiUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3050/api';

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_DIAN_API_KEY || 'TwoSixAdminKey123!',
});

export const createAdjustment = async (data: any) => {
    const response = await fetch(`${API_URL}/inventory/adjustments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'createAdjustment');
};

export const getAdjustments = async () => {
    const response = await fetch(`${API_URL}/inventory/adjustments`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getAdjustments');
};

export const getKardex = async (clothingSizeId: number) => {
    const response = await fetch(`${API_URL}/inventory/kardex/${clothingSizeId}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getKardex');
};
