const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE_URL}/consignment/sellout`;

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

export interface SelloutRow {
  sku?: string;
  reference?: string;
  color?: string;
  size?: string;
  quantity: number;
  price_override?: number;
}

export const previewSellout = async (dto: {
  id_customer: number;
  id_warehouse: number;
  rows: SelloutRow[];
}) => {
  const response = await fetch(`${ENDPOINT}/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  return handleResponse(response);
};

export const processSellout = async (dto: {
  id_customer: number;
  id_warehouse: number;
  rows: SelloutRow[];
  notes?: string;
}) => {
  const response = await fetch(`${ENDPOINT}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  return handleResponse(response);
};

export const generateDianForOrder = async (orderId: number) => {
  const response = await fetch(`${API_BASE_URL}/dian/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  return handleResponse(response);
};

/**
 * Parsea un CSV sencillo (delimitadores coma o punto y coma).
 * Headers esperados: sku,reference,color,size,quantity,price_override
 * Solo quantity es obligatorio (junto con al menos sku o reference+color+size).
 */
export const parseSelloutCsv = (text: string): SelloutRow[] => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const cols = line.split(delimiter).map((c) => c.trim());
    const obj: any = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? '';
    });
    return {
      sku: obj.sku || undefined,
      reference: obj.reference || obj['referencia'] || undefined,
      color: obj.color || undefined,
      size: obj.size || obj['talla'] || undefined,
      quantity: parseInt(obj.quantity || obj.cantidad || '0', 10),
      price_override:
        obj.price_override || obj.precio ? parseFloat(obj.price_override || obj.precio) : undefined,
    };
  });
};
