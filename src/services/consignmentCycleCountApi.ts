const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/consignment/cycle-counts`;

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

export const getCycleCounts = async (filters: { id_warehouse?: number; status?: string } = {}) => {
  const params = new URLSearchParams();
  if (filters.id_warehouse) params.set('id_warehouse', String(filters.id_warehouse));
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  const response = await fetch(`${ENDPOINT}${qs ? '?' + qs : ''}`);
  return handleResponse(response);
};

export const getCycleCount = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}`);
  return handleResponse(response);
};

export const createCycleCount = async (data: { id_warehouse: number; notes?: string }) => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const saveCycleCountItems = async (
  id: number,
  items: { id: number; real_qty: number | null }[],
) => {
  const response = await fetch(`${ENDPOINT}/${id}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  return handleResponse(response);
};

export const approveCycleCount = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}/approve`, { method: 'POST' });
  return handleResponse(response);
};

export const cancelCycleCount = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}/cancel`, { method: 'POST' });
  return handleResponse(response);
};

export const createMermaInvoice = async (
  id: number,
  data: { price_mode: 'CONSIGNMENT' | 'PENALTY'; penalty_unit_price?: number; notes?: string },
) => {
  const response = await fetch(`${ENDPOINT}/${id}/merma-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};
