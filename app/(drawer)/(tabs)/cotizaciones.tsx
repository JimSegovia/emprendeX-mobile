import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, FileText, Menu, Plus } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { screenEntering, sectionEntering, itemEntering } from '@/components/ui/motion';

const quotes = [
  {
    id: 'COT-204',
    client: 'Maria López',
    status: 'Pendiente',
    total: 'S/ 320.00',
    items: 3,
    note: 'Incluye acabados y delivery.',
    accent: 'amber',
  },
  {
    id: 'COT-206',
    client: 'Lucía Fernández',
    status: 'Aprobada',
    total: 'S/ 290.00',
    items: 2,
    note: 'Lista para convertirse en pedido sin reprocesar datos.',
    accent: 'emerald',
  },
  {
    id: 'COT-207',
    client: 'Ana Torres',
    status: 'Borrador',
    total: 'S/ 180.00',
    items: 1,
    note: 'Falta confirmar fecha de entrega.',
    accent: 'violet',
  },
];

const badgeStyles = {
  amber: { bg: 'bg-amber-50', text: 'text-amber-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700' },
};

export default function CotizacionesScreen() {
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
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-4">
            <TouchableOpacity onPress={openDrawer} className="mr-4">
              <Menu color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Cotizaciones</Text>
          </View>
          <TouchableOpacity className="flex-row items-center rounded-2xl bg-white/15 px-4 py-3" onPress={() => router.push('/(drawer)/(tabs)/operaciones/nueva')}>
            <Plus size={16} color="white" />
            <Text className="ml-2 font-semibold text-white">Nueva</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
        <Animated.View className="mb-6 flex-row flex-wrap justify-between" entering={sectionEntering(1)}>
          <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
            <Text className="text-xs font-medium text-slate-500">Borradores</Text>
            <Text className="mt-2 text-2xl font-extrabold text-slate-800">4</Text>
          </View>
          <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
            <Text className="text-xs font-medium text-slate-500">Aprobadas</Text>
            <Text className="mt-2 text-2xl font-extrabold text-slate-800">2</Text>
          </View>
        </Animated.View>

        {quotes.map((quote, index) => {
          const styles = badgeStyles[quote.accent as keyof typeof badgeStyles];
          const canConvert = quote.status === 'Aprobada';

          return (
            <Animated.View key={quote.id} className="mb-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={itemEntering(index + 1)}>
              <View className="flex-row items-start justify-between">
                <View className="mr-4 flex-1">
                  <Text className="text-lg font-bold text-slate-800">{quote.id}</Text>
                  <Text className="mt-1 text-sm text-slate-500">{quote.client}</Text>
                </View>
                <View className={`rounded-full px-3 py-1.5 ${styles.bg}`}>
                  <Text className={`text-xs font-semibold ${styles.text}`}>{quote.status}</Text>
                </View>
              </View>

              <View className="mt-4 rounded-2xl bg-slate-50 p-4">
                <Text className="text-sm leading-6 text-slate-600">{quote.note}</Text>
              </View>

              <View className="mt-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-xs font-medium text-slate-500">{quote.items} items</Text>
                  <Text className="mt-1 text-xl font-extrabold text-slate-800">{quote.total}</Text>
                </View>
                {canConvert ? (
                  <TouchableOpacity className="flex-row items-center rounded-2xl bg-violet-600 px-4 py-3" onPress={() => router.push('/(drawer)/(tabs)/operaciones')}>
                    <Check size={16} color="white" />
                    <Text className="ml-2 font-semibold text-white">Convertir en pedido</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3" onPress={() => router.push('/(drawer)/(tabs)/operaciones/nueva')}>
                    <FileText size={16} color="#475569" />
                    <Text className="ml-2 font-semibold text-slate-700">Abrir</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}
