import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Home, FileText, Plus, Settings, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarAllowFontScaling: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        animation: 'shift',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          height: 76 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 10,
        },
        tabBarItemStyle: {
          height: 58,
          paddingVertical: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          lineHeight: 14,
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="operaciones"
        options={{
          title: 'Operaciones',
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fab"
        options={{
          title: '',
          tabBarIcon: () => (
            <View className="h-14 w-14 items-center justify-center rounded-full bg-violet-600 -mt-4 border-4 border-white shadow-sm shadow-violet-200">
              <Plus size={26} color="white" />
            </View>
          ),
          tabBarButton: (props: any) => (
            <TouchableOpacity 
              {...props} 
              activeOpacity={0.8}
              style={[props.style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
              onPress={() => router.push('/(drawer)/(tabs)/operaciones/nueva')}
            />
          )
        }}
      />
      <Tabs.Screen
        name="productos"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="productos/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="productos/nuevo"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cotizaciones"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="pagos"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="reportes"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="configuracion"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan-pro"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
