import { logError } from './errorApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/newsletter`;

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Something went wrong');
    }
    if (response.status === 204) return null;
    return response.json();
};

export const getSubscribers = async () => {
    const response = await fetch(ENDPOINT);
    return handleResponse(response);
};

export const updateSubscriber = async (id: number, data: { status?: boolean; unsubscribed?: boolean }) => {
    const response = await fetch(`${ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};
