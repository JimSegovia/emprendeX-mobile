import Animated, { sectionEntering } from '@/components/ui/motion';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useModulePreferences } from '@/lib/module-preferences-context';
import { useNotifications } from '@/lib/notifications/NotificationContext';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  Calendar,
  ChevronRight,
  Info,
  Mail,
  ShoppingBag,
  Smartphone,
  Tag,
} from 'lucide-react-native';
import React from 'react';
import {
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ConfiguracionNotificacionesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { palette } = useAccountPreferences();
  const { isModuleEnabled } = useModulePreferences();
  const { settings, updateSettings } = useNotifications();

  const handleToggleGeneral = (value: boolean) => {
    updateSettings({
      ...settings,
      general: value,
    });
  };

  const handleToggleCategory = (categoryKey: keyof typeof settings.categories, value: boolean) => {
    updateSettings({
      ...settings,
      categories: {
        ...settings.categories,
        [categoryKey]: value,
      },
    });
  };

  const handleToggleChannel = (channelKey: keyof typeof settings.channels, value: boolean) => {
    updateSettings({
      ...settings,
      channels: {
        ...settings.channels,
        [channelKey]: value,
      },
    });
  };

  // Mapear categorías según los módulos instalados/activos del usuario
  const availableCategories = [
    {
      key: 'pedidos' as const,
      label: 'Pedidos',
      detail: 'Notificaciones sobre nuevos pedidos, cambios de estado y entregas',
      icon: <ShoppingBag size={20} color="#10b981" />,
      bg: 'bg-emerald-50',
      module: 'operaciones' as const,
    },
    {
      key: 'pagos' as const,
      label: 'Pagos',
      detail: 'Confirmaciones de pago, cobros recibidos y pagos vencidos',
      icon: <Text className="text-lg font-bold text-[#10b981]">$</Text>,
      bg: 'bg-emerald-50',
      module: 'contabilidad' as const,
    },
    {
      key: 'recordatorios' as const,
      label: 'Recordatorios',
      detail: 'Recordatorios de actividad, tareas pendientes y seguimientos',
      icon: <Bell size={20} color="#f59e0b" />,
      bg: 'bg-amber-50',
      module: 'alertas-pro' as const,
    },
    {
      key: 'promociones' as const,
      label: 'Promociones',
      detail: 'Ofertas, descuentos y novedades de la app',
      icon: <Tag size={20} color={palette.primary} />,
      bg: 'bg-indigo-50',
      module: 'catalogo' as const,
    },
    {
      key: 'calendario' as const,
      label: 'Calendario',
      detail: 'Eventos próximos, citas y reuniones programadas',
      icon: <Calendar size={20} color="#3b82f6" />,
      bg: 'bg-blue-50',
      module: 'calendario' as const,
    },
  ].filter((cat) => isModuleEnabled(cat.module));

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <Animated.View
        className="px-4 pb-6"
        style={{
          paddingTop: Math.max(insets.top, 16) + 16,
          backgroundColor: palette.primary,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">Configuración de notificaciones</Text>
              <Text className="text-white/80 text-xs mt-1">Elige qué notificaciones quieres recibir</Text>
            </View>
          </View>
          <View
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            <Bell size={20} color="white" />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
      >
        {/* Notificaciones Generales */}
        <Animated.View
          className="mb-6 rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/50 flex-row items-center justify-between"
          entering={sectionEntering(1)}
        >
          <View className="flex-row items-center flex-1 mr-4">
            <View
              className="mr-4 h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: palette.primarySoft }}
            >
              <Bell size={22} color={palette.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-slate-800">Notificaciones generales</Text>
              <Text className="mt-1 text-xs text-slate-500 leading-4">
                Activa o desactiva todas las notificaciones
              </Text>
            </View>
          </View>
          <Switch
            value={settings.general}
            onValueChange={handleToggleGeneral}
            trackColor={{ false: '#e2e8f0', true: palette.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : '#ffffff'}
            ios_backgroundColor="#e2e8f0"
          />
        </Animated.View>

        {/* Preferencias por categoría */}
        {availableCategories.length > 0 && (
          <Animated.View className="mb-6" entering={sectionEntering(2)}>
            <Text className="text-sm font-bold text-slate-500 mb-3 px-1">Preferencias por categoría</Text>
            
            <View className="rounded-[24px] border border-slate-100 bg-white overflow-hidden shadow-sm shadow-slate-100/50">
              {availableCategories.map((cat, index) => {
                const isLast = index === availableCategories.length - 1;
                return (
                  <View
                    key={cat.key}
                    className={`p-4 flex-row items-center ${isLast ? '' : 'border-b border-slate-100'}`}
                  >
                    <View className={`mr-3 h-10 w-10 items-center justify-center rounded-xl ${cat.bg}`}>
                      {cat.icon}
                    </View>
                    <View className="flex-1 mr-2">
                      <Text className="text-sm font-bold text-slate-800">{cat.label}</Text>
                      <Text className="text-[11px] text-slate-500 leading-4 mt-0.5">
                        {cat.detail}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Switch
                        value={settings.general && settings.categories[cat.key]}
                        disabled={!settings.general}
                        onValueChange={(val) => handleToggleCategory(cat.key, val)}
                        trackColor={{ false: '#e2e8f0', true: palette.primary }}
                        thumbColor={Platform.OS === 'ios' ? undefined : '#ffffff'}
                        ios_backgroundColor="#e2e8f0"
                      />
                      <ChevronRight size={16} color="#94a3b8" />
                    </View>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Canales de notificación */}
        <Animated.View className="mb-6" entering={sectionEntering(3)}>
          <Text className="text-sm font-bold text-slate-500 mb-3 px-1">Canales de notificación</Text>

          <View className="rounded-[24px] border border-slate-100 bg-white overflow-hidden shadow-sm shadow-slate-100/50">
            {/* Push */}
            <View className="p-4 flex-row items-center border-b border-slate-100">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                <Smartphone size={20} color={palette.primary} />
              </View>
              <View className="flex-1 mr-2">
                <Text className="text-sm font-bold text-slate-800">Notificaciones push</Text>
                <Text className="text-[11px] text-slate-500 leading-4 mt-0.5">
                  Recibe notificaciones en tu dispositivo
                </Text>
              </View>
              <Switch
                value={settings.general && settings.channels.push}
                disabled={!settings.general}
                onValueChange={(val) => handleToggleChannel('push', val)}
                trackColor={{ false: '#e2e8f0', true: palette.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : '#ffffff'}
                ios_backgroundColor="#e2e8f0"
              />
            </View>

            {/* Email */}
            <View className="p-4 flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                <Mail size={20} color={palette.primary} />
              </View>
              <View className="flex-1 mr-2">
                <Text className="text-sm font-bold text-slate-800">Correo electrónico</Text>
                <Text className="text-[11px] text-slate-500 leading-4 mt-0.5">
                  Recibe resúmenes y alertas por email
                </Text>
              </View>
              <Switch
                value={settings.general && settings.channels.email}
                disabled={!settings.general}
                onValueChange={(val) => handleToggleChannel('email', val)}
                trackColor={{ false: '#e2e8f0', true: palette.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : '#ffffff'}
                ios_backgroundColor="#e2e8f0"
              />
            </View>
          </View>
        </Animated.View>

        {/* Footer Info */}
        <Animated.View
          className="rounded-2xl flex-row items-start p-4"
          style={{ backgroundColor: palette.primarySoft }}
          entering={sectionEntering(4)}
        >
          <Info size={18} color={palette.primary} className="mr-3 mt-0.5" />
          <View className="flex-1">
            <Text className="text-xs font-semibold leading-5" style={{ color: palette.primaryText }}>
              Los cambios se guardan automáticamente.
            </Text>
            <Text className="text-xs leading-5 mt-0.5" style={{ color: palette.primaryText, opacity: 0.8 }}>
              Solo recibirás notificaciones de las categorías activadas.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
