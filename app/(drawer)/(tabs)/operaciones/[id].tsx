import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { fetchOperacionById, getReadableVentasError, type OperacionDetalle } from '@/lib/ventas';
import { useAuthSession } from '@/lib/auth-session-context';

export default function OperacionDetalleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  if (isLoading || !operation) {
    return (
      <Animated.View className="flex-1 bg-white items-center justify-center" entering={screenEntering}>
        {error ? (
          <Text className="px-6 text-center text-rose-600">{error}</Text>
        ) : (
          <>
            <ActivityIndicator color="#7c3aed" />
            <Text className="mt-3 text-slate-500">Cargando operación...</Text>
          </>
        )}
      </Animated.View>
    );
  }

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">{operation.referenceCode}</Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
        entering={sectionEntering(1)}
      >
        <Animated.View className="items-end mb-6" entering={sectionEntering(2)}>
          <View className="bg-orange-100 px-4 py-1.5 rounded-full">
            <Text className="text-orange-600 font-medium text-sm">{operation.status}</Text>
          </View>
        </Animated.View>

        <Animated.View className="mb-8" entering={sectionEntering(3)}>
          <Text className="text-lg font-bold text-slate-800 mb-4">Información</Text>
          <View className="space-y-4">
            <View className="flex-row justify-between"><Text className="text-slate-500">Tipo</Text><Text className="text-slate-800 font-medium">{operation.type}</Text></View>
            <View className="flex-row justify-between mt-3"><Text className="text-slate-500">Cliente</Text><Text className="text-slate-800 font-medium">{operation.customer.fullName}</Text></View>
            <View className="flex-row justify-between mt-3"><Text className="text-slate-500">Cotización</Text><Text className="text-slate-800 font-medium">{operation.quotationReferenceCode}</Text></View>
            <View className="flex-row justify-between mt-3"><Text className="text-slate-500">Entrega</Text><Text className="text-slate-800 font-medium">{new Date(operation.deliveryDate).toLocaleDateString()}</Text></View>
            <View className="flex-row justify-between mt-3"><Text className="text-slate-500">Método</Text><Text className="text-slate-800 font-medium">{operation.deliveryMethod}</Text></View>
            <View className="flex-row justify-between mt-3"><Text className="text-slate-500">Dirección</Text><Text className="text-slate-800 font-medium">{operation.customer.address ?? 'Sin dirección'}</Text></View>
            <View className="flex-row justify-between mt-3"><Text className="text-slate-500">Observaciones</Text><Text className="text-slate-800 font-medium">{operation.description ?? 'Sin observaciones'}</Text></View>
          </View>
        </Animated.View>

        <View className="h-[1px] bg-slate-100 mb-8" />

        <Animated.View className="mb-8" entering={sectionEntering(4)}>
          <Text className="text-lg font-bold text-slate-800 mb-4">Items</Text>
          {operation.items.map((item, index) => (
            <View key={item.id} className={`flex-row items-center justify-between ${index === 0 ? '' : 'mt-4'}`}>
              <View className="flex-1 pr-4">
                <View className="flex-row items-center">
                  <Text className="font-semibold text-slate-800 mb-1">{item.name}</Text>
                  <View className={`ml-2 rounded-full px-2 py-0.5 ${item.kind === 'Servicio' ? 'bg-emerald-50' : 'bg-violet-50'}`}>
                    <Text className={`text-[10px] font-semibold ${item.kind === 'Servicio' ? 'text-emerald-700' : 'text-violet-700'}`}>{item.kind}</Text>
                  </View>
                </View>
                <Text className="text-slate-500 text-sm">{item.quantity} unidad(es)</Text>
              </View>
              <Text className="font-bold text-slate-800">S/ {Number(item.price).toFixed(2)}</Text>
            </View>
          ))}
        </Animated.View>

        <View className="h-[1px] bg-slate-100 mb-8" />

        <Animated.View className="mb-12" entering={sectionEntering(5)}>
          <Text className="text-lg font-bold text-slate-800 mb-4">Resumen</Text>
          <View className="flex-row justify-between">
            <Text className="text-slate-500">Subtotal</Text>
            <Text className="text-slate-800 font-medium">S/ {subtotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mt-3">
            <Text className="text-slate-500">Total</Text>
            <Text className="text-slate-800 font-bold">S/ {operation.total}</Text>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </Animated.View>
  );
}
