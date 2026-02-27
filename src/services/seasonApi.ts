const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'Something went wrong');
  }
  if (response.status === 204) {
    return;
  }
  return response.json();
};

export const getSeasons = async () => {
  const response = await fetch(`${API_BASE_URL}/season`);
  return handleResponse(response);
};

export const createSeason = async (seasonData) => {
  const response = await fetch(`${API_BASE_URL}/season`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(seasonData),
  });
  return handleResponse(response);
};

export const updateSeason = async (id, seasonData) => {
  const response = await fetch(`${API_BASE_URL}/season/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(seasonData),
  });
  return handleResponse(response);
};

export const deleteSeason = async (id) => {
  const response = await fetch(`${API_BASE_URL}/season/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'Failed to delete season');
  }
  return;
};