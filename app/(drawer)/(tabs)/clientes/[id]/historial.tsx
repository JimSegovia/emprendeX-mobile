import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, X } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { PedidoCard } from '@/components/PedidoCard';
import {
  fetchHistorialComercial,
  getReadableClientesError,
  type HistorialComercial,
  type PedidoHistorial,
} from '@/lib/clientes';
import { useAuthSession } from '@/lib/auth-session-context';
import { useAccountPreferences } from '@/lib/account-preferences-context';

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export default function ClienteHistorialScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();

  const [historial, setHistorial] = useState<HistorialComercial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !accessToken) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchHistorialComercial(accessToken, id);
        setHistorial(data);
      } catch (loadError) {
        setError(getReadableClientesError(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [accessToken, id]);

  const handleFromChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowFromPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateFrom(startOfDay(selectedDate));
    }
  };

  const handleToChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowToPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateTo(endOfDay(selectedDate));
    }
  };

  const filteredPedidos = useMemo(() => {
    if (!historial) return [];

    let pedidos = [...historial.pedidos];

    if (dateFrom) {
      pedidos = pedidos.filter((p) => new Date(p.createdAt) >= dateFrom);
    }
    if (dateTo) {
      pedidos = pedidos.filter((p) => new Date(p.createdAt) <= dateTo);
    }

    pedidos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return pedidos;
  }, [historial, dateFrom, dateTo]);

  const hasActiveFilter = dateFrom !== null || dateTo !== null;

  const clearFilters = () => {
    setDateFrom(null);
    setDateTo(null);
  };

  if (isLoading) {
    return (
      <Animated.View
        className="flex-1 bg-white items-center justify-center"
        entering={screenEntering}
      >
        <ActivityIndicator color={palette.primary} />
        <Text className="mt-3 text-slate-500">Cargando historial...</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">Historial de pedidos</Text>
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
      >
        <Animated.View
          className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
          entering={sectionEntering(1)}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Calendar size={18} color={palette.primaryText} />
              <Text className="text-base font-semibold text-slate-800">Filtrar por fecha</Text>
            </View>
            {hasActiveFilter && (
              <TouchableOpacity onPress={clearFilters} className="flex-row items-center gap-1">
                <X size={14} color="#94a3b8" />
                <Text className="text-xs font-medium text-slate-400">Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-1.5 text-xs font-medium text-slate-500">Desde</Text>
              <TouchableOpacity
                className="flex-row items-center justify-between border border-slate-200 rounded-xl px-4 py-3 bg-white"
                onPress={() => setShowFromPicker(true)}
              >
                <Text className={dateFrom ? 'text-slate-800 text-sm font-medium' : 'text-slate-400 text-sm'}>
                  {dateFrom ? formatDateLabel(dateFrom) : 'Seleccionar'}
                </Text>
                <Calendar size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <View className="flex-1">
              <Text className="mb-1.5 text-xs font-medium text-slate-500">Hasta</Text>
              <TouchableOpacity
                className="flex-row items-center justify-between border border-slate-200 rounded-xl px-4 py-3 bg-white"
                onPress={() => setShowToPicker(true)}
              >
                <Text className={dateTo ? 'text-slate-800 text-sm font-medium' : 'text-slate-400 text-sm'}>
                  {dateTo ? formatDateLabel(dateTo) : 'Seleccionar'}
                </Text>
                <Calendar size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {showFromPicker && (
            <Modal transparent animationType="fade" visible={showFromPicker} onRequestClose={() => setShowFromPicker(false)}>
              <TouchableOpacity className="flex-1 justify-center items-center bg-black/40" activeOpacity={1} onPress={() => setShowFromPicker(false)}>
                <View className="bg-white rounded-2xl p-5 mx-8 shadow-lg items-center">
                  <Text className="text-base font-semibold text-slate-800 mb-3">Fecha desde</Text>
                  <DateTimePicker
                    value={dateFrom ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
                    themeVariant="light"
                    onChange={handleFromChange}
                    maximumDate={dateTo ?? new Date()}
                  />
                  <TouchableOpacity
                    className="mt-3 rounded-xl px-6 py-2.5 items-center"
                    style={{ backgroundColor: palette.primary }}
                    onPress={() => setShowFromPicker(false)}
                  >
                    <Text className="text-sm font-semibold text-white">Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
          )}
          {showToPicker && (
            <Modal transparent animationType="fade" visible={showToPicker} onRequestClose={() => setShowToPicker(false)}>
              <TouchableOpacity className="flex-1 justify-center items-center bg-black/40" activeOpacity={1} onPress={() => setShowToPicker(false)}>
                <View className="bg-white rounded-2xl p-5 mx-8 shadow-lg items-center">
                  <Text className="text-base font-semibold text-slate-800 mb-3">Fecha hasta</Text>
                  <DateTimePicker
                    value={dateTo ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
                    themeVariant="light"
                    onChange={handleToChange}
                    minimumDate={dateFrom ?? undefined}
                    maximumDate={new Date()}
                  />
                  <TouchableOpacity
                    className="mt-3 rounded-xl px-6 py-2.5 items-center"
                    style={{ backgroundColor: palette.primary }}
                    onPress={() => setShowToPicker(false)}
                  >
                    <Text className="text-sm font-semibold text-white">Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
          )}
        </Animated.View>

        {error && (
          <Text className="mt-4 px-4 text-center text-rose-600">{error}</Text>
        )}

        <Animated.View className="mt-6" entering={sectionEntering(2)}>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-slate-800">Pedidos</Text>
            <Text className="text-sm font-medium text-slate-400">
              {filteredPedidos.length} {filteredPedidos.length === 1 ? 'registro' : 'registros'}
              {hasActiveFilter ? ' (filtrados)' : ''}
            </Text>
          </View>

          {filteredPedidos.length === 0 ? (
            <View className="rounded-[24px] border border-slate-100 bg-slate-50 p-8 items-center">
              <Calendar size={32} color="#94a3b8" />
              <Text className="mt-3 text-base font-semibold text-slate-600">
                {hasActiveFilter ? 'Sin resultados' : 'Sin pedidos'}
              </Text>
              <Text className="mt-1 text-sm text-slate-400 text-center">
                {hasActiveFilter
                  ? 'No hay pedidos en el rango de fechas seleccionado.'
                  : 'Este cliente aún no tiene pedidos registrados.'}
              </Text>
              {hasActiveFilter && (
                <TouchableOpacity
                  className="mt-4 rounded-2xl px-4 py-2"
                  style={{ backgroundColor: palette.primary }}
                  onPress={clearFilters}
                >
                  <Text className="text-sm font-semibold text-white">Quitar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredPedidos.map((pedido: PedidoHistorial, index: number) => (
              <PedidoCard key={pedido.id} pedido={pedido} index={index} />
            ))
          )}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}
