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

export const downloadInvoiceXml = async (id: number, docNumber: string) => {
    const response = await fetch(`${API_URL}/v1/dian/invoices/${id}/xml`, {
        headers: { 'x-api-key': 'TwoSixAdminKey123!' },
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docNumber}.xml`;
    a.click();
    URL.revokeObjectURL(url);
};

export const downloadInvoicePdf = async (id: number) => {
    const response = await fetch(`${API_URL}/v1/dian/invoices/${id}/pdf`, {
        headers: { 'x-api-key': 'TwoSixAdminKey123!' },
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
};

export const checkInvoiceStatus = async (dianResponse: string) => {
    // Extraer ZipKey del dian_response guardado
    const zipKeyMatch = dianResponse?.match(/<b:ZipKey>(.*?)<\/b:ZipKey>/);
    if (!zipKeyMatch) throw new Error('No se encontró ZipKey en la respuesta DIAN');
    const trackId = zipKeyMatch[1];

    const response = await fetch(`${API_URL}/v1/dian/status/${trackId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'TwoSixAdminKey123!'
        },
    });
    return await handleResponse(response, 'checkInvoiceStatus');
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

