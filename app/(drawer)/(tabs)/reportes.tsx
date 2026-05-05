import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart2, Crown, Menu, Sparkles } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';

export default function ReportesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();

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
        <View className="flex-row items-center">
          <TouchableOpacity onPress={openDrawer} className="mr-4">
            <Menu color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Reportes</Text>
        </View>
      </Animated.View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
        <Animated.View className="items-center rounded-[32px] border border-amber-100 bg-amber-50 px-6 py-8" entering={sectionEntering(1)}>
          <View className="relative mb-5 h-20 w-20 items-center justify-center rounded-full bg-white">
            <Crown size={38} color="#d97706" />
            <View className="absolute -right-1 top-1">
              <Sparkles size={18} color="#f59e0b" />
            </View>
          </View>
          <Text className="text-center text-2xl font-extrabold text-amber-950">Reportes avanzados</Text>
          <Text className="mt-3 text-center text-sm leading-6 text-amber-900">
            Esta sección muestra claramente una funcionalidad premium disponible en el catálogo, pero bloqueada para el plan gratis del MVP.
          </Text>
        </Animated.View>

        <Animated.View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={sectionEntering(2)}>
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-slate-800">Lo que desbloquea</Text>
              <Text className="mt-1 text-sm text-slate-500">Metricas y comparativos para decisiones rapidas.</Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-violet-50">
              <BarChart2 size={22} color="#7c3aed" />
            </View>
          </View>

          <View className="mb-3 rounded-2xl bg-slate-50 p-4">
            <Text className="text-sm font-semibold text-slate-700">Ventas por periodo</Text>
            <View className="mt-4 h-24 rounded-2xl bg-slate-200" />
          </View>

          <View className="mb-3 rounded-2xl bg-slate-50 p-4">
            <Text className="text-sm font-semibold text-slate-700">Productos mas vendidos</Text>
            <View className="mt-4 h-20 rounded-2xl bg-slate-200" />
          </View>

          <View className="rounded-2xl bg-slate-50 p-4">
            <Text className="text-sm font-semibold text-slate-700">Cobros pendientes por cliente</Text>
            <View className="mt-4 h-20 rounded-2xl bg-slate-200" />
          </View>
        </Animated.View>

        <TouchableOpacity className="mt-6 items-center rounded-2xl bg-violet-600 py-4" onPress={() => router.push('/(drawer)/(tabs)/plan-pro')}>
          <Text className="text-lg font-bold text-white">Ver planes premium</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}
