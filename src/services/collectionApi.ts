const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'Something went wrong');
  }
  // Para respuestas DELETE que pueden no tener cuerpo
  if (response.status === 204) {
    return;
  }
  return response.json();
};

export const getCollections = async () => {
  const response = await fetch(`${API_BASE_URL}/collection`);
  return handleResponse(response);
};

export const createCollection = async (data) => {
  const response = await fetch(`${API_BASE_URL}/collection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateCollection = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/collection/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteCollection = async (id) => {
  const response = await fetch(`${API_BASE_URL}/collection/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};