import { TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  LinearTransition,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';

export const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const screenEntering = FadeIn.duration(180);

export const sectionEntering = (index = 0) => FadeInDown.delay(70 + index * 55).duration(360);

export const itemEntering = (index = 0) => FadeInRight.delay(60 + index * 45).duration(320);

export const smoothLayout = LinearTransition.springify().damping(18).stiffness(180);

export const quickCheckEntering = ZoomIn.duration(160);
export const quickCheckExiting = ZoomOut.duration(120);

export default Animated;
