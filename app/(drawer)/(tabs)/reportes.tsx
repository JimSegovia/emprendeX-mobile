import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart2, Menu } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { useAuthSession } from '@/lib/auth-session-context';
import { fetchReporteResumen, getReadableReportesError, type ReporteResumen } from '@/lib/reportes';

export default function ReportesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const { accessToken } = useAuthSession();
  const [summary, setSummary] = useState<ReporteResumen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  useEffect(() => {
    const loadSummary = async () => {
      if (!accessToken) return;
      setIsLoading(true);
      setError(null);
      try {
        setSummary(await fetchReporteResumen(accessToken));
      } catch (loadError) {
        setError(getReadableReportesError(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadSummary();
  }, [accessToken]);

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View className="bg-violet-600 px-4 pb-4" style={{ paddingTop: Math.max(insets.top, 16) + 16 }} entering={sectionEntering(0)}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={openDrawer} className="mr-4"><Menu color="white" size={24} /></TouchableOpacity>
          <Text className="text-white text-xl font-bold">Reportes</Text>
        </View>
      </Animated.View>
      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
        {isLoading ? <View className="py-10 items-center"><ActivityIndicator color="#7c3aed" /><Text className="mt-3 text-slate-500">Cargando reportes...</Text></View> : null}
        {error ? <Text className="text-rose-600">{error}</Text> : null}
        {summary ? (
          <>
            <Animated.View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={sectionEntering(1)}>
              <View className="mb-4 flex-row items-center justify-between"><Text className="text-lg font-bold text-slate-800">Resumen general</Text><BarChart2 size={22} color="#7c3aed" /></View>
              <View className="mb-3 rounded-2xl bg-slate-50 p-4"><Text className="text-sm text-slate-500">Ventas</Text><Text className="mt-2 text-2xl font-extrabold text-slate-800">S/ {summary.totalSales}</Text></View>
              <View className="mb-3 rounded-2xl bg-slate-50 p-4"><Text className="text-sm text-slate-500">Gastos</Text><Text className="mt-2 text-2xl font-extrabold text-slate-800">S/ {summary.totalExpenses}</Text></View>
              <View className="rounded-2xl bg-slate-50 p-4"><Text className="text-sm text-slate-500">Cobros pendientes</Text><Text className="mt-2 text-2xl font-extrabold text-slate-800">S/ {summary.pendingCollections}</Text></View>
            </Animated.View>
            <Animated.View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={sectionEntering(2)}>
              <Text className="text-lg font-bold text-slate-800">Items más vendidos</Text>
              {summary.topItems.map((item) => (
                <View key={item.name} className="mt-4 flex-row items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <Text className="font-semibold text-slate-800">{item.name}</Text>
                  <Text className="text-slate-500">{item.count} ventas</Text>
                </View>
              ))}
            </Animated.View>
          </>
        ) : null}
        <TouchableOpacity className="mt-6 items-center rounded-2xl bg-violet-600 py-4" onPress={() => router.push('/(drawer)/(tabs)/plan-pro')}>
          <Text className="text-lg font-bold text-white">Ver planes</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}
