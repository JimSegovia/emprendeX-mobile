import { Drawer } from 'expo-router/drawer';
import { usePathname, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AppSafeArea } from '@/components/AppSafeArea';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Crown, Lock } from 'lucide-react-native';
import Animated, { itemEntering, smoothLayout } from '@/components/ui/motion';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { useModulePreferences } from '@/lib/module-preferences-context';

function CustomDrawerContent(props: any) {
  const { navigation } = props;
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { authState } = useAuthSession();
  const { logoUrl, palette } = useAccountPreferences();
  const { modules: DRAWER_ITEMS, isModuleEnabled } = useModulePreferences();

  const displayName = authState
    ? `${authState.user.firstNames} ${authState.user.lastNames}`.trim()
    : 'EmprendeX';
  const accountLabel = authState?.user?.businessProfile?.name ?? authState?.user?.email ?? 'Sin sesión activa';
  const planName = authState?.user.activeSubscription?.planName ?? 'Sin plan';

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
      <View className="px-5 pb-6" style={{ paddingTop: insets.top + 28, backgroundColor: palette.primary }}>
        <View className="flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full border border-white/60">
            {logoUrl ? (
              <Image
                source={{ uri: logoUrl }}
                style={{ width: 44, height: 44, borderRadius: 999 }}
                contentFit="cover"
                accessibilityLabel="Logo del negocio"
              />
            ) : (
              <Text className="text-xl font-semibold text-white">
                {displayName.trim().charAt(0).toUpperCase() || 'E'}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-base font-semibold text-white">{displayName}</Text>
            <Text className="mt-1 text-sm font-medium" style={{ color: palette.primaryMutedText }}>
              {accountLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <ScrollView className="flex-1 px-3 py-4" showsVerticalScrollIndicator={false}>
        {DRAWER_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.match.includes('/')
            ? pathname === '/'
            : item.match.some((match) => pathname.startsWith(match));
          const isPremium = Boolean(item.premium);
          const isLocked = isPremium && !isModuleEnabled(item.id);
          const iconColor = isActive ? palette.primary : isPremium ? '#d97706' : '#475569';
          const textColor = isActive ? palette.primaryText : isPremium ? '#b45309' : '#334155';

          return (
            <Animated.View
              key={item.id}
              className="relative mb-1 overflow-hidden rounded-xl"
              entering={itemEntering(index)}
              layout={smoothLayout}
            >
              {isActive && (
                <Animated.View
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
                  style={{ backgroundColor: palette.primary }}
                  entering={itemEntering(0)}
                />
              )}
              <TouchableOpacity
                className="flex-row items-center py-3.5 px-4"
                style={{ backgroundColor: isActive ? palette.primarySoft : 'transparent' }}
                activeOpacity={0.75}
                onPress={() => {
                  if (isLocked) {
                    navigation.closeDrawer();
                    requestAnimationFrame(() => router.push('/(drawer)/(tabs)/plan-pro'));
                  } else {
                    navigateFromDrawer(item);
                  }
                }}
              >
                <Icon size={19} color={iconColor} />
                <Text className="ml-4 flex-1 text-[15px] font-semibold" style={{ color: textColor }}>
                  {item.label}
                </Text>
                {isLocked && !isActive && (
                  <View className="flex-row items-center rounded-full bg-amber-100 px-2 py-1">
                    <Lock size={12} color="#b45309" />
                    <Text className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      Pro
                    </Text>
                  </View>
                )}
                {isPremium && !isLocked && !isActive && (
                  <View className="rounded-full bg-amber-100 px-2.5 py-1">
                    <Text className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      Pro
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <AppSafeArea edges={['bottom']} className="bg-white px-4 pt-2 pb-4">
        <TouchableOpacity
          className="rounded-2xl px-4 py-4"
          style={{ backgroundColor: palette.primarySoft, borderColor: palette.primaryBorder, borderWidth: 1 }}
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
              <Text className="text-sm font-semibold text-slate-800">
                Tu plan: <Text style={{ color: palette.primaryText }}>{planName}</Text>
              </Text>
              <Text className="mt-1 text-xs text-slate-500">Explora funciones premium</Text>
            </View>
          </View>
        </TouchableOpacity>
      </AppSafeArea>
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
