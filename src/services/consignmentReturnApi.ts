const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/consignment/returns`;

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

export const getReturns = async (filters: { id_warehouse?: number; return_type?: string; status?: string } = {}) => {
  const params = new URLSearchParams();
  if (filters.id_warehouse) params.set('id_warehouse', String(filters.id_warehouse));
  if (filters.return_type) params.set('return_type', filters.return_type);
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  const response = await fetch(`${ENDPOINT}${qs ? '?' + qs : ''}`);
  return handleResponse(response);
};

export const getReturn = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}`);
  return handleResponse(response);
};

export const createReturn = async (data: any) => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const processReturn = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}/process`, { method: 'POST' });
  return handleResponse(response);
};

export const cancelReturn = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}/cancel`, { method: 'POST' });
  return handleResponse(response);
};

export const deleteReturn = async (id: number) => {
  const response = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
  return handleResponse(response);
};

export const attachCreditNote = async (id: number, creditNoteId: number) => {
  const response = await fetch(`${ENDPOINT}/${id}/attach-credit-note/${creditNoteId}`, {
    method: 'POST',
  });
  return handleResponse(response);
};

/** Dispara la nota crédito DIAN para una factura electrónica. */
export const generateDianCreditNote = async (
  dianInvoiceId: number,
  body: { lines: any[]; reasonCode?: string; reasonDesc?: string; customerDoc?: string; customerDocType?: string },
) => {
  const response = await fetch(`${API_BASE_URL}/dian/invoices/${dianInvoiceId}/credit-note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};
