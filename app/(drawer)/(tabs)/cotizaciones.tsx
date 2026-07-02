import React, { useCallback, useMemo, useState } from 'react';
import { Alert, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Menu, Plus, Trash2 } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
  AnimatedTouchableOpacity,
  screenEntering,
  sectionEntering,
  itemEntering,
  smoothLayout,
} from '@/components/ui/motion';
import {
  convertCotizacionToPedido,
  deleteCotizacion,
  fetchCotizaciones,
  getReadableVentasError,
  type Cotizacion,
} from '@/lib/ventas';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { formatCurrencyValue } from '@/lib/runtime-config';
import { useScrollToTopOnFocus } from '@/hooks/use-scroll-to-top';

const badgeStyles = {
  Pendiente: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Aprobada: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Borrador: { bg: 'bg-slate-100', text: 'text-slate-700' },
} as const;

type QuoteCardProps = {
  quote: Cotizacion;
  index: number;
  onPress: (quotationId: string) => void;
  onConvert: (quotationId: string) => void;
  onDelete: (quote: Cotizacion) => void;
};

function QuoteCard({ quote, index, onPress, onConvert, onDelete }: QuoteCardProps) {
  const { palette } = useAccountPreferences();
  const styles = badgeStyles[quote.status as keyof typeof badgeStyles] ?? {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
  };
  const canConvert = quote.status !== 'Aprobada';
  const canDelete = quote.status === 'Pendiente';

  const content = (
    <AnimatedTouchableOpacity
      className="mb-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
      entering={itemEntering(index + 1)}
      activeOpacity={0.92}
      onPress={() => onPress(quote.id)}
    >
      <View className="flex-row items-start justify-between">
        <View className="mr-4 flex-1">
          <Text className="text-lg font-semibold text-slate-800">{quote.referenceCode}</Text>
          <Text className="mt-1 text-sm text-slate-500">{quote.customerName}</Text>
          {quote.originLabel ? (
            <View className="mt-3 self-start rounded-full px-3 py-1.5" style={{ backgroundColor: palette.primarySoft }}>
              <Text className="text-xs font-semibold" style={{ color: palette.primaryText }}>
                {quote.originLabel}
              </Text>
            </View>
          ) : null}
        </View>
        <View className={`rounded-full px-3 py-1.5 ${styles.bg}`}>
          <Text className={`text-xs font-semibold ${styles.text}`}>
            {quote.status}
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-medium text-slate-500">{quote.itemsCount} items</Text>
          <Text className="mt-1 text-xl font-semibold text-slate-800">{formatCurrencyValue(quote.total)}</Text>
        </View>
        {canConvert ? (
            <TouchableOpacity
              className="flex-row items-center rounded-2xl px-4 py-3"
              style={{ backgroundColor: palette.primary }}
              onPress={(event) => {
                event.stopPropagation();
                onConvert(quote.id);
              }}
            >
            <Check size={16} color="white" />
            <Text className="ml-2 font-semibold text-white">Convertir</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </AnimatedTouchableOpacity>
  );

  if (!canDelete) {
    return content;
  }

  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={() => (
        <TouchableOpacity
          className="mb-4 ml-3 w-[104px] items-center justify-center rounded-[28px] bg-rose-500"
          activeOpacity={0.9}
          onPress={() => onDelete(quote)}
        >
          <Trash2 size={18} color="white" />
          <Text className="mt-2 text-sm font-semibold text-white">Eliminar</Text>
        </TouchableOpacity>
      )}
    >
      {content}
    </Swipeable>
  );
}

export default function CotizacionesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();
  const [quotes, setQuotes] = useState<Cotizacion[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Pendiente' | 'Aprobada'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mainScrollRef = useScrollToTopOnFocus();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const loadQuotations = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setQuotes(await fetchCotizaciones(accessToken));
    } catch (loadError) {
      setError(getReadableVentasError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadQuotations();
    }, [loadQuotations]),
  );

  const stats = useMemo(() => {
    return {
      pending: quotes.filter((quote) => quote.status === 'Pendiente').length,
      approved: quotes.filter((quote) => quote.status === 'Aprobada').length,
    };
  }, [quotes]);

  const sortedQuotes = useMemo(() => {
    const statusPriority: Record<string, number> = {
      Pendiente: 0,
      Borrador: 1,
      Aprobada: 2,
    };

    return [...quotes].sort((left, right) => {
      const priorityDiff =
        (statusPriority[left.status] ?? 99) - (statusPriority[right.status] ?? 99);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return right.createdAt.localeCompare(left.createdAt);
    });
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    if (activeFilter === 'all') {
      return sortedQuotes;
    }

    return sortedQuotes.filter((quote) => quote.status === activeFilter);
  }, [activeFilter, sortedQuotes]);

  const handleConvert = async (quotationId: string) => {
    if (!accessToken) {
      return;
    }

    try {
      await convertCotizacionToPedido(accessToken, quotationId);
      await loadQuotations();
      router.push('/(drawer)/(tabs)/operaciones');
    } catch (convertError) {
      setError(getReadableVentasError(convertError));
    }
  };

  const handleDelete = async (quote: Cotizacion) => {
    if (!accessToken) {
      return;
    }

    Alert.alert(
      'Eliminar cotización',
      `¿Seguro que deseas eliminar ${quote.referenceCode}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteCotizacion(accessToken, quote.id);
                await loadQuotations();
              } catch (deleteError) {
                setError(getReadableVentasError(deleteError));
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-4">
            <TouchableOpacity onPress={openDrawer} className="mr-4">
              <Menu color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-semibold">Cotizaciones</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center rounded-2xl bg-white/15 px-4 py-3"
            onPress={() => router.push('/(drawer)/(tabs)/operaciones/nueva')}
          >
            <Plus size={16} color="white" />
            <Text className="ml-2 font-semibold text-white">Nueva</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        ref={mainScrollRef}
        className="flex-1 px-5 pt-0"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
      >
        <Animated.View className="border-b border-slate-200 mb-6" entering={sectionEntering(1)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
            <View className="flex-row">
              {[
                { label: 'Todas', value: 'all' as const },
                { label: 'Pendientes', value: 'Pendiente' as const },
                { label: 'Aprobadas', value: 'Aprobada' as const },
              ].map((filterOption) => {
                const isActive = activeFilter === filterOption.value;

                return (
                  <AnimatedTouchableOpacity
                    key={filterOption.value}
                    className="py-4 mr-6 border-b-2"
                    style={{ borderColor: isActive ? palette.primary : 'transparent' }}
                    onPress={() => setActiveFilter(filterOption.value)}
                    layout={smoothLayout}
                  >
                    <Text
                      className={`${isActive ? 'font-semibold' : 'text-slate-500'}`}
                      style={{ color: isActive ? palette.primaryText : undefined }}
                    >
                      {filterOption.label}
                    </Text>
                  </AnimatedTouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>

        <Animated.View
          className="mb-6 flex-row flex-wrap justify-between"
          entering={sectionEntering(2)}
        >
          <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
            <Text className="text-xs font-medium text-slate-500">Pendientes</Text>
            <Text className="mt-2 text-2xl font-semibold text-slate-800">{stats.pending}</Text>
          </View>
          <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
            <Text className="text-xs font-medium text-slate-500">Aprobadas</Text>
            <Text className="mt-2 text-2xl font-semibold text-slate-800">{stats.approved}</Text>
          </View>
        </Animated.View>

        {error ? <Text className="mb-4 text-sm font-medium text-rose-600">{error}</Text> : null}

        {isLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color={palette.primary} />
            <Text className="mt-3 text-slate-500">Cargando cotizaciones...</Text>
          </View>
        ) : null}

        {filteredQuotes.map((quote, index) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            index={index}
            onPress={(quotationId) => {
              router.push({
                pathname: '/(drawer)/(tabs)/cotizaciones/[id]',
                params: { id: quotationId, source: 'cotizaciones' },
              });
            }}
            onConvert={(quotationId) => {
              void handleConvert(quotationId);
            }}
            onDelete={(selectedQuote) => {
              void handleDelete(selectedQuote);
            }}
          />
        ))}

        {!isLoading && filteredQuotes.length === 0 ? (
          <View className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
            <Text className="text-base font-semibold text-slate-800">Sin cotizaciones</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-500">
              No hay resultados para el filtro seleccionado.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </Animated.View>
  );
}
