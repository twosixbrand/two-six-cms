const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Internal Server Error');
    }
  }
  // Para peticiones DELETE que no devuelven contenido
  if (response.status === 204) {
    return;
  }
  return response.json();
};

export const getTypeClothings = async () => {
  const response = await fetch(`${API_BASE_URL}/type-clothing`);
  return handleResponse(response);
};

export const createTypeClothing = async (data) => {
  const response = await fetch(`${API_BASE_URL}/type-clothing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateTypeClothing = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/type-clothing/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteTypeClothing = async (id) => {
  const response = await fetch(`${API_BASE_URL}/type-clothing/${id}`, { method: 'DELETE' });
  return handleResponse(response);
};