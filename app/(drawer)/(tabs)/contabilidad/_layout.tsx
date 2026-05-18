import { Stack } from 'expo-router';

export default function ContabilidadLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#ffffff' },
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="nuevo" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
