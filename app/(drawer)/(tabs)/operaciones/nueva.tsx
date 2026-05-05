import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Calendar, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';

export default function NuevaOperacionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4 flex-row items-center"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Nueva cotización</Text>
      </Animated.View>

      <Animated.View className="border-b border-slate-100 bg-violet-50/70 px-4 py-4" entering={sectionEntering(1)}>
        <View className="flex-row items-center">
          <View className="rounded-full bg-violet-600 px-4 py-2">
            <Text className="text-xs font-bold uppercase tracking-wide text-white">1. Cotización</Text>
          </View>
          <View className="mx-3 h-[1px] flex-1 bg-violet-200" />
          <View className="rounded-full border border-violet-200 bg-white px-4 py-2">
            <Text className="text-xs font-bold uppercase tracking-wide text-violet-300">2. Pedido</Text>
          </View>
        </View>
        <Text className="mt-3 text-sm leading-5 text-slate-600">
          Primero registras cliente y productos en la cotización. Cuando sea aprobada, recién pasa a pedido.
        </Text>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        entering={sectionEntering(2)}
      >
        <Animated.View className="mb-6" entering={sectionEntering(3)}>
          <Text className="font-bold text-slate-800 mb-2">Cliente</Text>
          <TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white">
            <Text className="text-slate-400">Seleccionar cliente</Text>
            <ChevronDown color="#94a3b8" size={20} />
          </TouchableOpacity>
          <TouchableOpacity className="items-end mt-2">
            <Text className="text-violet-600 font-medium">+ Nuevo cliente</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View className="mb-6" entering={sectionEntering(4)}>
          <Text className="font-bold text-slate-800 mb-2">Productos / Servicios</Text>
          <TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white">
            <Text className="text-slate-400">Seleccionar producto</Text>
            <ChevronDown color="#94a3b8" size={20} />
          </TouchableOpacity>
          <TouchableOpacity className="items-end mt-2">
            <Text className="text-violet-600 font-medium">+ Agregar item</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View className="mb-6" entering={sectionEntering(5)}>
          <Text className="font-bold text-slate-800 mb-2">Fecha de entrega estimada</Text>
          <TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white">
            <Text className="text-slate-800">20/05/2024</Text>
            <Calendar color="#94a3b8" size={20} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View className="mb-6" entering={sectionEntering(6)}>
          <Text className="font-bold text-slate-800 mb-2">Método de entrega</Text>
          <TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white">
            <Text className="text-slate-400">Seleccionar método</Text>
            <ChevronDown color="#94a3b8" size={20} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View className="mb-8 rounded-2xl border border-violet-100 bg-violet-50 p-4" entering={sectionEntering(7)}>
          <Text className="text-sm font-semibold text-violet-900">Siguiente paso</Text>
          <Text className="mt-2 text-sm leading-6 text-violet-800">
            Cuando la cotización esté aprobada, podrás convertirla en pedido sin volver a ingresar cliente, items ni total.
          </Text>
        </Animated.View>
      </Animated.ScrollView>

      <Animated.View
        className="border-t border-slate-100 bg-white px-4 pt-4 flex-row items-center justify-between"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        entering={sectionEntering(8)}
      >
        <View>
          <Text className="text-slate-500 font-medium">Total cotizado</Text>
          <Text className="text-lg font-bold text-slate-800">S/ 0.00</Text>
        </View>
        <TouchableOpacity
          className="bg-violet-600 px-8 py-3 rounded-xl"
          onPress={() => router.replace('/(drawer)/(tabs)/cotizaciones')}
        >
          <Text className="text-white font-bold">Guardar cotización</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}
