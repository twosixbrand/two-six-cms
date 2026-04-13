const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/coupon`;

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

export const getCoupons = async () => {
  const response = await fetch(ENDPOINT);
  return handleResponse(response);
};

export const createCoupon = async (item: any) => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return handleResponse(response);
};

export const updateCoupon = async (id: number, item: any) => {
  const response = await fetch(`${ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return handleResponse(response);
};

export const deleteCoupon = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};
