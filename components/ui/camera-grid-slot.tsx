import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, RefreshCw } from 'lucide-react-native';

type CameraGridSlotProps = {
  onPhotoCapture: (uri: string) => void;
};

export function CameraGridSlot({ onPhotoCapture }: CameraGridSlotProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo?.uri) {
        onPhotoCapture(photo.uri);
      }
    } catch {
      // Capture failed silently
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, onPhotoCapture]);

  const toggleFacing = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  // Still loading permission state
  if (!permission) {
    return (
      <View className="flex-1 rounded-xl bg-slate-100 items-center justify-center">
        <ActivityIndicator size="small" color="#94a3b8" />
      </View>
    );
  }

  // Permission not granted — show fallback with request button
  if (!permission.granted) {
    return (
      <TouchableOpacity
        className="flex-1 rounded-xl bg-slate-100 items-center justify-center"
        activeOpacity={0.7}
        onPress={requestPermission}
      >
        <Camera size={32} color="#64748b" />
        <Text className="mt-2 text-xs font-medium text-slate-500 text-center px-2">
          Abrir cámara
        </Text>
      </TouchableOpacity>
    );
  }

  // Permission granted — show live camera preview
  return (
    <View className="flex-1 rounded-xl overflow-hidden bg-black">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1, width: '100%', height: '100%' }}
        facing={facing}
        mode="picture"
        autofocus="on"
      />

      {/* Capture area — transparent overlay on top of camera */}
      <TouchableOpacity
        className="absolute inset-0"
        activeOpacity={1}
        onPress={handleCapture}
      >
        {isCapturing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="white" size="small" />
          </View>
        ) : (
          <View className="flex-1 items-center justify-center">
            <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-white/60">
              <Camera size={30} color="white" />
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Flip camera button */}
      <TouchableOpacity
        className="absolute bottom-1.5 right-1.5 h-8 w-8 rounded-full bg-black/30 items-center justify-center"
        activeOpacity={0.7}
        onPress={toggleFacing}
      >
        <RefreshCw size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
}
