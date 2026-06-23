import React, { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface KeyboardAwareLayoutProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  extraScrollHeight?: number;
  bounces?: boolean;
  keyboardDismissMode?: 'none' | 'interactive' | 'on-drag';
  insideTabBar?: boolean;
}

export function KeyboardAwareLayout({
  children,
  style,
  contentContainerStyle,
  extraScrollHeight = 20,
  bounces = true,
  keyboardDismissMode = 'none',
  insideTabBar = false,
}: KeyboardAwareLayoutProps) {
  return (
    <KeyboardAwareScrollView
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      enableOnAndroid={true}
      extraScrollHeight={extraScrollHeight}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableAutomaticScroll={true}
      viewIsInsideTabBar={insideTabBar}
      bounces={bounces}
      keyboardDismissMode={keyboardDismissMode}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
