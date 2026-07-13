import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Calendar, ArrowUp, ArrowDown, ShoppingBag, ShoppingCart, Receipt, Users, Package, AlertTriangle, AlertCircle, TrendingUp, Truck, Clock, CheckCircle, UserPlus, DollarSign, TrendingDown, CreditCard } from 'lucide-react-native';
import { useFocusEffect, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { AnimatedTouchableOpacity, screenEntering, sectionEntering, smoothLayout } from '@/components/ui/motion';
import { useScrollToTopOnFocus } from '@/hooks/use-scroll-to-top';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { fetchReports, getReadableReportesError, type ReporteResumenData, type ReporteMetrica, type IngresoDiario, type VentaCategoria, type TopProducto, type ReportsResponse, type InventarioData, type InventarioProducto, type VentasData, type VentaDiaria, type OrdenReciente, type ClientesData, type ClienteRanking, type ClienteFrecuencia, type FinancieroData, type FlujoDiario, type GastoCategoria, type IngresoMetodo } from '@/lib/reportes';
import { formatCurrencyValue } from '@/lib/runtime-config';
import { getBadgeBgColor, getBadgeLabel, getBadgeTextColor } from '@/lib/status-badge';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const TABS = ['Resumen', 'Inventario', 'Ventas', 'Clientes', 'Financiero'] as const;
const TAB_KEYS: Record<string, string> = {
  Resumen: 'resumen',
  Inventario: 'inventario',
  Ventas: 'ventas',
  Clientes: 'clientes',
  Financiero: 'financiero',
};

const RESUME_METRIC_ICONS: Record<string, { icon: typeof ShoppingBag; color: string; bg: string }> = {
  ingresos: { icon: ShoppingBag, color: '#8B5CF6', bg: '#EDE9FE' },
  ventas: { icon: ShoppingCart, color: '#10B981', bg: '#D1FAE5' },
  ticket_promedio: { icon: Receipt, color: '#F59E0B', bg: '#FEF3C7' },
  clientes_activos: { icon: Users, color: '#3B82F6', bg: '#DBEAFE' },
};

const RESUME_METRIC_LABELS: Record<string, string> = {
  ingresos: 'Ingresos',
  ventas: 'Ventas',
  ticket_promedio: 'Ticket prom.',
  clientes_activos: 'Clientes act.',
};

const STOCK_ESTADO: Record<string, { label: string; bg: string; textColor: string }> = {
  sin_stock: { label: 'Sin stock', bg: '#FEE2E2', textColor: '#DC2626' },
  stock_bajo: { label: 'Stock bajo', bg: '#FEF3C7', textColor: '#B45309' },
  disponible: { label: 'Disponible', bg: '#D1FAE5', textColor: '#047857' },
};

const CATEGORY_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#3B82F6', '#CBD5E1', '#EC4899', '#8B5CF6', '#EF4444'];

function formatMetricValue(id: string, valor: number): string {
  if (id === 'ingresos' || id === 'ticket_promedio') {
    return formatCurrencyValue(valor);
  }
  return String(valor);
}

function formatGrowth(crecimiento: number | null): { text: string; positive: boolean } | null {
  if (crecimiento === null || crecimiento === undefined) return null;
  const sign = crecimiento > 0 ? '+' : '';
  return { text: `${sign}${crecimiento.toFixed(1)}%`, positive: crecimiento >= 0 };
}

function buildLinePath(data: IngresoDiario[], maxVal: number): string {
  if (data.length === 0) return '';
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 100;
    const y = maxVal > 0 ? 100 - (d.ingresos / maxVal) * 80 : 100;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `${points.join(' ')} L100,100 L0,100 Z`;
}

function buildLineStroke(data: IngresoDiario[], maxVal: number): string {
  if (data.length === 0) return '';
  return data
    .map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * 100;
      const y = maxVal > 0 ? 100 - (d.ingresos / maxVal) * 80 : 100;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function buildDonutSegments(categories: VentaCategoria[], totalVentas: number) {
  const circumference = 2 * Math.PI * 40;
  let accumulated = 0;
  return categories.slice(0, 5).map((cat, i) => {
    const pct = totalVentas > 0 ? cat.total / totalVentas : 0;
    const dashLength = pct * circumference;
    const offset = -accumulated;
    accumulated += dashLength;
    const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
    return { ...cat, dashLength, offset, color };
  });
}

function MetricCard({ metrica, palette }: { metrica: ReporteMetrica; palette: any }) {
  const config = RESUME_METRIC_ICONS[metrica.id] ?? RESUME_METRIC_ICONS.ventas;
  const Icon = config.icon;
  const growth = formatGrowth(metrica.crecimiento);

  return (
    <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm shadow-slate-100">
      <Text className="text-slate-500 font-medium text-xs mb-2" numberOfLines={1}>{RESUME_METRIC_LABELS[metrica.id] ?? metrica.id}</Text>
      <Text className="text-2xl font-bold text-slate-800 mb-2" numberOfLines={1}>
        {formatMetricValue(metrica.id, metrica.valor)}
      </Text>

      <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center" style={{ backgroundColor: config.bg }}>
        <Icon color={config.color} size={20} />
      </View>

      <View className="flex-row items-center">
        {growth ? (
          <>
            {growth.positive ? <ArrowUp color="#10b981" size={14} /> : <ArrowDown color="#ef4444" size={14} />}
            <Text className={`text-xs font-semibold ml-1 mr-1 ${growth.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {growth.text}
            </Text>
          </>
        ) : (
          <Text className="text-xs font-semibold text-slate-400 mr-1">--</Text>
        )}
        <Text className="text-[10px] text-slate-400">vs periodo ant.</Text>
      </View>
    </View>
  );
}

function ResumenView({ data, palette }: { data: ReporteResumenData; palette: any }) {
  const metricas = useMemo(() => data.metricas ?? [], [data]);
  const ingresosPorDia = useMemo(() => data.ingresos_por_dia ?? [], [data]);
  const categorias = useMemo(() => data.ventas_por_categoria ?? [], [data]);
  const productos = useMemo(() => data.top_productos ?? [], [data]);

  const tieneIngresos = ingresosPorDia.length > 0;
  const tieneCategorias = categorias.length > 0;
  const tieneProductos = productos.length > 0;
  const tieneCharts = tieneIngresos || tieneCategorias;

  const totalVentas = useMemo(() => {
    const m = metricas.find((m) => m.id === 'ventas');
    return m?.valor ?? 0;
  }, [metricas]);

  const maxIngreso = useMemo(() => {
    if (!tieneIngresos) return 1;
    return Math.max(...ingresosPorDia.map((d) => d.ingresos), 1);
  }, [ingresosPorDia, tieneIngresos]);

  const totalVentasCategoria = useMemo(() => {
    return categorias.reduce((sum, c) => sum + c.total, 0);
  }, [categorias]);

  const donutSegments = useMemo(
    () => buildDonutSegments(categorias, totalVentasCategoria),
    [categorias, totalVentasCategoria],
  );

  const xLabels = useMemo(() => {
    if (!tieneIngresos) return { first: '', mid: '', last: '' };
    const fmt = (d: IngresoDiario) => {
      const date = new Date(d.fecha + 'T00:00:00');
      return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    };
    const mid = ingresosPorDia[Math.floor(ingresosPorDia.length / 2)];
    return { first: fmt(ingresosPorDia[0]), mid: mid ? fmt(mid) : '', last: fmt(ingresosPorDia[ingresosPorDia.length - 1]) };
  }, [ingresosPorDia, tieneIngresos]);

  const yLabels = useMemo(() => {
    if (maxIngreso <= 0) return ['0', '0', '0', '0', '0'];
    const step = maxIngreso / 4;
    return [0, 1, 2, 3, 4].map((i) => {
      const val = Math.round(step * (4 - i));
      return val >= 1000 ? `${(val / 1000).toFixed(0)}K` : String(val);
    });
  }, [maxIngreso]);

  return (
    <>
      <View className="flex-row flex-wrap justify-between">
        {metricas.map((m) => (
          <MetricCard key={m.id} metrica={m} palette={palette} />
        ))}
      </View>

      {tieneCharts && (
        <View className="flex-row justify-between mb-6">
          {tieneIngresos ? (
            <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xs font-semibold text-slate-800" numberOfLines={1}>Ingresos por día</Text>
                <View className="flex-row items-center bg-slate-50 px-2 py-1 rounded-lg">
                  <Text className="text-[10px] text-slate-500">S/</Text>
                </View>
              </View>

              <View className="h-32 w-full">
                <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <Defs>
                    <LinearGradient id="gradLine" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={palette.primary} stopOpacity="0.2" />
                      <Stop offset="1" stopColor={palette.primary} stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  <Path d={buildLinePath(ingresosPorDia, maxIngreso)} fill="url(#gradLine)" />
                  <Path d={buildLineStroke(ingresosPorDia, maxIngreso)} fill="none" stroke={palette.primary} strokeWidth="2" strokeLinejoin="round" />
                </Svg>

                <View className="absolute left-0 top-0 bottom-6 justify-between w-8">
                  {yLabels.map((label, i) => (
                    <Text key={i} className="text-[9px] text-slate-400" numberOfLines={1}>{label}</Text>
                  ))}
                </View>

                <View className="absolute left-8 right-0 bottom-0 flex-row justify-between pt-1">
                  <Text className="text-[9px] text-slate-400" numberOfLines={1}>{xLabels.first}</Text>
                  <Text className="text-[9px] text-slate-400" numberOfLines={1}>{xLabels.mid}</Text>
                  <Text className="text-[9px] text-slate-400" numberOfLines={1}>{xLabels.last}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100 items-center justify-center">
              <Text className="text-xs text-slate-400">Sin ingresos en el período</Text>
            </View>
          )}

          {tieneCategorias ? (
            <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
              <Text className="text-xs font-semibold text-slate-800 mb-4" numberOfLines={1}>Ventas por categoría</Text>
              <View className="flex-row items-center">
                <View className="w-20 h-20 mr-2 relative justify-center items-center flex-shrink-0">
                  <Svg width="100%" height="100%" viewBox="0 0 100 100">
                    {donutSegments.map((seg, i) => (
                      <Circle key={i} cx="50" cy="50" r="40" fill="none" stroke={seg.color} strokeWidth="16"
                        strokeDasharray={`${seg.dashLength.toFixed(1)} 251`} strokeDashoffset={seg.offset.toFixed(1)} strokeLinecap="butt" />
                    ))}
                  </Svg>
                  <View className="absolute items-center justify-center bg-white rounded-full h-[48px] w-[48px]">
                    <Text className="text-[9px] text-slate-500">Total</Text>
                    <Text className="text-sm font-bold text-slate-800 leading-tight">{totalVentas}</Text>
                    <Text className="text-[8px] text-slate-400">ventas</Text>
                  </View>
                </View>

                <View className="flex-1 overflow-hidden">
                  {donutSegments.map((seg, i) => (
                    <View key={i} className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center flex-1 mr-1 overflow-hidden">
                        <View className="w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0" style={{ backgroundColor: seg.color }} />
                        <Text className="text-[9px] text-slate-600" numberOfLines={1}>{seg.categoria}</Text>
                      </View>
                      <Text className="text-[9px] text-slate-800 flex-shrink-0">{seg.porcentaje}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100 items-center justify-center">
              <Text className="text-xs text-slate-400">Sin categorías</Text>
            </View>
          )}
        </View>
      )}

      <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm shadow-slate-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-semibold text-slate-800">Productos más vendidos</Text>
          {tieneProductos && (
            <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: palette.primarySoft }}>
              <Text className="text-[10px] font-semibold" style={{ color: palette.primary }}>Top {Math.min(productos.length, 10)}</Text>
            </View>
          )}
        </View>

        {tieneProductos ? (
          <>
            <View className="flex-row border-b border-slate-100 pb-2 mb-3">
              <Text className="text-[10px] text-slate-400 w-6">#</Text>
              <Text className="text-[10px] text-slate-400 flex-1">Producto</Text>
              <Text className="text-[10px] text-slate-400 w-10 text-center">Vtas</Text>
              <Text className="text-[10px] text-slate-400 w-[64px] text-right">Ingresos</Text>
              <Text className="text-[10px] text-slate-400 w-14 text-right">% total</Text>
            </View>
            {productos.map((prod: TopProducto) => (
              <View key={prod.ranking} className="flex-row items-center py-2">
                <Text className="text-xs font-medium text-slate-700 w-6">{prod.ranking}</Text>
                <View className="flex-1 flex-row items-center overflow-hidden">
                  <View className="h-8 w-8 rounded-lg mr-1.5 items-center justify-center flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[(prod.ranking - 1) % CATEGORY_COLORS.length] + '30' }}>
                    <ShoppingBag size={14} color={CATEGORY_COLORS[(prod.ranking - 1) % CATEGORY_COLORS.length]} />
                  </View>
                  <Text className="text-[11px] font-medium text-slate-800 flex-1" numberOfLines={2}>{prod.producto}</Text>
                </View>
                <Text className="text-[11px] font-medium text-slate-600 w-10 text-center" numberOfLines={1}>{prod.cantidad}</Text>
                <Text className="text-[11px] font-medium text-slate-800 w-[64px] text-right flex-shrink-0" numberOfLines={1}>{formatCurrencyValue(prod.ingresos)}</Text>
                <View className="w-14 items-end flex-shrink-0 ml-2">
                  <Text className="text-[10px] font-medium text-slate-700" numberOfLines={1}>{prod.porcentaje}%</Text>
                  <View className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                    <View className="h-full rounded-full" style={{ width: `${Math.min(prod.porcentaje, 100)}%`, backgroundColor: palette.primary }} />
                  </View>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View className="items-center py-8">
            <ShoppingBag size={32} color="#cbd5e1" />
            <Text className="text-sm text-slate-400 mt-3">Sin datos de productos en el período</Text>
            <Text className="text-xs text-slate-400 mt-1">Realiza ventas para ver el ranking</Text>
          </View>
        )}
      </View>
    </>
  );
}

function InventarioView({ data, palette }: { data: InventarioData; palette: any }) {
  const m = data.metricas;
  return (
    <>
      {/* Metricas de inventario */}
      <View className="flex-row flex-wrap justify-between">
        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Total productos</Text>
          <Text className="text-xl font-bold text-slate-800 mb-4">{m.total_productos}</Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-indigo-50">
            <Package color="#6366F1" size={20} />
          </View>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Sin stock</Text>
          <Text className="text-xl font-bold text-slate-800 mb-4">{m.productos_sin_stock}</Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-rose-50">
            <AlertCircle color="#EF4444" size={20} />
          </View>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Stock bajo</Text>
          <View className="flex-row items-baseline mb-4">
            <Text className="text-xl font-bold text-slate-800">{m.stock_bajo}</Text>
            <Text className="text-[10px] text-slate-400 ml-1">≤{m.umbral_stock_bajo}</Text>
          </View>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-amber-50">
            <AlertTriangle color="#F59E0B" size={20} />
          </View>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Valor inventario</Text>
          <Text className="text-xl font-bold text-slate-800" numberOfLines={1}>{formatCurrencyValue(m.valor_inventario)}</Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-emerald-50">
            <Receipt color="#10B981" size={20} />
          </View>
        </View>
      </View>

      {/* Lista de productos */}
      <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm shadow-slate-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-semibold text-slate-800">Productos en inventario</Text>
          <Text className="text-xs text-slate-400">{data.productos.length} items</Text>
        </View>

        {data.productos.length > 0 ? (
          data.productos.map((prod: InventarioProducto, idx: number) => {
            const estado = STOCK_ESTADO[prod.estado_stock] ?? STOCK_ESTADO.disponible;
            return (
              <View key={prod.item_id} className={`flex-row items-center py-3 ${idx !== 0 ? 'border-t border-slate-50' : ''}`}>
                <View className="flex-1 mr-3">
                  <Text className="text-sm font-medium text-slate-800" numberOfLines={1}>{prod.nombre}</Text>
                  <View className="flex-row items-center mt-1 overflow-hidden">
                    <Text className="text-[10px] text-slate-400" numberOfLines={1}>{prod.categoria}</Text>
                    <Text className="text-[10px] text-slate-300 mx-1.5">·</Text>
                    <Text className="text-[10px] text-slate-400 flex-shrink-0" numberOfLines={1}>{prod.unidad}</Text>
                    <Text className="text-[10px] text-slate-300 mx-1.5">·</Text>
                    <Text className="text-[10px] text-slate-400 flex-1" numberOfLines={1}>{prod.codigo}</Text>
                  </View>
                </View>

                <View className="items-end mr-3 flex-shrink-0">
                  <Text className="text-sm font-semibold text-slate-800" numberOfLines={1}>{formatCurrencyValue(prod.precio)}</Text>
                  <Text className="text-[10px] text-slate-400">x{prod.stock}</Text>
                </View>

                <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: estado.bg }}>
                  <Text className="text-[10px] font-semibold" style={{ color: estado.textColor }}>{estado.label}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View className="items-center py-8">
            <Package size={32} color="#cbd5e1" />
            <Text className="text-sm text-slate-400 mt-3">No hay productos registrados</Text>
          </View>
        )}
      </View>
    </>
  );
}

function VentasView({ data, palette }: { data: VentasData; palette: any }) {
  const m = data.metricas;

  const maxVentasIngreso = useMemo(() => {
    const vals = data.ventas_por_dia ?? [];
    if (vals.length === 0) return 1;
    return Math.max(...vals.map((d) => d.ingresos), 1);
  }, [data]);

  const xLabels = useMemo(() => {
    const vals = data.ventas_por_dia ?? [];
    if (vals.length === 0) return { first: '', mid: '', last: '' };
    const fmt = (d: VentaDiaria) => {
      const date = new Date(d.fecha + 'T00:00:00');
      return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    };
    const mid = vals[Math.floor(vals.length / 2)];
    return { first: fmt(vals[0]), mid: mid ? fmt(mid) : '', last: fmt(vals[vals.length - 1]) };
  }, [data]);

  const yLabels = useMemo(() => {
    if (maxVentasIngreso <= 0) return ['0', '0', '0', '0', '0'];
    const step = maxVentasIngreso / 4;
    return [0, 1, 2, 3, 4].map((i) => {
      const val = Math.round(step * (4 - i));
      return val >= 1000 ? `${(val / 1000).toFixed(0)}K` : String(val);
    });
  }, [maxVentasIngreso]);

  const tasaLabel = useMemo(() => `${m.tasa_conversion}%`, [m]);

  const STATUS_ICONS: Record<string, typeof ShoppingCart> = {
    Pendiente: Clock,
    Reserva: Calendar,
    Activo: TrendingUp,
    'En camino': Truck,
    Entregado: CheckCircle,
  };

  return (
    <>
      {/* Metricas */}
      <View className="flex-row flex-wrap justify-between">
        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Total órdenes</Text>
          <Text className="text-xl font-bold text-slate-800 mb-4">{m.total_ordenes}</Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-indigo-50">
            <ShoppingCart color="#6366F1" size={20} />
          </View>
          <Text className="text-[10px] text-slate-400">Tasa conversión: {tasaLabel}</Text>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Pendientes</Text>
          <Text className="text-xl font-bold text-amber-600 mb-4">{m.pendientes}</Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-amber-50">
            <Clock color="#F59E0B" size={20} />
          </View>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">En camino</Text>
          <Text className="text-xl font-bold text-orange-600 mb-4">{m.en_camino}</Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-orange-50">
            <Truck color="#EA580C" size={20} />
          </View>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Entregadas</Text>
          <Text className="text-xl font-bold text-emerald-600">{m.entregadas}</Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-emerald-50">
            <CheckCircle color="#10B981" size={20} />
          </View>
        </View>
      </View>

      {/* Ordenes por estado */}
      {data.ordenes_por_estado.length > 0 && (
        <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="font-semibold text-slate-800 mb-4">Órdenes por estado</Text>
          <View className="flex-row flex-wrap">
            {data.ordenes_por_estado.map((est) => {
              const StatusIcon = STATUS_ICONS[est.estado] ?? ShoppingCart;
              const bg = getBadgeBgColor(est.estado);
              const textColor = getBadgeTextColor(est.estado);
              return (
                <View key={est.estado} className="w-[30%] items-center mb-4 mr-[3%]">
                  <View className="h-10 w-10 rounded-full items-center justify-center mb-1.5" style={{ backgroundColor: bg }}>
                    <StatusIcon color={textColor} size={18} />
                  </View>
                  <Text className="text-lg font-bold text-slate-800">{est.cantidad}</Text>
                  <Text className="text-[10px] text-slate-500 text-center" numberOfLines={1}>{getBadgeLabel(est.estado)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Ingresos por dia */}
      <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm shadow-slate-100">
        <Text className="font-semibold text-slate-800 mb-4" numberOfLines={1}>Ingresos por día</Text>
        <View className="h-36 w-full">
          <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={palette.primary} stopOpacity="0.2" />
                <Stop offset="1" stopColor={palette.primary} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            {(data.ventas_por_dia?.length ?? 0) > 0 && (
              <>
                <Path d={buildLinePath(data.ventas_por_dia!, maxVentasIngreso)} fill="url(#gradVentas)" />
                <Path d={buildLineStroke(data.ventas_por_dia!, maxVentasIngreso)} fill="none" stroke={palette.primary} strokeWidth="2" strokeLinejoin="round" />
              </>
            )}
          </Svg>
          <View className="absolute left-0 top-0 bottom-6 justify-between w-8">
            {yLabels.map((label, i) => (
              <Text key={i} className="text-[9px] text-slate-400" numberOfLines={1}>{label}</Text>
            ))}
          </View>
          <View className="absolute left-8 right-0 bottom-0 flex-row justify-between pt-1">
            <Text className="text-[9px] text-slate-400" numberOfLines={1}>{xLabels.first}</Text>
            <Text className="text-[9px] text-slate-400" numberOfLines={1}>{xLabels.mid}</Text>
            <Text className="text-[9px] text-slate-400" numberOfLines={1}>{xLabels.last}</Text>
          </View>
        </View>
      </View>

      {/* Ordenes recientes */}
      <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm shadow-slate-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-semibold text-slate-800">Órdenes recientes</Text>
          <Text className="text-xs text-slate-400">{data.ordenes_recientes.length} órdenes</Text>
        </View>

        {data.ordenes_recientes.length > 0 ? (
          data.ordenes_recientes.map((orden: OrdenReciente, idx: number) => (
            <View key={orden.order_id} className={`py-3 ${idx !== 0 ? 'border-t border-slate-50' : ''}`}>
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center flex-1 mr-3 overflow-hidden">
                  <Text className="text-sm font-semibold text-slate-800 flex-shrink-0" numberOfLines={1}>{orden.codigo}</Text>
                  <View className="rounded-full px-2 py-0.5 ml-2 flex-shrink-0" style={{ backgroundColor: getBadgeBgColor(orden.estado) }}>
                    <Text className="text-[9px] font-semibold" style={{ color: getBadgeTextColor(orden.estado) }}>{getBadgeLabel(orden.estado)}</Text>
                  </View>
                </View>
                <Text className="text-sm font-bold text-slate-800 flex-shrink-0" numberOfLines={1}>{formatCurrencyValue(orden.monto_total)}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-3 overflow-hidden">
                  <Text className="text-[11px] text-slate-500" numberOfLines={1}>{orden.cliente}</Text>
                  {orden.saldo_pendiente > 0 && orden.estado_pago && (
                    <View className="rounded-full px-1.5 py-0.5 ml-2 flex-shrink-0" style={{ backgroundColor: getBadgeBgColor(orden.estado_pago) }}>
                      <Text className="text-[8px] font-semibold" style={{ color: getBadgeTextColor(orden.estado_pago) }}>{getBadgeLabel(orden.estado_pago)}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-[10px] text-slate-400 flex-shrink-0" numberOfLines={1}>
                  {new Date(orden.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View className="items-center py-8">
            <ShoppingCart size={32} color="#cbd5e1" />
            <Text className="text-sm text-slate-400 mt-3">Sin órdenes en el período</Text>
          </View>
        )}
      </View>
    </>
  );
}

function ClientesView({ data, palette }: { data: ClientesData; palette: any }) {
  const m = data.metricas;

  return (
    <>
      {/* Metricas */}
      <View className="flex-row flex-wrap justify-between">
        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Total clientes</Text>
          <Text className="text-xl font-bold text-slate-800 mb-4">{m.total_clientes}</Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-blue-50">
            <Users color="#3B82F6" size={20} />
          </View>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Activos</Text>
          <Text className="text-xl font-bold text-emerald-600 mb-4">{m.clientes_activos}</Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-emerald-50">
            <TrendingUp color="#10B981" size={20} />
          </View>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Nuevos</Text>
          <Text className="text-xl font-bold text-indigo-600 mb-4">{m.clientes_nuevos}</Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-indigo-50">
            <UserPlus color="#6366F1" size={20} />
          </View>
        </View>
      </View>

      {/* Ranking */}
      {data.ranking_clientes.length > 0 && (
        <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm shadow-slate-100">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-semibold text-slate-800">Ranking de clientes</Text>
            <Text className="text-xs text-slate-400">Top {data.ranking_clientes.length}</Text>
          </View>

          <View className="flex-row border-b border-slate-100 pb-2 mb-3">
            <Text className="text-[10px] text-slate-400 w-6">#</Text>
            <Text className="text-[10px] text-slate-400 flex-1">Cliente</Text>
            <Text className="text-[10px] text-slate-400 w-12 text-center">Pedidos</Text>
              <Text className="text-[10px] text-slate-400 w-[72px] text-right">Total</Text>
          </View>

          {data.ranking_clientes.map((c: ClienteRanking, idx: number) => (
            <View key={c.customer_id} className={`flex-row items-center py-2.5 ${idx !== 0 ? 'border-t border-slate-50' : ''}`}>
              <Text className="text-xs font-medium text-slate-700 w-6">{idx + 1}</Text>
              <View className="flex-1 mr-2">
                <Text className="text-sm font-medium text-slate-800" numberOfLines={1}>{c.cliente}</Text>
                <Text className="text-[10px] text-slate-400" numberOfLines={1}>DNI: {c.dni}</Text>
              </View>
              <Text className="text-[11px] font-medium text-slate-600 w-12 text-center">{c.total_pedidos}</Text>
              <Text className="text-[11px] font-semibold text-slate-800 w-[72px] text-right flex-shrink-0" numberOfLines={1}>{formatCurrencyValue(c.total_gastado)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Frecuencia */}
      {data.frecuencia_compra.length > 0 && (
        <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="font-semibold text-slate-800 mb-4">Frecuencia de compra</Text>

          {data.frecuencia_compra.slice(0, 10).map((fc: ClienteFrecuencia, idx: number) => (
            <View key={fc.customer_id} className={`py-3 ${idx !== 0 ? 'border-t border-slate-50' : ''}`}>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm font-medium text-slate-800 flex-1 mr-3" numberOfLines={1}>{fc.cliente}</Text>
                <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: palette.primarySoft }}>
                  <Text className="text-[10px] font-semibold" style={{ color: palette.primary }}>
                    {fc.total_pedidos} {fc.total_pedidos === 1 ? 'pedido' : 'pedidos'}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center overflow-hidden">
                <Text className="text-[10px] text-slate-400 flex-shrink-0" numberOfLines={1}>
                  {new Date(fc.primera_compra).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                  {' — '}
                  {new Date(fc.ultima_compra).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                </Text>
                {fc.frecuencia_promedio_dias !== null && (
                  <Text className="text-[10px] text-slate-400 ml-2" numberOfLines={1}>
                    · cada {Math.round(fc.frecuencia_promedio_dias)} días
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

function FinancieroView({ data, palette }: { data: FinancieroData; palette: any }) {
  const m = data.metricas;
  const flujo = useMemo(() => data.ingresos_vs_gastos_por_dia ?? [], [data]);
  const benPositivo = m.beneficio_neto >= 0;

  const maxFlujo = useMemo(() => {
    if (flujo.length === 0) return 1;
    return Math.max(...flujo.map((d) => Math.max(d.ingresos, d.gastos)), 1);
  }, [flujo]);

  const flujoStroke = useMemo(() => {
    if (flujo.length === 0) return { ingresos: '', gastos: '' };
    const make = (key: 'ingresos' | 'gastos') =>
      flujo
        .map((d, i) => {
          const x = (i / Math.max(flujo.length - 1, 1)) * 100;
          const y = maxFlujo > 0 ? 100 - (d[key] / maxFlujo) * 80 : 100;
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    return { ingresos: make('ingresos'), gastos: make('gastos') };
  }, [flujo, maxFlujo]);

  const xLabels = useMemo(() => {
    if (flujo.length === 0) return { first: '', mid: '', last: '' };
    const fmt = (d: FlujoDiario) => {
      const date = new Date(d.fecha + 'T00:00:00');
      return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    };
    const mid = flujo[Math.floor(flujo.length / 2)];
    return { first: fmt(flujo[0]), mid: mid ? fmt(mid) : '', last: fmt(flujo[flujo.length - 1]) };
  }, [flujo]);

  const yLabels = useMemo(() => {
    if (maxFlujo <= 0) return ['0', '0', '0', '0', '0'];
    const step = maxFlujo / 4;
    return [0, 1, 2, 3, 4].map((i) => {
      const val = Math.round(step * (4 - i));
      return val >= 1000 ? `${(val / 1000).toFixed(0)}K` : String(val);
    });
  }, [maxFlujo]);

  const maxGastoCat = useMemo(() => {
    const cats = data.gastos_por_categoria ?? [];
    if (cats.length === 0) return 1;
    return Math.max(...cats.map((c) => c.total), 1);
  }, [data]);

  return (
    <>
      {/* Metricas */}
      <View className="flex-row flex-wrap justify-between">
        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Ingresos</Text>
          <Text className="text-xl font-bold text-emerald-600 mb-4" numberOfLines={1}>{formatCurrencyValue(m.ingresos)}</Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-emerald-50">
            <TrendingUp color="#10B981" size={20} />
          </View>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Gastos</Text>
          <Text className="text-xl font-bold text-rose-600 mb-4" numberOfLines={1}>{formatCurrencyValue(m.gastos)}</Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-rose-50">
            <TrendingDown color="#EF4444" size={20} />
          </View>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Beneficio neto</Text>
          <Text className={`text-xl font-bold mb-4 ${benPositivo ? 'text-emerald-600' : 'text-rose-600'}`} numberOfLines={1}>
            {formatCurrencyValue(m.beneficio_neto)}
          </Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center" style={{ backgroundColor: benPositivo ? '#D1FAE5' : '#FEE2E2' }}>
            <DollarSign color={benPositivo ? '#10B981' : '#EF4444'} size={20} />
          </View>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-sm text-slate-500 mb-2">Margen</Text>
          <Text className={`text-xl font-bold mb-4 ${m.margen >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {m.margen}%
          </Text>
          <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center bg-indigo-50">
            <Receipt color="#6366F1" size={20} />
          </View>
        </View>
      </View>

      {/* Ingresos vs Gastos */}
      <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm shadow-slate-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-semibold text-slate-800">Ingresos vs Gastos</Text>
          <View className="flex-row items-center">
            <View className="flex-row items-center mr-3">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
              <Text className="text-[9px] text-slate-500">Ingresos</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-rose-500 mr-1" />
              <Text className="text-[9px] text-slate-500">Gastos</Text>
            </View>
          </View>
        </View>

        <View className="h-36 w-full">
          <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            {flujo.length > 0 && (
              <>
                <Path d={flujoStroke.ingresos} fill="none" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />
                <Path d={flujoStroke.gastos} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
              </>
            )}
          </Svg>
          <View className="absolute left-0 top-0 bottom-6 justify-between w-8">
            {yLabels.map((label, i) => (
              <Text key={i} className="text-[9px] text-slate-400" numberOfLines={1}>{label}</Text>
            ))}
          </View>
          <View className="absolute left-8 right-0 bottom-0 flex-row justify-between pt-1">
            <Text className="text-[9px] text-slate-400" numberOfLines={1}>{xLabels.first}</Text>
            <Text className="text-[9px] text-slate-400" numberOfLines={1}>{xLabels.mid}</Text>
            <Text className="text-[9px] text-slate-400" numberOfLines={1}>{xLabels.last}</Text>
          </View>
        </View>
      </View>

      {/* Gastos por categoria */}
      {data.gastos_por_categoria.length > 0 && (
        <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="font-semibold text-slate-800 mb-4">Gastos por categoría</Text>
          {data.gastos_por_categoria.map((cat: GastoCategoria, idx: number) => (
            <View key={cat.categoria} className={`${idx !== 0 ? 'mt-3' : ''}`}>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs font-medium text-slate-700 flex-1 mr-2" numberOfLines={1}>{cat.categoria}</Text>
                <Text className="text-xs font-semibold text-slate-800 flex-shrink-0" numberOfLines={1}>{formatCurrencyValue(cat.total)}</Text>
              </View>
              <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <View className="h-full rounded-full bg-rose-400" style={{ width: `${Math.min((cat.total / maxGastoCat) * 100, 100)}%` }} />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Metodos de pago */}
      <View className="flex-row justify-between mb-6">
        <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-xs font-semibold text-slate-800 mb-3">Ingresos</Text>
          {data.ingresos_por_metodo_pago.length > 0 ? (
            data.ingresos_por_metodo_pago.map((m: IngresoMetodo) => (
              <View key={m.metodo_pago} className="flex-row justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                <View className="flex-row items-center flex-1 mr-2 overflow-hidden">
                  <CreditCard size={12} color="#10B981" />
                  <Text className="text-[10px] text-slate-600 ml-1.5" numberOfLines={1}>{m.metodo_pago}</Text>
                </View>
                <Text className="text-[10px] font-semibold text-slate-800 flex-shrink-0" numberOfLines={1}>{formatCurrencyValue(m.total)}</Text>
              </View>
            ))
          ) : (
            <Text className="text-[10px] text-slate-400">Sin datos</Text>
          )}
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
          <Text className="text-xs font-semibold text-slate-800 mb-3">Gastos</Text>
          {data.gastos_por_metodo_pago.length > 0 ? (
            data.gastos_por_metodo_pago.map((m: IngresoMetodo) => (
              <View key={m.metodo_pago} className="flex-row justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                <View className="flex-row items-center flex-1 mr-2 overflow-hidden">
                  <CreditCard size={12} color="#EF4444" />
                  <Text className="text-[10px] text-slate-600 ml-1.5" numberOfLines={1}>{m.metodo_pago}</Text>
                </View>
                <Text className="text-[10px] font-semibold text-slate-800 flex-shrink-0" numberOfLines={1}>{formatCurrencyValue(m.total)}</Text>
              </View>
            ))
          ) : (
            <Text className="text-[10px] text-slate-400">Sin datos</Text>
          )}
        </View>
      </View>
    </>
  );
}

export default function ReportesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const mainScrollRef = useScrollToTopOnFocus();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();

  const [activeTab, setActiveTab] = useState<string>('Resumen');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportsResponse | null>(null);

  const tabKey = TAB_KEYS[activeTab] ?? 'resumen';

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchReports(accessToken, tabKey);
      setReportData(response);
    } catch (err: unknown) {
      setError(getReadableReportesError(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken, tabKey]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const renderContent = () => {
    if (activeTab === 'Resumen' && reportData?.resumen) {
      return <ResumenView data={reportData.resumen} palette={palette} />;
    }
    if (activeTab === 'Inventario' && reportData?.inventario) {
      return <InventarioView data={reportData.inventario} palette={palette} />;
    }
    if (activeTab === 'Ventas' && reportData?.ventas) {
      return <VentasView data={reportData.ventas} palette={palette} />;
    }
    if (activeTab === 'Clientes' && reportData?.clientes) {
      return <ClientesView data={reportData.clientes} palette={palette} />;
    }
    if (activeTab === 'Financiero' && reportData?.financiero) {
      return <FinancieroView data={reportData.financiero} palette={palette} />;
    }
    return (
      <View className="items-center py-20">
        <Text className="text-slate-400 text-lg font-medium">{activeTab}</Text>
        <Text className="text-slate-400 text-sm mt-2">Sin datos disponibles</Text>
      </View>
    );
  };

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="px-5 pb-4 flex-row items-center"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={openDrawer} className="mr-4">
            <Menu color="white" size={24} />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className="text-white text-xl font-bold mr-2">Reportes</Text>
            <View className="border border-white/40 rounded-full px-2 py-0.5">
              <Text className="text-white text-[10px] font-bold">PRO</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View className="border-b border-slate-200" entering={sectionEntering(1)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
          {TABS.map((tab) => (
            <AnimatedTouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="py-4 mr-6 border-b-2"
              style={{ borderColor: activeTab === tab ? palette.primary : 'transparent' }}
              layout={smoothLayout}
            >
              <Text
                className={activeTab === tab ? 'font-semibold' : 'text-slate-500'}
                style={{ color: activeTab === tab ? palette.primaryText : undefined }}
              >
                {tab}
              </Text>
            </AnimatedTouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView
        ref={mainScrollRef}
        className="flex-1 bg-slate-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 40) }}
      >
        <Animated.View className="px-4 pt-6" entering={sectionEntering(2)}>
          {loading ? (
            <View className="items-center py-20">
              <ActivityIndicator size="large" color={palette.primary} />
              <Text className="text-slate-500 mt-4 font-medium">Cargando reportes...</Text>
            </View>
          ) : error ? (
            <View className="items-center py-20 px-8">
              <Text className="text-rose-500 text-center font-medium" numberOfLines={4}>{error}</Text>
            </View>
          ) : (
            <>
              {renderContent()}
            </>
          )}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}
