import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';

const CLIENTS = [
  {
    id: '1',
    name: 'Maria López',
    phone: '987 654 321',
    district: 'Los Olivos',
    notes: 'Prefiere coordinar por WhatsApp luego de las 4 p.m.',
    operations: [
      { id: 'COT-204', type: 'Cotización', total: 'S/ 320.00', status: 'Pendiente', accent: 'violet' },
      { id: 'PED-1023', type: 'Pedido', total: 'S/ 150.00', status: 'En camino', accent: 'orange' },
    ],
  },
  {
    id: '2',
    name: 'Juan Pérez',
    phone: '912 345 678',
    district: 'Pueblo Libre',
    notes: 'Recojo en taller y suele confirmar con 48 horas de anticipacion.',
    operations: [
      { id: 'PED-1024', type: 'Pedido', total: 'S/ 210.00', status: 'Pendiente', accent: 'amber' },
    ],
  },
  {
    id: '3',
    name: 'Lucía Fernández',
    phone: '946 678 901',
    district: 'Surco',
    notes: 'Pide tortas personalizadas para eventos corporativos.',
    operations: [
      { id: 'PED-1025', type: 'Pedido', total: 'S/ 480.00', status: 'Confirmado', accent: 'emerald' },
      { id: 'COT-206', type: 'Cotización', total: 'S/ 290.00', status: 'Aprobada', accent: 'violet' },
    ],
  },
];

const statusStyles = {
  violet: { bg: 'bg-violet-50', text: 'text-violet-700' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
};

export default function ClienteDetalleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const client = useMemo(() => CLIENTS.find((item) => item.id === id) ?? CLIENTS[0], [id]);

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Ficha del cliente</Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/10">
            <Text className="text-lg font-bold text-white">{client.name.charAt(0)}</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
        <Animated.View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={sectionEntering(1)}>
          <Text className="text-2xl font-extrabold text-slate-800">{client.name}</Text>
          <Text className="mt-2 text-sm text-slate-500">{client.phone} · {client.district}</Text>
          <Text className="mt-4 text-sm leading-6 text-slate-600">{client.notes}</Text>

          <View className="mt-5 flex-row">
            <TouchableOpacity
              className="mr-3 rounded-2xl bg-violet-600 px-4 py-3"
              onPress={() => router.push({ pathname: '/(drawer)/(tabs)/clientes/form', params: { id: client.id } })}
            >
              <Text className="font-semibold text-white">Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
              <Text className="font-semibold text-rose-600">Eliminar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View className="mt-6 rounded-[28px] border border-slate-100 bg-slate-50 p-5" entering={sectionEntering(2)}>
          <Text className="text-lg font-bold text-slate-800">Resumen comercial</Text>
          <View className="mt-4 flex-row flex-wrap justify-between">
            <View className="mb-3 w-[48%] rounded-2xl border border-slate-100 bg-white p-4">
              <Text className="text-xs font-medium text-slate-500">Operaciones</Text>
              <Text className="mt-2 text-2xl font-bold text-slate-800">{client.operations.length}</Text>
            </View>
            <View className="mb-3 w-[48%] rounded-2xl border border-slate-100 bg-white p-4">
              <Text className="text-xs font-medium text-slate-500">Ultimo total</Text>
              <Text className="mt-2 text-2xl font-bold text-slate-800">{client.operations[0]?.total ?? 'S/ 0.00'}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View className="mt-6" entering={sectionEntering(3)}>
          <View className="mb-4 flex-row items-end justify-between">
            <Text className="text-lg font-bold text-slate-800">Operaciones asociadas</Text>
            <Text className="text-sm font-medium text-violet-600">Relacion cliente-operacion</Text>
          </View>

          {client.operations.map((operation) => {
            const styles = statusStyles[operation.accent as keyof typeof statusStyles];

            return (
              <View key={operation.id} className="mb-3 rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-base font-bold text-slate-800">{operation.id}</Text>
                    <Text className="mt-1 text-sm text-slate-500">{operation.type}</Text>
                  </View>
                  <View className={`rounded-full px-3 py-1.5 ${styles.bg}`}>
                    <Text className={`text-xs font-semibold ${styles.text}`}>{operation.status}</Text>
                  </View>
                </View>
                <Text className="mt-4 text-lg font-bold text-slate-800">{operation.total}</Text>
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}
