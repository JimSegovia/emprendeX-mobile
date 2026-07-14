import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronRight, Package } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { itemEntering } from '@/components/ui/motion';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { formatCurrencyValue } from '@/lib/runtime-config';
import { ItemKindBadge } from '@/components/ItemKindBadge';
import { getBadgeBgColor, getBadgeLabel, getBadgeTextColor } from '@/lib/status-badge';
import type { PedidoHistorial } from '@/lib/clientes';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

type PedidoCardProps = {
  pedido: PedidoHistorial;
  index: number;
};

export function PedidoCard({ pedido, index }: PedidoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const { palette } = useAccountPreferences();
  const statusBg = getBadgeBgColor(pedido.status);
  const statusText = getBadgeTextColor(pedido.status);
  const hasBalance = Number(pedido.balance) > 0;

  return (
    <Animated.View
      className="mb-3 rounded-[24px] border border-slate-100 bg-white shadow-sm shadow-slate-100 overflow-hidden"
      entering={itemEntering(index)}
    >
      <TouchableOpacity
        className="p-4"
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold text-slate-800">{pedido.referenceCode}</Text>
              <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: statusBg }}>
                <Text className="text-[10px] font-semibold" style={{ color: statusText }}>
                  {getBadgeLabel(pedido.status)}
                </Text>
              </View>
            </View>
            <Text className="mt-1 text-xs text-slate-400">
              {formatDate(pedido.createdAt)} · Entrega {formatDate(pedido.deliveryDate)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-lg font-semibold text-slate-800">{formatCurrencyValue(pedido.total)}</Text>
            {hasBalance && (
              <Text className="mt-0.5 text-xs font-medium text-amber-600">
                Pendiente: {formatCurrencyValue(pedido.balance)}
              </Text>
            )}
            <View className="mt-1 flex-row items-center gap-1">
              <Package size={12} color={palette.primaryText} />
              <Text className="text-xs text-slate-400">{pedido.itemsCount} items</Text>
            </View>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-center">
          {expanded ? (
            <ChevronDown size={16} color="#94a3b8" />
          ) : (
            <ChevronRight size={16} color="#94a3b8" />
          )}
          <Text className="ml-1 text-xs text-slate-400">
            {expanded ? 'Ocultar detalle' : 'Ver detalle'}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="border-t border-slate-100 bg-slate-50 px-4 pb-4 pt-3">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Items del pedido
          </Text>
          {pedido.items.map((item, idx) => (
            <View
              key={idx}
              className={`flex-row items-center justify-between py-2.5 ${idx > 0 ? 'border-t border-slate-200/60' : ''}`}
            >
              <View className="flex-1">
                <Text className="text-sm font-medium text-slate-700">{item.name}</Text>
                <View className="mt-0.5 flex-row items-center gap-2">
                  <ItemKindBadge kind={item.kind} />
                  <Text className="text-xs text-slate-400">
                    {item.quantity} x {formatCurrencyValue(item.unitPrice)}
                  </Text>
                </View>
              </View>
              <Text className="text-sm font-semibold text-slate-700">{formatCurrencyValue(item.price)}</Text>
            </View>
          ))}
          <TouchableOpacity
            className="mt-3 rounded-2xl px-4 py-2.5"
            style={{ backgroundColor: palette.primary }}
            onPress={() =>
              router.push({
                pathname: '/(drawer)/(tabs)/pedidos/[id]',
                params: { id: pedido.id, srcCreatedAt: pedido.createdAt },
              })
            }
          >
            <Text className="text-center text-sm font-semibold text-white">Ver pedido completo</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}
