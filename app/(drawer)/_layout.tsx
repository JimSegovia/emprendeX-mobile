import { Drawer } from 'expo-router/drawer';
import { usePathname, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Users, Package, FileText, Calendar, FileSignature, CreditCard, BarChart2, Settings, Crown } from 'lucide-react-native';
import Animated, { itemEntering, smoothLayout } from '@/components/ui/motion';

function CustomDrawerContent(props: any) {
  const { navigation } = props;
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const DRAWER_ITEMS = [
    { label: 'Inicio', icon: Home, tab: 'index', match: ['/'] },
    { label: 'Operaciones', icon: FileText, tab: 'operaciones', match: ['/operaciones'] },
    { label: 'Clientes', icon: Users, tab: 'clientes', match: ['/clientes'] },
    { label: 'Productos / Servicios', icon: Package, tab: 'productos', match: ['/productos'] },
    { label: 'Calendario', icon: Calendar, tab: 'calendario', match: ['/calendario'] },
    { label: 'Cotizaciones', icon: FileSignature, tab: 'cotizaciones', match: ['/cotizaciones'] },
    { label: 'Pagos', icon: CreditCard, tab: 'pagos', match: ['/pagos'] },
    { label: 'Reportes', icon: BarChart2, tab: 'reportes', match: ['/reportes'], premium: true },
    { label: 'Configuración', icon: Settings, tab: 'configuracion', match: ['/configuracion'] },
  ];

  const navigateFromDrawer = (item: (typeof DRAWER_ITEMS)[number]) => {
    navigation.closeDrawer();
    requestAnimationFrame(() => {
      if (item.tab) {
        navigation.navigate('(tabs)', { screen: item.tab });
        return;
      }
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-violet-600 px-5 pb-6" style={{ paddingTop: insets.top + 28 }}>
        <View className="flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full border border-white/60">
            <Text className="text-xl font-bold text-white">A</Text>
          </View>

          <View className="flex-1">
            <Text className="text-base font-bold text-white">Ana López</Text>
            <Text className="mt-1 text-sm font-medium text-violet-100">Plan Gratis</Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <ScrollView className="flex-1 px-3 py-4" showsVerticalScrollIndicator={false}>
        {DRAWER_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.match.includes('/') ? pathname === '/' : item.match.some((match) => pathname.startsWith(match));
          const isPremium = Boolean(item.premium);
          const iconColor = isActive ? '#7c3aed' : isPremium ? '#d97706' : '#475569';
          const textColor = isActive ? 'text-violet-600' : isPremium ? 'text-amber-700' : 'text-slate-700';

          return (
            <Animated.View
              key={item.label}
              className="relative mb-1 overflow-hidden rounded-xl"
              entering={itemEntering(index)}
              layout={smoothLayout}
            >
              {isActive && <Animated.View className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-violet-500" entering={itemEntering(0)} />}
              <TouchableOpacity
                className={`flex-row items-center py-3.5 px-4 ${isActive ? 'bg-violet-50' : 'bg-transparent'}`}
                activeOpacity={0.75}
                onPress={() => navigateFromDrawer(item)}
              >
                <Icon size={19} color={iconColor} />
                <Text className={`ml-4 flex-1 text-[15px] font-semibold ${textColor}`}>
                  {item.label}
                </Text>
                {isPremium && !isActive && (
                  <View className="rounded-full bg-amber-100 px-2.5 py-1">
                    <Text className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Pro</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <SafeAreaView edges={['bottom']} className="bg-white px-4 pt-2 pb-4">
        <TouchableOpacity
          className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-4"
          onPress={() => {
            navigation.closeDrawer();
            requestAnimationFrame(() => router.push('/(drawer)/(tabs)/plan-pro'));
          }}
        >
          <View className="flex-row items-center">
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
              <Crown size={18} color="#f59e0b" />
            </View>

            <View className="flex-1">
              <Text className="text-sm font-bold text-slate-800">
                Tu plan: <Text className="text-violet-600">Gratis</Text>
              </Text>
              <Text className="mt-1 text-xs text-slate-500">Explora funciones premium</Text>
            </View>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        swipeEnabled: true,
        swipeEdgeWidth: 72,
        drawerStyle: {
          width: '82%',
          backgroundColor: '#ffffff',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          shadowColor: 'transparent',
          elevation: 0,
        },
        overlayColor: 'rgba(15, 23, 42, 0.28)',
        sceneStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
