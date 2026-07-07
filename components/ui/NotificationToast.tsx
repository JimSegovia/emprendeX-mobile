import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, Info, AlertTriangle, AlertCircle, X } from 'lucide-react-native';
import { useNotifications } from '../../lib/notifications/NotificationContext';
import { NotificationType } from '../../lib/notifications/types';

const ToastIcons: Record<NotificationType, React.FC<any>> = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

const ToastColors: Record<NotificationType, { bg: string; text: string; icon: string }> = {
  success: { bg: 'bg-green-50', text: 'text-green-900', icon: '#16a34a' },
  info: { bg: 'bg-indigo-50', text: 'text-indigo-900', icon: '#4f46e5' },
  warning: { bg: 'bg-orange-50', text: 'text-orange-900', icon: '#ea580c' },
  error: { bg: 'bg-red-50', text: 'text-red-900', icon: '#dc2626' },
};

export const NotificationToast = () => {
  const { activeToast, hideToast } = useNotifications();
  const insets = useSafeAreaInsets();
  
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (activeToast) {
      translateY.value = withSpring(insets.top > 0 ? insets.top + 10 : 20, {
        damping: 15,
        stiffness: 100,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [activeToast, insets.top, translateY, opacity]);

  const handleClose = () => {
    translateY.value = withTiming(-100, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(hideToast)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!activeToast) return null;

  const Icon = ToastIcons[activeToast.type];
  const colors = ToastColors[activeToast.type];

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
      ]}
      className="absolute left-4 right-4 z-50 flex-row items-start rounded-xl p-4 shadow-md border border-gray-100"
    >
      <View className={`absolute inset-0 rounded-xl ${colors.bg}`} style={{ opacity: 0.9 }} />
      
      <View className="mr-3 mt-0.5 z-10">
        <Icon size={24} color={colors.icon} />
      </View>
      
      <View className="flex-1 z-10 mr-2">
        <Text className={`font-semibold text-base mb-1 ${colors.text}`}>
          {activeToast.title}
        </Text>
        <Text className={`text-sm ${colors.text}`} style={{ opacity: 0.8 }}>
          {activeToast.message}
        </Text>
      </View>
      
      <TouchableOpacity onPress={handleClose} className="z-10 p-1">
        <X size={20} color={colors.icon} style={{ opacity: 0.5 }} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Elevación para Android
    elevation: 4,
  },
});
