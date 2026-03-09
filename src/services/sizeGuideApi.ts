const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3050/api';
const API_BASE_URL = RAW_API_URL.startsWith('http') ? RAW_API_URL : `https://${RAW_API_URL}`;

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || 'Something went wrong');
    }
    if (response.status === 204) {
        return;
    }
    return response.json();
};

export const getSizeGuides = async () => {
    const response = await fetch(`${API_BASE_URL}/size-guide`);
    return handleResponse(response);
};

export const getSizeGuideById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/size-guide/${id}`);
    return handleResponse(response);
};

export const createSizeGuide = async (sizeGuideData) => {
    const response = await fetch(`${API_BASE_URL}/size-guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sizeGuideData),
    });
    return handleResponse(response);
};

export const updateSizeGuide = async (id, sizeGuideData) => {
    const response = await fetch(`${API_BASE_URL}/size-guide/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sizeGuideData),
    });
    return handleResponse(response);
};

export const deleteSizeGuide = async (id) => {
    const response = await fetch(`${API_BASE_URL}/size-guide/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || 'Failed to delete size guide');
    }
    return;
};
