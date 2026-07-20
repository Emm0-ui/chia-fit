import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { useNetwork } from '@/hooks/use-network';

export function OfflineBanner() {
  const { isConnected } = useNetwork();
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isConnected ? -60 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [isConnected]);

  if (isConnected) return null;

  return (
    <Animated.View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      backgroundColor: '#EF4444',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      transform: [{ translateY }],
    }}>
      <Ionicons name="wifi-outline" size={16} color="#fff" />
      <Text style={{ color: '#fff', fontSize: 13 }}>
        Sin conexión — algunas funciones no están disponibles
      </Text>
    </Animated.View>
  );
}
