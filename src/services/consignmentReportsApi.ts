const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/consignment/reports`;

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
  return response.json();
};

export const getInventoryByCustomer = async (id_customer?: number) => {
  const qs = id_customer ? `?id_customer=${id_customer}` : '';
  const response = await fetch(`${ENDPOINT}/inventory-by-customer${qs}`);
  return handleResponse(response);
};

export const getLossReport = async (from?: string, to?: string) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  const response = await fetch(`${ENDPOINT}/losses${qs ? '?' + qs : ''}`);
  return handleResponse(response);
};

export const getPendingReconciliation = async (threshold_days = 30) => {
  const response = await fetch(`${ENDPOINT}/pending-reconciliation?threshold_days=${threshold_days}`);
  return handleResponse(response);
};
