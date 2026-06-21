import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Check } from 'lucide-react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

type GalleryThumbnailProps = {
  uri: string;
  isSelected: boolean;
  onToggle: (uri: string) => void;
};

export function GalleryThumbnail({ uri, isSelected, onToggle }: GalleryThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  return (
    <TouchableOpacity
      className="flex-1 aspect-square m-0.5 rounded-xl overflow-hidden bg-slate-100"
      activeOpacity={0.8}
      onPress={() => onToggle(uri)}
    >
      {!hasError ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={120}
          cachePolicy="memory-disk"
          recyclingKey={uri}
          onError={() => setHasError(true)}
        />
      ) : (
        <View className="flex-1 items-center justify-center bg-slate-200" />
      )}

      {isSelected && (
        <>
          <View className="absolute inset-0 rounded-xl border-2 border-emerald-500" />
          <Animated.View
            entering={ZoomIn.springify().damping(12)}
            exiting={FadeOut}
            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-emerald-500 items-center justify-center"
          >
            <Check size={14} color="white" strokeWidth={3} />
          </Animated.View>
        </>
      )}
    </TouchableOpacity>
  );
}
