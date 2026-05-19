import { apiRequest, getReadableApiError } from '@/lib/api-client';

export type Cliente = {
  id: string;
  firstNames: string;
  lastNames: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  operationsCount: number;
  createdAt: string;
};

export type ClienteDetalle = Cliente & {
  operations: Array<{
    id: string;
    referenceCode: string;
    type: 'Pedido' | 'Cotización';
    total: string;
    status: string;
    createdAt: string;
  }>;
};

export type GuardarClientePayload = {
  firstNames: string;
  lastNames?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export async function fetchClientes(accessToken: string) {
  return apiRequest<Cliente[]>('/clientes', { method: 'GET' }, accessToken);
}

export async function fetchClienteById(accessToken: string, customerId: string) {
  return apiRequest<ClienteDetalle>(`/clientes/${customerId}`, { method: 'GET' }, accessToken);
}

export async function createCliente(accessToken: string, payload: GuardarClientePayload) {
  return apiRequest<Cliente>(
    '/clientes',
    { method: 'POST', body: JSON.stringify(payload) },
    accessToken,
  );
}

export async function updateCliente(
  accessToken: string,
  customerId: string,
  payload: GuardarClientePayload,
) {
  return apiRequest<Cliente>(
    `/clientes/${customerId}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    accessToken,
  );
}

export async function deleteCliente(accessToken: string, customerId: string) {
  return apiRequest<void>(`/clientes/${customerId}`, { method: 'DELETE' }, accessToken);
}

export { getReadableApiError as getReadableClientesError };
