import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useColors } from '@/lib/theme';

interface SuccessAnimationProps {
  visible: boolean;
  mensaje?: string;
  color?: string;
}

export function SuccessAnimation({ visible, mensaje = '¡Listo!', color }: SuccessAnimationProps) {
  const c = useColors();
  const col = color ?? c.green;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.delay(1200),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.8, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      scale.setValue(0);
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Animated.View style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      opacity,
      transform: [{ scale }],
    }}>
      <Animated.View style={{
        backgroundColor: col + '15',
        borderWidth: 2,
        borderColor: col,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        gap: 10,
      }}>
        <Ionicons name="checkmark-circle" size={56} color={col} />
        <Text style={{ fontSize: 16, color: col, fontFamily: 'PlusJakartaSans_700Bold' }}>{mensaje}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({});
