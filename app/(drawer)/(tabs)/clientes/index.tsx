import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Search, Plus } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import Animated, {
  AnimatedTouchableOpacity,
  itemEntering,
  screenEntering,
  sectionEntering,
  smoothLayout,
} from '@/components/ui/motion';
import { fetchClientes, getReadableClientesError, type Cliente } from '@/lib/clientes';
import { useAuthSession } from '@/lib/auth-session-context';

export default function ClientesScreen() {
  const [query, setQuery] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const { accessToken } = useAuthSession();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const loadClientes = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setClientes(await fetchClientes(accessToken));
    } catch (loadError) {
      setError(getReadableClientesError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadClientes();
    }, [loadClientes]),
  );

  const filteredClientes = useMemo(() => {
    if (!query) return clientes;
    const q = query.trim().toLowerCase();
    return clientes.filter((item) => {
      const matchText = `${item.fullName} ${item.phone ?? ''} ${item.email ?? ''}`.toLowerCase();
      return matchText.includes(q);
    });
  }, [clientes, query]);

  const renderItem = ({ item, index }: { item: Cliente; index: number }) => (
    <AnimatedTouchableOpacity
      className="flex-row items-center justify-between py-5 border-b border-slate-100 bg-white"
      onPress={() =>
        router.push({ pathname: '/(drawer)/(tabs)/clientes/[id]', params: { id: item.id } })
      }
      entering={itemEntering(index)}
      layout={smoothLayout}
    >
      <View className="flex-row items-center flex-1 pr-4">
        <View className="w-14 h-14 rounded-full mr-4 bg-violet-50 items-center justify-center">
          <Text className="text-lg font-bold text-violet-700">{item.fullName.charAt(0)}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-bold text-slate-800 text-[15px] mb-0.5">{item.fullName}</Text>
          <Text className="text-slate-500 text-sm">{item.phone ?? item.email ?? 'Sin contacto'}</Text>
        </View>
      </View>
      <Text className="text-slate-400 text-[13px]">{item.operationsCount} operaciones</Text>
    </AnimatedTouchableOpacity>
  );

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={openDrawer} className="mr-4">
            <Menu color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Clientes</Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center rounded-2xl bg-white/15 px-4 py-3"
          onPress={() => router.push('/(drawer)/(tabs)/clientes/form')}
        >
          <Plus size={16} color="white" />
          <Text className="ml-2 font-semibold text-white">Nuevo</Text>
        </TouchableOpacity>
      </Animated.View>

      <FlatList
        data={filteredClientes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View className="mb-6" entering={sectionEntering(1)}>
            <View className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
              <View className="flex-row items-center rounded-2xl bg-slate-50 px-4 py-3">
                <Search size={18} color="#64748b" />
                <TextInput
                  className="ml-3 flex-1 text-[15px] font-semibold text-slate-800"
                  placeholder="Buscar por nombre, email o teléfono..."
                  placeholderTextColor="#94a3b8"
                  value={query}
                  onChangeText={setQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
              </View>
              <Text className="mt-3 text-xs text-slate-500">
                {filteredClientes.length} resultado(s)
              </Text>
              {error ? <Text className="mt-3 text-sm font-medium text-rose-600">{error}</Text> : null}
            </View>
          </Animated.View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator color="#7c3aed" />
              <Text className="mt-3 text-slate-500">Cargando clientes...</Text>
            </View>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-slate-500">No hay clientes registrados.</Text>
            </View>
          )
        }
      />
    </Animated.View>
  );
}
