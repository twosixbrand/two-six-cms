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

const endpoint = `${API_BASE_URL}/user-app`;

export const getUsers = async () => {
  const response = await fetch(endpoint);
  return handleResponse(response);
};

export const getUserById = async (id) => {
  const response = await fetch(`${endpoint}/${id}`);
  return handleResponse(response);
};

export const createUser = async (userData) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const updateUser = async (id, userData) => {
  const response = await fetch(`${endpoint}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const deleteUser = async (id) => {
  const response = await fetch(`${endpoint}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};