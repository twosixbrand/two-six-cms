const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/customer`;

export const getCustomers = async () => {
  const response = await fetch(API_ENDPOINT);
  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }
  return response.json();
};

export const getCustomerByDocument = async (document: string) => {
  const response = await fetch(`${API_ENDPOINT}/by-document/${encodeURIComponent(document)}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch customer by document (status ${response.status})`);
  }
  return response.json();
};

export const updateCustomer = async (id: number, data: any) => {
  const response = await fetch(`${API_ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Update failed' }));
    throw new Error(errorData.message || 'Failed to update customer');
  }
  return response.json();
};
