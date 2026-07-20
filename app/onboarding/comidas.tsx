import { router } from 'expo-router';
import { OnboardingScreen, SelectableCard } from '@/components/onboarding/onboarding-screen';
import { useOnboarding } from '@/contexts/onboarding-context';
import type { ComidasDia } from '@/types/onboarding';

const OPTIONS: { value: ComidasDia; label: string }[] = [
  { value: '3_principales', label: '🍽️ 3 comidas principales' },
  { value: '3_mas_2_snacks', label: '🥗 3 comidas + 2 snacks' },
  { value: '5_pequenas', label: '🥜 5 comidas pequeñas' },
];

export default function ComidasScreen() {
  const { data, updateData } = useOnboarding();
  return (
    <OnboardingScreen step={5} title="Comidas al día" subtitle="¿Cuántas comidas prefieres hacer al día?" canProceed={!!data.comidas} onNext={() => router.push('/onboarding/presupuesto')}>
      {OPTIONS.map((option) => (
        <SelectableCard key={option.value} label={option.label} selected={data.comidas === option.value} onPress={() => updateData({ comidas: option.value })} />
      ))}
    </OnboardingScreen>
  );
}
