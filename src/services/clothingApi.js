const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    // Loguea más detalles de la respuesta para facilitar la depuración
    console.error('Request failed with status:', response.status, response.statusText);

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      console.error('Error data (JSON):', errorData);
      throw new Error(errorData.message || 'Something went wrong');
    } else {
      const errorText = await response.text();
      console.error('Error data (text):', errorText);
      throw new Error(errorText || 'Internal Server Error');
    }
  }
  return response.json();
};

export const getClothing = async () => {
  const response = await fetch(`${API_BASE_URL}/clothing`);
  return handleResponse(response);
};

export const getClothingById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/clothing/${id}`);
  return handleResponse(response);
};

export const createClothing = async (clothingData) => {
  const dataToSend = {
    name: clothingData.name,
    gender: clothingData.gender,
    id_type_clothing: clothingData.id_type_clothing,
    id_category: parseInt(clothingData.id_category, 10),
  };
  const response = await fetch(`${API_BASE_URL}/clothing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataToSend),
  });
  return handleResponse(response);
};

export const updateClothing = async (id, clothingData) => {
  const response = await fetch(`${API_BASE_URL}/clothing/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: clothingData.name,
      gender: clothingData.gender,
      id_type_clothing: clothingData.id_type_clothing,
      id_category: parseInt(clothingData.id_category, 10),
    }),
  });
  return handleResponse(response);
};

export const deleteClothing = async (id) => {
  const response = await fetch(`${API_BASE_URL}/clothing/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    return handleResponse(response);
  }
};