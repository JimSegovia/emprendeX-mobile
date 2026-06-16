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
  paymentDetails?: Array<{
    id: string;
    paymentMethodName: string;
    amount: string;
    createdAt: string;
  }>;
};

export type DetallePago = {
  id: string;
  paymentMethodName: string;
  amount: string;
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

export type CrearMetodoPagoPayload = {
  name: string;
};

export type ActualizarMetodoPagoPayload = Partial<CrearMetodoPagoPayload>;

export type CrearCategoriaFinancieraPayload = {
  name: string;
};

export type ActualizarCategoriaFinancieraPayload = Partial<CrearCategoriaFinancieraPayload>;

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

export async function fetchDetallesPago(accessToken: string, paymentId: string) {
  return apiRequest<DetallePago[]>(
    `/contabilidad/payments/${paymentId}/details`,
    { method: 'GET' },
    accessToken,
  );
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

export async function createMetodoPago(accessToken: string, payload: CrearMetodoPagoPayload) {
  return apiRequest<MetodoPago>(
    '/contabilidad/payment-methods',
    { method: 'POST', body: JSON.stringify(payload) },
    accessToken,
  );
}

export async function updateMetodoPago(
  accessToken: string,
  paymentMethodId: string,
  payload: ActualizarMetodoPagoPayload,
) {
  return apiRequest<MetodoPago>(
    `/contabilidad/payment-methods/${paymentMethodId}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    accessToken,
  );
}

export async function deleteMetodoPago(accessToken: string, paymentMethodId: string) {
  return apiRequest<void>(
    `/contabilidad/payment-methods/${paymentMethodId}`,
    { method: 'DELETE' },
    accessToken,
  );
}

export async function createCategoriaFinanciera(
  accessToken: string,
  payload: CrearCategoriaFinancieraPayload,
) {
  return apiRequest<CategoriaFinanciera>(
    '/contabilidad/financial-categories',
    { method: 'POST', body: JSON.stringify(payload) },
    accessToken,
  );
}

export async function updateCategoriaFinanciera(
  accessToken: string,
  financialCategoryId: string,
  payload: ActualizarCategoriaFinancieraPayload,
) {
  return apiRequest<CategoriaFinanciera>(
    `/contabilidad/financial-categories/${financialCategoryId}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    accessToken,
  );
}

export async function deleteCategoriaFinanciera(accessToken: string, financialCategoryId: string) {
  return apiRequest<void>(
    `/contabilidad/financial-categories/${financialCategoryId}`,
    { method: 'DELETE' },
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
