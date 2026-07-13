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

export type InventarioMetricas = {
  total_productos: number;
  productos_sin_stock: number;
  stock_bajo: number;
  valor_inventario: number;
  umbral_stock_bajo: number;
};

export type InventarioProducto = {
  item_id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  unidad: string;
  codigo: string;
  estado_stock: 'sin_stock' | 'stock_bajo' | 'disponible';
};

export type InventarioData = {
  metricas: InventarioMetricas;
  productos: InventarioProducto[];
};

export type VentasMetricas = {
  total_ordenes: number;
  pendientes: number;
  reservas: number;
  activas: number;
  en_camino: number;
  entregadas: number;
  tasa_conversion: number;
};

export type OrdenPorEstado = {
  estado: string;
  cantidad: number;
};

export type VentaDiaria = {
  fecha: string;
  cantidad_ordenes: number;
  ingresos: number;
};

export type OrdenReciente = {
  order_id: string;
  codigo: string;
  estado: string;
  fecha: string;
  cliente: string;
  monto_total: number;
  estado_pago: string | null;
  saldo_pendiente: number;
};

export type VentasData = {
  metricas: VentasMetricas;
  ordenes_por_estado: OrdenPorEstado[];
  ventas_por_dia: VentaDiaria[];
  ordenes_recientes: OrdenReciente[];
};

export type ClientesMetricas = {
  total_clientes: number;
  clientes_activos: number;
  clientes_nuevos: number;
};

export type ClienteRanking = {
  customer_id: string;
  cliente: string;
  dni: string;
  total_pedidos: number;
  total_gastado: number;
};

export type ClienteFrecuencia = {
  customer_id: string;
  cliente: string;
  primera_compra: string;
  ultima_compra: string;
  total_pedidos: number;
  frecuencia_promedio_dias: number | null;
};

export type ClientesData = {
  metricas: ClientesMetricas;
  ranking_clientes: ClienteRanking[];
  frecuencia_compra: ClienteFrecuencia[];
};

export type FinancieroMetricas = {
  ingresos: number;
  gastos: number;
  beneficio_neto: number;
  margen: number;
};

export type FlujoDiario = {
  fecha: string;
  ingresos: number;
  gastos: number;
  beneficio: number;
};

export type GastoCategoria = {
  categoria: string;
  total: number;
};

export type IngresoMetodo = {
  metodo_pago: string;
  total: number;
};

export type FinancieroData = {
  metricas: FinancieroMetricas;
  ingresos_vs_gastos_por_dia: FlujoDiario[];
  gastos_por_categoria: GastoCategoria[];
  ingresos_por_metodo_pago: IngresoMetodo[];
  gastos_por_metodo_pago: IngresoMetodo[];
};

export type ReportsResponse = {
  resumen?: ReporteResumenData;
  inventario?: InventarioData;
  ventas?: VentasData;
  clientes?: ClientesData;
  financiero?: FinancieroData;
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
