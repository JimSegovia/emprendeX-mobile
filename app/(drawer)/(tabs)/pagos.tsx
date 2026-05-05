import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, Menu, Plus } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { screenEntering, sectionEntering, itemEntering } from '@/components/ui/motion';

const payments = [
  {
    id: 'PAG-301',
    order: 'PED-1023',
    client: 'Maria López',
    paid: 'S/ 80.00',
    balance: 'S/ 70.00',
    type: 'Adelanto',
    accent: 'amber',
  },
  {
    id: 'PAG-302',
    order: 'PED-1024',
    client: 'Juan Pérez',
    paid: 'S/ 210.00',
    balance: 'S/ 0.00',
    type: 'Cancelado',
    accent: 'emerald',
  },
  {
    id: 'PAG-303',
    order: 'PED-1025',
    client: 'Lucía Fernández',
    paid: 'S/ 150.00',
    balance: 'S/ 330.00',
    type: 'Parcial',
    accent: 'violet',
  },
];

const paymentStyles = {
  amber: { bg: 'bg-amber-50', text: 'text-amber-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700' },
};

export default function PagosScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

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
            <Text className="text-white text-xl font-bold">Pagos</Text>
          </View>
          <TouchableOpacity className="flex-row items-center rounded-2xl bg-white/15 px-4 py-3">
            <Plus size={16} color="white" />
            <Text className="ml-2 font-semibold text-white">Nuevo</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
        <Animated.View className="mb-6 flex-row flex-wrap justify-between" entering={sectionEntering(1)}>
          <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
            <Text className="text-xs font-medium text-slate-500">Cobrado hoy</Text>
            <Text className="mt-2 text-2xl font-extrabold text-slate-800">S/ 440.00</Text>
          </View>
          <View className="mb-3 w-[48%] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
            <Text className="text-xs font-medium text-slate-500">Pendiente</Text>
            <Text className="mt-2 text-2xl font-extrabold text-slate-800">S/ 400.00</Text>
          </View>
        </Animated.View>

        {payments.map((payment, index) => {
          const styles = paymentStyles[payment.accent as keyof typeof paymentStyles];

          return (
            <Animated.View key={payment.id} className="mb-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={itemEntering(index + 1)}>
              <View className="flex-row items-start justify-between">
                <View className="mr-4 flex-1">
                  <Text className="text-lg font-bold text-slate-800">{payment.order}</Text>
                  <Text className="mt-1 text-sm text-slate-500">{payment.client}</Text>
                </View>
                <View className={`rounded-full px-3 py-1.5 ${styles.bg}`}>
                  <Text className={`text-xs font-semibold ${styles.text}`}>{payment.type}</Text>
                </View>
              </View>

              <View className="mt-4 rounded-2xl bg-slate-50 p-4">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-slate-500">Monto registrado</Text>
                  <Text className="font-semibold text-slate-800">{payment.paid}</Text>
                </View>
                <View className="mt-3 flex-row justify-between">
                  <Text className="text-sm text-slate-500">Saldo restante</Text>
                  <Text className="font-semibold text-slate-800">{payment.balance}</Text>
                </View>
              </View>

              <View className="mt-4 flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">Referencia {payment.id}</Text>
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-violet-50">
                  <CreditCard size={18} color="#7c3aed" />
                </View>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}
