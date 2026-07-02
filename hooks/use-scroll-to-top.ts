import { useRef, useCallback } from 'react';
import { ScrollView, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';

type Scrollable = ScrollView | FlatList<any>;

export function useScrollToTopOnFocus() {
  const ref = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      const node = ref.current;

      if (node) {
        if ('scrollToOffset' in node) {
          (node as FlatList<any>).scrollToOffset({ offset: 0, animated: false });
        } else {
          (node as ScrollView).scrollTo({ y: 0, animated: false });
        }
      }
    }, []),
  );

  return ref;
}
