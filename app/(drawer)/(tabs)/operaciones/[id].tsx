import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';

export default function OperacionDetalleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      {/* Header */}
      <Animated.View 
        className="bg-violet-600 px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Operación #{id}</Text>
        </View>
        <TouchableOpacity>
          <MoreVertical color="white" size={24} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false} entering={sectionEntering(1)}>
        {/* Status Badge */}
        <Animated.View className="items-end mb-6" entering={sectionEntering(2)}>
          <View className="bg-orange-100 px-4 py-1.5 rounded-full">
            <Text className="text-orange-600 font-medium text-sm">En camino</Text>
          </View>
        </Animated.View>

        {/* Información Section */}
        <Animated.View className="mb-8" entering={sectionEntering(3)}>
          <Text className="text-lg font-bold text-slate-800 mb-4">Información</Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <Text className="text-slate-500">Tipo de operación</Text>
              <Text className="text-slate-800 font-medium">Pedido</Text>
            </View>
            <View className="flex-row justify-between mt-3">
              <Text className="text-slate-500">Cliente</Text>
              <Text className="text-slate-800 font-medium">María López</Text>
            </View>
            <View className="flex-row justify-between mt-3">
              <Text className="text-slate-500">Cotización de origen</Text>
              <Text className="text-slate-800 font-medium">COT-204 aprobada</Text>
            </View>
            <View className="flex-row justify-between mt-3">
              <Text className="text-slate-500">Fecha de entrega</Text>
              <Text className="text-slate-800 font-medium">20/05/2024 - 2:00 p.m.</Text>
            </View>
            <View className="flex-row justify-between mt-3">
              <Text className="text-slate-500">Método de entrega</Text>
              <Text className="text-slate-800 font-medium">Delivery</Text>
            </View>
            <View className="flex-row justify-between mt-3">
              <Text className="text-slate-500">Dirección</Text>
              <Text className="text-slate-800 font-medium">Av. Los Olivos 123, Lima</Text>
            </View>
            <View className="flex-row justify-between mt-3">
              <Text className="text-slate-500">Observaciones</Text>
              <Text className="text-slate-800 font-medium">Torta de chocolate sin azúcar.</Text>
            </View>
          </View>
        </Animated.View>

        <View className="h-[1px] bg-slate-100 mb-8" />

        {/* Productos Section */}
        <Animated.View className="mb-8" entering={sectionEntering(4)}>
          <Text className="text-lg font-bold text-slate-800 mb-4">Productos</Text>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-16 h-16 bg-slate-100 rounded-xl mr-4 overflow-hidden">
                {/* Placeholder for the cake image. We can use a generic URL or color if no local asset exists */}
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80' }} 
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View>
                <Text className="font-semibold text-slate-800 mb-1">Torta personalizada</Text>
                <Text className="text-slate-500 text-sm">1 unidad</Text>
              </View>
            </View>
            <Text className="font-bold text-slate-800">S/ 150.00</Text>
          </View>
        </Animated.View>

        <View className="h-[1px] bg-slate-100 mb-8" />

        {/* Resumen Section */}
        <Animated.View className="mb-12" entering={sectionEntering(5)}>
          <Text className="text-lg font-bold text-slate-800 mb-4">Resumen</Text>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-500">Subtotal</Text>
            <Text className="text-slate-800 font-medium">S/ 150.00</Text>
          </View>
        </Animated.View>

      </Animated.ScrollView>
    </Animated.View>
  );
}
