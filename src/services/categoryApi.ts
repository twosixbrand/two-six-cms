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

export const getCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/category`);
  return handleResponse(response);
};

export const createCategory = async (categoryData) => {
  const response = await fetch(`${API_BASE_URL}/category`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  });
  return handleResponse(response);
};

export const updateCategory = async (id, categoryData) => {
  const response = await fetch(`${API_BASE_URL}/category/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  });
  return handleResponse(response);
};

export const deleteCategory = async (id) => {
  const response = await fetch(`${API_BASE_URL}/category/${id}`, { method: 'DELETE' });
  return handleResponse(response);
};