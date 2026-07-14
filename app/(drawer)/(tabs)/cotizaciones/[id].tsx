import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Pencil } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { fetchOperacionById, getReadableVentasError, type OperacionDetalle } from '@/lib/ventas';
import { formatCurrencyAmount, formatCurrencyValue } from '@/lib/runtime-config';
import { ItemKindBadge } from '@/components/ItemKindBadge';
import { getBadgeBgColor, getBadgeLabel, getBadgeTextColor } from '@/lib/status-badge';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CotizacionDetalleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();
  const [quotation, setQuotation] = useState<OperacionDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuotation = async () => {
      if (!id || !accessToken) return;
      setIsLoading(true);
      setError(null);
      try {
        setQuotation(await fetchOperacionById(accessToken, id));
      } catch (loadError) {
        setError(getReadableVentasError(loadError));
      } finally {
        setIsLoading(false);
      }
    };
    void loadQuotation();
  }, [accessToken, id]);

  const subtotal = useMemo(() => {
    return (quotation?.items ?? []).reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  }, [quotation]);

  const statusBg = useMemo(() => {
    if (!quotation) return '#f3f4f6';
    return getBadgeBgColor(quotation.status);
  }, [quotation]);

  const statusText = useMemo(() => {
    if (!quotation) return '#4b5563';
    return getBadgeTextColor(quotation.status);
  }, [quotation]);

  if (isLoading || !quotation) {
    return (
      <Animated.View className="flex-1 bg-white items-center justify-center" entering={screenEntering}>
        {error ? (
          <Text className="px-6 text-center text-rose-600">{error}</Text>
        ) : (
          <>
            <ActivityIndicator color={palette.primary} />
            <Text className="mt-3 text-slate-500">Cargando cotización...</Text>
          </>
        )}
      </Animated.View>
    );
  }

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.replace('/(drawer)/(tabs)/operaciones')} className="mr-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">{quotation.referenceCode}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="rounded-full px-3 py-1" style={{ backgroundColor: statusBg }}>
            <Text className="text-xs font-semibold" style={{ color: statusText }}>
              {getBadgeLabel(quotation.status)}
            </Text>
          </View>
          {quotation.status !== 'Aprobada' && (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(drawer)/(tabs)/operaciones/editar-cotizacion', params: { id: quotation.id } })}
              className="p-1"
            >
              <Pencil color="white" size={20} />
            </TouchableOpacity>
          )}
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
          <Text className="text-lg font-semibold text-slate-800 mb-4">Información</Text>
          <View className="gap-4">
            <View>
              <Text className="text-xs font-medium text-slate-500">Cliente</Text>
              <Text className="mt-1 text-slate-800 font-medium">{quotation.customer.fullName}</Text>
            </View>
            <View>
              <Text className="text-xs font-medium text-slate-500">Entrega</Text>
              <Text className="mt-1 text-slate-800 font-medium">{formatDate(quotation.deliveryDate)}</Text>
            </View>
            <View>
              <Text className="text-xs font-medium text-slate-500">Método</Text>
              <Text className="mt-1 text-slate-800 font-medium">{quotation.deliveryMethod}</Text>
            </View>
            <View>
              <Text className="text-xs font-medium text-slate-500">Dirección</Text>
              <Text className="mt-1 text-slate-800 font-medium">
                {quotation.customer.address ?? 'Sin dirección'}
              </Text>
            </View>
            {quotation.description ? (
              <View>
                <Text className="text-xs font-medium text-slate-500">Observaciones</Text>
                <Text className="mt-1 text-slate-800 font-medium">{quotation.description}</Text>
              </View>
            ) : null}
            {quotation.sourceLabel ? (
              <View className="rounded-2xl px-4 py-3" style={{ backgroundColor: palette.primarySoft }}>
                <Text className="text-sm font-medium" style={{ color: palette.primaryText }}>
                  {quotation.sourceLabel}
                </Text>
              </View>
            ) : null}
          </View>
        </Animated.View>

        <View className="h-px bg-slate-100 my-6" />

        <Animated.View className="mb-6" entering={sectionEntering(2)}>
          <Text className="text-lg font-semibold text-slate-800 mb-4">Items</Text>
          {quotation.items.map((item, index) => (
            <View
              key={item.id}
              className={`rounded-3xl border border-slate-100 bg-slate-50 p-4 ${index === 0 ? '' : 'mt-4'}`}
            >
              <View className="flex-row items-start justify-between">
                <View className="mr-4 flex-1">
                  <Text className="font-semibold text-slate-800">{item.name}</Text>
                  <ItemKindBadge kind={item.kind} className="mt-2" />
                </View>
                <View className="items-end">
                  <Text className="text-xs font-medium text-slate-500">Subtotal</Text>
                  <Text className="mt-1 font-semibold text-slate-800">
                    {formatCurrencyAmount(Number(item.unitPrice) * item.quantity - Number(item.discount))}
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-white px-4 py-3">
                <View>
                  <Text className="text-xs font-medium text-slate-500">Cantidad</Text>
                  <Text className="mt-1 text-sm font-semibold text-slate-800">
                    {item.quantity} unidad(es)
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-medium text-slate-500">Precio unitario</Text>
                  <Text className="mt-1 text-sm font-semibold text-slate-800">
                    {formatCurrencyAmount(Number(item.unitPrice))}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>

        <View className="h-px bg-slate-100 mb-6" />

        <Animated.View entering={sectionEntering(3)}>
          <Text className="text-lg font-semibold text-slate-800 mb-4">Resumen</Text>
          <View className="flex-row justify-between">
            <Text className="text-slate-500">Subtotal</Text>
            <Text className="text-slate-800 font-medium">{formatCurrencyAmount(subtotal)}</Text>
          </View>
          <View className="flex-row justify-between mt-3">
            <Text className="text-slate-500">Total</Text>
            <Text className="text-slate-800 font-semibold">{formatCurrencyValue(quotation.total)}</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}
