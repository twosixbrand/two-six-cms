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

export const getTags = async () => {
  const response = await fetch(`${API_BASE_URL}/tags`);
  return handleResponse(response);
};

export const createTag = async (tagData) => {
  const response = await fetch(`${API_BASE_URL}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tagData),
  });
  return handleResponse(response);
};

export const updateTag = async (id, tagData) => {
  const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tagData),
  });
  return handleResponse(response);
};

export const deleteTag = async (id) => {
  const response = await fetch(`${API_BASE_URL}/tags/${id}`, { method: 'DELETE' });
  return handleResponse(response);
};