const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/consignment/prices`;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en la petición');
    } else {
      const errorText = await response.text();
      throw new Error(errorText || `Error ${response.status}`);
    }
  }
  if (response.status === 204) return;
  return response.json();
};

export const getConsignmentPrices = async (filters: { id_customer?: number; id_product?: number; only_active?: boolean } = {}) => {
  const params = new URLSearchParams();
  if (filters.id_customer) params.set('id_customer', String(filters.id_customer));
  if (filters.id_product) params.set('id_product', String(filters.id_product));
  if (filters.only_active) params.set('only_active', 'true');
  const qs = params.toString();
  const response = await fetch(`${ENDPOINT}${qs ? '?' + qs : ''}`);
  return handleResponse(response);
};

export const createConsignmentPrice = async (data: any) => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateConsignmentPrice = async (id: number, data: any) => {
  const response = await fetch(`${ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteConsignmentPrice = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
  return handleResponse(response);
};
