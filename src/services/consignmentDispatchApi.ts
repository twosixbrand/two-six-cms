const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/consignment/dispatches`;

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

export const getDispatches = async (filters: { id_warehouse?: number; status?: string } = {}) => {
  const params = new URLSearchParams();
  if (filters.id_warehouse) params.set('id_warehouse', String(filters.id_warehouse));
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  const response = await fetch(`${ENDPOINT}${qs ? '?' + qs : ''}`);
  return handleResponse(response);
};

export const getDispatch = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}`);
  return handleResponse(response);
};

export const createDispatch = async (data: any) => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const preSendDispatch = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}/pre-send`);
  return handleResponse(response);
};

export const sendDispatch = async (id: number, opts: { adjust_to_available?: boolean } = {}) => {
  const response = await fetch(`${ENDPOINT}/${id}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });
  return handleResponse(response);
};

export const cancelDispatch = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}/cancel`, { method: 'POST' });
  return handleResponse(response);
};

export const deleteDispatch = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
  return handleResponse(response);
};
