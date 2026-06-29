import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SafeAreaEdge = 'top' | 'right' | 'bottom' | 'left';

type AppSafeAreaProps = ViewProps & {
  className?: string;
  edges?: SafeAreaEdge[];
};

export function AppSafeArea({
  edges = ['top', 'right', 'bottom', 'left'],
  style,
  ...props
}: AppSafeAreaProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          paddingTop: edges.includes('top') ? insets.top : 0,
          paddingRight: edges.includes('right') ? insets.right : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
          paddingLeft: edges.includes('left') ? insets.left : 0,
        },
        style,
      ]}
      {...props}
    />
  );
}
