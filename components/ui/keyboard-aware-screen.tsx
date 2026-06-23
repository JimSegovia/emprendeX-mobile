import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  extraPadding?: number;
};

export function KeyboardAwareScreen({ children, extraPadding = 0 }: Props) {
  const keyboard = useAnimatedKeyboard();

  const animatedStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboard.height.value + extraPadding,
  }));

  return <Animated.View style={[{ flex: 1 }, animatedStyle]}>{children}</Animated.View>;
}
