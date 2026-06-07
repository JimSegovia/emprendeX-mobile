import Animated, {
  AnimatedTouchableOpacity,
  itemEntering,
  screenEntering,
  sectionEntering,
  smoothLayout,
} from '@/components/ui/motion';
import {
  fetchProductosServiciosItems,
  formatMoney,
  getReadableProductosServiciosError,
  type ProductosServiciosItem,
} from '@/lib/productos-servicios';
import { useAuthSession } from '@/lib/auth-session-context';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import {
  Briefcase,
  Menu,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScreen } from '@/components/ui/keyboard-aware-screen';

export default function ProductosScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const { accessToken } = useAuthSession();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'Producto' | 'Servicio'>('all');
  const [items, setItems] = useState<ProductosServiciosItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProductosServicios = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const productosServicios = await fetchProductosServiciosItems(accessToken);
      setItems(productosServicios);
    } catch (productosServiciosError) {
      setError(getReadableProductosServiciosError(productosServiciosError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadProductosServicios();
    }, [loadProductosServicios]),
  );

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      if (filter !== 'all' && item.kind !== filter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${item.name} ${item.description} ${item.referenceCode} ${item.sku ?? ''}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [filter, items, query]);

  const stats = useMemo(() => {
    const productsCount = items.filter((item) => item.kind === 'Producto').length;
    const servicesCount = items.filter((item) => item.kind === 'Servicio').length;

    return {
      total: items.length,
      products: productsCount,
      services: servicesCount,
    };
  }, [items]);

  const renderItem = ({ item, index }: { item: ProductosServiciosItem; index: number }) => {
    const isService = item.kind === 'Servicio';

    return (
      <AnimatedTouchableOpacity
        className="mb-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
        entering={itemEntering(index + 1)}
        layout={smoothLayout}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: '/(drawer)/(tabs)/productos/[id]',
            params: { id: item.id },
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${item.kind.toLowerCase()} ${item.name}`}
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
            <Text className="text-lg font-bold text-slate-800">{item.name}</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-500">
              {item.description || 'Sin descripción'}
            </Text>
            <Text className="mt-3 text-xs font-medium text-slate-400">
              {isService
                ? `Categoría: ${item.category ?? 'Sin categoría'}`
                : `Unidad: ${item.unit ?? 'Sin unidad'}`}
            </Text>
          </View>
          <View
            className={`h-12 w-12 items-center justify-center rounded-2xl ${isService ? 'bg-emerald-50' : 'bg-violet-50'}`}
          >
            {isService ? (
              <Briefcase size={22} color="#059669" />
            ) : (
              <Package size={22} color="#7c3aed" />
            )}
          </View>
        </View>
          <View className="mt-5 flex-row items-center justify-between">
            <Text className="text-sm text-slate-500">Código {item.referenceCode}</Text>
            <Text className="text-xl font-extrabold text-slate-800">
              {formatMoney(item.currencySymbol, item.price)}
            </Text>
          </View>
          {item.kind === 'Servicio' && item.category ? (
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Categoría</Text>
              <Text className="text-sm font-bold text-emerald-800">{item.category}</Text>
            </View>
          ) : null}
          {/* Stock/Inventario solo productos */}
          {item.kind === 'Producto' && (
            <View className="mt-2 flex-row items-center justify-between">
              <Text className={`text-sm font-bold ${item.stock && item.stock > 0 ? 'text-violet-800' : 'text-slate-400'}`}>{typeof item.stock === 'number' ? (item.stock > 0 ? `Stock: ${item.stock}` : 'Sin stock') : 'Sin stock'}</Text>
            </View>
          )}
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <KeyboardAwareScreen>
      <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-col space-y-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={openDrawer} className="mr-4">
              <Menu color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Productos y servicios</Text>
          </View>
        </View>
      </Animated.View>

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          }}
          ListHeaderComponent={
            <View>
              <Animated.View className="mb-4" entering={sectionEntering(1)}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 8 }}
                >
                  <View className="flex-row">
                    <TouchableOpacity
                      className="mr-3 flex-row items-center rounded-2xl bg-violet-100 px-3.5 py-3"
                      onPress={() => {
                        setFilter((previousFilter) =>
                          previousFilter === 'all'
                            ? 'Producto'
                            : previousFilter === 'Producto'
                              ? 'Servicio'
                              : 'all',
                        );
                      }}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel="Cambiar filtro"
                    >
                      <SlidersHorizontal size={16} color="#7c3aed" />
                      <Text className="ml-2 font-semibold text-violet-800">
                        {filter === 'all' ? 'Todo' : filter}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center rounded-2xl bg-violet-600 px-4 py-3"
                      activeOpacity={0.85}
                      onPress={() => {
                        router.push('/(drawer)/(tabs)/productos/nuevo');
                      }}
                    >
                      <Plus size={16} color="white" />
                      <Text className="ml-2 font-semibold text-white">Nuevo</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </Animated.View>

              <Animated.View className="mb-4" entering={sectionEntering(2)}>
                <View className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                  <View className="flex-row items-center rounded-2xl bg-slate-50 px-4 py-3">
                    <Search size={18} color="#64748b" />
                    <TextInput
                      className="ml-3 flex-1 text-[15px] font-semibold text-slate-800"
                      placeholder="Buscar por nombre, código o SKU"
                      placeholderTextColor="#94a3b8"
                      value={query}
                      onChangeText={setQuery}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="search"
                    />
                  </View>
                  <Text className="mt-3 text-xs text-slate-500">
                    {filteredItems.length} resultado(s) en{' '}
                    {filter === 'all'
                      ? 'todos los productos y servicios'
                      : filter.toLowerCase()}.
                  </Text>
                </View>
              </Animated.View>

              <Animated.View
                className="mb-6 flex-row flex-wrap justify-between"
                entering={sectionEntering(3)}
              >
                <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                  <Text className="text-xs font-medium text-slate-500">Items registrados</Text>
                  <Text className="mt-2 text-2xl font-extrabold text-slate-800">
                    {stats.total}
                  </Text>
                </View>
                <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                  <Text className="text-xs font-medium text-slate-500">Productos</Text>
                  <Text className="mt-2 text-2xl font-extrabold text-slate-800">
                    {stats.products}
                  </Text>
                </View>
                <View className="w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                  <Text className="text-xs font-medium text-slate-500">Servicios</Text>
                  <Text className="mt-2 text-2xl font-extrabold text-slate-800">
                    {stats.services}
                  </Text>
                </View>
                <View className="w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                  <Text className="text-xs font-medium text-slate-500">Filtro actual</Text>
                  <Text className="mt-2 text-2xl font-extrabold text-slate-800">
                    {filter === 'all' ? 'Todo' : filter}
                  </Text>
                </View>
              </Animated.View>

              {isLoading ? (
                <View className="mb-6 items-center justify-center rounded-[28px] border border-slate-100 bg-slate-50 p-6">
                  <ActivityIndicator color="#7c3aed" />
                  <Text className="mt-3 text-sm font-medium text-slate-500">
                    Cargando productos y servicios...
                  </Text>
                </View>
              ) : null}

              {error ? (
                <View className="mb-6 rounded-[28px] border border-rose-100 bg-rose-50 p-5">
                  <Text className="text-sm font-semibold text-rose-600">{error}</Text>
                  <TouchableOpacity
                    className="mt-4 self-start rounded-2xl bg-violet-600 px-4 py-3"
                    onPress={() => {
                      void loadProductosServicios();
                    }}
                  >
                    <Text className="font-semibold text-white">Reintentar</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            !isLoading && !error ? (
              <View className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
                <Text className="text-base font-bold text-slate-800">Sin resultados</Text>
                <Text className="mt-2 text-sm leading-6 text-slate-500">
                  Prueba con otro nombre, código o cambia el filtro.
                </Text>
                <TouchableOpacity
                  className="mt-4 self-start rounded-2xl bg-violet-600 px-4 py-3"
                  onPress={() => {
                    setQuery('');
                    setFilter('all');
                  }}
                >
                  <Text className="font-semibold text-white">Limpiar filtros</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
    </Animated.View>
    </KeyboardAwareScreen>
  );
}
