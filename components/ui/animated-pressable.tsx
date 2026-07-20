import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Animated, Pressable, PressableProps } from 'react-native';

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  haptic?: 'light' | 'medium' | 'heavy';
  scaleValue?: number;
}

export function AnimatedPressable({
  children,
  haptic = 'light',
  scaleValue = 0.97,
  onPress,
  style,
  ...props
}: AnimatedPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: scaleValue, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePress = (e: any) => {
    const hapticMap = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    Haptics.impactAsync(hapticMap[haptic]);
    onPress?.(e);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} {...props}>
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style as any]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
