import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import {
  ArrowUpRight,
  Bell,
  Calendar,
  FileText,
  Menu,
  PlusSquare,
  Search,
  UserPlus,
} from 'lucide-react-native';
import Animated, {
  AnimatedTouchableOpacity,
  itemEntering,
  screenEntering,
  sectionEntering,
} from '@/components/ui/motion';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { fetchCalendarioEventos, getReadableCalendarioError, type CalendarioEvento } from '@/lib/calendario';
import { useModulePreferences } from '@/lib/module-preferences-context';
import { fetchBusinessKpis, getReadableReportesError, type BusinessKpis } from '@/lib/reportes';
import { formatCurrencyValue } from '@/lib/runtime-config';

type QuickAction = {
  key: string;
  label: string;
  icon: typeof PlusSquare;
  onPress: () => void;
};

export default function DashboardScreen() {
  const { colorPaletteId, palette } = useAccountPreferences();
  const { accessToken, authState } = useAuthSession();
  const { isModuleEnabled } = useModulePreferences();
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [kpis, setKpis] = useState<BusinessKpis | null>(null);
  const [isKpisLoading, setIsKpisLoading] = useState(false);
  const [kpisError, setKpisError] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarioEvento[]>([]);
  const [deliveriesError, setDeliveriesError] = useState<string | null>(null);

  const firstName = authState?.user.firstNames.split(' ')[0] ?? 'Hola';
  const isOperationsEnabled = isModuleEnabled('operaciones');
  const isClientsEnabled = isModuleEnabled('clientes');
  const isQuotesEnabled = isModuleEnabled('cotizaciones');

  const quickActions: QuickAction[] = [
    {
      key: 'new-quote',
      label: `Nueva\ncotización`,
      icon: PlusSquare,
      onPress: () => router.push('/(drawer)/(tabs)/operaciones/nueva'),
    },
    {
      key: 'view-quotes',
      label: `Ver\ncotizaciones`,
      icon: FileText,
      onPress: () => router.push('/(drawer)/(tabs)/cotizaciones'),
    },
    {
      key: 'new-client',
      label: `Nuevo\ncliente`,
      icon: UserPlus,
      onPress: () => router.push('/(drawer)/(tabs)/clientes/form'),
    },
    {
      key: 'new-operation',
      label: `Nueva\noperación`,
      icon: Calendar,
      onPress: () => router.push('/(drawer)/(tabs)/operaciones/nueva'),
    },
  ].filter((action) => {
    if (action.key === 'new-client') {
      return isClientsEnabled;
    }

    if (action.key === 'new-operation') {
      return isOperationsEnabled;
    }

    return isQuotesEnabled;
  });

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const getDeliveryStatusStyle = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return { backgroundColor: '#dbeafe', color: '#1d4ed8' };
      case 'Reserva':
        return { backgroundColor: '#fffbeb', color: '#b45309' };
      case 'En camino':
        return { backgroundColor: '#ffedd5', color: '#c2410c' };
      case 'Entregado':
        return { backgroundColor: '#ecfdf5', color: '#047857' };
      case 'Activo':
        return { backgroundColor: palette.primarySoft, color: palette.primaryText };
      default:
        return { backgroundColor: '#f3f4f6', color: '#4b5563' };
    }
  };

  const loadKpis = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsKpisLoading(true);
    setKpisError(null);

    try {
      setKpis(await fetchBusinessKpis(accessToken, 'America/Lima'));
    } catch (error) {
      setKpisError(getReadableReportesError(error));
    } finally {
      setIsKpisLoading(false);
    }
  }, [accessToken]);

  const loadDeliveries = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setDeliveriesError(null);

    try {
      setCalendarEvents(await fetchCalendarioEventos(accessToken));
    } catch (error) {
      setDeliveriesError(getReadableCalendarioError(error));
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadKpis();
      void loadDeliveries();
    }, [loadDeliveries, loadKpis]),
  );

  const salesTodayLabel = useMemo(
    () => (kpis ? formatCurrencyValue(kpis.dailySales.today) : 'S/ 0.00'),
    [kpis],
  );
  const salesChangeLabel = useMemo(() => {
    if (!kpis) {
      return '0% vs ayer';
    }

    const change = Number(kpis.dailySales.percentageChange);
    const sign = change > 0 ? '+' : '';

    return `${sign}${change.toFixed(2)}% vs ayer`;
  }, [kpis]);
  const ordersTotalLabel = useMemo(
    () => (kpis ? String(kpis.orders.totalToday) : '0'),
    [kpis],
  );
  const pendingOrdersLabel = useMemo(
    () =>
      kpis ? `${kpis.orders.statuses.pending} pendientes` : '0 pendientes',
    [kpis],
  );
  const pendingCollectionsLabel = useMemo(
    () => (kpis ? formatCurrencyValue(kpis.pendingCollections.total) : 'S/ 0.00'),
    [kpis],
  );
  const newCustomersTodayLabel = useMemo(
    () => (kpis ? String(kpis.newCustomers.today) : '0'),
    [kpis],
  );
  const newCustomersDiffLabel = useMemo(() => {
    if (!kpis) {
      return '0 vs ayer';
    }

    const difference = kpis.newCustomers.differenceVsYesterday;
    const sign = difference > 0 ? '+' : '';

    return `${sign}${difference} vs ayer`;
  }, [kpis]);
  const upcomingDeliveries = useMemo(() => {
    const todayStart = new Date();

    todayStart.setHours(0, 0, 0, 0);

    return calendarEvents
      .filter(
        (event) =>
          event.type === 'Pedido' &&
          event.status !== 'Entregado' &&
          new Date(event.date).getTime() >= todayStart.getTime(),
      )
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(0, 3);
  }, [calendarEvents]);

  return (
    <Animated.View className="flex-1 bg-slate-50" entering={screenEntering}>
      <StatusBar key={`home-status-${colorPaletteId}`} style="light" backgroundColor={palette.primary} />

      <View
        key={`home-header-${colorPaletteId}`}
        className="flex-row items-center justify-between px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={openDrawer} className="mr-4">
            <Menu size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row items-baseline">
            <Image
              source={require('../../../assets/images/logo full blanco.png')}
              style={{ width: 150, height: 40 }}
              contentFit="contain"
              contentPosition="center"
            />
          </View>
        </View>
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity className="mr-3">
            <Search size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className="relative"
            onPress={() => router.push('/(drawer)/(tabs)/plan-pro')}
          >
            <Bell size={22} color="#f59e0b" />
            <View
              className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 bg-amber-200"
              style={{ borderColor: palette.primary }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
        <Animated.View className="px-6 pt-6 pb-4" entering={sectionEntering(1)}>
          <Text className="text-2xl font-semibold text-slate-800 mb-1">
            {`¡Hola, ${firstName}! 👋`}
          </Text>
          <Text className="text-slate-500 text-base">Resumen de hoy</Text>
        </Animated.View>

        <Animated.View
          className="px-6 flex-row flex-wrap justify-between"
          entering={sectionEntering(2)}
        >
          <AnimatedTouchableOpacity
            className="w-[48%] bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm shadow-slate-100"
            entering={itemEntering(0)}
            activeOpacity={0.7}
            onPress={() => router.push('/(drawer)/(tabs)/contabilidad')}
          >
            <Text className="text-slate-500 font-medium text-xs mb-2">Ventas del día</Text>
            <Text className="text-2xl font-bold text-slate-800 mb-2">{salesTodayLabel}</Text>
            <View className="flex-row items-center">
              <ArrowUpRight size={14} color="#10b981" />
              <Text className="text-emerald-500 font-semibold text-xs ml-1">
                {salesChangeLabel}
              </Text>
            </View>
          </AnimatedTouchableOpacity>

          <AnimatedTouchableOpacity
            className="w-[48%] bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm shadow-slate-100"
            entering={itemEntering(1)}
            activeOpacity={0.7}
            onPress={() => router.push('/(drawer)/(tabs)/operaciones')}
          >
            <Text className="text-slate-500 font-medium text-xs mb-2">Pedidos</Text>
            <Text className="text-2xl font-bold text-slate-800 mb-2">{ordersTotalLabel}</Text>
            <Text className="font-semibold text-xs" style={{ color: palette.primaryText }}>
              {pendingOrdersLabel}
            </Text>
          </AnimatedTouchableOpacity>

          <AnimatedTouchableOpacity
            className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100"
            entering={itemEntering(2)}
            activeOpacity={0.7}
            onPress={() => router.push('/(drawer)/(tabs)/contabilidad')}
          >
            <Text className="text-slate-500 font-medium text-xs mb-2">
              Cobros pendientes
            </Text>
            <Text className="text-2xl font-bold text-slate-800 mb-2">{pendingCollectionsLabel}</Text>
          </AnimatedTouchableOpacity>

          <AnimatedTouchableOpacity
            className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100"
            entering={itemEntering(3)}
            activeOpacity={0.7}
            onPress={() => router.push('/(drawer)/(tabs)/clientes')}
          >
            <Text className="text-slate-500 font-medium text-xs mb-2">Clientes nuevos</Text>
            <Text className="text-2xl font-bold text-slate-800 mb-2">{newCustomersTodayLabel}</Text>
            <View className="flex-row items-center">
              <ArrowUpRight size={14} color="#10b981" />
              <Text className="text-emerald-500 font-semibold text-xs ml-1">{newCustomersDiffLabel}</Text>
            </View>
          </AnimatedTouchableOpacity>
        </Animated.View>

        {isKpisLoading ? (
          <View className="px-6 mt-2 flex-row items-center">
            <ActivityIndicator size="small" color={palette.primary} />
            <Text className="ml-3 text-sm text-slate-500">Actualizando resumen...</Text>
          </View>
        ) : null}

        {kpisError ? (
          <View className="px-6 mt-2">
            <Text className="text-sm text-rose-600">{kpisError}</Text>
          </View>
        ) : null}

        {isOperationsEnabled ? (
          <Animated.View className="px-6 mt-8 mb-4" entering={sectionEntering(3)}>
            <View className="flex-row justify-between items-end mb-4">
              <Text className="text-lg font-semibold text-slate-800">Próximas entregas</Text>
              <TouchableOpacity
                onPress={() => router.navigate('/(drawer)/(tabs)/operaciones')}
              >
                <Text className="font-medium text-sm" style={{ color: palette.primaryText }}>
                  Ver todas
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 overflow-hidden p-4">
              {upcomingDeliveries.length > 0 ? (
                upcomingDeliveries.map((event, index) => (
                  <TouchableOpacity
                    key={event.id}
                    className={`${index === 0 ? '' : 'mt-4 border-t border-slate-100 pt-4'}`}
                    onPress={() =>
                      router.push({
                        pathname: '/(drawer)/(tabs)/operaciones/[id]',
                        params: { id: event.id },
                      })
                    }
                    activeOpacity={0.8}
                  >
                    {(() => {
                      const statusStyle = getDeliveryStatusStyle(event.status);

                      return (
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-slate-800">{event.referenceCode}</Text>
                        <Text className="mt-1 text-sm text-slate-500">{event.title}</Text>
                        <Text className="mt-2 text-xs text-slate-400">
                          {new Date(event.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <View
                        className="rounded-full px-3 py-1"
                        style={{ backgroundColor: statusStyle.backgroundColor }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: statusStyle.color }}
                        >
                          {event.status}
                        </Text>
                      </View>
                    </View>
                      );
                    })()}
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-sm text-slate-500">Aún no hay entregas para mostrar.</Text>
              )}

              {deliveriesError ? (
                <Text className="mt-4 text-sm text-rose-600">{deliveriesError}</Text>
              ) : null}
            </View>
          </Animated.View>
        ) : null}

        {quickActions.length > 0 ? (
          <Animated.View className="mt-4 mb-10" entering={sectionEntering(4)}>
            <Text className="px-6 text-lg font-semibold text-slate-800 mb-4">
              Acciones rápidas
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
            >
              {quickActions.map((action, index) => {
                const Icon = action.icon;

                return (
                  <AnimatedTouchableOpacity
                    key={action.key}
                    className="bg-white p-4 rounded-2xl items-center justify-center border border-slate-100 shadow-sm shadow-slate-100 w-[100px] h-[100px]"
                    entering={itemEntering(index)}
                    onPress={action.onPress}
                  >
                    <View className="p-2 rounded-lg mb-2" style={{ backgroundColor: palette.primarySoft }}>
                      <Icon size={24} color={palette.primary} />
                    </View>
                    <Text className="text-slate-600 font-medium text-xs text-center leading-tight">
                      {action.label}
                    </Text>
                  </AnimatedTouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        ) : null}
      </ScrollView>
    </Animated.View>
  );
}
