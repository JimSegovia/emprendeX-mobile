import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Search, Menu } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import Animated, {
  AnimatedTouchableOpacity,
  itemEntering,
  screenEntering,
  sectionEntering,
  smoothLayout,
} from '@/components/ui/motion';

const operacionesData = [
  {
    id: '1023',
    tipo: 'Pedido',
    cliente: 'María López',
    monto: '150.00',
    estado: 'En camino',
    color: 'orange',
  },
  {
    id: '1022',
    tipo: 'Cotización',
    fecha: '20/05/2024',
    monto: '320.00',
    estado: 'Pendiente',
    color: 'amber',
  },
  {
    id: '1019',
    tipo: 'Pedido',
    cliente: 'Ana Torres',
    monto: '120.00',
    estado: 'Entregado',
    color: 'emerald',
  },
];

const tabs = ['Todas', 'Pedidos', 'Cotizaciones'];

export default function OperacionesScreen() {
  const [activeTab, setActiveTab] = useState('Todas');
  const [query, setQuery] = useState('');
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const getStatusStyle = (color: string) => {
    switch (color) {
      case 'orange':
        return 'bg-orange-100 text-orange-600';
      case 'amber':
        return 'bg-amber-100 text-amber-600';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredOperaciones = operacionesData.filter((item) => {
    if (activeTab !== 'Todas') {
      if (activeTab === 'Pedidos' && item.tipo !== 'Pedido') return false;
      if (activeTab === 'Cotizaciones' && item.tipo !== 'Cotización') return false;
    }
    if (query) {
      const q = query.trim().toLowerCase();
      const matchText =
        `${item.id} ${item.cliente || ''} ${item.fecha || ''} ${item.tipo}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const renderItem = ({ item, index }: { item: (typeof operacionesData)[0]; index: number }) => (
    <AnimatedTouchableOpacity
      className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm"
      onPress={() =>
        router.push({ pathname: '/(drawer)/(tabs)/operaciones/[id]', params: { id: item.id } })
      }
      entering={itemEntering(index)}
      layout={smoothLayout}
    >
      {/* Top row */}
      <View className="flex-row justify-between items-center mb-1">
        <Text className="font-bold text-slate-800">#{item.id}</Text>
        <View className={`px-3 py-1 rounded-full ${getStatusStyle(item.color).split(' ')[0]}`}>
          <Text className={`text-xs font-semibold ${getStatusStyle(item.color).split(' ')[1]}`}>
            {item.estado}
          </Text>
        </View>
      </View>

      {/* Middle row */}
      <Text
        className={`text-xs mb-2 ${item.tipo === 'Cotización' ? 'text-violet-500' : 'text-slate-500'}`}
      >
        {item.tipo}
      </Text>

      {/* Bottom row */}
      <View className="flex-row justify-between items-center">
        <Text className="text-slate-500 text-sm">{item.cliente || item.fecha}</Text>
        <Text className="font-semibold text-slate-800 text-sm">S/ {item.monto}</Text>
      </View>
    </AnimatedTouchableOpacity>
  );

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      {/* Header */}
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

      {/* Tabs */}
      <Animated.View className="border-b border-slate-200" entering={sectionEntering(1)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {tabs.map((tab) => (
            <AnimatedTouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`py-4 mr-6 border-b-2 ${activeTab === tab ? 'border-violet-600' : 'border-transparent'}`}
              layout={smoothLayout}
            >
              <Text
                className={`${activeTab === tab ? 'text-violet-600 font-semibold' : 'text-slate-500'}`}
              >
                {tab}
              </Text>
            </AnimatedTouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* List */}
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
                  placeholder="Buscar por ID, cliente, fecha..."
                  placeholderTextColor="#94a3b8"
                  value={query}
                  onChangeText={setQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
              </View>
              <Text className="mt-3 text-xs text-slate-500">
                {filteredOperaciones.length} resultado(s)
              </Text>
            </View>
          </Animated.View>
        }
      />
    </Animated.View>
  );
}
