import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { CameraGridSlot } from './camera-grid-slot';
import { GalleryThumbnail } from './gallery-thumbnail';
import { useAttachment } from '@/hooks/use-attachment';
import { useAccountPreferences } from '@/lib/account-preferences-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const ITEM_SPACING = 4;
const GRID_PADDING = 16;
const ITEM_SIZE =
  (SCREEN_WIDTH - GRID_PADDING * 2 - ITEM_SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

type GridItem =
  | { type: 'camera'; id: string }
  | { type: 'photo'; id: string; uri: string };

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

  // Reset selection and load gallery when sheet becomes visible
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
    () => [
      { type: 'camera', id: 'camera' },
      ...recentPhotos.map((asset) => ({
        type: 'photo' as const,
        id: asset.id,
        uri: asset.uri,
      })),
    ],
    [recentPhotos],
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingGallery) {
      loadMorePhotos();
    }
  }, [hasMore, isLoadingGallery, loadMorePhotos]);

  const renderFooter = useCallback(
    () =>
      isLoadingGallery ? (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color={palette.primary} />
        </View>
      ) : null,
    [isLoadingGallery, palette.primary],
  );

  const hasSelection = selectedUri !== null;

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
          style={{ maxHeight: '75%', paddingBottom: insets.bottom }}
        >
          {/* ── Header ── */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <Text className="text-lg font-semibold text-slate-800">Adjuntar imagen</Text>
            <TouchableOpacity
              onPress={handleClose}
              className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
            >
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* ── Camera + gallery grid (camera as first cell) ── */}
          <FlatList
            data={gridData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              if (item.type === 'camera') {
                return (
                  <View style={{ width: ITEM_SIZE, height: ITEM_SIZE }} className="m-0.5">
                    <CameraGridSlot onPhotoCapture={handlePhotoCapture} />
                  </View>
                );
              }
              return (
                <View style={{ width: ITEM_SIZE, height: ITEM_SIZE }} className="m-0.5">
                  <GalleryThumbnail
                    uri={item.uri}
                    isSelected={selectedUri === item.uri}
                    onToggle={handleSelectImage}
                  />
                </View>
              );
            }}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={{
              paddingHorizontal: GRID_PADDING - 2,
              paddingTop: 12,
              paddingBottom: 12,
            }}
            showsVerticalScrollIndicator={false}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />

          {/* ── Footer ── */}
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
                {hasSelection
                  ? 'Adjuntar'
                  : 'Selecciona una imagen'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}
