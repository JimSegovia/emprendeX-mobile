import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Search, Menu } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import Animated, {
  AnimatedTouchableOpacity,
  itemEntering,
  screenEntering,
  sectionEntering,
  smoothLayout,
} from '@/components/ui/motion';
import { fetchOperaciones, getReadableVentasError, type OperacionResumen } from '@/lib/ventas';
import { useAuthSession } from '@/lib/auth-session-context';

const tabs = ['Todas', 'Pedidos', 'Cotizaciones'];

export default function OperacionesScreen() {
  const [activeTab, setActiveTab] = useState('Todas');
  const [query, setQuery] = useState('');
  const [operaciones, setOperaciones] = useState<OperacionResumen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuthSession();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const loadOperations = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);
    try {
      setOperaciones(await fetchOperaciones(accessToken));
    } catch (loadError) {
      setError(getReadableVentasError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadOperations();
    }, [loadOperations]),
  );

  const filteredOperaciones = useMemo(() => {
    return operaciones.filter((item) => {
      if (activeTab !== 'Todas') {
        if (activeTab === 'Pedidos' && item.type !== 'Pedido') return false;
        if (activeTab === 'Cotizaciones' && item.type !== 'Cotización') return false;
      }
      if (query) {
        const q = query.trim().toLowerCase();
        const matchText = `${item.referenceCode} ${item.customerName} ${item.type}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }
      return true;
    });
  }, [activeTab, operaciones, query]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'En camino':
        return 'bg-orange-100 text-orange-600';
      case 'Pendiente':
      case 'Reserva':
        return 'bg-amber-100 text-amber-600';
      case 'Entregado':
      case 'Aprobada':
        return 'bg-emerald-100 text-emerald-600';
      case 'Activo':
        return 'bg-violet-100 text-violet-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const renderItem = ({ item, index }: { item: OperacionResumen; index: number }) => (
    <AnimatedTouchableOpacity
      className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm"
      onPress={() =>
        router.push({ pathname: '/(drawer)/(tabs)/operaciones/[id]', params: { id: item.id } })
      }
      entering={itemEntering(index)}
      layout={smoothLayout}
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text className="font-bold text-slate-800">{item.referenceCode}</Text>
        <View className={`px-3 py-1 rounded-full ${getStatusStyle(item.status).split(' ')[0]}`}>
          <Text className={`text-xs font-semibold ${getStatusStyle(item.status).split(' ')[1]}`}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text
        className={`text-xs mb-2 ${item.type === 'Cotización' ? 'text-violet-500' : 'text-slate-500'}`}
      >
        {item.type}
      </Text>

      <View className="flex-row justify-between items-center">
        <Text className="text-slate-500 text-sm">{item.customerName}</Text>
        <Text className="font-semibold text-slate-800 text-sm">S/ {item.total}</Text>
      </View>
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
          <Text className="text-white text-xl font-bold">Operaciones</Text>
        </View>
      </Animated.View>

      <Animated.View className="border-b border-slate-200" entering={sectionEntering(1)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {tabs.map((tab) => (
            <AnimatedTouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`py-4 mr-6 border-b-2 ${activeTab === tab ? 'border-violet-600' : 'border-transparent'}`}
              layout={smoothLayout}
            >
              <Text className={`${activeTab === tab ? 'text-violet-600 font-semibold' : 'text-slate-500'}`}>
                {tab}
              </Text>
            </AnimatedTouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <FlatList
        data={filteredOperaciones}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16) + 24,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View className="mb-4" entering={sectionEntering(2)}>
            <View className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
              <View className="flex-row items-center rounded-2xl bg-slate-50 px-4 py-3">
                <Search size={18} color="#64748b" />
                <TextInput
                  className="ml-3 flex-1 text-[15px] font-semibold text-slate-800"
                  placeholder="Buscar por código o cliente..."
                  placeholderTextColor="#94a3b8"
                  value={query}
                  onChangeText={setQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
              </View>
              <Text className="mt-3 text-xs text-slate-500">{filteredOperaciones.length} resultado(s)</Text>
              {error ? <Text className="mt-3 text-sm font-medium text-rose-600">{error}</Text> : null}
            </View>
          </Animated.View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator color="#7c3aed" />
              <Text className="mt-3 text-slate-500">Cargando operaciones...</Text>
            </View>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-slate-500">No hay operaciones registradas.</Text>
            </View>
          )
        }
      />
    </Animated.View>
  );
}
