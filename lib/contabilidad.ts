import { apiRequest, getReadableApiError } from '@/lib/api-client';

export type ResumenContable = {
  totalPaid: string;
  totalExpenses: string;
};

export type RegistroContable = {
  id: string;
  referenceCode: string;
  sourceReferenceCode: string;
  entityName: string;
  amount: string;
  status: string;
  type: 'Pago' | 'Gasto';
  createdAt: string;
};

export type MetodoPago = {
  paymentMethodId: string;
  name: string;
};

export type CategoriaFinanciera = {
  financialCategoryId: string;
  businessId: string;
  name: string;
  createdAt: string;
};

export type CrearPagoPayload = {
  orderId: string;
  paymentMethodId: string;
  amount: string;
};

export type CrearGastoPayload = {
  financialCategoryId: string;
  paymentMethodId: string;
  amount: string;
  description?: string;
};

export async function fetchResumenContable(accessToken: string) {
  return apiRequest<ResumenContable>('/contabilidad/summary', { method: 'GET' }, accessToken);
}

export async function fetchRegistrosContables(accessToken: string) {
  return apiRequest<RegistroContable[]>('/contabilidad/records', { method: 'GET' }, accessToken);
}

export async function fetchMetodosPago(accessToken: string) {
  return apiRequest<MetodoPago[]>('/contabilidad/payment-methods', { method: 'GET' }, accessToken);
}

export async function fetchCategoriasFinancieras(accessToken: string) {
  return apiRequest<CategoriaFinanciera[]>(
    '/contabilidad/financial-categories',
    { method: 'GET' },
    accessToken,
  );
}

export async function createPago(accessToken: string, payload: CrearPagoPayload) {
  return apiRequest('/contabilidad/payments', { method: 'POST', body: JSON.stringify(payload) }, accessToken);
}

export async function createGasto(accessToken: string, payload: CrearGastoPayload) {
  return apiRequest('/contabilidad/expenses', { method: 'POST', body: JSON.stringify(payload) }, accessToken);
}

export { getReadableApiError as getReadableContabilidadError };
