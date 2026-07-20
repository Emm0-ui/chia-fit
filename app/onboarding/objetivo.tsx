import { router } from 'expo-router';
import { OnboardingScreen, SelectableCard } from '@/components/onboarding/onboarding-screen';
import { useOnboarding } from '@/contexts/onboarding-context';
import type { Objetivo } from '@/types/onboarding';

const OPTIONS: { value: Objetivo; label: string }[] = [
  { value: 'bajar_peso', label: '⚖️ Bajar de peso' },
  { value: 'mantener_peso', label: '🎯 Mantener mi peso' },
  { value: 'ganar_musculo', label: '💪 Ganar músculo' },
  { value: 'comer_saludable', label: '🥗 Comer más saludable' },
];

export default function ObjetivoScreen() {
  const { data, updateData } = useOnboarding();
  return (
    <OnboardingScreen step={1} title="¿Cuál es tu objetivo?" subtitle="Elige la meta que mejor describa lo que quieres lograr" canProceed={!!data.objetivo} onNext={() => router.push('/onboarding/datos')} showBack={false}>
      {OPTIONS.map((option) => (
        <SelectableCard key={option.value} label={option.label} selected={data.objetivo === option.value} onPress={() => updateData({ objetivo: option.value })} />
      ))}
    </OnboardingScreen>
  );
}
