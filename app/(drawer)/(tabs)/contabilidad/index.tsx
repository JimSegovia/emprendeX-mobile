import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Search, Menu, Plus } from 'lucide-react-native';
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

const contabilidadData = [
  {
    id: 'PAG-303',
    refId: 'PED-1026',
    entidad: 'Lucía Fernández',
    monto: '95.00',
    estado: 'No cancelado',
    color: 'rose',
    tipo: 'Pago',
    fecha: '20/05/2026',
  },
  {
    id: 'PAG-302',
    refId: 'PED-1024',
    entidad: 'Juan Pérez',
    monto: '210.00',
    estado: 'Cancelado',
    color: 'emerald',
    tipo: 'Pago',
    fecha: '20/05/2026',
  },
  {
    id: 'PAG-301',
    refId: 'PED-1023',
    entidad: 'María López',
    monto: '80.00',
    estado: 'Adelanto',
    color: 'amber',
    tipo: 'Pago',
    fecha: '20/05/2026',
  },
  {
    id: 'GAS-101',
    refId: 'Suministros',
    entidad: 'Mercado Local',
    monto: '50.00',
    estado: 'Registrado',
    color: 'rose',
    tipo: 'Gasto',
    fecha: '19/05/2026',
  },
  {
    id: 'GAS-102',
    refId: 'Logística',
    entidad: 'Delivery Express',
    monto: '15.00',
    estado: 'Registrado',
    color: 'rose',
    tipo: 'Gasto',
    fecha: '18/05/2026',
  },
];

const tabs = ['Todas', 'Pagos', 'Gastos'];

export default function ContabilidadScreen() {
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
      case 'emerald':
        return 'bg-emerald-100 text-emerald-600';
      case 'amber':
        return 'bg-amber-100 text-amber-600';
      case 'rose':
        return 'bg-rose-100 text-rose-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredData = contabilidadData.filter((item) => {
    if (activeTab !== 'Todas') {
      if (activeTab === 'Pagos' && item.tipo !== 'Pago') return false;
      if (activeTab === 'Gastos' && item.tipo !== 'Gasto') return false;
    }
    if (query) {
      const q = query.trim().toLowerCase();
      const matchText =
        `${item.id} ${item.refId || ''} ${item.entidad || ''} ${item.tipo}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const renderItem = ({ item, index }: { item: (typeof contabilidadData)[0]; index: number }) => (
    <AnimatedTouchableOpacity
      className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm shadow-slate-100"
      onPress={() => {}} // TODO: Navigate to detail
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
        className={`text-xs mb-2 font-medium ${item.tipo === 'Pago' ? 'text-emerald-600' : 'text-rose-600'}`}
      >
        {item.tipo} • {item.fecha}
      </Text>

      {/* Bottom row */}
      <View className="flex-row justify-between items-center mt-2">
        <View className="flex-1 mr-2">
          <Text className="text-slate-500 text-sm font-medium" numberOfLines={1}>{item.refId}</Text>
          <Text className="text-slate-400 text-xs mt-0.5">{item.entidad}</Text>
        </View>
        <Text className="font-extrabold text-slate-800 text-base">S/ {item.monto}</Text>
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
        <View className="flex-row items-center flex-1 pr-4">
          <TouchableOpacity onPress={openDrawer} className="mr-4">
            <Menu color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Contabilidad</Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center rounded-2xl bg-white/15 px-4 py-3"
          onPress={() => router.push('/(drawer)/(tabs)/contabilidad/nuevo')}
        >
          <Plus size={16} color="white" />
          <Text className="ml-2 font-semibold text-white">Nuevo</Text>
        </TouchableOpacity>
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
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16) + 24,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Animated.View
              className="mb-4 flex-row flex-wrap justify-between"
              entering={sectionEntering(1)}
            >
              <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                <Text className="text-xs font-medium text-slate-500">Cobrado hoy</Text>
                <Text className="mt-2 text-xl font-extrabold text-emerald-600">S/ 440.00</Text>
              </View>
              <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                <Text className="text-xs font-medium text-slate-500">Gastos del mes</Text>
                <Text className="mt-2 text-xl font-extrabold text-rose-600">S/ 65.00</Text>
              </View>
            </Animated.View>

            <Animated.View className="mb-4" entering={sectionEntering(2)}>
              <View className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                <View className="flex-row items-center rounded-2xl bg-slate-50 px-4 py-3">
                  <Search size={18} color="#64748b" />
                  <TextInput
                    className="ml-3 flex-1 text-[15px] font-semibold text-slate-800"
                    placeholder="Buscar registro..."
                    placeholderTextColor="#94a3b8"
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                  />
                </View>
                <Text className="mt-3 text-xs text-slate-500">
                  {filteredData.length} resultado(s)
                </Text>
              </View>
            </Animated.View>
          </>
        }
      />
    </Animated.View>
  );
}
