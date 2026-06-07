import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Search, Menu, Plus } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import Animated, { AnimatedTouchableOpacity, itemEntering, screenEntering, sectionEntering, smoothLayout } from '@/components/ui/motion';
import { fetchRegistrosContables, fetchResumenContable, getReadableContabilidadError, type RegistroContable } from '@/lib/contabilidad';
import { useAuthSession } from '@/lib/auth-session-context';
import { KeyboardAwareScreen } from '@/components/ui/keyboard-aware-screen';

const tabs = ['Todas', 'Pagos', 'Gastos'];

export default function ContabilidadScreen() {
  const [activeTab, setActiveTab] = useState('Todas');
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState<RegistroContable[]>([]);
  const [summary, setSummary] = useState<{ totalPaid: string; totalExpenses: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuthSession();

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const loadRecords = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const [nextSummary, nextRecords] = await Promise.all([
        fetchResumenContable(accessToken),
        fetchRegistrosContables(accessToken),
      ]);
      setSummary(nextSummary);
      setRecords(nextRecords);
    } catch (loadError) {
      setError(getReadableContabilidadError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(useCallback(() => { void loadRecords(); }, [loadRecords]));

  const filteredData = useMemo(() => {
    return records.filter((item) => {
      if (activeTab === 'Pagos' && item.type !== 'Pago') return false;
      if (activeTab === 'Gastos' && item.type !== 'Gasto') return false;
      if (!query) return true;
      const q = query.trim().toLowerCase();
      return `${item.referenceCode} ${item.sourceReferenceCode} ${item.entityName} ${item.type}`.toLowerCase().includes(q);
    });
  }, [activeTab, query, records]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Cancelado': return 'bg-emerald-100 text-emerald-600';
      case 'Adelanto': return 'bg-amber-100 text-amber-600';
      default: return 'bg-rose-100 text-rose-600';
    }
  };

  const renderItem = ({ item, index }: { item: RegistroContable; index: number }) => (
    <AnimatedTouchableOpacity
      className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm shadow-slate-100"
      entering={itemEntering(index)}
      layout={smoothLayout}
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text className="font-bold text-slate-800">{item.referenceCode}</Text>
        <View className={`px-3 py-1 rounded-full ${getStatusStyle(item.status).split(' ')[0]}`}>
          <Text className={`text-xs font-semibold ${getStatusStyle(item.status).split(' ')[1]}`}>{item.status}</Text>
        </View>
      </View>
      <Text className={`text-xs mb-2 font-medium ${item.type === 'Pago' ? 'text-emerald-600' : 'text-rose-600'}`}>{item.type} • {new Date(item.createdAt).toLocaleDateString()}</Text>
      <View className="flex-row justify-between items-center mt-2">
        <View className="flex-1 mr-2">
          <Text className="text-slate-500 text-sm font-medium" numberOfLines={1}>{item.sourceReferenceCode}</Text>
          <Text className="text-slate-400 text-xs mt-0.5">{item.entityName}</Text>
        </View>
        <Text className="font-extrabold text-slate-800 text-base">S/ {item.amount}</Text>
      </View>
    </AnimatedTouchableOpacity>
  );

  return (
    <KeyboardAwareScreen>
      <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View className="bg-violet-600 px-4 pb-4 flex-row items-center justify-between" style={{ paddingTop: Math.max(insets.top, 16) + 16 }} entering={sectionEntering(0)}>
        <View className="flex-row items-center flex-1 pr-4">
          <TouchableOpacity onPress={openDrawer} className="mr-4"><Menu color="white" size={24} /></TouchableOpacity>
          <Text className="text-white text-xl font-bold">Contabilidad</Text>
        </View>
        <TouchableOpacity className="flex-row items-center rounded-2xl bg-white/15 px-4 py-3" onPress={() => router.push('/(drawer)/(tabs)/contabilidad/nuevo')}>
          <Plus size={16} color="white" />
          <Text className="ml-2 font-semibold text-white">Nuevo</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View className="border-b border-slate-200" entering={sectionEntering(1)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {tabs.map((tab) => (
            <AnimatedTouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className={`py-4 mr-6 border-b-2 ${activeTab === tab ? 'border-violet-600' : 'border-transparent'}`} layout={smoothLayout}>
              <Text className={`${activeTab === tab ? 'text-violet-600 font-semibold' : 'text-slate-500'}`}>{tab}</Text>
            </AnimatedTouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) + 24 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <Animated.View className="mb-4 flex-row flex-wrap justify-between" entering={sectionEntering(1)}>
                <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                  <Text className="text-xs font-medium text-slate-500">Cobrado</Text>
                  <Text className="mt-2 text-xl font-extrabold text-emerald-600">S/ {summary?.totalPaid ?? '0.00'}</Text>
                </View>
                <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                  <Text className="text-xs font-medium text-slate-500">Gastos</Text>
                  <Text className="mt-2 text-xl font-extrabold text-rose-600">S/ {summary?.totalExpenses ?? '0.00'}</Text>
                </View>
              </Animated.View>
              <Animated.View className="mb-4" entering={sectionEntering(2)}>
                <View className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                  <View className="flex-row items-center rounded-2xl bg-slate-50 px-4 py-3">
                    <Search size={18} color="#64748b" />
                    <TextInput className="ml-3 flex-1 text-[15px] font-semibold text-slate-800" placeholder="Buscar registro..." placeholderTextColor="#94a3b8" value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} returnKeyType="search" />
                  </View>
                  <Text className="mt-3 text-xs text-slate-500">{filteredData.length} resultado(s)</Text>
                  {error ? <Text className="mt-3 text-sm font-medium text-rose-600">{error}</Text> : null}
                </View>
              </Animated.View>
            </>
          }
          ListEmptyComponent={isLoading ? <View className="py-10 items-center"><ActivityIndicator color="#7c3aed" /><Text className="mt-3 text-slate-500">Cargando registros...</Text></View> : <View className="py-10 items-center"><Text className="text-slate-500">No hay registros contables.</Text></View>}
        />
    </Animated.View>
    </KeyboardAwareScreen>
  );
}
