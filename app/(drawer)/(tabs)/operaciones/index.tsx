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
  Modal,
} from 'react-native';
import { Search, Menu, X } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import Animated, {
  AnimatedTouchableOpacity,
  itemEntering,
  screenEntering,
  sectionEntering,
  smoothLayout,
} from '@/components/ui/motion';
import { fetchOperaciones, getReadableVentasError, type OperacionResumen } from '@/lib/ventas';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { formatCurrencyValue } from '@/lib/runtime-config';
import { getBadgeBgColor, getBadgeLabel, getBadgeTextColor } from '@/lib/status-badge';
import { useScrollToTopOnFocus } from '@/hooks/use-scroll-to-top';

const tabs = ['Todas', 'Pedidos', 'Cotizaciones'];

const statusOptions = [
  { label: 'Pendiente', color: '#fef3c7', textColor: '#b45309' },
  { label: 'En camino', color: '#fed7aa', textColor: '#c2410c' },
  { label: 'Entregado', color: '#6ee7b7', textColor: '#047857' },
];

export default function OperacionesScreen() {
  const [activeTab, setActiveTab] = useState('Todas');
  const [query, setQuery] = useState('');
  const [operaciones, setOperaciones] = useState<OperacionResumen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<OperacionResumen | null>(null);
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();
  const mainScrollRef = useScrollToTopOnFocus();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const loadOperations = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);
    try {
      setOperaciones(await fetchOperaciones(accessToken));
    } catch (loadError) {
      setError(getReadableVentasError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadOperations();
    }, [loadOperations]),
  );

  const filteredOperaciones = useMemo(() => {
    return operaciones.filter((item) => {
      if (activeTab !== 'Todas') {
        if (activeTab === 'Pedidos' && item.type !== 'Pedido') return false;
        if (activeTab === 'Cotizaciones' && item.type !== 'Cotización') return false;
      }
      if (query) {
        const q = query.trim().toLowerCase();
        const matchText = `${item.referenceCode} ${item.customerName} ${item.type}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }
      return true;
    });
  }, [activeTab, operaciones, query]);

  const getStatusStyle = (_type: OperacionResumen['type'], status: string) => {
    return {
      backgroundColor: getBadgeBgColor(status),
      color: getBadgeTextColor(status),
    };
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedOperation) return;

    setOperaciones((prev) =>
      prev.map((op) =>
        op.id === selectedOperation.id ? { ...op, status: newStatus } : op,
      ),
    );
    setSelectedOperation(null);
  };

  const renderItem = ({ item, index }: { item: OperacionResumen; index: number }) => (
    <AnimatedTouchableOpacity
      className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm"
      onPress={() => {
        if (item.type === 'Cotización') {
          router.push({
            pathname: '/(drawer)/(tabs)/cotizaciones/[id]',
            params: { id: item.id, source: 'operaciones' },
          });
          return;
        }

        setSelectedOperation(item);
      }}
      entering={itemEntering(index)}
      layout={smoothLayout}
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text className="font-semibold text-slate-800">{item.referenceCode}</Text>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: getStatusStyle(item.type, item.status).backgroundColor }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: getStatusStyle(item.type, item.status).color }}
          >
            {getBadgeLabel(item.status)}
          </Text>
        </View>
      </View>

      <Text className="text-xs mb-2 text-slate-500">{item.type}</Text>

      <View className="flex-row justify-between items-center">
        <Text className="text-slate-500 text-sm">{item.customerName}</Text>
        <Text className="font-semibold text-slate-800 text-sm">{formatCurrencyValue(item.total)}</Text>
      </View>
    </AnimatedTouchableOpacity>
  );

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={openDrawer} className="mr-4">
            <Menu color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">Operaciones</Text>
        </View>
      </Animated.View>

      <Animated.View className="border-b border-slate-200" entering={sectionEntering(1)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {tabs.map((tab) => (
            <AnimatedTouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="py-4 mr-6 border-b-2"
              style={{ borderColor: activeTab === tab ? palette.primary : 'transparent' }}
              layout={smoothLayout}
            >
              <Text
                className={`${activeTab === tab ? 'font-semibold' : 'text-slate-500'}`}
                style={{ color: activeTab === tab ? palette.primaryText : undefined }}
              >
                {tab}
              </Text>
            </AnimatedTouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={mainScrollRef}
          data={filteredOperaciones}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Animated.View className="mb-4" entering={sectionEntering(2)}>
              <View className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                <View className="flex-row items-center rounded-2xl bg-slate-50 px-4 py-3">
                  <Search size={18} color="#64748b" />
                  <TextInput
                    className="ml-3 flex-1 text-[15px] font-semibold text-slate-800"
                    placeholder="Buscar por código o cliente..."
                    placeholderTextColor="#94a3b8"
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                  />
                </View>
                <Text className="mt-3 text-xs text-slate-500">{filteredOperaciones.length} resultado(s)</Text>
                {error ? <Text className="mt-3 text-sm font-medium text-rose-600">{error}</Text> : null}
              </View>
            </Animated.View>
          }
          ListEmptyComponent={
            isLoading ? (
              <View className="py-10 items-center">
                <ActivityIndicator color={palette.primary} />
                <Text className="mt-3 text-slate-500">Cargando operaciones...</Text>
              </View>
            ) : (
              <View className="py-10 items-center">
                <Text className="text-slate-500">No hay operaciones registradas.</Text>
              </View>
            )
          }
        />
      </KeyboardAvoidingView>

      <Modal
        visible={selectedOperation !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedOperation(null)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-3xl p-6 w-[85%] max-w-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-slate-800">
                {selectedOperation?.referenceCode}
              </Text>
              <TouchableOpacity onPress={() => setSelectedOperation(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-slate-500 mb-4">
              Cliente: {selectedOperation?.customerName}
            </Text>

            <Text className="text-base font-semibold text-slate-800 mb-3">
              Estado actual: {getBadgeLabel(selectedOperation?.status ?? '')}
            </Text>

            <View className="space-y-8">
              {statusOptions.map((option) => {
                const isActive = selectedOperation?.status === option.label;
                return (
                  <TouchableOpacity
                    key={option.label}
                    className="rounded-2xl py-5 items-center"
                    style={{
                      backgroundColor: option.color,
                      opacity: isActive ? 1 : 0.6,
                      borderWidth: isActive ? 2 : 0,
                      borderColor: isActive ? palette.primary : 'transparent',
                    }}
                    onPress={() => handleStatusChange(option.label)}
                  >
                    <Text className="font-semibold text-slate-800">{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}
