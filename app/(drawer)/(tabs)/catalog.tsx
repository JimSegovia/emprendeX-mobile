import Animated, {
  AnimatedTouchableOpacity,
  itemEntering,
  screenEntering,
  sectionEntering,
  smoothLayout,
} from '@/components/ui/motion';
import {
  fetchCatalogItems,
  formatMoney,
  getReadableCatalogError,
  type CatalogItem,
} from '@/lib/catalog';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useNavigation, useRouter } from 'expo-router';
import {
  Briefcase,
  Menu,
  Package,
  Plus,
  Search,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'Producto' | 'Servicio'>('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setItems(await fetchCatalogItems(accessToken));
    } catch (catalogError) {
      setError(getReadableCatalogError(catalogError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadCatalog();
    }, [loadCatalog]),
  );

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const itemsByType = useMemo(() => {
    return items.filter((item) => (filter === 'all' ? true : item.kind === filter));
  }, [filter, items]);

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of itemsByType) {
      counts.set(item.category.name, (counts.get(item.category.name) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({
        value: name,
        label: name,
        count,
      }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
  }, [itemsByType]);

  useEffect(() => {
    if (activeCategory === 'all') {
      return;
    }

    if (!categoryOptions.some((option) => option.value === activeCategory)) {
      setActiveCategory('all');
    }
  }, [activeCategory, categoryOptions]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return itemsByType.filter((item) => {
      if (activeCategory !== 'all' && item.category.name !== activeCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${item.name} ${item.description} ${item.referenceCode} ${item.sku ?? ''}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [activeCategory, itemsByType, query]);

  const renderItem = ({ item, index }: { item: CatalogItem; index: number }) => {
    const isService = item.kind === 'Servicio';
    const stockLabel =
      item.kind === 'Producto'
        ? typeof item.stock === 'number' && item.stock > 0
          ? `${item.stock} en stock`
          : 'Sin stock'
        : 'Servicio disponible';

    return (
      <AnimatedTouchableOpacity
        className="mb-4 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm shadow-slate-100"
        entering={itemEntering(index + 1)}
        layout={smoothLayout}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: '/(drawer)/(tabs)/catalog/[id]',
            params: { id: item.id },
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${item.kind.toLowerCase()} ${item.name}`}
      >
        <View className="flex-row">
          <View className="relative h-36 w-32 overflow-hidden bg-slate-100">
            <CatalogImage
              imageUrl={item.imageUrl}
              isService={isService}
              size="thumbnail"
            />
            <View className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 shadow-sm shadow-slate-300">
              <Text
                className={`text-[10px] font-semibold ${isService ? 'text-emerald-700' : ''}`}
                style={{ color: isService ? undefined : palette.primaryText }}
              >
                {item.kind}
              </Text>
            </View>
          </View>

          <View className="min-h-36 flex-1 justify-between p-4">
            <View>
              <Text className="text-base font-semibold leading-5 text-slate-900" numberOfLines={2}>
                {item.name}
              </Text>
              <Text className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {item.referenceCode}
              </Text>
              <Text className="mt-2 text-xs font-semibold text-slate-600" numberOfLines={1}>
                {item.category.name}
              </Text>
            </View>

            <View>
              <View className="flex-row items-end justify-between">
                <Text className="text-lg font-semibold text-slate-900">
                  {formatMoney(item.currencySymbol, item.price)}
                </Text>
              </View>
              <Text
                className={`mt-2 text-xs font-semibold ${item.kind === 'Producto' && (!item.stock || item.stock <= 0) ? 'text-rose-500' : 'text-emerald-600'}`}
              >
                {stockLabel}
              </Text>
            </View>
          </View>
        </View>
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-4">
            <TouchableOpacity onPress={openDrawer} className="mr-4">
              <Menu color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-semibold">Catálogo</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center rounded-2xl bg-white/15 px-4 py-3"
            onPress={() => router.push('/(drawer)/(tabs)/catalog/new')}
          >
            <Plus size={16} color="white" />
            <Text className="ml-2 font-semibold text-white">Nuevo</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 0,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          }}
          ListHeaderComponent={
            <View>
              <Animated.View className="border-b border-slate-200 mb-6" entering={sectionEntering(1)}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
                  <View className="flex-row">
                    {[
                      { label: 'Todo', value: 'all' as const },
                      { label: 'Productos', value: 'Producto' as const },
                      { label: 'Servicios', value: 'Servicio' as const },
                    ].map((filterOption) => {
                      const isActive = filter === filterOption.value;

                      return (
                        <AnimatedTouchableOpacity
                          key={filterOption.value}
                          className="py-4 mr-6 border-b-2"
                          style={{ borderColor: isActive ? palette.primary : 'transparent' }}
                          onPress={() => setFilter(filterOption.value)}
                          layout={smoothLayout}
                        >
                          <Text
                            className={`${isActive ? 'font-semibold' : 'text-slate-500'}`}
                            style={{ color: isActive ? palette.primaryText : undefined }}
                          >
                            {filterOption.label}
                          </Text>
                        </AnimatedTouchableOpacity>
                      );
                    })}
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
                      ? 'todo el catálogo'
                      : filter.toLowerCase()}
                    {activeCategory !== 'all' ? ` · ${activeCategory}` : ''}.
                  </Text>
                </View>
              </Animated.View>

              <Animated.View className="mb-4" entering={sectionEntering(3)}>
                <View
                  className="rounded-[28px] border p-4"
                  style={{ backgroundColor: palette.primarySoft, borderColor: palette.primaryBorder }}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-sm font-semibold text-slate-800">Explora por categoría</Text>
                      <Text className="mt-1 text-xs text-slate-500">
                        Cambia el foco del catálogo con un toque.
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="rounded-full bg-white px-3 py-2"
                      onPress={() => setActiveCategory('all')}
                    >
                      <Text className="text-xs font-semibold" style={{ color: palette.primaryText }}>
                        Ver todo
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-4"
                    contentContainerStyle={{ paddingRight: 8 }}
                  >
                    <View className="flex-row">
                      <TouchableOpacity
                        className="mr-3 rounded-2xl border px-4 py-3"
                        style={{
                          borderColor: activeCategory === 'all' ? palette.primaryBorder : 'transparent',
                          backgroundColor: activeCategory === 'all' ? '#ffffff' : 'rgba(255,255,255,0.7)',
                        }}
                        onPress={() => setActiveCategory('all')}
                      >
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: activeCategory === 'all' ? palette.primaryText : '#334155' }}
                        >
                          Todo
                        </Text>
                        <Text className="mt-1 text-xs text-slate-500">{itemsByType.length} items</Text>
                      </TouchableOpacity>
                      {categoryOptions.map((categoryOption) => {
                        const isActive = activeCategory === categoryOption.value;

                        return (
                          <TouchableOpacity
                            key={categoryOption.value}
                            className="mr-3 rounded-2xl border px-4 py-3"
                            style={{
                              borderColor: isActive ? palette.primaryBorder : 'transparent',
                              backgroundColor: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                            }}
                            onPress={() => setActiveCategory(categoryOption.value)}
                          >
                            <Text
                              className="text-sm font-semibold"
                              style={{ color: isActive ? palette.primaryText : '#334155' }}
                            >
                              {categoryOption.label}
                            </Text>
                            <Text className="mt-1 text-xs text-slate-500">{categoryOption.count} item(s)</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              </Animated.View>

              {isLoading ? (
                <View className="mb-6 items-center justify-center rounded-[28px] border border-slate-100 bg-slate-50 p-6">
                  <ActivityIndicator color={palette.primary} />
                  <Text className="mt-3 text-sm font-medium text-slate-500">
                     Cargando catálogo...
                  </Text>
                </View>
              ) : null}

              {error ? (
                <View className="mb-6 rounded-[28px] border border-rose-100 bg-rose-50 p-5">
                  <Text className="text-sm font-semibold text-rose-600">{error}</Text>
                  <TouchableOpacity
                    className="mt-4 self-start rounded-2xl px-4 py-3"
                    style={{ backgroundColor: palette.primary }}
                    onPress={() => {
                      void loadCatalog();
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
                <Text className="text-base font-semibold text-slate-800">Sin resultados</Text>
                <Text className="mt-2 text-sm leading-6 text-slate-500">
                  Prueba con otro nombre, código o cambia el filtro.
                </Text>
                <TouchableOpacity
                  className="mt-4 self-start rounded-2xl px-4 py-3"
                  style={{ backgroundColor: palette.primary }}
                    onPress={() => {
                      setQuery('');
                      setFilter('all');
                      setActiveCategory('all');
                    }}
                  >
                  <Text className="font-semibold text-white">Limpiar filtros</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

function CatalogImage({
  imageUrl,
  isService,
  size,
}: {
  imageUrl: string | null;
  isService: boolean;
  size: 'thumbnail';
}) {
  const { palette } = useAccountPreferences();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  if (imageUrl && !hasError) {
    return (
      <Image
        source={imageUrl}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={180}
        cachePolicy="memory-disk"
        recyclingKey={imageUrl}
        onError={() => setHasError(true)}
        accessibilityLabel="Imagen del item del catálogo"
      />
    );
  }

  return (
    <View
      className={`h-full w-full items-center justify-center ${isService ? 'bg-emerald-50' : ''}`}
      style={{ backgroundColor: isService ? undefined : palette.primarySoft }}
    >
      {isService ? (
        <Briefcase size={size === 'thumbnail' ? 30 : 48} color="#059669" />
      ) : (
        <Package size={size === 'thumbnail' ? 30 : 48} color={palette.primary} />
      )}
    </View>
  );
}
