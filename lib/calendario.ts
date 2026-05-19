import { apiRequest, getReadableApiError } from '@/lib/api-client';

export type CalendarioEvento = {
  id: string;
  referenceCode: string;
  type: 'Pedido' | 'Cotización';
  title: string;
  status: string;
  date: string;
};

export async function fetchCalendarioEventos(accessToken: string) {
  return apiRequest<CalendarioEvento[]>('/calendario/events', { method: 'GET' }, accessToken);
}

export { getReadableApiError as getReadableCalendarioError };
