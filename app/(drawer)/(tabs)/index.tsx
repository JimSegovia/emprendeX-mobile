import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { 
  Menu, Search, Bell, ArrowUpRight, FileText, UserPlus, Calendar, PlusSquare
} from 'lucide-react-native';

export default function DashboardScreen() {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-violet-600">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={openDrawer} className="mr-4">
            <Menu size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row items-baseline">
            <Text className="text-2xl font-bold text-white tracking-tight">Emprende</Text>
            <Text className="text-3xl font-extrabold text-violet-200 italic -ml-0.5">X</Text>
          </View>
        </View>
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity className="mr-3">
            <Search size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="relative">
            <Bell size={22} color="white" />
            <View className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full border-2 border-violet-600" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-extrabold text-slate-800 mb-1">¡Hola, Ana! 👋</Text>
          <Text className="text-slate-500 text-base">Resumen de hoy</Text>
        </View>

        {/* Stats Grid */}
        <View className="px-6 flex-row flex-wrap justify-between">
          {/* Venta del dia */}
          <View className="w-[48%] bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm shadow-slate-100">
            <Text className="text-slate-500 font-medium text-xs mb-2">Ventas del día</Text>
            <Text className="text-2xl font-bold text-slate-800 mb-2">S/ 1,250.00</Text>
            <View className="flex-row items-center">
              <ArrowUpRight size={14} color="#10b981" />
              <Text className="text-emerald-500 font-semibold text-xs ml-1">18% vs ayer</Text>
            </View>
          </View>

          {/* Pedidos */}
          <View className="w-[48%] bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm shadow-slate-100">
            <Text className="text-slate-500 font-medium text-xs mb-2">Pedidos</Text>
            <Text className="text-2xl font-bold text-slate-800 mb-2">12</Text>
            <Text className="text-violet-600 font-semibold text-xs">3 pendientes</Text>
          </View>

          {/* Cobros pendientes */}
          <View className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
            <Text className="text-slate-500 font-medium text-xs mb-2">Cobros pendientes</Text>
            <Text className="text-2xl font-bold text-slate-800 mb-2">S/ 350.00</Text>
          </View>

          {/* Clientes nuevos */}
          <View className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
            <Text className="text-slate-500 font-medium text-xs mb-2">Clientes nuevos</Text>
            <Text className="text-2xl font-bold text-slate-800 mb-2">5</Text>
            <View className="flex-row items-center">
              <ArrowUpRight size={14} color="#10b981" />
              <Text className="text-emerald-500 font-semibold text-xs ml-1">2 vs ayer</Text>
            </View>
          </View>
        </View>

        {/* Próximas entregas */}
        <View className="px-6 mt-8 mb-4">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-lg font-bold text-slate-800">Próximas entregas</Text>
            <TouchableOpacity>
              <Text className="text-violet-600 font-medium text-sm">Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 overflow-hidden">
            {/* Pedido 1 */}
            <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
              <View>
                <Text className="font-bold text-slate-800 mb-0.5">Pedido #1023</Text>
                <Text className="text-slate-500 text-xs">María López</Text>
              </View>
              <View className="items-end">
                <Text className="text-slate-400 text-xs mb-1.5">Hoy, 2:00 p.m.</Text>
                <View className="bg-orange-50 px-2.5 py-1 rounded-md">
                  <Text className="text-orange-500 font-semibold text-xs">En camino</Text>
                </View>
              </View>
            </View>

            {/* Pedido 2 */}
            <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
              <View>
                <Text className="font-bold text-slate-800 mb-0.5">Pedido #1024</Text>
                <Text className="text-slate-500 text-xs">Juan Pérez</Text>
              </View>
              <View className="items-end">
                <Text className="text-slate-400 text-xs mb-1.5">Hoy, 4:00 p.m.</Text>
                <View className="bg-amber-50 px-2.5 py-1 rounded-md">
                  <Text className="text-amber-500 font-semibold text-xs">Pendiente</Text>
                </View>
              </View>
            </View>

            {/* Pedido 3 */}
            <View className="flex-row items-center justify-between p-4">
              <View>
                <Text className="font-bold text-slate-800 mb-0.5">Pedido #1025</Text>
                <Text className="text-slate-500 text-xs">Lucía Fernández</Text>
              </View>
              <View className="items-end">
                <Text className="text-slate-400 text-xs mb-1.5">Mañana, 10:00 a.m.</Text>
                <View className="bg-emerald-50 px-2.5 py-1 rounded-md">
                  <Text className="text-emerald-500 font-semibold text-xs">Confirmado</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View className="mt-4 mb-10">
          <Text className="px-6 text-lg font-bold text-slate-800 mb-4">Acciones rápidas</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            <TouchableOpacity className="bg-white p-4 rounded-2xl items-center justify-center border border-slate-100 shadow-sm shadow-slate-100 w-[100px] h-[100px]">
              <View className="bg-violet-50 p-2 rounded-lg mb-2">
                <PlusSquare size={24} color="#7c3aed" />
              </View>
              <Text className="text-slate-600 font-medium text-xs text-center leading-tight">Nuevo{'\n'}pedido</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white p-4 rounded-2xl items-center justify-center border border-slate-100 shadow-sm shadow-slate-100 w-[100px] h-[100px]">
              <View className="bg-violet-50 p-2 rounded-lg mb-2">
                <FileText size={24} color="#7c3aed" />
              </View>
              <Text className="text-slate-600 font-medium text-xs text-center leading-tight">Nueva{'\n'}cotización</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white p-4 rounded-2xl items-center justify-center border border-slate-100 shadow-sm shadow-slate-100 w-[100px] h-[100px]">
              <View className="bg-violet-50 p-2 rounded-lg mb-2">
                <UserPlus size={24} color="#7c3aed" />
              </View>
              <Text className="text-slate-600 font-medium text-xs text-center leading-tight">Nuevo{'\n'}cliente</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white p-4 rounded-2xl items-center justify-center border border-slate-100 shadow-sm shadow-slate-100 w-[100px] h-[100px]">
              <View className="bg-violet-50 p-2 rounded-lg mb-2">
                <Calendar size={24} color="#7c3aed" />
              </View>
              <Text className="text-slate-600 font-medium text-xs text-center leading-tight">Ver{'\n'}calendario</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
