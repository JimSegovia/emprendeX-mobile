import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
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
      <Stack.Screen name="setup" />
      <Stack.Screen name="modules" />
    </Stack>
  );
}
