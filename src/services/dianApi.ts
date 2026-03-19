import { handleResponse } from './apiUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3050/api';

export const getDianInvoices = async () => {
    try {
        const response = await fetch(`${API_URL}/v1/dian/invoices`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'TwoSixAdminKey123!'
            },
        });
        return await handleResponse(response, 'getDianInvoices');
    } catch (error) {
        throw error;
    }
};

export const createDianInvoice = async (data: any) => {
    try {
        const response = await fetch(`${API_URL}/v1/dian/invoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'TwoSixAdminKey123!'
            },
            body: JSON.stringify(data)
        });
        return await handleResponse(response, 'createDianInvoice');
    } catch (error) {
        throw error;
    }
};

