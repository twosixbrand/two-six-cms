import { handleResponse } from './apiUtils.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/image-clothing`;
const API_NAME = 'image-clothing';

export const getImages = async (id_clothing_color) => {
    const response = await fetch(`${API_ENDPOINT}/${id_clothing_color}`);
    return handleResponse(response, API_NAME);
};

export const uploadImages = async (id_clothing_color, formData) => {
    const response = await fetch(`${API_ENDPOINT}/upload/${id_clothing_color}`, {
        method: 'POST',
        body: formData,
    });
    // Upload might return array of created images
    return handleResponse(response, API_NAME);
};

export const deleteImage = async (id) => {
    const response = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(response, API_NAME);
};

export const reorderImages = async (id_clothing_color, imageIds) => {
    const response = await fetch(`${API_ENDPOINT}/reorder/${id_clothing_color}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds }),
    });
    return handleResponse(response, API_NAME);
};
