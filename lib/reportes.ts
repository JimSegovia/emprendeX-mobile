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

export type ReporteMetrica = {
  id: string;
  valor: number;
  crecimiento: number | null;
};

export type IngresoDiario = {
  fecha: string;
  ingresos: number;
};

export type VentaCategoria = {
  categoria: string;
  total: number;
  porcentaje: number;
};

export type TopProducto = {
  ranking: number;
  producto: string;
  cantidad: number;
  ingresos: number;
  porcentaje: number;
};

export type ReporteResumenData = {
  metricas: ReporteMetrica[];
  ingresos_por_dia: IngresoDiario[];
  ventas_por_categoria: VentaCategoria[];
  top_productos: TopProducto[];
};

export type ReportsResponse = {
  resumen?: ReporteResumenData;
  inventario?: Record<string, unknown>;
  ventas?: Record<string, unknown>;
  clientes?: Record<string, unknown>;
  financiero?: Record<string, unknown>;
};

export async function fetchReports(
  accessToken: string,
  tab: string,
  fechaInicio?: string,
  fechaFin?: string,
) {
  const params = new URLSearchParams({ tab });
  if (fechaInicio) params.set('fechaInicio', fechaInicio);
  if (fechaFin) params.set('fechaFin', fechaFin);

  return apiRequest<ReportsResponse>(
    `/reportes?${params.toString()}`,
    { method: 'GET' },
    accessToken,
  );
}

export { getReadableApiError as getReadableReportesError };
