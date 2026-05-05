import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Briefcase, Menu, Package, Plus, Search } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { screenEntering, sectionEntering, itemEntering } from '@/components/ui/motion';

const catalogItems = [
  {
    id: 'PR-01',
    name: 'Box de cupcakes',
    kind: 'Producto',
    type: 'Simple',
    price: 'S/ 48.00',
    description: 'Caja cerrada con 6 cupcakes en sabores fijos.',
  },
  {
    id: 'PR-02',
    name: 'Torta personalizada',
    kind: 'Producto',
    type: 'Personalizado',
    price: 'S/ 150.00',
    description: 'Base editable por tema, porciones y acabados decorativos.',
  },
  {
    id: 'SV-01',
    name: 'Mesa dulce para evento',
    kind: 'Servicio',
    type: 'Personalizado',
    price: 'S/ 420.00',
    description: 'Incluye montaje, exhibicion y seleccion segun la ocasion.',
  },
];

export default function ProductosScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
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
            <TouchableOpacity onPress={openDrawer} className="mr-4">
              <Menu color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Productos y servicios</Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity className="mr-4">
              <Search size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center rounded-2xl bg-white/15 px-4 py-2.5">
              <Plus size={16} color="white" />
              <Text className="ml-2 font-semibold text-white">Nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
        <Animated.View className="mb-6 flex-row flex-wrap justify-between" entering={sectionEntering(1)}>
          <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
            <Text className="text-xs font-medium text-slate-500">Items registrados</Text>
            <Text className="mt-2 text-2xl font-extrabold text-slate-800">12</Text>
          </View>
          <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
            <Text className="text-xs font-medium text-slate-500">Simples</Text>
            <Text className="mt-2 text-2xl font-extrabold text-slate-800">7</Text>
          </View>
          <View className="w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
            <Text className="text-xs font-medium text-slate-500">Personalizados</Text>
            <Text className="mt-2 text-2xl font-extrabold text-slate-800">5</Text>
          </View>
          <View className="w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
            <Text className="text-xs font-medium text-slate-500">Servicios</Text>
            <Text className="mt-2 text-2xl font-extrabold text-slate-800">3</Text>
          </View>
        </Animated.View>

        {catalogItems.map((item, index) => {
          const isService = item.kind === 'Servicio';
          const isCustom = item.type === 'Personalizado';

          return (
            <Animated.View key={item.id} className="mb-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={itemEntering(index + 1)}>
              <View className="flex-row items-start justify-between">
                <View className="mr-4 flex-1">
                  <View className="mb-3 flex-row items-center">
                    <View className={`mr-2 rounded-full px-3 py-1.5 ${isService ? 'bg-emerald-50' : 'bg-violet-50'}`}>
                      <Text className={`text-xs font-semibold ${isService ? 'text-emerald-700' : 'text-violet-700'}`}>{item.kind}</Text>
                    </View>
                    <View className={`rounded-full px-3 py-1.5 ${isCustom ? 'bg-amber-50' : 'bg-slate-100'}`}>
                      <Text className={`text-xs font-semibold ${isCustom ? 'text-amber-700' : 'text-slate-600'}`}>{item.type}</Text>
                    </View>
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
                <Text className="text-xl font-extrabold text-slate-800">{item.price}</Text>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}
