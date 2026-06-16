import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { fetchOperacionById, getReadableVentasError, type OperacionDetalle } from '@/lib/ventas';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { formatCurrencyAmount, formatCurrencyValue } from '@/lib/runtime-config';

export default function OperacionDetalleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();
  const [operation, setOperation] = useState<OperacionDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOperation = async () => {
      if (!id || !accessToken) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        setOperation(await fetchOperacionById(accessToken, id));
      } catch (loadError) {
        setError(getReadableVentasError(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadOperation();
  }, [accessToken, id]);

  const subtotal = useMemo(() => {
    return (operation?.items ?? []).reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }, [operation]);

  const statusTone = useMemo(() => {
    if (!operation) {
      return { backgroundColor: '#f3f4f6', color: '#4b5563' };
    }

    switch (operation.status) {
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
  }, [operation, palette.primarySoft, palette.primaryText]);

  if (isLoading || !operation) {
    return (
      <Animated.View className="flex-1 bg-white items-center justify-center" entering={screenEntering}>
        {error ? (
          <Text className="px-6 text-center text-rose-600">{error}</Text>
        ) : (
          <>
            <ActivityIndicator color={palette.primary} />
            <Text className="mt-3 text-slate-500">Cargando operación...</Text>
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
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">{operation.referenceCode}</Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
        entering={sectionEntering(1)}
      >
        <Animated.View className="items-end mb-6" entering={sectionEntering(2)}>
          <View className="px-4 py-1.5 rounded-full" style={{ backgroundColor: statusTone.backgroundColor }}>
            <Text className="font-medium text-sm" style={{ color: statusTone.color }}>
              {operation.status}
            </Text>
          </View>
        </Animated.View>

        <Animated.View className="mb-8" entering={sectionEntering(3)}>
          <Text className="text-lg font-semibold text-slate-800 mb-4">Información</Text>
          <View className="space-y-4">
            <View className="flex-row justify-between"><Text className="text-slate-500">Tipo</Text><Text className="text-slate-800 font-medium">{operation.type}</Text></View>
            <View className="flex-row justify-between mt-3"><Text className="text-slate-500">Cliente</Text><Text className="text-slate-800 font-medium">{operation.customer.fullName}</Text></View>
            <View className="flex-row justify-between mt-3"><Text className="text-slate-500">Cotización</Text><Text className="text-slate-800 font-medium">{operation.quotationReferenceCode}</Text></View>
            <View className="flex-row justify-between mt-3"><Text className="text-slate-500">Entrega</Text><Text className="text-slate-800 font-medium">{new Date(operation.deliveryDate).toLocaleDateString()}</Text></View>
            <View className="flex-row justify-between mt-3"><Text className="text-slate-500">Método</Text><Text className="text-slate-800 font-medium">{operation.deliveryMethod}</Text></View>
            <View className="flex-row justify-between mt-3"><Text className="text-slate-500">Dirección</Text><Text className="text-slate-800 font-medium">{operation.customer.address ?? 'Sin dirección'}</Text></View>
            <View className="flex-row justify-between mt-3"><Text className="text-slate-500">Observaciones</Text><Text className="text-slate-800 font-medium">{operation.description ?? 'Sin observaciones'}</Text></View>
            {operation.sourceLabel ? (
              <View className="mt-3 rounded-2xl px-4 py-3" style={{ backgroundColor: palette.primarySoft }}>
                <Text className="text-sm font-medium" style={{ color: palette.primaryText }}>
                  {operation.sourceLabel}
                </Text>
              </View>
            ) : null}
          </View>
        </Animated.View>

        <View className="h-[1px] bg-slate-100 mb-8" />

        <Animated.View className="mb-8" entering={sectionEntering(4)}>
          <Text className="text-lg font-semibold text-slate-800 mb-4">Items</Text>
          {operation.items.map((item, index) => (
            <View
              key={item.id}
              className={`rounded-3xl border border-slate-100 bg-slate-50 p-4 ${index === 0 ? '' : 'mt-4'}`}
            >
              <View className="flex-row items-start justify-between">
                <View className="mr-4 flex-1">
                  <Text className="font-semibold text-slate-800">{item.name}</Text>
                  <View
                    className={`mt-2 self-start rounded-full px-2.5 py-1 ${item.kind === 'Servicio' ? 'bg-emerald-50' : ''}`}
                    style={{ backgroundColor: item.kind === 'Servicio' ? undefined : palette.primarySoft }}
                  >
                    <Text
                      className={`text-[10px] font-semibold ${item.kind === 'Servicio' ? 'text-emerald-700' : ''}`}
                      style={{ color: item.kind === 'Servicio' ? undefined : palette.primaryText }}
                    >
                      {item.kind}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-medium text-slate-500">Subtotal</Text>
                  <Text className="mt-1 font-semibold text-slate-800">
                    {formatCurrencyAmount(
                      Number(item.unitPrice) * item.quantity - Number(item.discount),
                    )}
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-white px-4 py-3">
                <View>
                  <Text className="text-xs font-medium text-slate-500">Cantidad</Text>
                  <Text className="mt-1 text-sm font-semibold text-slate-800">{item.quantity} unidad(es)</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-medium text-slate-500">Precio unitario</Text>
                  <Text className="mt-1 text-sm font-semibold text-slate-800">{formatCurrencyAmount(Number(item.unitPrice))}</Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>

        <View className="h-[1px] bg-slate-100 mb-8" />

        <Animated.View className="mb-12" entering={sectionEntering(5)}>
          <Text className="text-lg font-semibold text-slate-800 mb-4">Resumen</Text>
          <View className="flex-row justify-between">
            <Text className="text-slate-500">Subtotal</Text>
            <Text className="text-slate-800 font-medium">{formatCurrencyAmount(subtotal)}</Text>
          </View>
          <View className="flex-row justify-between mt-3">
            <Text className="text-slate-500">Total</Text>
            <Text className="text-slate-800 font-semibold">{formatCurrencyValue(operation.total)}</Text>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </Animated.View>
  );
}
