import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Calendar, ChevronDown, ArrowUp, ArrowDown, ShoppingBag, ShoppingCart, Receipt, Users, Star, ChevronRight } from 'lucide-react-native';
import { useFocusEffect, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { useScrollToTopOnFocus } from '@/hooks/use-scroll-to-top';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { fetchReports, getReadableReportesError, type ReporteResumenData, type ReporteMetrica, type IngresoDiario, type VentaCategoria, type TopProducto } from '@/lib/reportes';
import { formatCurrencyValue } from '@/lib/runtime-config';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const TABS = ['Resumen', 'Inventario', 'Ventas', 'Clientes', 'Financiero'] as const;
const TAB_KEYS: Record<string, string> = {
  Resumen: 'resumen',
  Inventario: 'inventario',
  Ventas: 'ventas',
  Clientes: 'clientes',
  Financiero: 'financiero',
};

const METRIC_ICONS: Record<string, { icon: typeof ShoppingBag; color: string; bg: string }> = {
  ingresos: { icon: ShoppingBag, color: '#8B5CF6', bg: '#EDE9FE' },
  ventas: { icon: ShoppingCart, color: '#10B981', bg: '#D1FAE5' },
  ticket_promedio: { icon: Receipt, color: '#F59E0B', bg: '#FEF3C7' },
  clientes_activos: { icon: Users, color: '#3B82F6', bg: '#DBEAFE' },
};

const METRIC_LABELS: Record<string, string> = {
  ingresos: 'Ingresos',
  ventas: 'Ventas',
  ticket_promedio: 'Ticket prom.',
  clientes_activos: 'Clientes act.',
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
  const lastX = 100;
  return `${points.join(' ')} L${lastX},100 L0,100 Z`;
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

export default function ReportesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const mainScrollRef = useScrollToTopOnFocus();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();

  const [activeTab, setActiveTab] = useState<string>('Resumen');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumenData, setResumenData] = useState<ReporteResumenData | null>(null);

  const tabKey = TAB_KEYS[activeTab] ?? 'resumen';

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchReports(accessToken, tabKey);
      if (response.resumen) {
        setResumenData(response.resumen);
      } else {
        setResumenData(null);
      }
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

  const metricas = resumenData?.metricas ?? [];
  const metricLabel = useMemo(() => {
    const metric = metricas.find((m) => m.id === 'ventas');
    return `${metric?.valor ?? 0} ventas`;
  }, [metricas]);

  const maxIngreso = useMemo(() => {
    const data = resumenData?.ingresos_por_dia ?? [];
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => d.ingresos), 1);
  }, [resumenData]);

  const totalVentasCategoria = useMemo(() => {
    const data = resumenData?.ventas_por_categoria ?? [];
    return data.reduce((sum, c) => sum + c.total, 0);
  }, [resumenData]);

  const donutSegments = useMemo(
    () => buildDonutSegments(resumenData?.ventas_por_categoria ?? [], totalVentasCategoria),
    [resumenData, totalVentasCategoria],
  );

  const xLabels = useMemo(() => {
    const data = resumenData?.ingresos_por_dia ?? [];
    if (data.length === 0) return { first: '', mid: '', last: '' };
    const format = (d: IngresoDiario) => {
      const date = new Date(d.fecha + 'T00:00:00');
      return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    };
    const mid = data[Math.floor(data.length / 2)];
    return {
      first: format(data[0]),
      mid: mid ? format(mid) : '',
      last: format(data[data.length - 1]),
    };
  }, [resumenData]);

  const yLabels = useMemo(() => {
    if (maxIngreso <= 0) return ['0', '0', '0', '0', '0'];
    const step = maxIngreso / 4;
    return [0, 1, 2, 3, 4].map((i) => {
      const val = Math.round(step * (4 - i));
      if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
      return String(val);
    });
  }, [maxIngreso]);

  const isResumen = activeTab === 'Resumen';
  const isOtherTab = !isResumen;

  return (
    <Animated.View className="flex-1 bg-slate-50" entering={screenEntering}>
      {/* Header */}
      <Animated.View
        style={{ paddingTop: Math.max(insets.top, 16), backgroundColor: palette.primary, zIndex: 10 }}
        entering={sectionEntering(0)}
        className="rounded-b-3xl"
      >
        <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={openDrawer} className="p-2 -ml-2 mr-2">
              <Menu color="white" size={24} />
            </TouchableOpacity>
            <View>
              <View className="flex-row items-center mb-1">
                <Text className="text-white text-xl font-bold mr-2">Reportes</Text>
                <View className="border border-white/40 rounded-full px-2 py-0.5">
                  <Text className="text-white text-[10px] font-bold">PRO</Text>
                </View>
              </View>
              <Text className="text-white/80 text-xs">Analiza el rendimiento de tu negocio</Text>
            </View>
          </View>
          <TouchableOpacity className="flex-row items-center border border-white/30 rounded-xl px-3 py-2">
            <Calendar color="white" size={16} />
            <Text className="text-white ml-2 text-sm font-medium">Filtros</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 pt-2 bg-white rounded-t-3xl">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="mr-6 py-4 border-b-2"
              style={{ borderBottomColor: tab === activeTab ? palette.primary : 'transparent' }}
            >
              <Text
                className="font-semibold"
                style={{ color: tab === activeTab ? palette.primary : '#64748b' }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView
        ref={mainScrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 40) }}
      >
        <Animated.View className="px-4 pt-6" entering={sectionEntering(1)}>
          {loading ? (
            <View className="items-center py-20">
              <ActivityIndicator size="large" color={palette.primary} />
              <Text className="text-slate-500 mt-4 font-medium">Cargando reportes...</Text>
            </View>
          ) : error ? (
            <View className="items-center py-20 px-4">
              <Text className="text-rose-500 text-center font-medium">{error}</Text>
            </View>
          ) : isOtherTab ? (
            <View className="items-center py-20">
              <Text className="text-slate-400 text-lg font-medium">{activeTab}</Text>
              <Text className="text-slate-400 text-sm mt-2">Próximamente</Text>
            </View>
          ) : (
            <>
              {/* Metrics Grid */}
              <View className="flex-row flex-wrap justify-between">
                {metricas.map((metrica: ReporteMetrica) => {
                  const config = METRIC_ICONS[metrica.id] ?? METRIC_ICONS.ventas;
                  const Icon = config.icon;
                  const growth = formatGrowth(metrica.crecimiento);
                  return (
                    <View key={metrica.id} className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm shadow-slate-100">
                      <Text className="text-sm text-slate-500 mb-2">{METRIC_LABELS[metrica.id] ?? metrica.id}</Text>
                      <Text className="text-xl font-bold text-slate-800 mb-4">{formatMetricValue(metrica.id, metrica.valor)}</Text>

                      <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center" style={{ backgroundColor: config.bg }}>
                        <Icon color={config.color} size={20} />
                      </View>

                      {growth && (
                        <View className="flex-row items-center">
                          {growth.positive ? (
                            <ArrowUp color="#10b981" size={14} />
                          ) : (
                            <ArrowDown color="#ef4444" size={14} />
                          )}
                          <Text
                            className={`text-xs font-semibold ml-1 mr-1 ${growth.positive ? 'text-emerald-500' : 'text-rose-500'}`}
                          >
                            {growth.text}
                          </Text>
                          <Text className="text-[10px] text-slate-400">vs periodo ant.</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Charts Row */}
              <View className="flex-row justify-between mb-6">
                {/* Line Chart */}
                <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xs font-semibold text-slate-800">Ingresos por día</Text>
                    <View className="flex-row items-center bg-slate-50 px-2 py-1 rounded-lg">
                      <Text className="text-[10px] text-slate-500 mr-1">Ingresos</Text>
                      <ChevronDown color="#94a3b8" size={12} />
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
                      {(resumenData?.ingresos_por_dia?.length ?? 0) > 0 && (
                        <>
                          <Path d={buildLinePath(resumenData!.ingresos_por_dia, maxIngreso)} fill="url(#gradLine)" />
                          <Path d={buildLineStroke(resumenData!.ingresos_por_dia, maxIngreso)} fill="none" stroke={palette.primary} strokeWidth="2" strokeLinejoin="round" />
                        </>
                      )}
                    </Svg>

                    <View className="absolute left-0 top-0 bottom-6 justify-between">
                      {yLabels.map((label, i) => (
                        <Text key={i} className="text-[9px] text-slate-400">{label}</Text>
                      ))}
                    </View>

                    <View className="absolute left-4 right-0 bottom-0 flex-row justify-between pt-1">
                      <Text className="text-[9px] text-slate-400">{xLabels.first}</Text>
                      <Text className="text-[9px] text-slate-400">{xLabels.mid}</Text>
                      <Text className="text-[9px] text-slate-400">{xLabels.last}</Text>
                    </View>
                  </View>
                </View>

                {/* Donut Chart */}
                <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
                  <Text className="text-xs font-semibold text-slate-800 mb-4">Ventas por categoría</Text>
                  <View className="flex-row items-center">
                    <View className="w-20 h-20 mr-2 relative justify-center items-center">
                      {donutSegments.length > 0 ? (
                        <Svg width="100%" height="100%" viewBox="0 0 100 100">
                          {donutSegments.map((seg, i) => (
                            <Circle
                              key={i}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={seg.color}
                              strokeWidth="16"
                              strokeDasharray={`${seg.dashLength.toFixed(1)} 251`}
                              strokeDashoffset={seg.offset.toFixed(1)}
                              strokeLinecap="butt"
                            />
                          ))}
                        </Svg>
                      ) : (
                        <Svg width="100%" height="100%" viewBox="0 0 100 100">
                          <Circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="16" />
                        </Svg>
                      )}
                      <View className="absolute items-center justify-center bg-white rounded-full h-[48px] w-[48px]">
                        <Text className="text-[9px] text-slate-500">Total</Text>
                        <Text className="text-sm font-bold text-slate-800 leading-tight">{metricLabel}</Text>
                      </View>
                    </View>

                    <View className="flex-1">
                      {donutSegments.map((seg, i) => (
                        <View key={i} className="flex-row items-center justify-between mb-1">
                          <View className="flex-row items-center">
                            <View className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: seg.color }} />
                            <Text className="text-[9px] text-slate-600" numberOfLines={1}>{seg.categoria}</Text>
                          </View>
                          <Text className="text-[9px] text-slate-800">{seg.porcentaje}%</Text>
                        </View>
                      ))}
                      {donutSegments.length === 0 && (
                        <Text className="text-[9px] text-slate-400 text-center mt-2">Sin datos</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {/* Top Products */}
              <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm shadow-slate-100">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="font-semibold text-slate-800">Productos más vendidos</Text>
                  <TouchableOpacity>
                    <Text className="text-sm font-semibold" style={{ color: palette.primary }}>Ver todo</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row border-b border-slate-100 pb-2 mb-3">
                  <Text className="text-[10px] text-slate-400 w-6">#</Text>
                  <Text className="text-[10px] text-slate-400 flex-1">Producto</Text>
                  <Text className="text-[10px] text-slate-400 w-12 text-center">Ventas</Text>
                  <Text className="text-[10px] text-slate-400 w-16 text-right mr-3">Ingresos</Text>
                  <Text className="text-[10px] text-slate-400 w-16">% del total</Text>
                </View>

                {(resumenData?.top_productos?.length ?? 0) > 0 ? (
                  resumenData!.top_productos.map((prod: TopProducto) => (
                    <View key={prod.ranking} className="flex-row items-center py-2">
                      <Text className="text-xs font-medium text-slate-700 w-6">{prod.ranking}</Text>
                      <View className="flex-1 flex-row items-center">
                        <View className="h-8 w-8 rounded-lg mr-2 items-center justify-center" style={{ backgroundColor: CATEGORY_COLORS[(prod.ranking - 1) % CATEGORY_COLORS.length] + '30' }}>
                          <ShoppingBag size={14} color={CATEGORY_COLORS[(prod.ranking - 1) % CATEGORY_COLORS.length]} />
                        </View>
                        <Text className="text-[11px] font-medium text-slate-800 pr-2" numberOfLines={2}>{prod.producto}</Text>
                      </View>
                      <Text className="text-[11px] font-medium text-slate-600 w-12 text-center">{prod.cantidad}</Text>
                      <Text className="text-[11px] font-medium text-slate-800 w-16 text-right mr-3">{formatCurrencyValue(prod.ingresos)}</Text>
                      <View className="w-16 flex-row items-center justify-between">
                        <Text className="text-[10px] text-slate-600 w-7">{prod.porcentaje}%</Text>
                        <View className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-1">
                          <View className="h-full rounded-full" style={{ width: `${Math.min(prod.porcentaje, 100)}%`, backgroundColor: palette.primary }} />
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="items-center py-8">
                    <Text className="text-sm text-slate-400">Sin datos de productos</Text>
                  </View>
                )}
              </View>

              {/* PRO Banner */}
              <View className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-row items-center">
                <View className="h-12 w-12 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: palette.primary }}>
                  <Star color="white" size={24} />
                </View>
                <View className="flex-1">
                  <Text className="font-bold mb-1" style={{ color: palette.primaryDark }}>Estás usando el plan PRO</Text>
                  <Text className="text-slate-600 text-xs">Aprovecha al máximo tus reportes</Text>
                </View>
                <ChevronRight color={palette.primary} size={20} />
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}
