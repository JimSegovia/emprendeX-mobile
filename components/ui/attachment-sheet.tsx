import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, RefreshCw, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { GalleryThumbnail } from './gallery-thumbnail';
import { useAttachment } from '@/hooks/use-attachment';
import { useAccountPreferences } from '@/lib/account-preferences-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const ITEM_SPACING = 4;
const GRID_PADDING = 16;
const ITEM_SIZE =
  (SCREEN_WIDTH - GRID_PADDING * 2 - ITEM_SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const CAMERA_HEIGHT = 200;

type GridItem = { type: 'photo'; id: string; uri: string };

type AttachmentSheetProps = {
  visible: boolean;
  onClose: () => void;
  onAttach: (uris: string[]) => void;
};

export function AttachmentSheet({ visible, onClose, onAttach }: AttachmentSheetProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAccountPreferences();
  const {
    recentPhotos,
    isLoadingGallery,
    hasMore,
    loadRecentPhotos,
    loadMorePhotos,
    resetGallery,
  } = useAttachment();

  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [fullscreenCamera, setFullscreenCamera] = useState(false);
  const fullCameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedUri(null);
      resetGallery();
      loadRecentPhotos();
    }
  }, [visible, resetGallery, loadRecentPhotos]);

  const handleSelectImage = useCallback((uri: string) => {
    setSelectedUri((prev) => (prev === uri ? null : uri));
  }, []);

  const handlePhotoCapture = useCallback((uri: string) => {
    setSelectedUri(uri);
  }, []);

  const handleAttach = useCallback(() => {
    if (selectedUri) {
      onAttach([selectedUri]);
    }
    onClose();
  }, [selectedUri, onAttach, onClose]);

  const handleClose = useCallback(() => {
    setSelectedUri(null);
    onClose();
  }, [onClose]);

  const gridData: GridItem[] = useMemo(
    () =>
      recentPhotos.map((asset) => ({
        type: 'photo' as const,
        id: asset.id,
        uri: asset.uri,
      })),
    [recentPhotos],
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingGallery) {
      loadMorePhotos();
    }
  }, [hasMore, isLoadingGallery, loadMorePhotos]);

  const renderGalleryFooter = useCallback(
    () =>
      isLoadingGallery ? (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color={palette.primary} />
        </View>
      ) : null,
    [isLoadingGallery, palette.primary],
  );

  const openFullscreenCamera = useCallback(() => {
    setFacing('back');
    setFullscreenCamera(true);
  }, []);

  const closeFullscreenCamera = useCallback(() => {
    setFullscreenCamera(false);
  }, []);

  const captureFullscreen = useCallback(async () => {
    if (!fullCameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await fullCameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        handlePhotoCapture(photo.uri);
        setFullscreenCamera(false);
      }
    } catch {
      // silent
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, handlePhotoCapture]);

  const toggleFacing = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  const handleRequestCameraPermission = useCallback(async () => {
    const result = await requestCameraPermission();
    if (result?.granted) {
      setFullscreenCamera(true);
    }
  }, [requestCameraPermission]);

  const hasSelection = selectedUri !== null;
  const hasCameraPermission = cameraPermission?.granted;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
        className="flex-1 justify-end bg-black/40"
      >
        <View
          className="bg-white rounded-t-3xl overflow-hidden"
          style={{ maxHeight: '85%', paddingBottom: insets.bottom }}
        >
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <Text className="text-lg font-semibold text-slate-800">Adjuntar imagen</Text>
            <TouchableOpacity
              onPress={handleClose}
              className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
            >
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="mx-4 mt-3 rounded-2xl overflow-hidden bg-black"
            style={{ height: CAMERA_HEIGHT }}
            activeOpacity={0.9}
            onPress={hasCameraPermission ? openFullscreenCamera : handleRequestCameraPermission}
          >
            {hasCameraPermission ? (
              <CameraView
                style={{ flex: 1 }}
                facing={facing}
                mode="picture"
                autofocus="on"
              />
            ) : (
              <View className="flex-1 rounded-2xl bg-slate-100 items-center justify-center">
                <Camera size={32} color="#64748b" />
                <Text className="mt-2 text-xs font-medium text-slate-500 text-center px-2">
                  Abrir cámara
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <FlatList
            data={gridData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ width: ITEM_SIZE, height: ITEM_SIZE }} className="m-0.5">
                <GalleryThumbnail
                  uri={item.uri}
                  isSelected={selectedUri === item.uri}
                  onToggle={handleSelectImage}
                />
              </View>
            )}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={{
              paddingHorizontal: GRID_PADDING - 2,
              paddingTop: 12,
              paddingBottom: 12,
            }}
            showsVerticalScrollIndicator={false}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderGalleryFooter}
          />

          <View className="border-t border-slate-100 px-5 py-4">
            <TouchableOpacity
              className="rounded-2xl py-3.5 items-center"
              style={{
                backgroundColor: hasSelection ? palette.primary : '#f1f5f9',
              }}
              activeOpacity={0.85}
              onPress={handleAttach}
              disabled={!hasSelection}
            >
              <Text
                className="font-semibold text-base"
                style={{ color: hasSelection ? '#ffffff' : '#94a3b8' }}
              >
                {hasSelection ? 'Adjuntar' : 'Selecciona una imagen'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {fullscreenCamera ? (
        <Modal
          visible={fullscreenCamera}
          animationType="fade"
          onRequestClose={closeFullscreenCamera}
        >
          <StatusBar barStyle="light-content" />
          <View className="flex-1 bg-black">
            <CameraView
              ref={fullCameraRef}
              style={{ flex: 1 }}
              facing={facing}
              mode="picture"
              autofocus="on"
            />

            <TouchableOpacity
              className="absolute top-12 right-5 h-10 w-10 rounded-full bg-black/40 items-center justify-center"
              onPress={closeFullscreenCamera}
            >
              <X size={22} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="absolute bottom-10 right-5 h-10 w-10 rounded-full bg-black/40 items-center justify-center"
              onPress={toggleFacing}
            >
              <RefreshCw size={20} color="white" />
            </TouchableOpacity>

            <View className="absolute bottom-10 left-0 right-0 items-center">
              <TouchableOpacity
                className="h-20 w-20 rounded-full border-4 border-white items-center justify-center"
                activeOpacity={0.7}
                onPress={captureFullscreen}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <View className="h-[70px] w-[70px] rounded-full bg-white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null}
    </Modal>
  );
}
