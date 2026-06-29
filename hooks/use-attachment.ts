import { useState, useEffect, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { useCameraPermissions } from 'expo-camera';
import { Alert } from 'react-native';

export type GalleryAsset = {
  id: string;
  uri: string;
};

export function useAttachment() {
  const [recentPhotos, setRecentPhotos] = useState<GalleryAsset[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [after, setAfter] = useState<string | undefined>(undefined);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [galleryPermission, requestGalleryPermission] = MediaLibrary.usePermissions();

  const loadRecentPhotos = useCallback(async () => {
    if (!galleryPermission?.granted) {
      return;
    }

    setIsLoadingGallery(true);

    try {
      const { assets, endCursor, hasNextPage } = await MediaLibrary.getAssetsAsync({
        first: 30,
        mediaType: ['photo'],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      setRecentPhotos(
        assets.map((asset) => ({ id: asset.id, uri: asset.uri })),
      );
      setAfter(endCursor);
      setHasMore(hasNextPage);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las fotos recientes.');
    } finally {
      setIsLoadingGallery(false);
    }
  }, [galleryPermission]);

  const loadMorePhotos = useCallback(async () => {
    if (!hasMore || isLoadingGallery || !after || !galleryPermission?.granted) {
      return;
    }

    setIsLoadingGallery(true);

    try {
      const { assets, endCursor, hasNextPage } = await MediaLibrary.getAssetsAsync({
        first: 30,
        mediaType: ['photo'],
        sortBy: [MediaLibrary.SortBy.creationTime],
        after,
      });

      setRecentPhotos((prev) => [
        ...prev,
        ...assets.map((asset) => ({ id: asset.id, uri: asset.uri })),
      ]);
      setAfter(endCursor);
      setHasMore(hasNextPage);
    } catch {
      // Silently fail on pagination
    } finally {
      setIsLoadingGallery(false);
    }
  }, [hasMore, isLoadingGallery, after, galleryPermission]);

  // Request gallery permission on mount if not yet requested
  useEffect(() => {
    if (!galleryPermission) {
      requestGalleryPermission();
    }
  }, [galleryPermission, requestGalleryPermission]);

  const resetGallery = useCallback(() => {
    setRecentPhotos([]);
    setAfter(undefined);
    setHasMore(true);
    setIsLoadingGallery(false);
  }, []);

  return {
    recentPhotos,
    isLoadingGallery,
    hasMore,
    loadRecentPhotos,
    loadMorePhotos,
    resetGallery,
    cameraPermission,
    requestCameraPermission,
    galleryPermission,
    requestGalleryPermission,
  };
}
