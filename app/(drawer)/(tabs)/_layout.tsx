import { HapticTab } from '@/components/haptic-tab';
import { BlurView } from 'expo-blur';
import { Tabs, usePathname, useRouter } from 'expo-router';
import {
  CreditCard,
  FilePlus,
  FileText,
  Home,
  PackagePlus,
  Plus,
  Settings,
  Users,
  X,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveModuleIdFromPathname } from '@/lib/modules';
import { useModulePreferences } from '@/lib/module-preferences-context';

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const { isModuleEnabled } = useModulePreferences();

  const isOperationsEnabled = isModuleEnabled('operaciones');
  const isClientsEnabled = isModuleEnabled('clientes');

  const [fabOpen, setFabOpen] = useState(false);
  const tabBarHeight = 76 + bottomInset;
  const fabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const protectedModuleId = resolveModuleIdFromPathname(pathname);

    if (!protectedModuleId) {
      return;
    }

    if (!isModuleEnabled(protectedModuleId)) {
      router.replace('/(drawer)/(tabs)');
    }
  }, [isModuleEnabled, pathname, router]);

  useEffect(() => {
    Animated.spring(fabAnim, {
      toValue: fabOpen ? 1 : 0,
      useNativeDriver: true,
      damping: 14,
      stiffness: 140,
      mass: 0.8,
    }).start();
  }, [fabAnim, fabOpen]);

  const fabActions = [
    {
      label: 'Cotiza',
      icon: <FilePlus size={20} color="#0f172a" />,
      onPress: () => router.push('/(drawer)/(tabs)/operaciones/nueva'),
      offset: { x: -58, y: -42 }, // Más bajo y armónico en arco
    },
    {
      label: 'Pago',
      icon: <CreditCard size={20} color="#0f172a" />,
      onPress: () => router.push('/(drawer)/(tabs)/pagos/nuevo'),
      offset: { x: 0, y: -62 },   // Más bajo
    },
    {
      label: 'Gasto',
      icon: <PackagePlus size={20} color="#0f172a" />,
      onPress: () => { },
      offset: { x: 58, y: -42 },  // Más bajo y armónico en arco
    },
  ];

  return (
    <View style={styles.root}>
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
            height: tabBarHeight,
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
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => <Home size={22} color={color} />,
          }}
          listeners={{
            tabPress: () => setFabOpen(false),
          }}
        />
        <Tabs.Screen
          name="operaciones"
          options={{
            title: 'Operaciones',
            href: isOperationsEnabled ? undefined : null,
            tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
          }}
          listeners={{
            tabPress: () => setFabOpen(false),
          }}
        />
        <Tabs.Screen
          name="fab"
          options={{
            title: '',
            href: isOperationsEnabled ? undefined : null,
            tabBarIcon: () => (
              <View
                className="h-14 w-14 items-center justify-center rounded-full bg-violet-600 -mt-4 border-4 border-white shadow-sm shadow-violet-200"
                style={fabOpen ? styles.fabActive : undefined}
              >
                {fabOpen ? <X size={22} color="white" /> : <Plus size={26} color="white" />}
              </View>
            ),
            tabBarButton: isOperationsEnabled
              ? (props: any) => (
                  <TouchableOpacity
                    {...props}
                    activeOpacity={0.8}
                    style={[props.style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
                    onPress={() => setFabOpen((prev) => !prev)}
                  />
                )
              : () => null,
          }}
          listeners={{
            tabPress: (event) => {
              event.preventDefault();
              setFabOpen((prev) => !prev);
            },
          }}
        />
        <Tabs.Screen name="productos" options={{ href: null }} />
        <Tabs.Screen name="productos/[id]" options={{ href: null }} />
        <Tabs.Screen name="productos/nuevo" options={{ href: null }} />
        <Tabs.Screen name="calendario" options={{ href: null }} />
        <Tabs.Screen name="cotizaciones" options={{ href: null }} />
        <Tabs.Screen name="pagos" options={{ href: null }} />
        <Tabs.Screen name="pagos/nuevo" options={{ href: null }} />
        <Tabs.Screen name="reportes" options={{ href: null }} />
        <Tabs.Screen
          name="clientes"
          options={{
            title: 'Clientes',
            href: isClientsEnabled ? undefined : null,
            tabBarIcon: ({ color }) => <Users size={22} color={color} />,
          }}
          listeners={{
            tabPress: () => setFabOpen(false),
          }}
        />
        <Tabs.Screen
          name="configuracion"
          options={{
            title: 'Cuenta',
            tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
          }}
          listeners={{
            tabPress: () => setFabOpen(false),
          }}
        />
        <Tabs.Screen name="plan-pro" options={{ href: null }} />
      </Tabs>
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <Animated.View
          pointerEvents={fabOpen ? 'auto' : 'none'}
          style={[
            styles.backdrop,
            {
              bottom: tabBarHeight,
              opacity: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
            },
          ]}
        >
          <BlurView
            intensity={28}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setFabOpen(false)} />
          </BlurView>
        </Animated.View>
        <View pointerEvents="box-none" style={[styles.fabAnchor, { bottom: tabBarHeight + 4 }]}>
          {fabActions.map((action) => {
            const translateX = fabAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, action.offset.x],
            });
            const translateY = fabAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, action.offset.y],
            });
            const scale = fabAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 1],
            });

            return (
              <Animated.View
                key={action.label}
                style={[
                  styles.fabItem,
                  {
                    opacity: fabAnim,
                    transform: [{ translateX }, { translateY }, { scale }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.fabItemButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    setFabOpen(false);
                    action.onPress();
                  }}
                >
                  <View style={styles.fabIcon}>{action.icon}</View>
                  <Text style={styles.fabLabel}>{action.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  fabActive: {
    transform: [{ rotate: '45deg' }],
  },
  fabAnchor: {
    position: 'absolute',
    left: '50%',
    marginLeft: -1,
    width: 2,
    height: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabItemButton: {
    alignItems: 'center',
  },
  fabIcon: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabLabel: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
    paddingHorizontal: 6,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
