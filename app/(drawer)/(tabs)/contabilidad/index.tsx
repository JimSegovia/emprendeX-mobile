import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Search, Menu, Plus } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import Animated, { AnimatedTouchableOpacity, itemEntering, screenEntering, sectionEntering, smoothLayout } from '@/components/ui/motion';
import { fetchRegistrosContables, fetchResumenContable, getReadableContabilidadError, type DetallePago, type RegistroContable } from '@/lib/contabilidad';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { formatCurrencyValue } from '@/lib/runtime-config';
import { useScrollToTopOnFocus } from '@/hooks/use-scroll-to-top';

const tabs = ['Todas', 'Pagos', 'Gastos'];

export default function ContabilidadScreen() {
  const [activeTab, setActiveTab] = useState('Todas');
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState<RegistroContable[]>([]);
  const [summary, setSummary] = useState<{ totalPaid: string; totalExpenses: string } | null>(null);
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);
  const [paymentDetailsById, setPaymentDetailsById] = useState<Record<string, DetallePago[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();
  const mainScrollRef = useScrollToTopOnFocus();

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
      case 'Pendiente': return 'bg-amber-50 text-amber-700';
      case 'Adelanto': return 'bg-amber-50 text-amber-700';
      case 'Aprobada': return 'bg-emerald-50 text-emerald-700';
      case 'Cancelado': return 'bg-rose-50 text-rose-700';
      case 'Entregado': return 'bg-emerald-50 text-emerald-700';
      case 'Pagado': return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const togglePaymentDetails = async (item: RegistroContable) => {
    if (item.type !== 'Pago' || !accessToken) {
      return;
    }

    if (expandedPaymentId === item.id) {
      setExpandedPaymentId(null);
      return;
    }

    setExpandedPaymentId(item.id);

    if (item.paymentDetails && item.paymentDetails.length > 0) {
      setPaymentDetailsById((current) => ({
        ...current,
        [item.id]: item.paymentDetails ?? [],
      }));
    }
  };

  const renderItem = ({ item, index }: { item: RegistroContable; index: number }) => {
    const isPaymentExpanded = item.type === 'Pago' && expandedPaymentId === item.id;
    const paymentDetails = paymentDetailsById[item.id] ?? item.paymentDetails ?? [];

    return (
      <AnimatedTouchableOpacity
        className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm shadow-slate-100"
        entering={itemEntering(index)}
        layout={smoothLayout}
        activeOpacity={item.type === 'Pago' ? 0.8 : 1}
        onPress={() => {
          void togglePaymentDetails(item);
        }}
      >
        <View className="flex-row justify-between items-center mb-1">
          <Text className="font-semibold text-slate-800">{item.referenceCode}</Text>
          <View className={`px-3 py-1 rounded-full ${getStatusStyle(item.status).split(' ')[0]}`}>
            <Text className={`text-xs font-semibold ${getStatusStyle(item.status).split(' ')[1]}`}>{item.status}</Text>
          </View>
        </View>
        <Text className={`text-xs mb-2 font-medium ${item.type === 'Pago' ? 'text-emerald-700' : 'text-rose-700'}`}>{item.type} • {new Date(item.createdAt).toLocaleDateString()}</Text>
        <View className="flex-row justify-between items-center mt-2">
          <View className="flex-1 mr-2">
            <Text className="text-slate-500 text-sm font-medium" numberOfLines={1}>{item.sourceReferenceCode}</Text>
            <Text className="text-slate-400 text-xs mt-0.5">{item.entityName}</Text>
          </View>
          <Text className="font-semibold text-slate-800 text-base">{formatCurrencyValue(item.amount)}</Text>
        </View>

        {isPaymentExpanded ? (
          <View className="mt-4 rounded-2xl bg-slate-50 p-3">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Detalles del pago
            </Text>
            {paymentDetails.length > 0 ? (
              paymentDetails.map((detail) => (
                <View key={detail.id} className="border-t border-slate-100 py-2 first:border-t-0">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-slate-700">{detail.paymentMethodName}</Text>
                    <Text className="text-sm font-semibold text-emerald-700">{formatCurrencyValue(detail.amount)}</Text>
                  </View>
                  <Text className="mt-1 text-xs text-slate-400">
                    {new Date(detail.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-sm text-slate-500">Este pago no tiene detalles registrados.</Text>
            )}
          </View>
        ) : null}
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View className="px-4 pb-4 flex-row items-center justify-between" style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }} entering={sectionEntering(0)}>
        <View className="flex-row items-center flex-1 pr-4">
          <TouchableOpacity onPress={openDrawer} className="mr-4"><Menu color="white" size={24} /></TouchableOpacity>
          <Text className="text-white text-xl font-semibold">Contabilidad</Text>
        </View>
        <TouchableOpacity className="flex-row items-center rounded-2xl bg-white/15 px-4 py-3" onPress={() => router.push('/(drawer)/(tabs)/contabilidad/nuevo')}>
          <Plus size={16} color="white" />
          <Text className="ml-2 font-semibold text-white">Nuevo</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View className="border-b border-slate-200" entering={sectionEntering(1)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {tabs.map((tab) => (
            <AnimatedTouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className="py-4 mr-6 border-b-2" style={{ borderColor: activeTab === tab ? palette.primary : 'transparent' }} layout={smoothLayout}>
              <Text className={`${activeTab === tab ? 'font-semibold' : 'text-slate-500'}`} style={{ color: activeTab === tab ? palette.primaryText : undefined }}>{tab}</Text>
            </AnimatedTouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={mainScrollRef}
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
                  <Text className="mt-2 text-xl font-semibold text-emerald-700">{formatCurrencyValue(summary?.totalPaid)}</Text>
                </View>
                <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                  <Text className="text-xs font-medium text-slate-500">Gastos</Text>
                  <Text className="mt-2 text-xl font-semibold text-rose-700">{formatCurrencyValue(summary?.totalExpenses)}</Text>
                </View>
              </Animated.View>
              <Animated.View className="mb-4" entering={sectionEntering(2)}>
                <View className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                  <View className="flex-row items-center rounded-2xl bg-slate-50 px-4 py-3">
                    <Search size={18} color="#64748b" />
                    <TextInput className="ml-3 flex-1 text-[15px] font-semibold text-slate-800" placeholder="Buscar registro..." placeholderTextColor="#94a3b8" value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} returnKeyType="search" />
                  </View>
                  <Text className="mt-3 text-xs text-slate-500">{filteredData.length} resultado(s)</Text>
                  {error ? <Text className="mt-3 text-sm font-medium text-rose-700">{error}</Text> : null}
                </View>
              </Animated.View>
            </>
          }
          ListEmptyComponent={isLoading ? <View className="py-10 items-center"><ActivityIndicator color={palette.primary} /><Text className="mt-3 text-slate-500">Cargando registros...</Text></View> : <View className="py-10 items-center"><Text className="text-slate-500">No hay registros contables.</Text></View>}
        />
      </KeyboardAvoidingView>
    </Animated.View>
  );
}
