const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/consignment/sell-reports`;

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

export const getSellReports = async (filters: { status?: string; id_customer?: number } = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.id_customer) params.set('id_customer', String(filters.id_customer));
  const qs = params.toString();
  const response = await fetch(`${ENDPOINT}${qs ? '?' + qs : ''}`);
  return handleResponse(response);
};

export const getSellReport = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}`);
  return handleResponse(response);
};

export const approveSellReport = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return handleResponse(response);
};

export const rejectSellReport = async (id: number, reason: string) => {
  const response = await fetch(`${ENDPOINT}/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  return handleResponse(response);
};
