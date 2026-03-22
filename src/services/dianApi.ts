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

export const downloadInvoicePdf = async (id: number, docNumber: string) => {
    const response = await fetch(`${API_URL}/v1/dian/invoices/${id}/pdf`, {
        headers: { 'x-api-key': 'TwoSixAdminKey123!' },
    });

    if (!response.ok) {
        const errorText = await response.text();
        alert('Error generando el PDF: ' + (errorText || response.statusText));
        return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let fileName = `${docNumber}.pdf`;
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) fileName = match[1];
    }
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const downloadInvoiceZip = async (trackId: string, docNumber: string) => {
    const response = await fetch(`${API_URL}/v1/dian/status/${trackId}/xml`, {
        headers: { 'x-api-key': 'TwoSixAdminKey123!' },
    });

    if (!response.ok) {
        const errorText = await response.text();
        alert('Error descargando el ZIP: ' + (errorText || response.statusText));
        return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApplicationResponse_${docNumber}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

export const retryInvoice = async (orderId: number, data: any) => {
    try {
        const response = await fetch(`${API_URL}/v1/dian/invoices/retry/${orderId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'TwoSixAdminKey123!'
            },
            body: JSON.stringify(data)
        });
        return await handleResponse(response, 'retryInvoice');
    } catch (error) {
        throw error;
    }
};

export const createCreditNote = async (id: number, data: any) => {
    try {
        const response = await fetch(`${API_URL}/v1/dian/invoices/${id}/credit-note`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'TwoSixAdminKey123!'
            },
            body: JSON.stringify(data)
        });
        return await handleResponse(response, 'createCreditNote');
    } catch (error) {
        throw error;
    }
};

export const createDebitNote = async (id: number, data: any) => {
    try {
        const response = await fetch(`${API_URL}/v1/dian/invoices/${id}/debit-note`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'TwoSixAdminKey123!'
            },
            body: JSON.stringify(data)
        });
        return await handleResponse(response, 'createDebitNote');
    } catch (error) {
        throw error;
    }
};

export const syncNoteStatus = async (noteId: number) => {
    try {
        const response = await fetch(`${API_URL}/v1/dian/notes/${noteId}/sync-status`, {
            method: 'POST',
            headers: {
                'x-api-key': 'TwoSixAdminKey123!'
            }
        });
        return await handleResponse(response, 'syncNoteStatus');
    } catch (error) {
        throw error;
    }
};

export const checkInvoiceStatus = async (trackId: string) => {
    try {
        const response = await fetch(`${API_URL}/v1/dian/status/${trackId}`, {
            method: 'GET',
            headers: {
                'x-api-key': 'TwoSixAdminKey123!'
            }
        });
        return await handleResponse(response, 'checkInvoiceStatus');
    } catch (error) {
        throw error;
    }
};

