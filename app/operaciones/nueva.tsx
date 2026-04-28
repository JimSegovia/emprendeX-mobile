import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ArrowLeft, Calendar, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabs = ['Pedido', 'Cotización', 'Alquiler', 'Suscripción'];

export default function NuevaOperacionScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Pedido');
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View 
        className="bg-violet-600 px-4 pb-4 flex-row items-center"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Nueva operación</Text>
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

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Cliente */}
        <View className="mb-6">
          <Text className="font-bold text-slate-800 mb-2">Cliente</Text>
          <TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white">
            <Text className="text-slate-400">Seleccionar cliente</Text>
            <ChevronDown color="#94a3b8" size={20} />
          </TouchableOpacity>
          <TouchableOpacity className="items-end mt-2">
            <Text className="text-violet-600 font-medium">+ Nuevo cliente</Text>
          </TouchableOpacity>
        </View>

        {/* Productos / Servicios */}
        <View className="mb-6">
          <Text className="font-bold text-slate-800 mb-2">Productos / Servicios</Text>
          <TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white">
            <Text className="text-slate-400">Seleccionar producto</Text>
            <ChevronDown color="#94a3b8" size={20} />
          </TouchableOpacity>
          <TouchableOpacity className="items-end mt-2">
            <Text className="text-violet-600 font-medium">+ Agregar producto</Text>
          </TouchableOpacity>
        </View>

        {/* Fecha de entrega */}
        <View className="mb-6">
          <Text className="font-bold text-slate-800 mb-2">Fecha de entrega</Text>
          <TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white">
            <Text className="text-slate-800">20/05/2024</Text>
            <Calendar color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>

        {/* Método de entrega */}
        <View className="mb-8">
          <Text className="font-bold text-slate-800 mb-2">Método de entrega</Text>
          <TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white">
            <Text className="text-slate-400">Seleccionar método</Text>
            <ChevronDown color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="p-4 border-t border-slate-100 bg-white flex-row items-center justify-between">
        <View>
          <Text className="text-slate-500 font-medium">Total</Text>
          <Text className="text-lg font-bold text-slate-800">S/ 0.00</Text>
        </View>
        <TouchableOpacity 
          className="bg-violet-600 px-8 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Guardar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
