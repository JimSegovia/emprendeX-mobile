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

const MOCK_HISTORIAL: HistorialComercial = {
  kpis: {
    totalVendido: '12450.00',
    totalOperaciones: 7,
    saldoPendiente: '3200.00',
  },
  pedidos: [
    {
      id: 'mock-1',
      referenceCode: 'PED-2026-007',
      status: 'En camino',
      total: '1850.00',
      balance: '1850.00',
      deliveryDate: '2026-07-14',
      createdAt: '2026-07-10T09:30:00Z',
      itemsCount: 3,
      items: [
        { name: 'Camiseta deportiva', kind: 'Producto', quantity: 10, unitPrice: '45.00', price: '450.00' },
        { name: 'Gorra bordada', kind: 'Producto', quantity: 5, unitPrice: '25.00', price: '125.00' },
        { name: 'Diseño personalizado', kind: 'Servicio', quantity: 1, unitPrice: '275.00', price: '275.00' },
      ],
    },
    {
      id: 'mock-2',
      referenceCode: 'PED-2026-006',
      status: 'Pendiente',
      total: '3200.00',
      balance: '3200.00',
      deliveryDate: '2026-07-20',
      createdAt: '2026-07-08T14:15:00Z',
      itemsCount: 2,
      items: [
        { name: 'Polos corporativos', kind: 'Producto', quantity: 50, unitPrice: '40.00', price: '2000.00' },
        { name: 'Bordado de logo', kind: 'Servicio', quantity: 50, unitPrice: '24.00', price: '1200.00' },
      ],
    },
    {
      id: 'mock-3',
      referenceCode: 'PED-2026-005',
      status: 'Entregado',
      total: '2400.00',
      balance: '0.00',
      deliveryDate: '2026-07-05',
      createdAt: '2026-07-01T11:00:00Z',
      itemsCount: 4,
      items: [
        { name: 'Casacas impermeables', kind: 'Producto', quantity: 8, unitPrice: '180.00', price: '1440.00' },
        { name: 'Pantalón cargo', kind: 'Producto', quantity: 8, unitPrice: '90.00', price: '720.00' },
        { name: 'Envío a domicilio', kind: 'Servicio', quantity: 1, unitPrice: '120.00', price: '120.00' },
        { name: 'Empaque especial', kind: 'Servicio', quantity: 8, unitPrice: '15.00', price: '120.00' },
      ],
    },
    {
      id: 'mock-4',
      referenceCode: 'PED-2026-004',
      status: 'Entregado',
      total: '980.00',
      balance: '0.00',
      deliveryDate: '2026-06-28',
      createdAt: '2026-06-25T16:45:00Z',
      itemsCount: 1,
      items: [
        { name: 'Uniformes completos', kind: 'Producto', quantity: 4, unitPrice: '245.00', price: '980.00' },
      ],
    },
    {
      id: 'mock-5',
      referenceCode: 'PED-2026-003',
      status: 'Cancelado',
      total: '620.00',
      balance: '0.00',
      deliveryDate: '2026-06-20',
      createdAt: '2026-06-18T10:20:00Z',
      itemsCount: 2,
      items: [
        { name: 'Delantales personalizados', kind: 'Producto', quantity: 10, unitPrice: '35.00', price: '350.00' },
        { name: 'Estampado frontal', kind: 'Servicio', quantity: 10, unitPrice: '27.00', price: '270.00' },
      ],
    },
    {
      id: 'mock-6',
      referenceCode: 'PED-2026-002',
      status: 'Entregado',
      total: '1500.00',
      balance: '0.00',
      deliveryDate: '2026-06-10',
      createdAt: '2026-06-05T08:00:00Z',
      itemsCount: 1,
      items: [
        { name: 'Chalecos reflectivos', kind: 'Producto', quantity: 30, unitPrice: '50.00', price: '1500.00' },
      ],
    },
    {
      id: 'mock-7',
      referenceCode: 'PED-2026-001',
      status: 'Entregado',
      total: '1900.00',
      balance: '0.00',
      deliveryDate: '2026-05-25',
      createdAt: '2026-05-20T13:30:00Z',
      itemsCount: 3,
      items: [
        { name: 'Polos algodón premium', kind: 'Producto', quantity: 20, unitPrice: '55.00', price: '1100.00' },
        { name: 'Serigrafía 2 colores', kind: 'Servicio', quantity: 20, unitPrice: '25.00', price: '500.00' },
        { name: 'Etiquetado personalizado', kind: 'Servicio', quantity: 20, unitPrice: '15.00', price: '300.00' },
      ],
    },
  ],
};

export async function fetchHistorialComercial(_accessToken: string, _customerId: string): Promise<HistorialComercial> {
  // TODO: Conectar con el backend real: GET /clientes/:id/historial-comercial
  // Por ahora retorna datos mockeados para desarrollo de la UI
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_HISTORIAL), 600);
  });
}
