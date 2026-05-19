import { apiRequest, getReadableApiError } from '@/lib/api-client';

export type ReporteResumen = {
  totalSales: string;
  totalExpenses: string;
  pendingCollections: string;
  topItems: Array<{
    name: string;
    count: number;
  }>;
};

export async function fetchReporteResumen(accessToken: string) {
  return apiRequest<ReporteResumen>('/reportes/overview', { method: 'GET' }, accessToken);
}

export { getReadableApiError as getReadableReportesError };
