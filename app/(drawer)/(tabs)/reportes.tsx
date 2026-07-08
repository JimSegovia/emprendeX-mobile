import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Calendar, ChevronDown, Download, FileText, ArrowUp, ShoppingBag, ShoppingCart, Receipt, Users, Star, ChevronRight } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { useScrollToTopOnFocus } from '@/hooks/use-scroll-to-top';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const TABS = ['Resumen', 'Inventario', 'Ventas', 'Clientes', 'Financiero'];

const METRICS = [
  {
    id: '1',
    title: 'Ingresos',
    value: 'S/ 28,560',
    icon: ShoppingBag,
    iconColor: '#8B5CF6',
    iconBg: '#EDE9FE',
    growth: '+ 15.6%',
    compare: 'vs Abr 2025',
  },
  {
    id: '2',
    title: 'Ventas',
    value: '156',
    icon: ShoppingCart,
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
    growth: '+ 8.3%',
    compare: 'vs Abr 2025',
  },
  {
    id: '3',
    title: 'Ticket prom.',
    value: 'S/ 183.08',
    icon: Receipt,
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    growth: '+ 6.2%',
    compare: 'vs Abr 2025',
  },
  {
    id: '4',
    title: 'Clientes act.',
    value: '89',
    icon: Users,
    iconColor: '#3B82F6',
    iconBg: '#DBEAFE',
    growth: '+ 12.5%',
    compare: 'vs Abr 2025',
  },
];

const TOP_PRODUCTS = [
  { id: '1', name: 'Caf+® Molido Premium 250g', sales: 32, revenue: 'S/ 960.00', pct: 18.5, color: '#3b2f2f' },
  { id: '2', name: 'Az+¦car Blanca 1kg', sales: 28, revenue: 'S/ 784.00', pct: 15.1, color: '#f5f5dc' },
  { id: '3', name: 'Detergente L+¡quido 2L', sales: 22, revenue: 'S/ 660.00', pct: 12.7, color: '#0ea5e9' },
  { id: '4', name: 'Leche Entera 1L', sales: 18, revenue: 'S/ 540.00', pct: 10.4, color: '#e2e8f0' },
  { id: '5', name: 'Galletas Integrales 200g', sales: 16, revenue: 'S/ 448.00', pct: 8.6, color: '#8b4513' },
];

export default function ReportesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const mainScrollRef = useScrollToTopOnFocus();
  const { palette } = useAccountPreferences();

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <Animated.View className="flex-1 bg-slate-50" entering={screenEntering}>
      {/* Header */}
      <Animated.View
        style={{ paddingTop: Math.max(insets.top, 16), backgroundColor: palette.primary, zIndex: 10 }}
        entering={sectionEntering(0)}
        className="rounded-b-3xl"
      >
        <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={openDrawer} className="p-2 -ml-2 mr-2">
              <Menu color="white" size={24} />
            </TouchableOpacity>
            <View>
              <View className="flex-row items-center mb-1">
                <Text className="text-white text-xl font-bold mr-2">Reportes</Text>
                <View className="border border-white/40 rounded-full px-2 py-0.5">
                  <Text className="text-white text-[10px] font-bold">PRO</Text>
                </View>
              </View>
              <Text className="text-white/80 text-xs">Analiza el rendimiento de tu negocio</Text>
            </View>
          </View>
          <TouchableOpacity className="flex-row items-center border border-white/30 rounded-xl px-3 py-2">
            <Calendar color="white" size={16} />
            <Text className="text-white ml-2 text-sm font-medium">Filtros</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mt-2 bg-white rounded-t-3xl pt-2">
          {TABS.map((tab, idx) => (
            <TouchableOpacity key={tab} className={`mr-6 py-4 border-b-2 ${idx !== 0 ? 'border-transparent' : ''}`} style={idx === 0 ? { borderBottomColor: palette.primary } : {}}>
              <Text className={`font-semibold ${idx !== 0 ? 'text-slate-500' : ''}`} style={idx === 0 ? { color: palette.primary } : {}}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView
        ref={mainScrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 40) }}
      >
        <Animated.View className="px-4 pt-6" entering={sectionEntering(1)}>
          
          {/* Controls */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity className="flex-row items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm shadow-slate-100">
              <Calendar color="#64748b" size={20} />
              <View className="ml-3 mr-4">
                <Text className="text-sm font-semibold text-slate-800">Este mes</Text>
                <Text className="text-xs text-slate-500">1 - 31 May 2025</Text>
              </View>
              <ChevronDown color="#64748b" size={16} />
            </TouchableOpacity>
            
            <View className="flex-row">
              <TouchableOpacity className="flex-row items-center bg-white border border-rose-100 rounded-xl px-3 py-2 mr-2">
                <FileText color="#ef4444" size={16} />
                <Text className="ml-1 text-sm font-semibold text-slate-700">PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center bg-white border border-emerald-100 rounded-xl px-3 py-2">
                <FileText color="#10b981" size={16} />
                <Text className="ml-1 text-sm font-semibold text-slate-700">Excel</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Metrics Grid */}
          <View className="flex-row flex-wrap justify-between">
            {METRICS.map((item) => {
              const Icon = item.icon;
              return (
                <View key={item.id} className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm shadow-slate-100">
                  <Text className="text-sm text-slate-500 mb-2">{item.title}</Text>
                  <Text className="text-xl font-bold text-slate-800 mb-4">{item.value}</Text>
                  
                  <View className="absolute top-4 right-4 h-10 w-10 rounded-full items-center justify-center" style={{ backgroundColor: item.iconBg }}>
                    <Icon color={item.iconColor} size={20} />
                  </View>
                  
                  <View className="flex-row items-center">
                    <ArrowUp color="#10b981" size={14} />
                    <Text className="text-xs font-semibold text-emerald-500 ml-1 mr-1">{item.growth}</Text>
                    <Text className="text-[10px] text-slate-400">{item.compare}</Text>
                  </View>
                </View>
              )
            })}
          </View>

          {/* Charts Row */}
          <View className="flex-row justify-between mb-6">
            {/* Line Chart Mock */}
            <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xs font-semibold text-slate-800">Ingresos por d+¡a</Text>
                <View className="flex-row items-center bg-slate-50 px-2 py-1 rounded-lg">
                  <Text className="text-[10px] text-slate-500 mr-1">Ingresos</Text>
                  <ChevronDown color="#94a3b8" size={12} />
                </View>
              </View>
              
              <View className="h-32 w-full">
                <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={palette.primary} stopOpacity="0.2" />
                      <Stop offset="1" stopColor={palette.primary} stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  {/* Mock area */}
                  <Path d="M0,80 L10,75 L15,50 L20,60 L25,65 L30,55 L35,60 L40,50 L45,65 L50,60 L55,45 L60,55 L65,60 L70,55 L75,65 L80,50 L85,60 L90,45 L100,30 L100,100 L0,100 Z" fill="url(#grad)" />
                  {/* Mock line */}
                  <Path d="M0,80 L10,75 L15,50 L20,60 L25,65 L30,55 L35,60 L40,50 L45,65 L50,60 L55,45 L60,55 L65,60 L70,55 L75,65 L80,50 L85,60 L90,45 L100,30" fill="none" stroke={palette.primary} strokeWidth="2" strokeLinejoin="round" />
                  <Circle cx="100" cy="30" r="3" fill="white" stroke={palette.primary} strokeWidth="2" />
                </Svg>
                
                {/* Y Axis Mock */}
                <View className="absolute left-0 top-0 bottom-6 justify-between">
                  <Text className="text-[9px] text-slate-400">4K</Text>
                  <Text className="text-[9px] text-slate-400">3K</Text>
                  <Text className="text-[9px] text-slate-400">2K</Text>
                  <Text className="text-[9px] text-slate-400">1K</Text>
                  <Text className="text-[9px] text-slate-400">0</Text>
                </View>
                
                {/* X Axis Mock */}
                <View className="absolute left-4 right-0 bottom-0 flex-row justify-between pt-1">
                  <Text className="text-[9px] text-slate-400">1 May</Text>
                  <Text className="text-[9px] text-slate-400">15 May</Text>
                  <Text className="text-[9px] text-slate-400">31 May</Text>
                </View>
              </View>
            </View>

            {/* Donut Chart Mock */}
            <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
              <Text className="text-xs font-semibold text-slate-800 mb-4">Ventas por categor+¡a</Text>
              <View className="flex-row items-center">
                <View className="w-20 h-20 mr-2 relative justify-center items-center">
                  <Svg width="100%" height="100%" viewBox="0 0 100 100">
                    <Circle cx="50" cy="50" r="40" fill="none" stroke="#6366F1" strokeWidth="16" strokeDasharray="105 251" strokeDashoffset="0" />
                    <Circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="16" strokeDasharray="70 251" strokeDashoffset="-105" />
                    <Circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="16" strokeDasharray="45 251" strokeDashoffset="-175" />
                    <Circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="16" strokeDasharray="20 251" strokeDashoffset="-220" />
                    <Circle cx="50" cy="50" r="40" fill="none" stroke="#CBD5E1" strokeWidth="16" strokeDasharray="11 251" strokeDashoffset="-240" />
                  </Svg>
                  <View className="absolute items-center justify-center bg-white rounded-full h-[48px] w-[48px]">
                    <Text className="text-[9px] text-slate-500">Total</Text>
                    <Text className="text-sm font-bold text-slate-800 leading-tight">156</Text>
                    <Text className="text-[8px] text-slate-400">ventas</Text>
                  </View>
                </View>
                
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center"><View className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1"/><Text className="text-[9px] text-slate-600">Alimentos</Text></View>
                    <Text className="text-[9px] text-slate-800">42%</Text>
                  </View>
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center"><View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"/><Text className="text-[9px] text-slate-600">Bebidas</Text></View>
                    <Text className="text-[9px] text-slate-800">28%</Text>
                  </View>
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center"><View className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"/><Text className="text-[9px] text-slate-600">Limpieza</Text></View>
                    <Text className="text-[9px] text-slate-800">18%</Text>
                  </View>
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center"><View className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1"/><Text className="text-[9px] text-slate-600">Accesorios</Text></View>
                    <Text className="text-[9px] text-slate-800">8%</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center"><View className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1"/><Text className="text-[9px] text-slate-600">Otros</Text></View>
                    <Text className="text-[9px] text-slate-800">4%</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Top Products */}
          <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm shadow-slate-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-semibold text-slate-800">Productos m+ís vendidos</Text>
              <TouchableOpacity>
                <Text className="text-sm font-semibold" style={{ color: palette.primary }}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex-row border-b border-slate-100 pb-2 mb-3">
              <Text className="text-[10px] text-slate-400 w-6">#</Text>
              <Text className="text-[10px] text-slate-400 flex-1">Producto</Text>
              <Text className="text-[10px] text-slate-400 w-12 text-center">Ventas</Text>
              <Text className="text-[10px] text-slate-400 w-16 text-right mr-3">Ingresos</Text>
              <Text className="text-[10px] text-slate-400 w-16">% del total</Text>
            </View>
            
            {TOP_PRODUCTS.map((prod, idx) => (
              <View key={prod.id} className="flex-row items-center py-2">
                <Text className="text-xs font-medium text-slate-700 w-6">{idx + 1}</Text>
                <View className="flex-1 flex-row items-center">
                  <View className="h-8 w-8 rounded-lg mr-2 items-center justify-center" style={{ backgroundColor: prod.color + '40' }}>
                    <ShoppingBag size={14} color={prod.color} />
                  </View>
                  <Text className="text-[11px] font-medium text-slate-800 pr-2" numberOfLines={2}>{prod.name}</Text>
                </View>
                <Text className="text-[11px] font-medium text-slate-600 w-12 text-center">{prod.sales}</Text>
                <Text className="text-[11px] font-medium text-slate-800 w-16 text-right mr-3">{prod.revenue}</Text>
                <View className="w-16 flex-row items-center justify-between">
                  <Text className="text-[10px] text-slate-600 w-7">{prod.pct}%</Text>
                  <View className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-1">
                    <View className="h-full rounded-full" style={{ width: `${prod.pct}%`, backgroundColor: palette.primary }} />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* PRO Banner */}
          <View className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-row items-center">
            <View className="h-12 w-12 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: palette.primary }}>
              <Star color="white" size={24} />
            </View>
            <View className="flex-1">
              <Text className="font-bold mb-1" style={{ color: palette.primaryDark }}>Est+ís usando el plan PRO</Text>
              <Text className="text-slate-600 text-xs">Aprovecha al m+íximo tus reportes</Text>
            </View>
            <ChevronRight color={palette.primary} size={20} />
          </View>

        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
