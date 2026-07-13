import { apiRequest, getReadableApiError } from '@/lib/api-client';

export type CalendarioEvento = {
  id: string;
  referenceCode: string;
  type: 'Pedido';
  title: string;
  customerFullName: string;
  deliveryMethod: string | null;
  total: string;
  status: string;
  paymentStatus: string | null;
  date: string;
  time: string;
};

export async function fetchCalendarioEventos(accessToken: string) {
  return apiRequest<CalendarioEvento[]>('/calendario/events', { method: 'GET' }, accessToken);
}

export { getReadableApiError as getReadableCalendarioError };
