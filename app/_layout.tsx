// Required by react-native-gesture-handler (used by draggable list).
// eslint-disable-next-line import/no-duplicates
import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, TextInput } from 'react-native';
// eslint-disable-next-line import/no-duplicates
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AccountPreferencesProvider } from '@/lib/account-preferences-context';
import { AuthSessionProvider } from '@/lib/auth-session-context';
import { ModulePreferencesProvider } from '@/lib/module-preferences-context';
import { NotificationProvider } from '@/lib/notifications/NotificationContext';
import { NotificationToast } from '@/components/ui/NotificationToast';

export const unstable_settings = {
  initialRouteName: 'index',
};

type ScalableTextComponent = {
  defaultProps?: {
    allowFontScaling?: boolean;
    maxFontSizeMultiplier?: number;
  };
};

const applyConsistentTextScaling = (component: ScalableTextComponent) => {
  component.defaultProps = {
    ...component.defaultProps,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };
};

applyConsistentTextScaling(Text as unknown as ScalableTextComponent);
applyConsistentTextScaling(TextInput as unknown as ScalableTextComponent);

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthSessionProvider>
          <AccountPreferencesProvider>
            <ModulePreferencesProvider>
              <NotificationProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: 'simple_push',
                    animationDuration: 260,
                    animationMatchesGesture: true,
                    contentStyle: { backgroundColor: '#ffffff' },
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                  }}
                >
                  <Stack.Screen name="index" options={{ animation: 'fade' }} />
                  <Stack.Screen
                    name="register"
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen
                    name="forgot-password"
                    options={{ animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="reset-password"
                    options={{ animation: 'slide_from_right' }}
                  />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="(drawer)" options={{ animation: 'fade' }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
                <NotificationToast />
                <StatusBar style="auto" />
              </NotificationProvider>
            </ModulePreferencesProvider>
          </AccountPreferencesProvider>
        </AuthSessionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
