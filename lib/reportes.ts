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

export type BusinessKpis = {
  businessId: string | null;
  timezone: string;
  localDate: string | null;
  generatedAt: string;
  dailySales: {
    today: string;
    yesterday: string;
    percentageChange: string;
  };
  orders: {
    totalToday: number;
    statuses: {
      pending: number;
      reserved: number;
      active: number;
      delivered: number;
      onTheWay: number;
    };
  };
  pendingCollections: {
    total: string;
  };
  newCustomers: {
    today: number;
    yesterday: number;
    differenceVsYesterday: number;
  };
};

export async function fetchReporteResumen(accessToken: string) {
  return apiRequest<ReporteResumen>('/reportes/overview', { method: 'GET' }, accessToken);
}

export async function fetchBusinessKpis(
  accessToken: string,
  timezone = 'America/Lima',
) {
  return apiRequest<BusinessKpis>(
    `/reportes/kpis?timezone=${encodeURIComponent(timezone)}`,
    { method: 'GET' },
    accessToken,
  );
}

export { getReadableApiError as getReadableReportesError };
