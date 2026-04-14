const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/consignment/warehouses`;

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

export const getWarehouses = async (id_customer?: number) => {
  const qs = id_customer ? `?id_customer=${id_customer}` : '';
  const response = await fetch(`${ENDPOINT}${qs}`);
  return handleResponse(response);
};

export const getWarehouse = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}`);
  return handleResponse(response);
};

export const getWarehouseStock = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}/stock`);
  return handleResponse(response);
};

export const createWarehouse = async (data: any) => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateWarehouse = async (id: number, data: any) => {
  const response = await fetch(`${ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteWarehouse = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
  return handleResponse(response);
};
