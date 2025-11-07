const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
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

export const getMasterDesigns = async () => {
  const response = await fetch(`${API_BASE_URL}/master-design`);
  return handleResponse(response);
};

export const getMasterDesignById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/master-design/${id}`);
  return handleResponse(response);
};

export const createMasterDesign = async (designData) => {
  const response = await fetch(`${API_BASE_URL}/master-design`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(designData),
  });
  return handleResponse(response);
};

export const updateMasterDesign = async (id, designData) => {
  const response = await fetch(`${API_BASE_URL}/master-design/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(designData),
  });
  return handleResponse(response);
};

export const deleteMasterDesign = async (id) => {
  await fetch(`${API_BASE_URL}/master-design/${id}`, { method: 'DELETE' });
};