import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Home, Users, Package, FileText, Calendar, Bell, 
  RefreshCw, FileSignature, CreditCard, BarChart2, Settings, ChevronDown, Crown
} from 'lucide-react-native';

function CustomDrawerContent(props: any) {
  const { navigation } = props;

  const DRAWER_ITEMS = [
    { label: 'Inicio', icon: Home, route: '(tabs)', active: true },
    { label: 'Clientes', icon: Users, route: 'clientes' },
    { label: 'Productos / Servicios', icon: Package, route: 'productos' },
    { label: 'Operaciones', icon: FileText, route: 'operaciones' },
    { label: 'Calendario', icon: Calendar, route: 'calendario' },
    { label: 'Alquileres', icon: Bell, route: 'alquileres' },
    { label: 'Suscripciones', icon: RefreshCw, route: 'suscripciones' },
    { label: 'Cotizaciones', icon: FileSignature, route: 'cotizaciones' },
    { label: 'Pagos', icon: CreditCard, route: 'pagos' },
    { label: 'Reportes', icon: BarChart2, route: 'reportes' },
    { label: 'Configuración', icon: Settings, route: 'configuracion' },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-violet-600 pt-16 pb-6 px-4 rounded-br-3xl">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full border border-white/50 items-center justify-center mr-3">
              <Text className="text-white text-xl font-bold">A</Text>
            </View>
            <View>
              <Text className="text-white font-bold text-lg">Ana López</Text>
              <Text className="text-violet-200 text-sm">Plan Pro</Text>
            </View>
          </View>
          <ChevronDown size={20} color="white" />
        </View>
      </View>

      {/* Body */}
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {DRAWER_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <TouchableOpacity 
              key={index}
              className={`flex-row items-center py-3.5 px-4 rounded-xl mb-1 ${isActive ? 'bg-violet-50' : 'bg-transparent'}`}
              onPress={() => {
                if (item.route === '(tabs)') {
                  navigation.navigate('(tabs)');
                } else {
                  // For now, close drawer on mock items
                  navigation.closeDrawer();
                }
              }}
            >
              <Icon size={22} color={isActive ? '#7c3aed' : '#64748b'} />
              <Text className={`ml-4 font-medium text-base ${isActive ? 'text-violet-600' : 'text-slate-600'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <SafeAreaView edges={['bottom']} className="p-4 bg-white border-t border-slate-100">
        <View className="flex-row items-center bg-violet-50 p-4 rounded-2xl">
          <Crown size={24} color="#f59e0b" className="mr-3" />
          <View>
            <Text className="text-violet-900 font-bold text-sm">Tu plan: Pro</Text>
            <Text className="text-violet-600 text-xs">Vence el 20/06/2024</Text>
          </View>
        </View>
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
        drawerStyle: { width: '85%' }
      }}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
