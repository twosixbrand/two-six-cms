const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Something went wrong');
  }
  return response.json();
};

export const getProviders = async () => {
  const response = await fetch(`${API_BASE_URL}/provider`);
  return handleResponse(response);
};