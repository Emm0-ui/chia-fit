import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/lib/theme';

type OnboardingScreenProps = {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  canProceed: boolean;
  nextLabel?: string;
  isLoading?: boolean;
  showBack?: boolean;
};

export function OnboardingScreen({
  step,
  totalSteps = 6,
  title,
  subtitle,
  children,
  onNext,
  canProceed,
  nextLabel = 'Siguiente',
  isLoading = false,
  showBack = step > 1,
}: OnboardingScreenProps) {
  const c = useColors();
  const progress = step / totalSteps;

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 }}>
        {showBack ? (
          <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textMuted }}>Paso {step} de {totalSteps}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Barra de progreso */}
      <View style={{ height: 4, backgroundColor: c.border, marginHorizontal: 24, marginTop: 12, borderRadius: 2, overflow: 'hidden' }}>
        <View style={{ height: 4, width: `${progress * 100}%`, backgroundColor: c.green, borderRadius: 2 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 26, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, marginBottom: 8, letterSpacing: -0.5 }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 15, color: c.textMuted, lineHeight: 22, marginBottom: 8 }}>{subtitle}</Text>}
        <View style={{ gap: 12, marginTop: 16 }}>{children}</View>
      </ScrollView>

      {/* Footer */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 }}>
        <Pressable
          style={{ backgroundColor: canProceed ? c.green : c.border, paddingVertical: 16, borderRadius: 14, alignItems: 'center', opacity: isLoading ? 0.8 : 1 }}
          onPress={onNext}
          disabled={!canProceed || isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>{nextLabel}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export function SelectableCard({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1.5, borderColor: selected ? c.green : c.border, backgroundColor: selected ? c.surfaceGreen : c.surface }}
      onPress={onPress}>
      <Text style={{ fontSize: 16, fontFamily: selected ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_500Medium', color: selected ? c.textPrimary : c.textSecondary, flex: 1 }}>{label}</Text>
      {selected && <Ionicons name="checkmark-circle" size={22} color={c.green} />}
    </Pressable>
  );
}

export function SelectableChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1.5, borderColor: selected ? c.green : c.border, backgroundColor: selected ? c.surfaceGreen : c.surface }}
      onPress={onPress}>
      <Text style={{ fontSize: 14, fontFamily: selected ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_500Medium', color: selected ? c.green : c.textSecondary }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({});
