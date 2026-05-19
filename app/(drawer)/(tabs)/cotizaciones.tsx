import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, FileText, Menu, Plus } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import Animated, { screenEntering, sectionEntering, itemEntering } from '@/components/ui/motion';
import {
  convertCotizacionToPedido,
  fetchCotizaciones,
  getReadableVentasError,
  type Cotizacion,
} from '@/lib/ventas';
import { useAuthSession } from '@/lib/auth-session-context';

const badgeStyles = {
  Pendiente: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Aprobada: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Borrador: { bg: 'bg-violet-50', text: 'text-violet-700' },
} as const;

export default function CotizacionesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const { accessToken } = useAuthSession();
  const [quotes, setQuotes] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const loadQuotations = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setQuotes(await fetchCotizaciones(accessToken));
    } catch (loadError) {
      setError(getReadableVentasError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadQuotations();
    }, [loadQuotations]),
  );

  const stats = useMemo(() => {
    return {
      drafts: quotes.filter((quote) => quote.status === 'Borrador').length,
      approved: quotes.filter((quote) => quote.status === 'Aprobada').length,
    };
  }, [quotes]);

  const handleConvert = async (quotationId: string) => {
    if (!accessToken) {
      return;
    }

    try {
      await convertCotizacionToPedido(accessToken, quotationId);
      await loadQuotations();
      router.push('/(drawer)/(tabs)/operaciones');
    } catch (convertError) {
      setError(getReadableVentasError(convertError));
    }
  };

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-4">
            <TouchableOpacity onPress={openDrawer} className="mr-4">
              <Menu color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Cotizaciones</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center rounded-2xl bg-white/15 px-4 py-3"
            onPress={() => router.push('/(drawer)/(tabs)/operaciones/nueva')}
          >
            <Plus size={16} color="white" />
            <Text className="ml-2 font-semibold text-white">Nueva</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
      >
        <Animated.View
          className="mb-6 flex-row flex-wrap justify-between"
          entering={sectionEntering(1)}
        >
          <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
            <Text className="text-xs font-medium text-slate-500">Pendientes</Text>
            <Text className="mt-2 text-2xl font-extrabold text-slate-800">{stats.drafts}</Text>
          </View>
          <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
            <Text className="text-xs font-medium text-slate-500">Aprobadas</Text>
            <Text className="mt-2 text-2xl font-extrabold text-slate-800">{stats.approved}</Text>
          </View>
        </Animated.View>

        {error ? <Text className="mb-4 text-sm font-medium text-rose-600">{error}</Text> : null}

        {isLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color="#7c3aed" />
            <Text className="mt-3 text-slate-500">Cargando cotizaciones...</Text>
          </View>
        ) : null}

        {quotes.map((quote, index) => {
          const styles = badgeStyles[quote.status as keyof typeof badgeStyles] ?? {
            bg: 'bg-slate-50',
            text: 'text-slate-700',
          };
          const canConvert = quote.status === 'Aprobada' || quote.status === 'Pendiente';

          return (
            <Animated.View
              key={quote.id}
              className="mb-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
              entering={itemEntering(index + 1)}
            >
              <View className="flex-row items-start justify-between">
                <View className="mr-4 flex-1">
                  <Text className="text-lg font-bold text-slate-800">{quote.referenceCode}</Text>
                  <Text className="mt-1 text-sm text-slate-500">{quote.customerName}</Text>
                </View>
                <View className={`rounded-full px-3 py-1.5 ${styles.bg}`}>
                  <Text className={`text-xs font-semibold ${styles.text}`}>{quote.status}</Text>
                </View>
              </View>

              <View className="mt-4 rounded-2xl bg-slate-50 p-4">
                <Text className="text-sm leading-6 text-slate-600">
                  {quote.description ?? 'Sin observaciones adicionales.'}
                </Text>
              </View>

              <View className="mt-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-xs font-medium text-slate-500">{quote.itemsCount} items</Text>
                  <Text className="mt-1 text-xl font-extrabold text-slate-800">S/ {quote.total}</Text>
                </View>
                {canConvert ? (
                  <TouchableOpacity
                    className="flex-row items-center rounded-2xl bg-violet-600 px-4 py-3"
                    onPress={() => {
                      void handleConvert(quote.id);
                    }}
                  >
                    <Check size={16} color="white" />
                    <Text className="ml-2 font-semibold text-white">Convertir</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    onPress={() => router.push('/(drawer)/(tabs)/operaciones')}
                  >
                    <FileText size={16} color="#475569" />
                    <Text className="ml-2 font-semibold text-slate-700">Abrir</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}
