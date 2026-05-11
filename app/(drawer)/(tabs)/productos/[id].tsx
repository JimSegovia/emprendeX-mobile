import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Briefcase, Package } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { CATALOG_ITEMS, formatMoney } from '@/lib/catalog';

export default function ProductoDetalleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const item = useMemo(() => {
    return CATALOG_ITEMS.find((x) => x.id === id) ?? CATALOG_ITEMS[0];
  }, [id]);

  const isService = item.kind === 'Servicio';
  const Icon = isService ? Briefcase : Package;

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-4">
            <TouchableOpacity onPress={() => router.navigate('/(drawer)/(tabs)/productos')} className="mr-4">
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Detalle</Text>
          </View>
          <View className={`h-12 w-12 items-center justify-center rounded-2xl ${isService ? 'bg-emerald-50/20' : 'bg-white/15'}`}>
            <Icon size={22} color="white" />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
      >
        <Animated.View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={sectionEntering(1)}>
          <View className="flex-row items-start justify-between">
            <View className="mr-4 flex-1">
              <View className="mb-3 flex-row items-center">
                <View className={`mr-2 rounded-full px-3 py-1.5 ${isService ? 'bg-emerald-50' : 'bg-violet-50'}`}>
                  <Text className={`text-xs font-semibold ${isService ? 'text-emerald-700' : 'text-violet-700'}`}>{item.kind}</Text>
                </View>
                <View className={`rounded-full px-3 py-1.5 ${item.type === 'Personalizado' ? 'bg-amber-50' : 'bg-slate-100'}`}>
                  <Text className={`text-xs font-semibold ${item.type === 'Personalizado' ? 'text-amber-700' : 'text-slate-600'}`}>{item.type}</Text>
                </View>
                {!item.isActive ? (
                  <View className="ml-2 rounded-full bg-slate-100 px-2.5 py-1">
                    <Text className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Inactivo</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-2xl font-extrabold text-slate-800">{item.name}</Text>
              <Text className="mt-2 text-sm leading-6 text-slate-500">{item.description}</Text>
            </View>
          </View>

          <View className="mt-6 rounded-2xl bg-slate-50 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Codigo</Text>
              <Text className="text-sm font-bold text-slate-800">{item.id}</Text>
            </View>
            {item.sku ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">SKU</Text>
                <Text className="text-sm font-bold text-slate-800">{item.sku}</Text>
              </View>
            ) : null}
            {item.unit ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">Unidad</Text>
                <Text className="text-sm font-bold text-slate-800">{item.unit}</Text>
              </View>
            ) : null}
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Precio base</Text>
              <Text className="text-xl font-extrabold text-slate-800">{formatMoney(item.currencySymbol, item.price)}</Text>
            </View>
          </View>

          <View className="mt-6 flex-row">
            <TouchableOpacity className="mr-3 rounded-2xl bg-violet-600 px-4 py-3" activeOpacity={0.85}>
              <Text className="font-semibold text-white">Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3" activeOpacity={0.85}>
              <Text className="font-semibold text-rose-600">Eliminar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}
