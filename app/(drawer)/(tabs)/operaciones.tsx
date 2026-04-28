import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Search, Filter, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const operacionesData = [
  { id: '1023', tipo: 'Pedido', cliente: 'María López', monto: '150.00', estado: 'En camino', color: 'orange' },
  { id: '1022', tipo: 'Cotización', fecha: '20/05/2024', monto: '320.00', estado: 'Pendiente', color: 'amber' },
  { id: '1021', tipo: 'Alquiler', cliente: 'Carlos Ramírez', monto: '180.00', estado: 'Reservado', color: 'blue' },
  { id: '1020', tipo: 'Suscripción', cliente: 'Lucía Fernández', monto: '300.00', estado: 'Activa', color: 'green' },
  { id: '1019', tipo: 'Pedido', cliente: 'Ana Torres', monto: '120.00', estado: 'Entregado', color: 'emerald' },
];

const tabs = ['Todas', 'Pedidos', 'Cotizaciones', 'Alquileres', 'Suscripciones'];

export default function OperacionesScreen() {
  const [activeTab, setActiveTab] = useState('Todas');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getStatusStyle = (color: string) => {
    switch(color) {
      case 'orange': return 'bg-orange-100 text-orange-600';
      case 'amber': return 'bg-amber-100 text-amber-600';
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'emerald': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const renderItem = ({ item }: { item: typeof operacionesData[0] }) => (
    <TouchableOpacity 
      className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm"
      onPress={() => router.push(`/operaciones/${item.id}`)}
    >
      {/* Top row */}
      <View className="flex-row justify-between items-center mb-1">
        <Text className="font-bold text-slate-800">#{item.id}</Text>
        <View className={`px-3 py-1 rounded-full ${getStatusStyle(item.color).split(' ')[0]}`}>
          <Text className={`text-xs font-semibold ${getStatusStyle(item.color).split(' ')[1]}`}>{item.estado}</Text>
        </View>
      </View>

      {/* Middle row */}
      <Text className={`text-xs mb-2 ${item.tipo === 'Pedido' ? 'text-slate-500' : item.tipo === 'Cotización' ? 'text-violet-500' : item.tipo === 'Alquiler' ? 'text-blue-500' : item.tipo === 'Suscripción' ? 'text-emerald-500' : 'text-slate-500'}`}>
        {item.tipo}
      </Text>

      {/* Bottom row */}
      <View className="flex-row justify-between items-center">
        <Text className="text-slate-500 text-sm">{item.cliente || item.fecha}</Text>
        <Text className="font-semibold text-slate-800 text-sm">S/ {item.monto}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View 
        className="bg-violet-600 px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.push('/')} className="mr-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Operaciones</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="mr-4">
            <Search color="white" size={24} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Filter color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="border-b border-slate-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              className={`py-4 mr-6 border-b-2 ${activeTab === tab ? 'border-violet-600' : 'border-transparent'}`}
            >
              <Text className={`${activeTab === tab ? 'text-violet-600 font-semibold' : 'text-slate-500'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={operacionesData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
