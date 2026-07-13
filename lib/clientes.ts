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
  updatedAt: string;
};

export type ClienteConDni = Cliente & {
  dni: string;
};

export type ClienteDetalle = ClienteConDni & {
  operations: Array<{
    id: string;
    referenceCode: string;
    type: 'Pedido' | 'Cotización';
    total: string;
    status: string;
    createdAt: string;
  }>;
};

export type PedidoHistorialItem = {
  name: string;
  kind: 'Producto' | 'Servicio';
  quantity: number;
  unitPrice: string;
  price: string;
};

export type PedidoHistorial = {
  id: string;
  referenceCode: string;
  status: string;
  total: string;
  balance: string;
  deliveryDate: string;
  createdAt: string;
  itemsCount: number;
  items: PedidoHistorialItem[];
  customerName: string;
  deliveryMethod: string;
  description: string | null;
};

export type HistorialComercial = {
  kpis: {
    totalVendido: string;
    totalOperaciones: number;
    saldoPendiente: string;
  };
  pedidos: PedidoHistorial[];
};

export type GuardarClientePayload = {
  firstNames: string;
  dni: string;
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
  return apiRequest<ClienteConDni>(
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
  return apiRequest<ClienteConDni>(
    `/clientes/${customerId}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    accessToken,
  );
}

export async function deleteCliente(accessToken: string, customerId: string) {
  return apiRequest<void>(`/clientes/${customerId}`, { method: 'DELETE' }, accessToken);
}

export { getReadableApiError as getReadableClientesError };

export async function fetchHistorialComercial(
  accessToken: string,
  customerId: string,
): Promise<HistorialComercial> {
  return apiRequest<HistorialComercial>(
    `/clientes/${customerId}/historial-comercial`,
    { method: 'GET' },
    accessToken,
  );
}
