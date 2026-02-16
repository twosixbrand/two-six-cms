import { handleResponse } from './apiUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/gender`;
const API_NAME = 'gender';

export const getGenders = async () => {
    const response = await fetch(API_ENDPOINT);
    return handleResponse(response, API_NAME);
};
