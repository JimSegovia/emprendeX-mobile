// Required by react-native-gesture-handler (used by draggable list).
// eslint-disable-next-line import/no-duplicates
import 'react-native-gesture-handler';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TextInput } from "react-native";
// eslint-disable-next-line import/no-duplicates
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { ModulePreferencesProvider } from '@/lib/module-preferences-context';

export const unstable_settings = {
  initialRouteName: "index",
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
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <ModulePreferencesProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              contentStyle: { backgroundColor: "#ffffff" },
              gestureEnabled: true,
              fullScreenGestureEnabled: true,
            }}
          >
            <Stack.Screen name="index" options={{ animation: "fade" }} />
            <Stack.Screen
              name="register"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="onboarding" options={{ animation: "fade_from_bottom" }} />
            <Stack.Screen name="(drawer)" options={{ animation: "fade" }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ModulePreferencesProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
