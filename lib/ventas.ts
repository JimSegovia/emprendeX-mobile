import { apiRequest, getReadableApiError } from '@/lib/api-client';

export type Cotizacion = {
  id: string;
  referenceCode: string;
  customerId: string;
  customerName: string;
  description: string | null;
  deliveryDate: string;
  deliveryMethod: string;
  total: string;
  itemsCount: number;
  status: string;
  createdAt: string;
  originLabel: string | null;
};

export type OperacionResumen = {
  id: string;
  referenceCode: string;
  type: 'Pedido' | 'Cotización';
  customerName: string;
  total: string;
  status: string;
  createdAt: string;
  originLabel: string | null;
};

export type OperacionDetalle = {
  id: string;
  referenceCode: string;
  type: 'Pedido' | 'Cotización';
  status: string;
  customer: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  deliveryDate: string;
  deliveryMethod: string;
  description: string | null;
  quotationReferenceCode: string;
  sourceLabel: string | null;
  total: string;
  remainingTotal: string | null;
  items: Array<{
    id: string;
    itemId: string;
    name: string;
    kind: 'Producto' | 'Servicio';
    quantity: number;
    discount: string;
    unitPrice: string;
    price: string;
  }>;
};

export type PedidoPendiente = {
  id: string;
  referenceCode: string;
  customerName: string;
  total: string;
  balance: string;
};

export type CrearCotizacionPayload = {
  customerId: string;
  details: Array<{
    itemId: string;
    quantity: number;
    unitPrice: string;
    discount?: string;
  }>;
  description?: string;
  deliveryDate: string;
  deliveryMethod: 'Entrega a domicilio' | 'Recojo en tienda';
};

export async function fetchCotizaciones(accessToken: string) {
  return apiRequest<Cotizacion[]>('/cotizaciones', { method: 'GET' }, accessToken);
}

export async function createCotizacion(accessToken: string, payload: CrearCotizacionPayload) {
  return apiRequest<Cotizacion>(
    '/cotizaciones',
    { method: 'POST', body: JSON.stringify(payload) },
    accessToken,
  );
}

export async function deleteCotizacion(accessToken: string, quotationId: string) {
  return apiRequest<void>(`/cotizaciones/${quotationId}`, { method: 'DELETE' }, accessToken);
}

export async function updateQuotation(
  accessToken: string,
  quotationId: string,
  payload: CrearCotizacionPayload,
) {
  return apiRequest<Cotizacion>(
    `/cotizaciones/${quotationId}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    accessToken,
  );
}

export async function convertCotizacionToPedido(accessToken: string, quotationId: string) {
  return apiRequest<OperacionResumen>(
    `/cotizaciones/${quotationId}/convertir`,
    { method: 'POST' },
    accessToken,
  );
}

export async function fetchOperaciones(accessToken: string) {
  return apiRequest<OperacionResumen[]>('/operaciones', { method: 'GET' }, accessToken);
}

export async function fetchOperacionById(accessToken: string, operationId: string) {
  return apiRequest<OperacionDetalle>(`/operaciones/${operationId}`, { method: 'GET' }, accessToken);
}

export async function fetchPedidosPendientes(accessToken: string) {
  return apiRequest<PedidoPendiente[]>('/pedidos/pendientes', { method: 'GET' }, accessToken);
}

export async function updateOrderStatus(
  accessToken: string,
  orderId: string,
  status: string,
) {
  return apiRequest<OperacionResumen>(
    `/pedidos/${orderId}/status`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
    accessToken,
  );
}

export { getReadableApiError as getReadableVentasError };
