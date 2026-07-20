import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#060810',
          borderTopColor: 'rgba(255,255,255,0.05)',
          borderTopWidth: 0.5,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#16A34A',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.2)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'PlusJakartaSans_500Medium',
        },
      }}>
      <Tabs.Screen name='index' options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Ionicons name='home' size={size} color={color} /> }} />
      <Tabs.Screen name='escanear' options={{ title: 'Escanear', tabBarIcon: ({ color, size }) => <Ionicons name='camera' size={size} color={color} /> }} />
      <Tabs.Screen name='progreso' options={{ title: 'Progreso', tabBarIcon: ({ color, size }) => <Ionicons name='trending-up' size={size} color={color} /> }} />
      <Tabs.Screen name='perfil' options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name='person' size={size} color={color} /> }} />
    </Tabs>
  );
}