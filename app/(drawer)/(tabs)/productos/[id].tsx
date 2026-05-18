import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Briefcase, Package } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import {
  deleteProductoServicio,
  fetchProductosServiciosItemById,
  formatMoney,
  getReadableProductosServiciosError,
  type ProductosServiciosItem,
} from '@/lib/productos-servicios';
import { useAuthSession } from '@/lib/auth-session-context';

export default function ProductoDetalleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { accessToken } = useAuthSession();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<ProductosServiciosItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      if (!accessToken || !id) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const nextItem = await fetchProductosServiciosItemById(accessToken, id);
        setItem(nextItem);
      } catch (productosServiciosError) {
        setError(getReadableProductosServiciosError(productosServiciosError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadItem();
  }, [accessToken, id]);

  if (isLoading) {
    return (
      <Animated.View
        className="flex-1 items-center justify-center bg-white"
        entering={screenEntering}
      >
        <ActivityIndicator color="#7c3aed" />
      </Animated.View>
    );
  }

  if (!item || error) {
    return (
      <Animated.View className="flex-1 bg-white" entering={screenEntering}>
        <Animated.View
          className="bg-violet-600 px-4 pb-4"
          style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
          entering={sectionEntering(0)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-4">
              <TouchableOpacity
                onPress={() => router.navigate('/(drawer)/(tabs)/productos')}
                className="mr-4"
              >
                <ArrowLeft color="white" size={24} />
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold">Detalle</Text>
            </View>
          </View>
        </Animated.View>

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base font-semibold text-rose-600 text-center">
            {error ?? 'No se encontró el item solicitado.'}
          </Text>
        </View>
      </Animated.View>
    );
  }

  const isService = item.kind === 'Servicio';
  const Icon = isService ? Briefcase : Package;

  const handleDelete = async () => {
    if (!accessToken || !item || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteProductoServicio(accessToken, item.id);
      router.replace('/(drawer)/(tabs)/productos');
    } catch (productosServiciosError) {
      setError(getReadableProductosServiciosError(productosServiciosError));
    } finally {
      setIsDeleting(false);
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
            <TouchableOpacity
              onPress={() => router.navigate('/(drawer)/(tabs)/productos')}
              className="mr-4"
            >
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Detalle</Text>
          </View>
          <View
            className={`h-12 w-12 items-center justify-center rounded-2xl ${isService ? 'bg-emerald-50/20' : 'bg-white/15'}`}
          >
            <Icon size={22} color="white" />
          </View>
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
          <View className="flex-row items-start justify-between">
            <View className="mr-4 flex-1">
              <View className="mb-3 flex-row items-center">
                <View
                  className={`mr-2 rounded-full px-3 py-1.5 ${isService ? 'bg-emerald-50' : 'bg-violet-50'}`}
                >
                  <Text
                    className={`text-xs font-semibold ${isService ? 'text-emerald-700' : 'text-violet-700'}`}
                  >
                    {item.kind}
                  </Text>
                </View>
              </View>
              <Text className="text-2xl font-extrabold text-slate-800">{item.name}</Text>
              <Text className="mt-2 text-sm leading-6 text-slate-500">
                {item.description || 'Sin descripción'}
              </Text>
            </View>
          </View>

          <View className="mt-6 rounded-2xl bg-slate-50 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Código</Text>
              <Text className="text-sm font-bold text-slate-800">{item.id}</Text>
            </View>
            {item.sku ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">SKU</Text>
                <Text className="text-sm font-bold text-slate-800">{item.sku}</Text>
              </View>
            ) : null}
            {item.kind === 'Producto' && item.unit ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">Unidad</Text>
                <Text className="text-sm font-bold text-slate-800">{item.unit}</Text>
              </View>
            ) : null}
            {typeof item.stock === 'number' ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">Stock</Text>
                <Text className="text-sm font-bold text-slate-800">{item.stock}</Text>
              </View>
            ) : null}
            {item.category ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">Categoría</Text>
                <Text className="text-sm font-bold text-slate-800">{item.category}</Text>
              </View>
            ) : null}
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Precio base</Text>
              <Text className="text-xl font-extrabold text-slate-800">
                {formatMoney(item.currencySymbol, item.price)}
              </Text>
            </View>
          </View>

          {error ? (
            <View className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4">
              <Text className="text-sm font-semibold text-rose-600">{error}</Text>
            </View>
          ) : null}

          <View className="mt-6 flex-row">
            <TouchableOpacity
              className="mr-3 rounded-2xl bg-violet-600 px-4 py-3"
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/(drawer)/(tabs)/productos/nuevo',
                  params: { id: item.id },
                })
              }
            >
              <Text className="font-semibold text-white">Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"
              activeOpacity={0.85}
              onPress={() => {
                void handleDelete();
              }}
              disabled={isDeleting}
            >
              <Text className="font-semibold text-rose-600">
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}
