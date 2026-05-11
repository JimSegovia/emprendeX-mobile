import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Briefcase, Menu, Package, Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { AnimatedTouchableOpacity, screenEntering, sectionEntering, itemEntering, smoothLayout } from '@/components/ui/motion';
import { CATALOG_ITEMS, formatMoney, type CatalogItem } from '@/lib/catalog';

export default function ProductosScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'Producto' | 'Servicio'>('all');
  const [onlyActive, setOnlyActive] = useState(false);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG_ITEMS.filter((item) => {
      if (filter !== 'all' && item.kind !== filter) return false;
      if (onlyActive && !item.isActive) return false;
      if (!q) return true;
      const hay = `${item.name} ${item.description} ${item.id} ${item.sku ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [filter, onlyActive, query]);

  const stats = useMemo(() => {
    const all = CATALOG_ITEMS;
    const activeCount = all.filter((i) => i.isActive).length;
    const simpleCount = all.filter((i) => i.type === 'Simple').length;
    const customCount = all.filter((i) => i.type === 'Personalizado').length;
    const servicesCount = all.filter((i) => i.kind === 'Servicio').length;
    return {
      total: all.length,
      active: activeCount,
      simple: simpleCount,
      custom: customCount,
      services: servicesCount,
    };
  }, []);

  const renderItem = ({ item, index }: { item: CatalogItem; index: number }) => {
    const isService = item.kind === 'Servicio';
    const isCustom = item.type === 'Personalizado';
    return (
      <AnimatedTouchableOpacity
        className={`mb-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100 ${!item.isActive ? 'opacity-60' : ''}`}
        entering={itemEntering(index + 1)}
        layout={smoothLayout}
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/(drawer)/(tabs)/productos/[id]', params: { id: item.id } })}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${item.kind.toLowerCase()} ${item.name}`}
      >
        <View className="flex-row items-start justify-between">
          <View className="mr-4 flex-1">
            <View className="mb-3 flex-row items-center">
              <View className={`mr-2 rounded-full px-3 py-1.5 ${isService ? 'bg-emerald-50' : 'bg-violet-50'}`}>
                <Text className={`text-xs font-semibold ${isService ? 'text-emerald-700' : 'text-violet-700'}`}>{item.kind}</Text>
              </View>
              <View className={`rounded-full px-3 py-1.5 ${isCustom ? 'bg-amber-50' : 'bg-slate-100'}`}>
                <Text className={`text-xs font-semibold ${isCustom ? 'text-amber-700' : 'text-slate-600'}`}>{item.type}</Text>
              </View>
              {!item.isActive ? (
                <View className="ml-2 rounded-full bg-slate-100 px-2.5 py-1">
                  <Text className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Inactivo</Text>
                </View>
              ) : null}
            </View>
            <Text className="text-lg font-bold text-slate-800">{item.name}</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-500">{item.description}</Text>
          </View>
          <View className={`h-12 w-12 items-center justify-center rounded-2xl ${isService ? 'bg-emerald-50' : 'bg-violet-50'}`}>
            {isService ? <Briefcase size={22} color="#059669" /> : <Package size={22} color="#7c3aed" />}
          </View>
        </View>
        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-sm text-slate-500">Codigo {item.id}</Text>
          <Text className="text-xl font-extrabold text-slate-800">{formatMoney(item.currencySymbol, item.price)}</Text>
        </View>
      </AnimatedTouchableOpacity>
    );
  };

  return (
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
            <Text className="text-white text-2xl font-bold">Productos y servicios</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
            <View className="flex-row">
              <TouchableOpacity
                className="mr-3 flex-row items-center rounded-2xl bg-white/15 px-3.5 py-2.5"
                onPress={() => {
                  // Lightweight toggle: all -> producto -> servicio -> all
                  setFilter((prev) => (prev === 'all' ? 'Producto' : prev === 'Producto' ? 'Servicio' : 'all'));
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Cambiar filtro"
              >
                <SlidersHorizontal size={16} color="white" />
                <Text className="ml-2 font-semibold text-white">{filter === 'all' ? 'Todo' : filter}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="mr-3 flex-row items-center rounded-2xl bg-white/15 px-3.5 py-2.5" onPress={() => setOnlyActive((v) => !v)} activeOpacity={0.8}>
                <Text className="font-semibold text-white">{onlyActive ? 'Activos' : 'Todos'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center rounded-2xl bg-white/15 px-4 py-2.5"
                activeOpacity={0.8}
                onPress={() => {
                  router.push('/(drawer)/(tabs)/productos/nuevo');
                }}
              >
                <Plus size={16} color="white" />
                <Text className="ml-2 font-semibold text-white">Nuevo</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Animated.View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: Math.max(insets.bottom, 16) + 24 }}
        ListHeaderComponent={
          <View>
            <Animated.View className="mb-4" entering={sectionEntering(1)}>
              <View className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                <View className="flex-row items-center rounded-2xl bg-slate-50 px-4 py-3">
                  <Search size={18} color="#64748b" />
                  <TextInput
                    className="ml-3 flex-1 text-[15px] font-semibold text-slate-800"
                    placeholder="Buscar por nombre, codigo o SKU"
                    placeholderTextColor="#94a3b8"
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                  />
                </View>
                <Text className="mt-3 text-xs text-slate-500">
                  {filteredItems.length} resultado(s) en {filter === 'all' ? 'todo el catalogo' : filter.toLowerCase()}.
                </Text>
              </View>
            </Animated.View>

            <Animated.View className="mb-6 flex-row flex-wrap justify-between" entering={sectionEntering(2)}>
              <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                <Text className="text-xs font-medium text-slate-500">Items registrados</Text>
                <Text className="mt-2 text-2xl font-extrabold text-slate-800">{stats.total}</Text>
              </View>
              <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                <Text className="text-xs font-medium text-slate-500">Activos</Text>
                <Text className="mt-2 text-2xl font-extrabold text-slate-800">{stats.active}</Text>
              </View>
              <View className="w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                <Text className="text-xs font-medium text-slate-500">Personalizados</Text>
                <Text className="mt-2 text-2xl font-extrabold text-slate-800">{stats.custom}</Text>
              </View>
              <View className="w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                <Text className="text-xs font-medium text-slate-500">Servicios</Text>
                <Text className="mt-2 text-2xl font-extrabold text-slate-800">{stats.services}</Text>
              </View>
            </Animated.View>
          </View>
        }
        ListEmptyComponent={
          <View className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
            <Text className="text-base font-bold text-slate-800">Sin resultados</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-500">
              Prueba con otro nombre, codigo o cambia el filtro.
            </Text>
            <TouchableOpacity className="mt-4 self-start rounded-2xl bg-violet-600 px-4 py-3" onPress={() => { setQuery(''); setFilter('all'); setOnlyActive(false); }}>
              <Text className="font-semibold text-white">Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </Animated.View>
  );
}
