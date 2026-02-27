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

export const getDesigns = async () => {
  const response = await fetch(`${API_BASE_URL}/design`);
  return handleResponse(response);
};

export const getDesignById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/design/${id}`);
  return handleResponse(response);
};

export const createDesign = async (designData) => {
  const response = await fetch(`${API_BASE_URL}/design`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(designData),
  });
  return handleResponse(response);
};

export const updateDesign = async (id, designData) => {
  const response = await fetch(`${API_BASE_URL}/design/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(designData),
  });
  return handleResponse(response);
};

export const deleteDesign = async (id) => {
  const response = await fetch(`${API_BASE_URL}/design/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};