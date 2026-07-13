import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import type { PedidoHistorial } from '@/lib/clientes';
import { fetchOperacionById } from '@/lib/ventas';
import { formatCurrencyAmount, formatCurrencyValue } from '@/lib/runtime-config';
import {
  getBadgeBgColor,
  getBadgeLabel,
  getBadgeTextColor,
  PEDIDO_STATUS_OPTIONS,
} from '@/lib/status-badge';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PedidoDetalleScreen() {
  const { id, srcCustomer, srcCreatedAt } = useLocalSearchParams<{
    id?: string;
    srcCustomer?: string;
    srcCreatedAt?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();

  const [pedido, setPedido] = useState<PedidoHistorial | null>(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    const loadPedido = async () => {
      if (!id || !accessToken) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const op = await fetchOperacionById(accessToken, id);

        if (op.type !== 'Pedido') {
          setError('No es un pedido');
          return;
        }

        setPedido({
          id: op.id,
          referenceCode: op.referenceCode,
          status: op.status,
          total: op.total,
          balance: op.total,
          deliveryDate: op.deliveryDate,
          createdAt: srcCreatedAt ?? op.deliveryDate,
          itemsCount: op.items.length,
          items: op.items.map((i) => ({
            name: i.name,
            kind: i.kind,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            price: i.price,
          })),
          customerName: srcCustomer ?? op.customer.fullName,
          deliveryMethod: op.deliveryMethod,
          description: op.description,
        });
        setCurrentStatus(op.status);
      } catch (loadError) {
        setError(String(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadPedido();
  }, [accessToken, id]);

  const subtotal = useMemo(() => {
    return (pedido?.items ?? []).reduce(
      (sum: number, item: { price: string; quantity: number }) => sum + Number(item.price) * item.quantity,
      0,
    );
  }, [pedido]);

  const statusBg = getBadgeBgColor(currentStatus);
  const statusText = getBadgeTextColor(currentStatus);

  const handleSelectStatus = (newStatus: string) => {
    setCurrentStatus(newStatus);
    setShowStatusDropdown(false);
    // TODO: Conectar con el backend real - PATCH /pedidos/:id/status
  };

  if (isLoading || !pedido) {
    return (
      <Animated.View className="flex-1 bg-white items-center justify-center" entering={screenEntering}>
        {error ? (
          <Text className="px-6 text-center text-rose-600">{error}</Text>
        ) : (
          <>
            <ActivityIndicator color={palette.primary} />
            <Text className="mt-3 text-slate-500">Cargando pedido...</Text>
          </>
        )}
      </Animated.View>
    );
  }

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">{pedido.referenceCode}</Text>
        </View>
        <View className="rounded-full px-3 py-1" style={{ backgroundColor: statusBg }}>
          <Text className="text-xs font-semibold" style={{ color: statusText }}>
            {getBadgeLabel(currentStatus)}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
      >
        <Animated.View
          className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
          entering={sectionEntering(1)}
        >
          <Text className="text-lg font-semibold text-slate-800 mb-4">Información</Text>
          <View className="gap-4">
            <View>
              <Text className="text-xs font-medium text-slate-500">Cliente</Text>
              <Text className="mt-1 text-slate-800 font-medium">{pedido.customerName}</Text>
            </View>
            <View>
              <Text className="text-xs font-medium text-slate-500">Fecha de pedido</Text>
              <Text className="mt-1 text-slate-800 font-medium">{formatDate(pedido.createdAt)}</Text>
            </View>
            <View>
              <Text className="text-xs font-medium text-slate-500">Entrega</Text>
              <Text className="mt-1 text-slate-800 font-medium">{formatDate(pedido.deliveryDate)}</Text>
            </View>
            <View>
              <Text className="text-xs font-medium text-slate-500">Método</Text>
              <Text className="mt-1 text-slate-800 font-medium">{pedido.deliveryMethod}</Text>
            </View>
            <View>
              <Text className="text-xs font-medium text-slate-500">Saldo pendiente</Text>
              <Text className={`mt-1 font-medium ${Number(pedido.balance) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {Number(pedido.balance) > 0 ? formatCurrencyValue(pedido.balance) : 'Pagado'}
              </Text>
            </View>
            {pedido.description && (
              <View>
                <Text className="text-xs font-medium text-slate-500">Observaciones</Text>
                <Text className="mt-1 text-slate-800 font-medium">{pedido.description}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        <View className="h-px bg-slate-100 my-6" />

        <Animated.View className="mb-6" entering={sectionEntering(2)}>
          <Text className="text-lg font-semibold text-slate-800 mb-4">Items</Text>
          {pedido.items.map((item, index) => (
            <View
              key={index}
              className={`rounded-3xl border border-slate-100 bg-slate-50 p-4 ${index === 0 ? '' : 'mt-4'}`}
            >
              <View className="flex-row items-start justify-between">
                <View className="mr-4 flex-1">
                  <Text className="font-semibold text-slate-800">{item.name}</Text>
                  <View
                    className={`mt-2 self-start rounded-full px-2.5 py-1 ${item.kind === 'Servicio' ? 'bg-emerald-50' : ''}`}
                    style={{ backgroundColor: item.kind === 'Servicio' ? undefined : palette.primarySoft }}
                  >
                    <Text
                      className={`text-[10px] font-semibold ${item.kind === 'Servicio' ? 'text-emerald-700' : ''}`}
                      style={{ color: item.kind === 'Servicio' ? undefined : palette.primaryText }}
                    >
                      {item.kind}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-medium text-slate-500">Subtotal</Text>
                  <Text className="mt-1 font-semibold text-slate-800">
                    {formatCurrencyAmount(Number(item.unitPrice) * item.quantity)}
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-white px-4 py-3">
                <View>
                  <Text className="text-xs font-medium text-slate-500">Cantidad</Text>
                  <Text className="mt-1 text-sm font-semibold text-slate-800">
                    {item.quantity} unidad(es)
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-medium text-slate-500">Precio unitario</Text>
                  <Text className="mt-1 text-sm font-semibold text-slate-800">
                    {formatCurrencyAmount(Number(item.unitPrice))}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>

        <View className="h-px bg-slate-100 mb-6" />

        <Animated.View entering={sectionEntering(3)}>
          <Text className="text-lg font-semibold text-slate-800 mb-4">Resumen</Text>
          <View className="flex-row justify-between">
            <Text className="text-slate-500">Subtotal</Text>
            <Text className="text-slate-800 font-medium">{formatCurrencyAmount(subtotal)}</Text>
          </View>
          <View className="flex-row justify-between mt-3">
            <Text className="text-slate-500">Total</Text>
            <Text className="text-slate-800 font-semibold">{formatCurrencyValue(pedido.total)}</Text>
          </View>
        </Animated.View>

        <View className="h-px bg-slate-100 my-6" />

        <Animated.View
          className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
          entering={sectionEntering(4)}
        >
          <Text className="text-sm font-semibold text-slate-800 mb-3">Estado del pedido</Text>
          <TouchableOpacity
            className="flex-row items-center justify-between border border-slate-200 rounded-xl px-4 py-3.5 bg-white"
            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            <View className="flex-row items-center gap-2">
              <View
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: statusBg, borderWidth: 2, borderColor: statusText }}
              />
              <Text className="text-slate-800 font-medium">{getBadgeLabel(currentStatus)}</Text>
            </View>
            <ChevronDown size={18} color="#94a3b8" />
          </TouchableOpacity>

          {showStatusDropdown && (
            <View className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <ScrollView className="max-h-56" nestedScrollEnabled>
                {PEDIDO_STATUS_OPTIONS.map((status, idx) => {
                  const bg = getBadgeBgColor(status);
                  const text = getBadgeTextColor(status);
                  const isActive = status === currentStatus;
                  return (
                    <TouchableOpacity
                      key={status}
                      className={`flex-row items-center justify-between px-4 py-3.5 ${idx > 0 ? 'border-t border-slate-100' : ''} ${isActive ? 'bg-slate-50' : ''}`}
                      onPress={() => handleSelectStatus(status)}
                    >
                      <View className="flex-row items-center gap-2">
                        <View
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: bg, borderWidth: 2, borderColor: text }}
                        />
                        <Text className={`font-medium ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>
                          {getBadgeLabel(status)}
                        </Text>
                      </View>
                      {isActive && (
                        <View
                          className="w-5 h-5 rounded-full items-center justify-center"
                          style={{ backgroundColor: palette.primary }}
                        >
                          <Text className="text-white text-[10px] font-bold">✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}
